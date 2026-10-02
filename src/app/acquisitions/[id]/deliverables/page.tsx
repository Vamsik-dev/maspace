'use client';

import { Box, Button, Group, Menu, SimpleGrid, Stack, Text, Badge } from '@mantine/core';
import { IconChevronDown, IconSparkles, IconFileText } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useStore, nowIso } from '@/lib/store';
import type { Deliverable } from '@/lib/types';
import { fmtDate } from '@/lib/atlas';
import { PageHeader, StatusBadge, Person, Empty } from '@/components/ui';

const TYPES: { type: Deliverable['type']; desc: string }[] = [
  { type: 'IC Memo', desc: 'Transaction, thesis, valuation, findings, risks and decisions required.' },
  { type: 'Management Meeting Brief', desc: 'Issues to clarify, questions and lessons from prior deals.' },
  { type: 'Weekly Deal Update', desc: 'What changed, what is pending, what is next.' },
  { type: 'Diligence Summary', desc: 'Findings by workstream with sources.' },
  { type: 'Day-1 Integration Plan', desc: 'Day-1 must-haves and integration implications from diligence.' },
  { type: 'Target Brief', desc: 'Profile, strategic fit and initial questions.' },
];

export default function DeliverablesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const list = useStore(useShallow((s) => s.deliverables.filter((d) => d.acqId === id)));
  const add = useStore((s) => s.addDeliverable);
  const acq = useStore((s) => s.acquisitions.find((a) => a.id === id))!;
  const me = useStore((s) => s.currentUserId);

  const create = (type: Deliverable['type']) => {
    const did = add({ acqId: id, title: `${type} — ${acq.name}`, type, status: 'Draft', ownerId: me, generatedAt: nowIso().slice(0, 10), sources: [] });
    router.push(`/acquisitions/${id}/deliverables/${did}`);
  };

  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Materials"
        title="Deliverables"
        description="Deal documents generated from structured acquisition data, then edited by the team. Numbers and facts link back to their sources; Atlas never marks a deliverable final."
        right={
          <Menu position="bottom-end" width={340}>
            <Menu.Target>
              <Button leftSection={<IconSparkles size={14} />} rightSection={<IconChevronDown size={13} />}>
                Generate
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {TYPES.map((t) => (
                <Menu.Item key={t.type} onClick={() => create(t.type)}>
                  <Text size="sm" fw={500}>
                    {t.type}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t.desc}
                  </Text>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        }
      />
      {list.length === 0 && (
        <Box style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
          <Empty title="No deliverables yet">Generate a target brief to start. Deliverables update as the deal data changes.</Empty>
        </Box>
      )}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {list.map((d) => (
          <Box key={d.id} component={Link} href={`/acquisitions/${id}/deliverables/${d.id}`} p="md" className="row-link" style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8, display: 'block' }}>
            <Group justify="space-between" mb={8}>
              <Badge variant="default" leftSection={<IconFileText size={11} />}>
                {d.type}
              </Badge>
              <StatusBadge status={d.status} />
            </Group>
            <Text fw={600} lh={1.3}>
              {d.title}
            </Text>
            <Group justify="space-between" mt="md">
              <Person id={d.ownerId} />
              <Text size="xs" c="dimmed">
                {d.content ? 'Edited' : 'Generated'} {fmtDate(d.generatedAt)}
              </Text>
            </Group>
          </Box>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
