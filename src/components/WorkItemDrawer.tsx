'use client';

import { Anchor, Box, Drawer, Group, Select, SimpleGrid, Stack, Text, Badge } from '@mantine/core';
import Link from 'next/link';
import { PEOPLE } from '@/data/people';
import { PHASES, WORKSTREAMS, DEMO_TODAY } from '@/lib/meta';
import { useStore } from '@/lib/store';
import type { WorkItemStatus } from '@/lib/types';
import { Comments } from './Comments';
import { Field, StatusBadge, CitationChips, personName } from './ui';
import { fmtDate } from '@/lib/atlas';

const STATUSES: WorkItemStatus[] = ['Not Started', 'In Progress', 'Waiting', 'Needs Review', 'Blocked', 'Complete'];

export function WorkItemDrawer({ itemId, onClose }: { itemId: string | null; onClose: () => void }) {
  const w = useStore((s) => s.work.find((x) => x.id === itemId));
  const all = useStore((s) => s.work);
  const findings = useStore((s) => s.findings);
  const decisions = useStore((s) => s.decisions);
  const update = useStore((s) => s.updateWork);
  return (
    <Drawer opened={!!w} onClose={onClose} position="right" size={540} title={<Text fw={600}>{w?.kind ?? 'Work item'}</Text>}>
      {w && (
        <Stack gap="md">
          <Box>
            <Text fz={19} fw={600} lh={1.3}>
              {w.title}
            </Text>
            {w.createdBy === 'automation' && (
              <Badge mt={6} color="gray" variant="light">
                Created by workflow automation
              </Badge>
            )}
          </Box>
          {w.description && <Text size="sm">{w.description}</Text>}
          <SimpleGrid cols={2} spacing="sm">
            <Select size="xs" label="Status" data={STATUSES} value={w.status} onChange={(v) => v && update(w.id, { status: v as WorkItemStatus })} />
            <Select size="xs" label="Priority" data={['Urgent', 'High', 'Normal', 'Low']} value={w.priority} onChange={(v) => v && update(w.id, { priority: v as never })} />
            <Select size="xs" label="Owner" searchable data={PEOPLE.map((p) => ({ value: p.id, label: p.name }))} value={w.ownerId} onChange={(v) => v && update(w.id, { ownerId: v })} />
            <Select size="xs" label="Reviewer" clearable data={PEOPLE.map((p) => ({ value: p.id, label: p.name }))} value={w.reviewerId ?? null} onChange={(v) => update(w.id, { reviewerId: v ?? undefined })} />
            <Field label="Workstream">{WORKSTREAMS.find((x) => x.key === w.workstream)?.label}</Field>
            <Field label="Phase">{PHASES.find((x) => x.key === w.phase)?.label}</Field>
            <Field label="Due">
              <Text size="sm" c={w.due && w.due < DEMO_TODAY && w.status !== 'Complete' ? 'red.7' : undefined}>
                {w.due ? fmtDate(w.due) : '—'}
                {w.due && w.due < DEMO_TODAY && w.status !== 'Complete' ? ' · overdue' : ''}
              </Text>
            </Field>
          </SimpleGrid>
          {w.status === 'Needs Review' && w.reviewerId && (
            <Text size="xs" c="orange.8">
              Waiting on review from {personName(w.reviewerId)}.
            </Text>
          )}
          {(w.dependsOn?.length ?? 0) > 0 && (
            <Field label="Depends on">
              <Stack gap={4}>
                {w.dependsOn!.map((d) => {
                  const dep = all.find((x) => x.id === d);
                  return dep ? (
                    <Group key={d} gap={6}>
                      <StatusBadge status={dep.status} size="xs" />
                      <Text size="sm">{dep.title}</Text>
                    </Group>
                  ) : null;
                })}
              </Stack>
            </Field>
          )}
          {(w.findingIds?.length ?? 0) > 0 && (
            <Field label="Findings">
              <Stack gap={4}>
                {findings
                  .filter((f) => w.findingIds!.includes(f.id))
                  .map((f) => (
                    <Anchor key={f.id} component={Link} href={`/acquisitions/${w.acqId}/findings/${f.id}`} size="sm">
                      {f.title}
                    </Anchor>
                  ))}
              </Stack>
            </Field>
          )}
          {(w.decisionIds?.length ?? 0) > 0 && (
            <Field label="Decisions">
              <Stack gap={4}>
                {decisions
                  .filter((d) => w.decisionIds!.includes(d.id))
                  .map((d) => (
                    <Anchor key={d.id} component={Link} href={`/acquisitions/${w.acqId}/decisions/${d.id}`} size="sm">
                      {d.question}
                    </Anchor>
                  ))}
              </Stack>
            </Field>
          )}
          {(w.documentIds?.length ?? 0) > 0 && (
            <Field label="Documents">
              <CitationChips acqId={w.acqId} citations={w.documentIds!.map((docId) => ({ docId }))} />
            </Field>
          )}
          <Box>
            <Text className="label" mb={6}>
              Discussion
            </Text>
            <Comments type="work" id={w.id} comments={w.comments} />
          </Box>
        </Stack>
      )}
    </Drawer>
  );
}
