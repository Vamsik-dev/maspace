'use client';

import { Anchor, Box, Button, Grid, Group, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { workstreamProgress } from '@/lib/derive';
import { WORKSTREAMS } from '@/lib/meta';
import { Section, Meter, Person, SeverityBadge, StatusBadge, DocIcon, Empty } from '@/components/ui';
import { WorkTable } from '@/components/WorkTable';
import { WorkItemDrawer } from '@/components/WorkItemDrawer';
import { NewWorkItemModal } from '@/components/Forms';
import type { WorkstreamKey } from '@/lib/types';

export default function WorkstreamPage() {
  const { id, ws } = useParams<{ id: string; ws: WorkstreamKey }>();
  const s = useStore();
  const [item, setItem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const meta = WORKSTREAMS.find((w) => w.key === ws);
  const acq = s.acquisitions.find((a) => a.id === id)!;
  if (!meta) return <Empty title="Unknown workstream" />;
  const prog = workstreamProgress(acq, s.work).find((w) => w.key === ws);
  const team = acq.team.filter((m) => m.workstreams.includes(ws));
  const findings = s.findings.filter((f) => f.acqId === id && f.workstream === ws && f.status !== 'Dismissed');
  const docs = s.documents.filter((d) => d.acqId === id && d.workstream === ws);
  const work = s.work.filter((w) => w.acqId === id && w.workstream === ws);
  const base = `/acquisitions/${id}`;

  return (
    <Stack gap="md">
      <Anchor component={Link} href={`${base}/workstreams`} size="xs" c="dimmed">
        <IconArrowLeft size={11} /> Workstreams
      </Anchor>
      <Group justify="space-between" align="flex-end">
        <Box>
          <Text className="label">Workstream</Text>
          <Text fz={24} fw={650}>
            {meta.label}
          </Text>
          <Text size="sm" c="dimmed">
            {meta.scope}
          </Text>
        </Box>
        {prog && (
          <Box>
            <Text className="label" mb={4}>
              Progress · {prog.done}/{prog.total}
            </Text>
            <Meter value={prog.pct} w={200} />
          </Box>
        )}
      </Group>
      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <Section title={`Findings (${findings.length})`} pad={false}>
              {findings.length === 0 ? (
                <Text p="md" size="sm" c="dimmed">
                  No findings in this workstream yet.
                </Text>
              ) : (
                <Stack gap={0}>
                  {findings.map((f) => (
                    <Link key={f.id} href={`${base}/findings/${f.id}`}>
                    <Group px="md" py={8} className="row-link" justify="space-between" wrap="nowrap" style={{ borderBottom: '1px solid #f5f5f4' }}>
                      <Group gap={8} wrap="nowrap">
                        <SeverityBadge severity={f.severity} positive={f.positive} />
                        <Text size="sm">{f.title}</Text>
                      </Group>
                      <StatusBadge status={f.status} />
                    </Group>
                    </Link>
                  ))}
                </Stack>
              )}
            </Section>
            <Section
              title={`Work (${work.length})`}
              pad={false}
              right={
                <Button size="compact-xs" variant="subtle" leftSection={<IconPlus size={12} />} onClick={() => setOpen(true)}>
                  Add
                </Button>
              }
            >
              <WorkTable items={work} onOpen={setItem} showWorkstream={false} />
            </Section>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <Section title="People">
              <Stack gap={8}>
                {team.map((m) => (
                  <Group key={m.personId} justify="space-between">
                    <Person id={m.personId} withTitle />
                    <Text size="xs" c="dimmed">
                      {m.dealRole}
                    </Text>
                  </Group>
                ))}
                {team.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No one assigned.
                  </Text>
                )}
              </Stack>
            </Section>
            <Section title={`Documents (${docs.length})`}>
              <Stack gap={6}>
                {docs.map((d) => (
                  <Anchor key={d.id} component={Link} href={`${base}/documents/${d.id}`} size="sm" c="dark">
                    <Group gap={6} wrap="nowrap">
                      <DocIcon type={d.type} size={14} />
                      <Text size="sm" truncate>
                        {d.name}
                      </Text>
                    </Group>
                  </Anchor>
                ))}
                {docs.length === 0 && (
                  <Text size="sm" c="dimmed">
                    None.
                  </Text>
                )}
              </Stack>
            </Section>
          </Stack>
        </Grid.Col>
      </Grid>
      <WorkItemDrawer itemId={item} onClose={() => setItem(null)} />
      <NewWorkItemModal opened={open} onClose={() => setOpen(false)} acqId={id} defaults={{ workstream: ws }} />
    </Stack>
  );
}
