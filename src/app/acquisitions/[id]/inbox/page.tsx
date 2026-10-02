'use client';

import { Box, Button, Group, SegmentedControl, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCheck, IconSparkles } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { notifications } from '@mantine/notifications';
import { useStore } from '@/lib/store';
import { wsLabel } from '@/lib/meta';
import { PageHeader, SeverityBadge, Claim, Empty, Pill } from '@/components/ui';
import { ProposalCard, ChainPanel } from '@/components/intel';

export default function InboxPage() {
  const { id } = useParams<{ id: string }>();
  const raw = useStore(useShallow((s) => s.findings.filter((f) => f.acqId === id && f.status === 'Proposed')));
  const sev = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const findings = [...raw].sort((a, b) => Number(!!a.positive) - Number(!!b.positive) || sev[a.severity] - sev[b.severity]);
  const proposals = useStore(useShallow((s) => s.proposals.filter((p) => p.acqId === id)));
  const accept = useStore((s) => s.acceptFinding);
  const dismiss = useStore((s) => s.dismissFinding);
  const acceptProposal = useStore((s) => s.acceptProposal);
  const [view, setView] = useState('pending');

  const standalone = proposals.filter((p) => !p.parentFindingId);
  const chained = proposals.filter((p) => p.parentFindingId && p.status === 'Pending');
  const pendingStandalone = standalone.filter((p) => p.status === 'Pending');
  const shown = view === 'pending' ? pendingStandalone : standalone.filter((p) => p.status !== 'Pending');
  const total = findings.length + proposals.filter((p) => p.status === 'Pending').length;
  const requests = pendingStandalone.filter((p) => p.kind === 'request');

  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Human review"
        title="Atlas review queue"
        description="Everything Atlas found or drafted for this acquisition, waiting for a person. Accepted items become findings, risks, decisions or assigned work; dismissed items are kept in the audit trail."
        right={
          <Group gap="xs">
            <Pill color={total ? 'violet' : 'teal'}>{total ? `${total} awaiting review` : 'Queue clear'}</Pill>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        {[
          ['Proposed findings', findings.length],
          ['Linked items drafted', chained.length],
          ['Seller requests drafted', requests.length],
          ['Other proposals', pendingStandalone.length - requests.length],
        ].map(([k, v]) => (
          <Box key={k as string} className="panel" p="md">
            <Text className="label">{k}</Text>
            <Text fz={24} fw={600} className="num">
              {v}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {findings.length > 0 && (
        <Box>
          <Group justify="space-between" mb={8}>
            <Text fw={600}>Proposed findings</Text>
            <Text size="xs" c="dimmed">
              Each finding cites its source. Accepting releases the risk, decision and actions Atlas drafted for it.
            </Text>
          </Group>
          <Stack gap="md">
            {findings.map((f) => (
              <Box key={f.id} className="panel" p="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                  <Box style={{ minWidth: 0 }}>
                    <Group gap={6} mb={4}>
                      <SeverityBadge severity={f.severity} positive={f.positive} />
                      <Text size="xs" c="dimmed">
                        {wsLabel(f.workstream)} · proposed by Atlas
                      </Text>
                    </Group>
                    <Text component={Link} href={`/acquisitions/${id}/findings/${f.id}`} fw={600} fz={15}>
                      {f.title}
                    </Text>
                  </Box>
                  <Group gap={6} wrap="nowrap">
                    <Button size="xs" variant="default" onClick={() => dismiss(f.id)}>
                      Dismiss
                    </Button>
                    <Button size="xs" variant="default" component={Link} href={`/acquisitions/${id}/findings/${f.id}`}>
                      Investigate
                    </Button>
                    <Button size="xs" leftSection={<IconCheck size={13} />} onClick={() => accept(f.id)}>
                      Accept
                    </Button>
                  </Group>
                </Group>
                <Stack gap={8} mt="sm">
                  <Claim kind="fact" acqId={id} citations={f.fact.citations} calculation={f.calculation} comparedWith={f.thesisLink ? `Playbook: ${f.thesisLink.expected}` : undefined} compact>
                    {f.fact.text}
                  </Claim>
                  {f.interpretation && (
                    <Claim kind="inference" compact>
                      {f.interpretation}
                    </Claim>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {chained.length > 0 && (
        <Box>
          <Text fw={600} mb={8}>
            Drafted follow-through for accepted findings
          </Text>
          <Stack gap="md">
            {Array.from(new Set(chained.map((p) => p.parentFindingId!))).map((fid) => (
              <ChainBlock key={fid} acqId={id} findingId={fid} />
            ))}
          </Stack>
        </Box>
      )}

      <Box>
        <Group justify="space-between" mb={8}>
          <SegmentedControl size="xs" value={view} onChange={setView} data={[{ value: 'pending', label: `Other proposals (${pendingStandalone.length})` }, { value: 'done', label: 'Reviewed' }]} />
          {view === 'pending' && requests.length > 1 && (
            <Button
              size="xs"
              variant="light"
              onClick={() => {
                requests.forEach((r) => acceptProposal(r.id));
                notifications.show({ message: `${requests.length} requests added to the seller request list.`, color: 'ink' });
              }}
            >
              Add all {requests.length} requests
            </Button>
          )}
        </Group>
        {shown.length === 0 ? (
          <Box className="panel">
            <Empty title={view === 'pending' ? 'Nothing else waiting' : 'Nothing reviewed yet'}>Atlas adds proposals here as documents arrive, research completes, and deliverables go out of date.</Empty>
          </Box>
        ) : (
          <Stack gap={8}>
            {shown.map((p) => (
              <ProposalCard key={p.id} p={p} />
            ))}
          </Stack>
        )}
      </Box>
      {total === 0 && chained.length === 0 && (
        <Group gap={6}>
          <IconSparkles size={14} color="#6d3fd4" />
          <Text size="xs" c="dimmed">
            Upload documents or ask Atlas to research the target to generate new proposals.
          </Text>
        </Group>
      )}
    </Stack>
  );
}

function ChainBlock({ acqId, findingId }: { acqId: string; findingId: string }) {
  const f = useStore((s) => s.findings.find((x) => x.id === findingId));
  if (!f) return null;
  return (
    <Box>
      <Text size="sm" mb={6}>
        From finding:{' '}
        <Text component={Link} href={`/acquisitions/${acqId}/findings/${f.id}`} span fw={600} c="ink.8">
          {f.title}
        </Text>
      </Text>
      <ChainPanel findingId={f.id} findingStatus={f.status} />
    </Box>
  );
}
