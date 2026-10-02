'use client';

import { Box, Button, Group, SegmentedControl, Select, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { useWorkstreams, useOrgPeople } from '@/lib/hooks';
import { DEMO_TODAY, PHASES } from '@/lib/meta';
import { PageHeader } from '@/components/ui';
import { WorkTable } from '@/components/WorkTable';
import { WorkItemDrawer } from '@/components/WorkItemDrawer';
import { NewWorkItemModal } from '@/components/Forms';

function WorkInner() {
  const { id } = useParams<{ id: string }>();
  const WS = useWorkstreams(id);
  const PEOPLE = useOrgPeople();
  const params = useSearchParams();
  const router = useRouter();
  const me = useStore((s) => s.currentUserId);
  const all = useStore(useShallow((s) => s.work.filter((w) => w.acqId === id)));
  const [view, setView] = useState(params.get('view') ?? 'open');
  const [ws, setWs] = useState<string | null>(null);
  const [phase, setPhase] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const item = params.get('item');

  const items = all
    .filter((w) => {
      if (view === 'mine') return (w.ownerId === me || w.reviewerId === me) && w.status !== 'Complete';
      if (view === 'overdue') return w.status !== 'Complete' && !!w.due && w.due < DEMO_TODAY;
      if (view === 'review') return w.status === 'Needs Review';
      if (view === 'open') return w.status !== 'Complete';
      return true;
    })
    .filter((w) => !ws || w.workstream === ws)
    .filter((w) => !phase || w.phase === phase)
    .filter((w) => !owner || w.ownerId === owner);

  const setItem = (wid: string | null) => {
    const q = new URLSearchParams(params.toString());
    if (wid) q.set('item', wid);
    else q.delete('item');
    router.replace(`/acquisitions/${id}/work${q.toString() ? `?${q}` : ''}`, { scroll: false });
  };

  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Execution"
        title="Work items"
        description="Tasks, information requests, reviews and approvals across workstreams and phases. Work links back to the findings and decisions it serves."
        right={
          <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>
            New work item
          </Button>
        }
      />
      <Group gap="sm">
        <SegmentedControl
          size="xs"
          value={view}
          onChange={setView}
          data={[
            { value: 'open', label: 'Open' },
            { value: 'mine', label: 'Mine' },
            { value: 'overdue', label: `Overdue (${all.filter((w) => w.status !== 'Complete' && w.due && w.due < DEMO_TODAY).length})` },
            { value: 'review', label: 'Needs review' },
            { value: 'all', label: 'All' },
          ]}
        />
        <Select size="xs" w={160} placeholder="Workstream" clearable data={WS.map((w) => ({ value: w.key, label: w.label }))} value={ws} onChange={setWs} />
        <Select size="xs" w={150} placeholder="Phase" clearable data={PHASES.map((p) => ({ value: p.key, label: p.short }))} value={phase} onChange={setPhase} />
        <Select size="xs" w={160} placeholder="Owner" clearable searchable data={PEOPLE.map((p) => ({ value: p.id, label: p.name }))} value={owner} onChange={setOwner} />
      </Group>
      <Box className="panel">
        <WorkTable items={items} onOpen={setItem} />
      </Box>
      <WorkItemDrawer itemId={item} onClose={() => setItem(null)} />
      <NewWorkItemModal opened={open} onClose={() => setOpen(false)} acqId={id} onCreated={setItem} />
    </Stack>
  );
}

export default function WorkPage() {
  return (
    <Suspense>
      <WorkInner />
    </Suspense>
  );
}
