'use client';

import { Button, Group, Modal, MultiSelect, Select, Stack, Text, TextInput, Textarea, SegmentedControl, ActionIcon } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { PHASES } from '@/lib/meta';
import { useOrgPeople, useWorkstreams } from '@/lib/hooks';
import type { Person } from '@/lib/types';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import type { PhaseKey, Severity, WorkstreamKey, WorkItem } from '@/lib/types';

const toPeopleData = (ps: Person[]) => ps.map((p) => ({ value: p.id, label: `${p.name} — ${p.function}${p.firm ? ` (${p.firm})` : ''}` }));
const phaseData = PHASES.map((p) => ({ value: p.key, label: `${p.n}. ${p.short}` }));

export function NewWorkItemModal({
  opened,
  onClose,
  acqId,
  defaults,
  onCreated,
}: {
  opened: boolean;
  onClose: () => void;
  acqId: string;
  defaults?: Partial<WorkItem>;
  onCreated?: (id: string) => void;
}) {
  const add = useStore((s) => s.addWork);
  const wsData = useWorkstreams(acqId).map((w) => ({ value: w.key, label: w.label }));
  const people = useOrgPeople();
  const peopleData = toPeopleData(people);
  const me = useStore((s) => s.currentUserId);
  const init = () => ({
    title: defaults?.title ?? '',
    description: defaults?.description ?? '',
    kind: defaults?.kind ?? ('Task' as WorkItem['kind']),
    workstream: defaults?.workstream ?? (wsData[0]?.value as WorkstreamKey),
    phase: defaults?.phase ?? ('diligence' as PhaseKey),
    ownerId: defaults?.ownerId ?? me,
    reviewerId: defaults?.reviewerId ?? '',
    priority: defaults?.priority ?? ('Normal' as WorkItem['priority']),
    due: defaults?.due ?? '2026-10-09',
  });
  const [v, setV] = useState(init);
  useEffect(() => {
    if (opened) setV(init());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);
  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={600}>{v.kind === 'Review' ? 'Request review' : 'New work item'}</Text>} size="lg">
      <Stack gap="sm">
        <SegmentedControl size="xs" value={v.kind} onChange={(k) => setV({ ...v, kind: k as WorkItem['kind'] })} data={['Task', 'Request', 'Review', 'Approval']} />
        <TextInput size="sm" label="Title" value={v.title} onChange={(e) => setV({ ...v, title: e.currentTarget.value })} data-autofocus />
        <Textarea size="sm" label="Description" autosize minRows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.currentTarget.value })} />
        <Group grow>
          <Select size="sm" label="Workstream" data={wsData} value={v.workstream} onChange={(x) => setV({ ...v, workstream: (x as WorkstreamKey) ?? v.workstream })} />
          <Select size="sm" label="Phase" data={phaseData} value={v.phase} onChange={(x) => setV({ ...v, phase: (x as PhaseKey) ?? v.phase })} />
        </Group>
        <Group grow>
          <Select size="sm" label="Owner" data={peopleData} value={v.ownerId} onChange={(x) => setV({ ...v, ownerId: x ?? v.ownerId })} searchable />
          <Select size="sm" label="Reviewer" data={peopleData} value={v.reviewerId || null} onChange={(x) => setV({ ...v, reviewerId: x ?? '' })} clearable searchable />
        </Group>
        <Group grow>
          <Select size="sm" label="Priority" data={['Urgent', 'High', 'Normal', 'Low']} value={v.priority} onChange={(x) => setV({ ...v, priority: (x as WorkItem['priority']) ?? 'Normal' })} />
          <TextInput size="sm" type="date" label="Due" value={v.due} onChange={(e) => setV({ ...v, due: e.currentTarget.value })} />
        </Group>
        <Group justify="flex-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!v.title.trim()}
            onClick={() => {
              const id = add({
                acqId,
                title: v.title,
                description: v.description || undefined,
                kind: v.kind,
                workstream: v.workstream,
                phase: v.phase,
                status: 'Not Started',
                priority: v.priority,
                ownerId: v.ownerId,
                reviewerId: v.reviewerId || undefined,
                due: v.due,
                findingIds: defaults?.findingIds,
                decisionIds: defaults?.decisionIds,
                documentIds: defaults?.documentIds,
              });
              onCreated?.(id);
              onClose();
              notifications.show({ message: `Assigned to ${people.find((p) => p.id === v.ownerId)?.name}. They'll be notified.`, color: 'ink' });
            }}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function NewDecisionModal({
  opened,
  onClose,
  acqId,
  defaults,
  onCreated,
}: {
  opened: boolean;
  onClose: () => void;
  acqId: string;
  defaults?: { question?: string; context?: string; options?: string[]; findingIds?: string[]; riskIds?: string[]; documentIds?: string[]; phase?: PhaseKey };
  onCreated?: (id: string) => void;
}) {
  const add = useStore((s) => s.addDecision);
  const people = useOrgPeople();
  const peopleData = toPeopleData(people);
  const init = () => ({
    question: defaults?.question ?? '',
    context: defaults?.context ?? '',
    options: defaults?.options?.length ? defaults.options : ['', ''],
    approverId: people.find((p) => p.function === 'CEO')?.id ?? people[0].id,
    reviewerIds: [people.find((p) => p.function === 'CFO')?.id ?? people[0].id] as string[],
    due: '2026-10-14',
    phase: defaults?.phase ?? ('diligence' as PhaseKey),
  });
  const [v, setV] = useState(init);
  useEffect(() => {
    if (opened) setV(init());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);
  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={600}>New decision</Text>} size="lg">
      <Stack gap="sm">
        <TextInput size="sm" label="Decision question" placeholder="Should we…?" value={v.question} onChange={(e) => setV({ ...v, question: e.currentTarget.value })} />
        <Textarea size="sm" label="Context" autosize minRows={2} value={v.context} onChange={(e) => setV({ ...v, context: e.currentTarget.value })} />
        <Stack gap={6}>
          <Text size="sm" fw={500}>
            Options
          </Text>
          {v.options.map((o, i) => (
            <Group key={i} gap={6} wrap="nowrap">
              <TextInput size="sm" style={{ flex: 1 }} placeholder={`Option ${i + 1}`} value={o} onChange={(e) => setV({ ...v, options: v.options.map((x, j) => (j === i ? e.currentTarget.value : x)) })} />
              <ActionIcon variant="subtle" color="gray" onClick={() => setV({ ...v, options: v.options.filter((_, j) => j !== i) })} disabled={v.options.length <= 2}>
                <IconX size={14} />
              </ActionIcon>
            </Group>
          ))}
          <Group>
            <Button variant="subtle" leftSection={<IconPlus size={13} />} onClick={() => setV({ ...v, options: [...v.options, ''] })}>
              Add option
            </Button>
          </Group>
        </Stack>
        <Group grow>
          <Select size="sm" label="Approver" data={peopleData} value={v.approverId} onChange={(x) => setV({ ...v, approverId: x ?? v.approverId })} />
          <TextInput size="sm" type="date" label="Decide by" value={v.due} onChange={(e) => setV({ ...v, due: e.currentTarget.value })} />
        </Group>
        <Group grow>
          <MultiSelect size="sm" label="Reviewers" data={peopleData} value={v.reviewerIds} onChange={(x) => setV({ ...v, reviewerIds: x })} />
          <Select size="sm" label="Phase" data={phaseData} value={v.phase} onChange={(x) => setV({ ...v, phase: (x as PhaseKey) ?? v.phase })} />
        </Group>
        <Group justify="flex-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!v.question.trim() || v.options.filter((o) => o.trim()).length < 2}
            onClick={() => {
              const id = add({
                acqId,
                question: v.question,
                context: v.context,
                phase: v.phase,
                options: v.options.filter((o) => o.trim()).map((label, i) => ({ id: `o${i + 1}`, label, description: '', pros: [], cons: [] })),
                proposedBy: useStore.getState().currentUserId,
                approverId: v.approverId,
                reviewerIds: v.reviewerIds,
                due: v.due,
                findingIds: defaults?.findingIds ?? [],
                riskIds: defaults?.riskIds ?? [],
                documentIds: defaults?.documentIds ?? [],
                downstream: [],
              });
              onCreated?.(id);
              onClose();
              notifications.show({ message: 'Decision opened. Reviewers have been asked for input.', color: 'ink' });
            }}
          >
            Open decision
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function NewRiskModal({ opened, onClose, findingId, defaults }: { opened: boolean; onClose: () => void; findingId: string; defaults?: { title?: string; description?: string; severity?: Severity; ownerId?: string } }) {
  const add = useStore((s) => s.addRiskFromFinding);
  const people = useOrgPeople();
  const peopleData = toPeopleData(people);
  const init = () => ({ title: defaults?.title ?? '', description: defaults?.description ?? '', severity: defaults?.severity ?? ('Medium' as Severity), probability: 'Possible' as const, ownerId: defaults?.ownerId ?? people[0].id, mitigation: '' });
  const [v, setV] = useState(init);
  useEffect(() => {
    if (opened) setV(init());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);
  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={600}>Create risk from finding</Text>} size="lg">
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          A finding is what we observed. A risk is what could go wrong because of it, and what we will do about it.
        </Text>
        <TextInput size="sm" label="Risk" value={v.title} onChange={(e) => setV({ ...v, title: e.currentTarget.value })} />
        <Textarea size="sm" label="Description" autosize minRows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.currentTarget.value })} />
        <Group grow>
          <Select size="sm" label="Severity" data={['Critical', 'High', 'Medium', 'Low']} value={v.severity} onChange={(x) => setV({ ...v, severity: (x as Severity) ?? v.severity })} />
          <Select size="sm" label="Probability" data={['Likely', 'Possible', 'Unlikely']} value={v.probability} onChange={(x) => setV({ ...v, probability: (x as never) ?? v.probability })} />
          <Select size="sm" label="Owner" data={peopleData} value={v.ownerId} onChange={(x) => setV({ ...v, ownerId: x ?? v.ownerId })} />
        </Group>
        <Textarea size="sm" label="Mitigation" autosize minRows={2} value={v.mitigation} onChange={(e) => setV({ ...v, mitigation: e.currentTarget.value })} />
        <Group justify="flex-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!v.title.trim()}
            onClick={() => {
              add(findingId, v);
              onClose();
              notifications.show({ message: 'Risk added to the register and linked to the finding.', color: 'ink' });
            }}
          >
            Add risk
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function NewFindingModal({ opened, onClose, acqId, onCreated }: { opened: boolean; onClose: () => void; acqId: string; onCreated?: (id: string) => void }) {
  const add = useStore((s) => s.addFinding);
  const wsData = useWorkstreams(acqId).map((w) => ({ value: w.key, label: w.label }));
  const people = useOrgPeople();
  const peopleData = toPeopleData(people);
  const docs = useStore(useShallow((s) => s.documents.filter((d) => d.acqId === acqId)));
  const me = useStore((s) => s.currentUserId);
  const init = () => ({ title: '', fact: '', workstream: wsData[0]?.value as WorkstreamKey, severity: 'Medium' as Severity, docId: '', page: '', interpretation: '', ownerId: me });
  const [v, setV] = useState(init);
  useEffect(() => {
    if (opened) setV(init());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);
  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={600}>Record a finding</Text>} size="lg">
      <Stack gap="sm">
        <TextInput size="sm" label="Finding" placeholder="Short, specific statement" value={v.title} onChange={(e) => setV({ ...v, title: e.currentTarget.value })} />
        <Textarea size="sm" label="Evidence (fact)" description="What the source says. Keep interpretation separate." autosize minRows={2} value={v.fact} onChange={(e) => setV({ ...v, fact: e.currentTarget.value })} />
        <Group grow>
          <Select size="sm" label="Source document" data={docs.map((d) => ({ value: d.id, label: d.name }))} value={v.docId || null} onChange={(x) => setV({ ...v, docId: x ?? '' })} searchable clearable />
          <TextInput size="sm" label="Page" w={80} value={v.page} onChange={(e) => setV({ ...v, page: e.currentTarget.value })} />
        </Group>
        <Textarea size="sm" label="Interpretation (optional)" autosize minRows={2} value={v.interpretation} onChange={(e) => setV({ ...v, interpretation: e.currentTarget.value })} />
        <Group grow>
          <Select size="sm" label="Workstream" data={wsData} value={v.workstream} onChange={(x) => setV({ ...v, workstream: (x as WorkstreamKey) ?? v.workstream })} />
          <Select size="sm" label="Severity" data={['Critical', 'High', 'Medium', 'Low']} value={v.severity} onChange={(x) => setV({ ...v, severity: (x as Severity) ?? v.severity })} />
          <Select size="sm" label="Owner" data={peopleData} value={v.ownerId} onChange={(x) => setV({ ...v, ownerId: x ?? v.ownerId })} />
        </Group>
        {(v.severity === 'High' || v.severity === 'Critical') && (
          <Text size="xs" c="orange.8">
            Workflow: a review work item will be created automatically for this {v.severity.toLowerCase()} finding.
          </Text>
        )}
        <Group justify="flex-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!v.title.trim() || !v.fact.trim()}
            onClick={() => {
              const id = add({
                acqId,
                title: v.title,
                workstream: v.workstream,
                severity: v.severity,
                status: 'Open',
                ownerId: v.ownerId,
                identifiedBy: me,
                fact: { text: v.fact, citations: v.docId ? [{ docId: v.docId, page: v.page ? Number(v.page) : undefined }] : [] },
                interpretation: v.interpretation || undefined,
                implications: [],
              });
              onCreated?.(id);
              onClose();
            }}
          >
            Record finding
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
