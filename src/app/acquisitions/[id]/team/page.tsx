'use client';

import { Box, Group, Stack, Table, Text, Badge, Select } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { DEMO_TODAY, wsLabel } from '@/lib/meta';
import { PageHeader, Person } from '@/components/ui';
import { personById } from '@/data/people';

const ROLE_HELP: Record<string, string> = {
  Owner: 'Accountable for the acquisition; can change anything.',
  Approver: 'Approves decisions and deliverables in their remit.',
  Reviewer: 'Reviews findings, work and decisions; cannot approve.',
  Contributor: 'Does the work in assigned workstreams.',
  Observer: 'Read-only access.',
};

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const acq = s.acquisitions.find((a) => a.id === id)!;
  const internal = acq.team.filter((m) => personById(m.personId)?.org === 'Internal');
  const advisors = acq.team.filter((m) => personById(m.personId)?.org === 'Advisor');

  const Rows = ({ list }: { list: typeof acq.team }) => (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Person</Table.Th>
          <Table.Th w={130}>Deal role</Table.Th>
          <Table.Th>Workstreams</Table.Th>
          <Table.Th w={110} ta="right">
            Open work
          </Table.Th>
          <Table.Th w={90} ta="right">
            Overdue
          </Table.Th>
          <Table.Th w={110} ta="right">
            Decisions
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {list.map((m) => {
          const p = personById(m.personId)!;
          const open = s.work.filter((w) => w.acqId === id && w.ownerId === m.personId && w.status !== 'Complete');
          const overdue = open.filter((w) => w.due && w.due < DEMO_TODAY).length;
          const dec = s.decisions.filter((d) => d.acqId === id && (d.status === 'Open' || d.status === 'Under Review') && (d.approverId === m.personId || d.reviewers.some((r) => r.personId === m.personId && r.verdict === 'Pending'))).length;
          return (
            <Table.Tr key={m.personId}>
              <Table.Td>
                <Group gap={8} wrap="nowrap">
                  <Person id={m.personId} size={26} />
                  <Text size="xs" c="dimmed">
                    {p.title}
                    {p.firm ? ` · ${p.firm}` : ''}
                    {m.note ? ` · ${m.note}` : ''}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Select size="xs" variant="unstyled" data={Object.keys(ROLE_HELP)} value={m.dealRole} disabled title={ROLE_HELP[m.dealRole]} />
              </Table.Td>
              <Table.Td>
                <Group gap={4}>
                  {m.workstreams.map((w) => (
                    <Badge key={w} variant="default" size="xs">
                      {wsLabel(w)}
                    </Badge>
                  ))}
                  {m.workstreams.length === 0 && (
                    <Text size="xs" c="dimmed">
                      All (oversight)
                    </Text>
                  )}
                </Group>
              </Table.Td>
              <Table.Td ta="right" className="num">
                {open.length || '—'}
              </Table.Td>
              <Table.Td ta="right" className="num" c={overdue ? 'red.7' : undefined}>
                {overdue || '—'}
              </Table.Td>
              <Table.Td ta="right" className="num">
                {dec || '—'}
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );

  return (
    <Stack gap="md">
      <PageHeader eyebrow="People" title="Deal team" description="Who is on this acquisition, what they own and what they can approve. External advisors only see the workstreams they are assigned to." />
      <Box style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
        <Text px="md" pt="sm" className="label">
          Meridian ({internal.length})
        </Text>
        <Rows list={internal} />
      </Box>
      {advisors.length > 0 && (
        <Box style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
          <Text px="md" pt="sm" className="label">
            External advisors ({advisors.length}) · access limited to assigned workstreams
          </Text>
          <Rows list={advisors} />
        </Box>
      )}
      <Group gap="lg">
        {Object.entries(ROLE_HELP).map(([k, v]) => (
          <Text key={k} size="xs" c="dimmed">
            <b>{k}</b> — {v}
          </Text>
        ))}
      </Group>
    </Stack>
  );
}
