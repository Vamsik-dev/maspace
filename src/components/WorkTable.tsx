'use client';

import { Box, Group, Table, Text, Badge, Tooltip } from '@mantine/core';
import { IconRobot, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import type { WorkItem } from '@/lib/types';
import { DEMO_TODAY, phaseShort, wsLabel } from '@/lib/meta';
import { Person, StatusBadge, Empty } from './ui';
import { fmtDate } from '@/lib/atlas';

type SortKey = 'due' | 'priority' | 'status' | 'workstream';
const prio = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
const statusOrder = { Blocked: 0, 'Needs Review': 1, 'In Progress': 2, Waiting: 3, 'Not Started': 4, Complete: 5 };

export function WorkTable({ items, onOpen, showWorkstream = true }: { items: WorkItem[]; onOpen: (id: string) => void; showWorkstream?: boolean }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'due', dir: 1 });
  const sorted = useMemo(() => {
    const cmp = (a: WorkItem, b: WorkItem) => {
      switch (sort.key) {
        case 'due':
          return (a.due ?? '9999').localeCompare(b.due ?? '9999');
        case 'priority':
          return prio[a.priority] - prio[b.priority];
        case 'status':
          return statusOrder[a.status] - statusOrder[b.status];
        case 'workstream':
          return a.workstream.localeCompare(b.workstream);
      }
    };
    return [...items].sort((a, b) => cmp(a, b) * sort.dir);
  }, [items, sort]);
  const Th = ({ k, children, w }: { k: SortKey; children: string; w?: number }) => (
    <Table.Th w={w} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setSort({ key: k, dir: sort.key === k ? ((-sort.dir) as 1 | -1) : 1 })}>
      <Group gap={2} wrap="nowrap">
        {children}
        {sort.key === k && (sort.dir === 1 ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />)}
      </Group>
    </Table.Th>
  );
  if (!items.length) return <Empty title="No work items">Nothing matches this view.</Empty>;
  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Work item</Table.Th>
          {showWorkstream && (
            <Th k="workstream" w={120}>
              Workstream
            </Th>
          )}
          <Table.Th w={160}>Owner</Table.Th>
          <Th k="status" w={120}>
            Status
          </Th>
          <Th k="priority" w={80}>
            Priority
          </Th>
          <Th k="due" w={100}>
            Due
          </Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sorted.map((w) => {
          const overdue = w.due && w.due < DEMO_TODAY && w.status !== 'Complete';
          return (
            <Table.Tr key={w.id} onClick={() => onOpen(w.id)} style={{ cursor: 'pointer' }}>
              <Table.Td>
                <Group gap={6} wrap="nowrap">
                  <Badge size="xs" variant="default" w={62} style={{ flexShrink: 0 }}>
                    {w.kind}
                  </Badge>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate td={w.status === 'Complete' ? 'line-through' : undefined} c={w.status === 'Complete' ? 'dimmed' : undefined}>
                      {w.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {phaseShort(w.phase)}
                      {w.reviewerId ? ' · review required' : ''}
                      {w.dependsOn?.length ? ` · ${w.dependsOn.length} dependency` : ''}
                    </Text>
                  </Box>
                  {w.createdBy === 'automation' && (
                    <Tooltip label="Created by workflow automation">
                      <IconRobot size={13} color="var(--app-muted)" />
                    </Tooltip>
                  )}
                </Group>
              </Table.Td>
              {showWorkstream && (
                <Table.Td>
                  <Text size="sm">{wsLabel(w.workstream)}</Text>
                </Table.Td>
              )}
              <Table.Td>
                <Person id={w.ownerId} />
              </Table.Td>
              <Table.Td>
                <StatusBadge status={w.status} />
              </Table.Td>
              <Table.Td>
                <Text size="xs" c={w.priority === 'Urgent' ? 'red.7' : w.priority === 'High' ? 'orange.8' : 'dimmed'} fw={w.priority === 'Urgent' ? 600 : 400}>
                  {w.priority}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" className="num" c={overdue ? 'red.7' : undefined} fw={overdue ? 600 : 400}>
                  {w.due ? fmtDate(w.due) : '—'}
                </Text>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
