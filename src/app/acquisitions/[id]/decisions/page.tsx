'use client';

import { Box, Button, Group, Stack, Text, SegmentedControl, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { phaseShort } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import { PageHeader, StatusBadge, PersonAvatar, personName, Empty } from '@/components/ui';
import { NewDecisionModal } from '@/components/Forms';

export default function DecisionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const all = useStore(useShallow((s) => s.decisions.filter((d) => d.acqId === id)));
  const me = useStore((s) => s.currentUserId);
  const [view, setView] = useState('pending');
  const [open, setOpen] = useState(false);
  const list = all.filter((d) => (view === 'pending' ? d.status === 'Open' || d.status === 'Under Review' : view === 'decided' ? !(d.status === 'Open' || d.status === 'Under Review') : true));

  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Governance"
        title="Decisions"
        description="The decision log for this acquisition. Each decision keeps its question, evidence, options, reviews, outcome and rationale permanently linked to the deal."
        right={
          <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>
            New decision
          </Button>
        }
      />
      <SegmentedControl
        size="xs"
        w="fit-content"
        value={view}
        onChange={setView}
        data={[
          { value: 'pending', label: `Pending (${all.filter((d) => d.status === 'Open' || d.status === 'Under Review').length})` },
          { value: 'decided', label: 'Decided' },
          { value: 'all', label: 'All' },
        ]}
      />
      <Stack gap="sm">
        {list.length === 0 && (
          <Box style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
            <Empty title="No decisions here">Open a decision when the team needs to choose between options. Decisions can also be created from a finding.</Empty>
          </Box>
        )}
        {list.map((d) => {
          const mine = d.approverId === me || d.reviewers.some((r) => r.personId === me && r.verdict === 'Pending');
          const rec = d.options.find((o) => o.id === d.recommendation?.optionId);
          const out = d.options.find((o) => o.id === d.outcome?.optionId);
          return (
            <Box key={d.id} component={Link} href={`/acquisitions/${id}/decisions/${d.id}`} p="md" style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8, display: 'block' }} className="row-link">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Box style={{ minWidth: 0 }}>
                  <Group gap={6} mb={4}>
                    <StatusBadge status={d.status} />
                    <Badge variant="default">{phaseShort(d.phase)}</Badge>
                    {mine && (d.status === 'Open' || d.status === 'Under Review') && <Badge color="blue">{d.approverId === me ? 'Your approval' : 'Your review'}</Badge>}
                  </Group>
                  <Text fw={600} size="md" lh={1.35}>
                    {d.question}
                  </Text>
                  <Text size="sm" c="dimmed" mt={4} lineClamp={2}>
                    {out ? `Decided: ${out.label}. ${d.outcome!.rationale}` : rec ? `Recommended: ${rec.label}` : d.context}
                  </Text>
                </Box>
                <Stack gap={6} align="flex-end" style={{ flexShrink: 0 }}>
                  <Group gap={-4}>
                    {d.reviewers.map((r) => (
                      <PersonAvatar key={r.personId} id={r.personId} size={22} />
                    ))}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {d.outcome ? `${personName(d.outcome.decidedBy)} · ${fmtDate(d.outcome.decidedAt.slice(0, 10))}` : `Approver ${personName(d.approverId)}${d.due ? ` · by ${fmtDate(d.due)}` : ''}`}
                  </Text>
                </Stack>
              </Group>
            </Box>
          );
        })}
      </Stack>
      <NewDecisionModal opened={open} onClose={() => setOpen(false)} acqId={id} onCreated={(did) => router.push(`/acquisitions/${id}/decisions/${did}`)} />
    </Stack>
  );
}
