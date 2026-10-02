'use client';

import { Anchor, Badge, Box, Button, Group, ScrollArea, Stack, Table, Text, UnstyledButton, Mark, Loader } from '@mantine/core';
import { IconArrowLeft, IconSparkles, IconDownload } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import { wsLabel } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import { Claim, DocIcon, Field, Person, Section, SeverityBadge, Empty } from '@/components/ui';

function highlight(text: string, quotes: string[]) {
  const q = quotes.find((x) => x && text.includes(x.replace(/…/g, '').trim().slice(0, 40)));
  if (!q) return text;
  const frag = q.replace(/…/g, '').trim().slice(0, 40);
  const i = text.indexOf(frag);
  // extend highlight to end of sentence
  const end = Math.min(text.length, text.indexOf('.', i + frag.length) + 1 || text.length);
  return (
    <>
      {text.slice(0, i)}
      <Mark color="yellow">{text.slice(i, end)}</Mark>
      {text.slice(end)}
    </>
  );
}

function Viewer() {
  const { id, docId } = useParams<{ id: string; docId: string }>();
  const params = useSearchParams();
  const focus = Number(params.get('page')) || undefined;
  const doc = useStore((s) => s.documents.find((d) => d.id === docId));
  const findings = useStore(useShallow((s) => s.findings.filter((f) => f.acqId === id && f.fact.citations.some((c) => c.docId === docId))));
  const openAtlas = useUi((u) => u.openAtlas);
  const refs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (focus && refs.current[focus]) refs.current[focus]!.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focus, doc?.id]);

  if (!doc) return <Empty title="Document not found" />;
  const base = `/acquisitions/${id}`;
  const quotesFor = (n: number) => findings.flatMap((f) => f.fact.citations.filter((c) => c.docId === docId && c.page === n && c.quote).map((c) => c.quote!));
  const unit = doc.type === 'XLSX' ? 'Sheet' : doc.type === 'PPTX' ? 'Slide' : 'Page';

  return (
    <Stack gap="md">
      <Anchor component={Link} href={`${base}/documents`} size="xs" c="dimmed">
        <IconArrowLeft size={11} /> Documents
      </Anchor>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <DocIcon type={doc.type} size={26} />
          <Box>
            <Text fz={20} fw={650} lh={1.2}>
              {doc.name}
            </Text>
            <Text size="xs" c="dimmed">
              {doc.category} · {doc.source} · v{doc.version} · {doc.pageCount} {unit.toLowerCase()}s
            </Text>
          </Box>
        </Group>
        <Group gap={6}>
          <Button variant="light" color="violet" leftSection={<IconSparkles size={14} />} onClick={() => openAtlas(`What does ${doc.name.split(/[—.]/)[0].trim()} tell us?`)}>
            Ask about this document
          </Button>
          <Button variant="default" leftSection={<IconDownload size={14} />} disabled title="Not available in prototype">
            Original
          </Button>
        </Group>
      </Group>

      <Group align="flex-start" gap="lg" wrap="nowrap">
        <Stack gap={4} w={150} visibleFrom="md" style={{ position: 'sticky', top: 0, flexShrink: 0 }}>
          <Text className="label" mb={4}>
            Extracted {unit.toLowerCase()}s
          </Text>
          {doc.pages.map((p) => (
            <UnstyledButton key={p.n} onClick={() => refs.current[p.n]?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="row-link" px={8} py={6} style={{ background: focus === p.n ? 'white' : undefined, boxShadow: focus === p.n ? '0 0 0 1px var(--app-border)' : undefined }}>
              <Text size="xs" fw={600}>
                {unit} {p.n}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {p.heading.replace(/^(Sheet|Slide \d+)\s*[:—-]\s*/, '')}
              </Text>
            </UnstyledButton>
          ))}
          <Text size="xs" c="dimmed" mt="sm">
            Prototype shows the {doc.pages.length} excerpted {unit.toLowerCase()}s of {doc.pageCount}.
          </Text>
        </Stack>

        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          {doc.status !== 'Processed' && (
            <Group gap="sm" p="md" className="panel">
              <Loader size="sm" />
              <Text size="sm">{doc.status === 'Queued' ? 'Security scan in progress…' : 'Extracting text, tables and page references…'}</Text>
            </Group>
          )}
          {doc.pages.map((p) => (
            <div key={p.n} ref={(el) => { refs.current[p.n] = el; }} className={`doc-page${focus === p.n ? ' focus' : ''}`} style={{ scrollMarginTop: 12 }}>
              <Group justify="space-between" mb="sm">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>
                  {unit} {p.n}
                </Text>
                <Badge color="yellow" variant="light" size="xs">
                  Synthetic
                </Badge>
              </Group>
              <Text fw={650} mb="sm" fz={16}>
                {p.heading}
              </Text>
              <Stack gap="sm">
                {p.body.map((para, i) => (
                  <Text key={i} size="sm" lh={1.65} style={{ fontFamily: doc.type === 'PDF' || doc.type === 'DOCX' ? 'Georgia, serif' : undefined }}>
                    {highlight(para, quotesFor(p.n))}
                  </Text>
                ))}
              </Stack>
              {p.table && (
                <Table mt="md" withTableBorder withColumnBorders fz="xs" className="num">
                  <Table.Thead bg="#f8fafc">
                    <Table.Tr>
                      {p.table.columns.map((c) => (
                        <Table.Th key={c}>{c}</Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {p.table.rows.map((r, i) => (
                      <Table.Tr key={i} bg={p.table!.highlightRows?.includes(i) && findings.length ? '#fef9c3' : undefined}>
                        {r.map((c, j) => (
                          <Table.Td key={j}>{c}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </div>
          ))}
        </Stack>

        <Stack gap="md" w={300} visibleFrom="lg" style={{ flexShrink: 0 }}>
          <Section title="About">
            <Stack gap="sm">
              <Claim kind="inference">{doc.summary}</Claim>
              <Field label="Uploaded by">
                <Person id={doc.uploadedBy} />
              </Field>
              <Field label="Uploaded">{fmtDate(doc.uploadedAt)}</Field>
              <Field label="Workstream">{wsLabel(doc.workstream)}</Field>
              <Group gap={4}>
                {doc.tags.map((t) => (
                  <Badge key={t} variant="default" size="xs">
                    {t}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Section>
          <Section title={`Cited by ${findings.length} finding${findings.length === 1 ? '' : 's'}`}>
            <Stack gap={10}>
              {findings.length === 0 && (
                <Text size="sm" c="dimmed">
                  Not cited yet.
                </Text>
              )}
              {findings.map((f) => (
                <Box key={f.id}>
                  <Group gap={6} mb={2}>
                    <SeverityBadge severity={f.severity} positive={f.positive} />
                    <Text size="xs" c="dimmed">
                      {f.fact.citations
                        .filter((c) => c.docId === docId)
                        .map((c) => (c.page ? `${unit.toLowerCase()} ${c.page}` : 'whole doc'))
                        .join(', ')}
                    </Text>
                  </Group>
                  <Anchor component={Link} href={`${base}/findings/${f.id}`} size="sm" c="dark" fw={500}>
                    {f.title}
                  </Anchor>
                </Box>
              ))}
            </Stack>
          </Section>
        </Stack>
      </Group>
    </Stack>
  );
}

export default function DocumentPage() {
  return (
    <Suspense>
      <Viewer />
    </Suspense>
  );
}
