'use client';

import { Alert, Anchor, Box, Button, Group, Menu, Stack, Text, Badge, Modal } from '@mantine/core';
import { IconArrowLeft, IconChevronDown, IconPrinter, IconRefresh, IconSparkles } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { generate } from '@/lib/generate';
import { DEMO_TODAY } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import { Empty, Person, StatusBadge, personName } from '@/components/ui';
import type { Deliverable } from '@/lib/types';

const DocEditor = dynamic(() => import('@/components/DocEditor'), { ssr: false, loading: () => <Text size="sm" c="dimmed" p="md">Loading editor…</Text> });

export default function DeliverablePage() {
  const { id, delId } = useParams<{ id: string; delId: string }>();
  const d = useStore((s) => s.deliverables.find((x) => x.id === delId));
  const save = useStore((s) => s.saveDeliverable);
  const update = useStore((s) => s.updateDeliverable);
  const me = useStore((s) => s.currentUserId);
  const counts = useStore(
    useShallow((s) => ({
      f: s.findings.filter((f) => f.acqId === id && !['Dismissed', 'Proposed'].includes(f.status)).length,
      r: s.risks.filter((r) => r.acqId === id).length,
      d: s.decisions.filter((x) => x.acqId === id).length,
    })),
  );
  const [version, setVersion] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial content: saved human edits, otherwise generated from current structured data.
  const initial = useMemo(() => {
    if (!d) return [];
    return (d.content as unknown[]) ?? generate(d.type, id, useStore.getState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d?.id, version]);

  if (!d) return <Empty title="Deliverable not found" />;

  const next: Record<Deliverable['status'], Deliverable['status'][]> = { Draft: ['In Review'], 'In Review': ['Draft', 'Final'], Final: ['Draft'] };

  return (
    <Stack gap="md">
      <Anchor component={Link} href={`/acquisitions/${id}/deliverables`} size="xs" c="dimmed" className="no-print">
        <IconArrowLeft size={11} /> Deliverables
      </Anchor>
      <Group justify="space-between" align="flex-end" className="no-print">
        <Box>
          <Group gap={6} mb={4}>
            <Badge variant="default">{d.type}</Badge>
            <StatusBadge status={d.status} />
          </Group>
          <Text fz={22} fw={650}>
            {d.title}
          </Text>
          <Group gap={8} mt={4}>
            <Person id={d.ownerId} />
            <Text size="xs" c="dimmed">
              · generated {fmtDate(d.generatedAt)}
              {d.content ? ' · edited by the team' : ''}
            </Text>
          </Group>
        </Box>
        <Group gap={6}>
          <Button variant="default" leftSection={<IconRefresh size={14} />} onClick={() => (d.content ? setConfirm(true) : setVersion((v) => v + 1))}>
            Regenerate from deal data
          </Button>
          <Button variant="default" leftSection={<IconPrinter size={14} />} onClick={() => window.print()}>
            Print / PDF
          </Button>
          <Menu position="bottom-end">
            <Menu.Target>
              <Button rightSection={<IconChevronDown size={13} />}>Status: {d.status}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              {next[d.status].map((st) => (
                <Menu.Item
                  key={st}
                  onClick={() => {
                    update(d.id, { status: st });
                    if (st === 'Final') notifications.show({ message: `Marked final by ${personName(me)}. Recorded in the audit trail.`, color: 'ink' });
                  }}
                >
                  {st === 'Final' ? 'Approve as Final' : st === 'In Review' ? 'Send for review' : 'Return to draft'}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Alert variant="light" color="violet" icon={<IconSparkles size={16} />} className="no-print" py={8}>
        <Text size="xs">
          Assembled by Atlas from structured deal data — {counts.f} findings, {counts.r} risks, {counts.d} decisions and the valuation bridge — not free-written. Bracketed references link to the source page. Sections
          Atlas should not write (e.g. the recommendation) are left for the deal lead.
        </Text>
      </Alert>

      <Box py="lg" style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
        <Box maw={860} mx="auto">
          <DocEditor
            key={`${d.id}-${version}`}
            initial={initial}
            onChange={(doc) => {
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => save(d.id, doc), 400);
            }}
          />
        </Box>
      </Box>

      <Modal opened={confirm} onClose={() => setConfirm(false)} title={<Text fw={600}>Regenerate this document?</Text>}>
        <Text size="sm" mb="md">
          This rebuilds the document from the latest findings, risks, decisions and valuation. Edits made by the team will be replaced.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" size="sm" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            color="red"
            onClick={() => {
              save(d.id, undefined);
              update(d.id, { generatedAt: DEMO_TODAY });
              setVersion((v) => v + 1);
              setConfirm(false);
            }}
          >
            Regenerate
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
