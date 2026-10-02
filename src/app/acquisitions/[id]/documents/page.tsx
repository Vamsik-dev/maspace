'use client';

import { Box, Button, Group, Loader, Select, Stack, Table, Text, TextInput, Badge, Mark } from '@mantine/core';
import { IconSearch, IconUpload } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { WORKSTREAMS, wsLabel } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import { PageHeader, DocIcon, PersonAvatar, Empty } from '@/components/ui';
import { UploadModal } from '@/components/UploadModal';

function Snippet({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text.slice(0, 160)}</>;
  const start = Math.max(0, i - 70);
  return (
    <>
      {start > 0 && '…'}
      {text.slice(start, i)}
      <Mark color="yellow">{text.slice(i, i + q.length)}</Mark>
      {text.slice(i + q.length, i + q.length + 90)}…
    </>
  );
}

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const docs = useStore(useShallow((s) => s.documents.filter((d) => d.acqId === id)));
  const findings = useStore(useShallow((s) => s.findings.filter((f) => f.acqId === id)));
  const [q, setQ] = useState('');
  const [ws, setWs] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const hits = useMemo(() => {
    if (q.trim().length < 3) return [];
    const term = q.trim().toLowerCase();
    return docs.flatMap((d) =>
      d.pages.flatMap((p) => {
        const txt = [p.heading, ...p.body, ...(p.table ? p.table.rows.map((r) => r.join(' ')) : [])].join(' ');
        return txt.toLowerCase().includes(term) ? [{ d, p, txt }] : [];
      }),
    );
  }, [q, docs]);

  const list = docs
    .filter((d) => !ws || d.workstream === ws)
    .filter((d) => !src || d.source === src)
    .filter((d) => !q.trim() || (d.name + ' ' + d.tags.join(' ') + ' ' + d.summary).toLowerCase().includes(q.trim().toLowerCase()) || hits.some((h) => h.d.id === d.id));

  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Materials"
        title="Documents"
        description="Deal documents with extracted text and page references. Not a data room: documents here are the evidence behind findings and the inputs to deliverables."
        right={
          <Button leftSection={<IconUpload size={14} />} onClick={() => setOpen(true)}>
            Upload
          </Button>
        }
      />
      <Group gap="sm">
        <TextInput size="xs" w={320} leftSection={<IconSearch size={13} />} placeholder="Search names and document contents…" value={q} onChange={(e) => setQ(e.currentTarget.value)} />
        <Select size="xs" w={160} placeholder="Workstream" clearable data={WORKSTREAMS.map((w) => ({ value: w.key, label: w.label }))} value={ws} onChange={setWs} />
        <Select size="xs" w={130} placeholder="Source" clearable data={['Seller', 'Advisor', 'Internal', 'Public']} value={src} onChange={setSrc} />
      </Group>

      {hits.length > 0 && (
        <Box p="md" style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
          <Text className="label" mb={8}>
            {hits.length} matches inside documents
          </Text>
          <Stack gap={8}>
            {hits.slice(0, 8).map((h, i) => (
              <Box key={i} component={Link} href={`/acquisitions/${id}/documents/${h.d.id}?page=${h.p.n}`} className="row-link" p={6}>
                <Group gap={6}>
                  <DocIcon type={h.d.type} size={14} />
                  <Text size="sm" fw={500}>
                    {h.d.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    p.{h.p.n} · {h.p.heading}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" mt={2} pl={20}>
                  <Snippet text={h.txt} q={q.trim()} />
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Box style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
        {list.length === 0 ? (
          <Empty title={docs.length ? 'No documents match' : 'No documents yet'} action={!docs.length ? <Button onClick={() => setOpen(true)}>Upload the CIM</Button> : undefined}>
            {docs.length ? 'Try a different search.' : 'Upload a CIM or financials to start. Atlas extracts text and page references so findings can cite them.'}
          </Empty>
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Document</Table.Th>
                <Table.Th w={150}>Category</Table.Th>
                <Table.Th w={110}>Workstream</Table.Th>
                <Table.Th w={80}>Source</Table.Th>
                <Table.Th w={130}>Uploaded</Table.Th>
                <Table.Th w={80}>Cited by</Table.Th>
                <Table.Th w={110}>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.map((d) => {
                const cites = findings.filter((f) => f.fact.citations.some((c) => c.docId === d.id)).length;
                return (
                  <Table.Tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/acquisitions/${id}/documents/${d.id}`)}>
                    <Table.Td>
                      <Group gap={8} wrap="nowrap">
                        <DocIcon type={d.type} size={18} />
                        <Box style={{ minWidth: 0 }}>
                          <Text size="sm" fw={500} truncate>
                            {d.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            v{d.version} · {d.pageCount} {d.type === 'XLSX' ? 'sheets' : d.type === 'PPTX' ? 'slides' : 'pages'} · {(d.sizeKb / 1024).toFixed(1)} MB
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{d.category}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{wsLabel(d.workstream)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="default" size="sm">
                        {d.source}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <PersonAvatar id={d.uploadedBy} size={18} />
                        <Text size="xs" c="dimmed">
                          {fmtDate(d.uploadedAt)}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={cites ? undefined : 'dimmed'}>
                        {cites ? `${cites} finding${cites > 1 ? 's' : ''}` : '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {d.status === 'Processed' ? (
                        <Badge color="teal">Indexed</Badge>
                      ) : (
                        <Group gap={6}>
                          <Loader size={12} />
                          <Text size="xs" c="dimmed">
                            {d.status === 'Queued' ? 'Scanning…' : 'Extracting…'}
                          </Text>
                        </Group>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Box>
      <UploadModal opened={open} onClose={() => setOpen(false)} acqId={id} />
    </Stack>
  );
}
