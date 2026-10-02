'use client';

import { Box, Group, SimpleGrid, Stack, Text, Badge } from '@mantine/core';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { workstreamProgress } from '@/lib/derive';
import { PageHeader, Meter, PersonAvatar, SeverityDot, Empty } from '@/components/ui';

export default function WorkstreamsPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const acq = s.acquisitions.find((a) => a.id === id)!;
  const ws = workstreamProgress(acq, s.work, s.playbooks.find((p) => p.id === acq.playbookId)?.workstreams ?? []);
  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Execution"
        title="Workstreams"
        description="Standard diligence workstreams from Playbook v4, created when the LOI was signed. Progress combines the initial request list with tracked work items."
      />
      {ws.length === 0 && (
        <Box className="panel">
          <Empty title="No workstreams yet">Workstreams are created automatically when the LOI is signed.</Empty>
        </Box>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {ws.map((w) => {
          const leads = acq.team.filter((m) => m.workstreams.includes(w.key));
          const f = s.findings.filter((x) => x.acqId === id && x.workstream === w.key && !['Dismissed', 'Resolved'].includes(x.status) && !x.positive);
          return (
            <Box key={w.key} component={Link} href={`/acquisitions/${id}/workstreams/${w.key}`} p="md" className="panel card-link" style={{ display: 'block' }}>
              <Group justify="space-between" mb={2}>
                <Text fw={600}>{w.label}</Text>
                <Group gap={-4}>
                  {leads.map((m) => (
                    <PersonAvatar key={m.personId} id={m.personId} size={20} />
                  ))}
                </Group>
              </Group>
              <Text size="xs" c="dimmed" mb="sm" lineClamp={1}>
                {w.scope}
              </Text>
              <Meter value={w.pct} w={160} color={w.pct < 50 ? 'orange' : 'ink'} />
              <Group gap={6} mt="sm">
                <Text size="xs" c="dimmed">
                  {w.done}/{w.total} items · {w.open} open
                </Text>
                {w.blocked > 0 && <Badge size="xs" color="red">{w.blocked} blocked</Badge>}
              </Group>
              {f.length > 0 && (
                <Group gap={8} mt={8}>
                  {f.slice(0, 3).map((x) => (
                    <Group key={x.id} gap={4} wrap="nowrap">
                      <SeverityDot severity={x.severity} />
                      <Text size="xs" lineClamp={1} maw={260}>
                        {x.title}
                      </Text>
                    </Group>
                  ))}
                </Group>
              )}
            </Box>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
