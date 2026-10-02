'use client';

import { Box, Button, Group, SegmentedControl, Stack, Table, Text, Badge, Select } from '@mantine/core';
import { IconPlus, IconSparkles } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { WORKSTREAMS, wsLabel } from '@/lib/meta';
import { PageHeader, SeverityBadge, StatusBadge, Person, Empty, AtlasAvatar } from '@/components/ui';
import { NewFindingModal } from '@/components/Forms';
import { fmtDate } from '@/lib/atlas';

const sev = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export default function FindingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const all = useStore(useShallow((s) => s.findings.filter((f) => f.acqId === id)));
  const [view, setView] = useState('open');
  const [ws, setWs] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const list = all
    .filter((f) => (view === 'open' ? ['Proposed', 'Open', 'Under Review'].includes(f.status) : view === 'closed' ? ['Confirmed', 'Resolved', 'Dismissed'].includes(f.status) : true))
    .filter((f) => !ws || f.workstream === ws)
    .sort((a, b) => (a.status === 'Proposed' ? -1 : 0) - (b.status === 'Proposed' ? -1 : 0) || sev[a.severity] - sev[b.severity]);
  const proposed = all.filter((f) => f.status === 'Proposed').length;

  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Diligence"
        title="Findings"
        description="What diligence has established, with evidence. Findings feed risks, decisions and deal documents. Atlas can propose findings; a person accepts them."
        right={
          <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>
            Record finding
          </Button>
        }
      />
      <Group justify="space-between">
        <Group gap="sm">
          <SegmentedControl
            size="xs"
            value={view}
            onChange={setView}
            data={[
              { value: 'open', label: `Open (${all.filter((f) => ['Proposed', 'Open', 'Under Review'].includes(f.status)).length})` },
              { value: 'closed', label: 'Confirmed / resolved' },
              { value: 'all', label: `All (${all.length})` },
            ]}
          />
          <Select size="xs" placeholder="All workstreams" clearable data={WORKSTREAMS.map((w) => ({ value: w.key, label: w.label }))} value={ws} onChange={setWs} w={180} />
        </Group>
        {proposed > 0 && (
          <Badge color="violet" leftSection={<IconSparkles size={11} />}>
            {proposed} proposed by Atlas awaiting review
          </Badge>
        )}
      </Group>
      <Box className="panel">
        {list.length === 0 ? (
          <Empty title="No findings match">Findings appear here as diligence progresses — recorded by the team, advisors, or proposed by Atlas from documents.</Empty>
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={90}>Severity</Table.Th>
                <Table.Th>Finding</Table.Th>
                <Table.Th w={120}>Workstream</Table.Th>
                <Table.Th w={160}>Owner</Table.Th>
                <Table.Th w={110}>Status</Table.Th>
                <Table.Th w={130}>Links</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.map((f) => (
                <Table.Tr key={f.id} style={{ cursor: 'pointer', background: f.status === 'Proposed' ? '#f7f3ff' : undefined }} onClick={() => router.push(`/acquisitions/${id}/findings/${f.id}`)}>
                  <Table.Td>
                    <SeverityBadge severity={f.severity} positive={f.positive} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500} component={Link} href={`/acquisitions/${id}/findings/${f.id}`}>
                      {f.title}
                    </Text>
                    <Group gap={6} mt={2}>
                      {f.identifiedBy === 'atlas' && <AtlasAvatar size={14} />}
                      <Text size="xs" c="dimmed">
                        {f.identifiedBy === 'atlas' ? 'Atlas' : 'Raised'} · {fmtDate(f.createdAt)} · {f.fact.citations.length} source{f.fact.citations.length === 1 ? '' : 's'}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{wsLabel(f.workstream)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Person id={f.ownerId} />
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={f.status} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {[f.riskIds.length && `${f.riskIds.length} risk`, f.decisionIds.length && `${f.decisionIds.length} decision`, f.workItemIds.length && `${f.workItemIds.length} work`].filter(Boolean).join(' · ') || '—'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Box>
      <NewFindingModal opened={open} onClose={() => setOpen(false)} acqId={id} onCreated={(fid) => router.push(`/acquisitions/${id}/findings/${fid}`)} />
    </Stack>
  );
}
