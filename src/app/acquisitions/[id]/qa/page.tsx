'use client';

import { Box, Button, Group, SegmentedControl, Select, Stack, Text, Textarea, Anchor } from '@mantine/core';
import { IconSparkles, IconPlus, IconSend } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { notifications } from '@mantine/notifications';
import { useStore } from '@/lib/store';
import { useWorkstreams } from '@/lib/hooks';
import { wsLabel } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import { PageHeader, Pill, PersonAvatar, personName, Empty } from '@/components/ui';
import type { QAItem } from '@/lib/types';

const STATUS_COLOR = { Draft: 'violet', Sent: 'blue', Answered: 'teal', 'Follow-up': 'orange' } as const;

function QARow({ q }: { q: QAItem }) {
  const update = useStore((s) => s.updateQA);
  const finding = useStore((s) => (q.findingId ? s.findings.find((f) => f.id === q.findingId) : undefined));
  const [answer, setAnswer] = useState('');
  return (
    <Box p="md" style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Box style={{ minWidth: 0 }}>
          <Group gap={6} mb={4}>
            <Pill color={STATUS_COLOR[q.status]}>{q.status}</Pill>
            <Text size="xs" c="dimmed">
              {wsLabel(q.workstream)} · to {q.askedOf.toLowerCase()} · {q.draftedBy === 'atlas' ? 'drafted by Atlas' : `asked by ${personName(q.askedBy)}`} · {fmtDate(q.askedAt)}
            </Text>
          </Group>
          <Text size="sm" fw={500}>
            {q.question}
          </Text>
          {finding && (
            <Anchor component={Link} href={`/acquisitions/${q.acqId}/findings/${finding.id}`} size="xs">
              Finding: {finding.title}
            </Anchor>
          )}
          {q.answer && (
            <Box mt={8} pl={10} style={{ borderLeft: '2px solid #12a383' }}>
              <Text fz={10.5} fw={600} tt="uppercase" c="teal.8" style={{ letterSpacing: '0.05em' }}>
                Answer · {q.answeredAt ? fmtDate(q.answeredAt) : ''}
              </Text>
              <Text size="sm">{q.answer}</Text>
            </Box>
          )}
          {(q.status === 'Sent' || q.status === 'Follow-up') && (
            <Group mt={8} gap={6} align="flex-end" wrap="nowrap">
              <Textarea size="xs" autosize minRows={1} placeholder="Record the answer received…" value={answer} onChange={(e) => setAnswer(e.currentTarget.value)} style={{ flex: 1 }} />
              <Button size="xs" variant="default" disabled={!answer.trim()} onClick={() => update(q.id, { status: 'Answered', answer: answer.trim(), answeredAt: '2026-10-02' })}>
                Record answer
              </Button>
            </Group>
          )}
        </Box>
        <Group gap={6} wrap="nowrap">
          {q.status === 'Draft' && (
            <Button size="compact-sm" leftSection={<IconSend size={12} />} onClick={() => update(q.id, { status: 'Sent' })}>
              Send
            </Button>
          )}
          {q.status === 'Answered' && (
            <Button size="compact-sm" variant="default" onClick={() => update(q.id, { status: 'Follow-up' })}>
              Follow up
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  );
}

export default function QAPage() {
  const { id } = useParams<{ id: string }>();
  const items = useStore(useShallow((s) => s.qa.filter((q) => q.acqId === id)));
  const draft = useStore((s) => s.draftQAFromFindings);
  const add = useStore((s) => s.addQA);
  const ws = useWorkstreams(id);
  const [view, setView] = useState('open');
  const [newQ, setNewQ] = useState('');
  const [newWs, setNewWs] = useState<string | null>(ws[0]?.key ?? null);
  const shown = items.filter((q) => (view === 'open' ? q.status !== 'Answered' : view === 'answered' ? q.status === 'Answered' : true));

  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Phase 4 · Due Diligence"
        title="Q&A with management"
        description="Questions to the seller, management and banker, tracked to an answer. Atlas drafts questions from open findings; a person edits and sends them. Answers stay linked to the finding they resolve."
        right={
          <Button
            variant="light"
            color="violet"
            leftSection={<IconSparkles size={14} />}
            onClick={() => {
              const n = draft(id);
              notifications.show({ message: n ? `Atlas drafted ${n} questions from open findings.` : 'Every open finding already has a question.', color: 'violet' });
            }}
          >
            Draft from open findings
          </Button>
        }
      />
      <Group justify="space-between">
        <SegmentedControl
          size="xs"
          value={view}
          onChange={setView}
          data={[
            { value: 'open', label: `Open (${items.filter((q) => q.status !== 'Answered').length})` },
            { value: 'answered', label: `Answered (${items.filter((q) => q.status === 'Answered').length})` },
            { value: 'all', label: 'All' },
          ]}
        />
        <Group gap={4}>
          {(['Draft', 'Sent', 'Follow-up'] as const).map((s) => (
            <Pill key={s} color={STATUS_COLOR[s]}>
              {items.filter((q) => q.status === s).length} {s.toLowerCase()}
            </Pill>
          ))}
        </Group>
      </Group>
      <Box className="panel" p="sm">
        <Group gap={6} align="flex-end" wrap="nowrap">
          <Textarea size="xs" autosize minRows={1} label="New question" placeholder="Ask management or the seller…" value={newQ} onChange={(e) => setNewQ(e.currentTarget.value)} style={{ flex: 1 }} />
          <Select size="xs" w={170} label="Workstream" data={ws.map((w) => ({ value: w.key, label: w.label }))} value={newWs} onChange={setNewWs} />
          <Button
            size="xs"
            leftSection={<IconPlus size={13} />}
            disabled={!newQ.trim()}
            onClick={() => {
              add({ acqId: id, question: newQ.trim(), workstream: newWs ?? ws[0].key, askedOf: 'Management', status: 'Draft' });
              setNewQ('');
            }}
          >
            Add
          </Button>
        </Group>
      </Box>
      <Box className="panel" style={{ overflow: 'hidden' }}>
        {shown.length === 0 ? (
          <Empty title="No questions here">Draft questions from open findings, or add your own.</Empty>
        ) : (
          shown.map((q) => <QARow key={q.id} q={q} />)
        )}
      </Box>
      <Group gap={6}>
        <PersonAvatar id="atlas" size={16} />
        <Text size="xs" c="dimmed">
          In the product, sent questions go to a seller portal or email; answers and attached documents flow back into the data room and re-run analysis.
        </Text>
      </Group>
    </Stack>
  );
}
