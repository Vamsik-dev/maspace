'use client';

import { Anchor, Box, Button, Group, Stack, Text, Tooltip, UnstyledButton, Collapse } from '@mantine/core';
import { IconCheck, IconX, IconArrowRight, IconSparkles, IconGavel, IconShieldExclamation, IconListCheck, IconFileText, IconWorld, IconBook2, IconInbox, IconChevronDown } from '@tabler/icons-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { notifications } from '@mantine/notifications';
import type { Acquisition, Proposal } from '@/lib/types';
import { benchmarks, similarDeals, thesisFit } from '@/lib/playbook';
import { usePlaybook, usePriors } from '@/lib/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { Pill, WhyPopover, personName, CitationChips } from './ui';

const RESULT_COLOR = { Pass: 'teal', Watch: 'yellow', Fail: 'red' } as const;

/** Verified when any cited source is an advisor report or internal system; seller-stated when only seller documents back it. */
function Provenance({ sources }: { sources: { docId: string }[] }) {
  const docs = useStore(useShallow((s) => s.documents.filter((d) => sources.some((c) => c.docId === d.id))));
  if (!docs.length) return null;
  const verified = docs.some((d) => d.source === 'Advisor' || d.source === 'Internal');
  return (
    <Tooltip
      withArrow
      multiline
      w={260}
      label={verified ? 'Backed by an advisor report or source-system extract.' : 'Only seller documents back this figure (CIM, management accounts). Verify in diligence.'}
    >
      <span>
        <Pill color={verified ? 'teal' : 'gray'}>{verified ? 'Verified' : 'Seller-stated'}</Pill>
      </span>
    </Tooltip>
  );
}

export function ThesisFit({ acq, compact }: { acq: Acquisition; compact?: boolean }) {
  const pb = usePlaybook(acq);
  const fit = thesisFit(acq, pb);
  if (!fit)
    return (
      <Text size="sm" c="dimmed">
        Atlas scores the target against the playbook once financials and the customer file are in the data room.
      </Text>
    );
  return (
    <Stack gap={0}>
      {!compact && (
        <Group justify="space-between" mb={8}>
          <Text size="xs" c="dimmed">
            Scored by rule against {pb?.name} {pb?.version}. Metrics extracted from documents; math done in code.
          </Text>
          <Group gap={6}>
            <Pill color="teal">{fit.pass} pass</Pill>
            <Pill color="yellow">{fit.watch} watch</Pill>
            <Pill color="red">{fit.fail} fail</Pill>
          </Group>
        </Group>
      )}
      {compact ? (
        <Stack gap={0}>
          {fit.rows.map((r) => (
            <Group key={r.key} justify="space-between" wrap="nowrap" gap="sm" py={7} style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" lh={1.3}>
                  {r.label}
                </Text>
                <Text size="xs" c="dimmed" className="num">
                  <b style={{ color: '#0f1b2d' }}>{r.value}</b> · playbook {r.rule}
                </Text>
              </Box>
              <Pill color={RESULT_COLOR[r.result]} solid={r.result === 'Fail'}>
                {r.result}
              </Pill>
            </Group>
          ))}
        </Stack>
      ) : (
      <Box style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 460 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              {['Criterion', 'Target', 'Playbook', ''].map((h) => (
                <th key={h} style={{ fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5b6b82', fontWeight: 600, padding: '6px 8px', borderBottom: '1px solid var(--app-border-soft)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fit.rows.map((r) => (
              <tr key={r.key} style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
                <td style={{ padding: '8px' }}>{r.label}</td>
                <td style={{ padding: '8px', fontWeight: 600 }} className="num">
                  <Group gap={4} wrap="nowrap">
                    {r.value}
                    {r.sources.length > 0 && <WhyPopover acqId={acq.id} citations={r.sources} label="" />}
                    <Provenance sources={r.sources} />
                  </Group>
                </td>
                <td style={{ padding: '8px', color: '#5b6b82' }} className="num">
                  {r.rule}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <Pill color={RESULT_COLOR[r.result]} solid={r.result === 'Fail'}>
                    {r.result}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      )}
    </Stack>
  );
}

/** One row per metric: prior deals as dots, their median, and this deal. */
export function Benchmarks({ acq }: { acq: Acquisition }) {
  const pb = usePlaybook(acq);
  const priors = usePriors(acq.orgId);
  const rows = benchmarks(acq, pb, priors);
  if (!rows.length) return null;
  return (
    <Stack gap="md">
      {rows.map((b) => {
        const vals = [...b.prior.map((p) => p.value), b.value];
        const lo = Math.min(...vals);
        const hi = Math.max(...vals);
        const pad = (hi - lo) * 0.12 || 1;
        const x = (v: number) => 8 + ((v - (lo - pad)) / (hi - lo + 2 * pad)) * 284;
        const fmt = (v: number) => `${v.toFixed(b.unit === 'x' ? 1 : 0)}${b.unit}`;
        return (
          <Box key={b.key}>
            <Group justify="space-between" mb={2} wrap="nowrap">
              <Text size="sm">{b.label}</Text>
              <Text size="xs" c={b.worse ? 'red.7' : 'teal.8'} fw={600} className="num">
                {fmt(b.value)} · {b.delta >= 0 ? '+' : ''}
                {b.delta.toFixed(1)}
                {b.unit === '%' ? ' pts' : 'x'} vs median
              </Text>
            </Group>
            <svg viewBox="0 0 300 30" width="100%" height="30" role="img" aria-label={`${b.label}: this deal ${fmt(b.value)}, prior median ${fmt(b.median)}`}>
              <line x1="8" x2="292" y1="15" y2="15" stroke="#e2e7ef" strokeWidth="2" />
              <line x1={x(b.median)} x2={x(b.median)} y1="6" y2="24" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />
              {b.prior.map((p) => (
                <circle key={p.name} cx={x(p.value)} cy="15" r="4.5" fill="#cbd3df" stroke="#fff" strokeWidth="1.5">
                  <title>
                    {p.name}: {fmt(p.value)}
                  </title>
                </circle>
              ))}
              <circle cx={x(b.value)} cy="15" r="7" fill={b.worse ? '#e5484d' : '#3a5fd1'} stroke="#fff" strokeWidth="2" />
            </svg>
            <Group justify="space-between">
              <Text fz={10.5} c="dimmed">
                Prior deals (grey) · median {fmt(b.median)}
              </Text>
              <Text fz={10.5} c="dimmed">
                {acq.name}
              </Text>
            </Group>
          </Box>
        );
      })}
    </Stack>
  );
}

export function SimilarDeals({ acq }: { acq: Acquisition }) {
  const pb = usePlaybook(acq);
  const priors = usePriors(acq.orgId);
  const sim = similarDeals(acq, pb, priors);
  if (!sim.length)
    return (
      <Text size="sm" c="dimmed">
        No close matches among completed acquisitions.
      </Text>
    );
  return (
    <Stack gap={10}>
      {sim.map(({ deal, reasons }) => (
        <Box key={deal.id} pl={10} style={{ borderLeft: '2px solid var(--memory)' }}>
          <Group justify="space-between" wrap="nowrap">
            <Anchor component={Link} href={`/memory#${deal.id}`} size="sm" fw={600} c="dark">
              {deal.name}
            </Anchor>
            <Text size="xs" c="dimmed">
              closed {deal.closed}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mb={2}>
            Similar on: {reasons.join(', ')}
          </Text>
          <Text size="sm">{deal.issues[0]}.</Text>
          <Text size="sm" c="ink.8">
            Lesson: {deal.lessons[0].text}
          </Text>
        </Box>
      ))}
    </Stack>
  );
}

const KIND_META: Record<Proposal['kind'], { label: string; icon: ReactNode; accept: string }> = {
  risk: { label: 'Risk', icon: <IconShieldExclamation size={15} />, accept: 'Add to risk register' },
  decision: { label: 'Decision', icon: <IconGavel size={15} />, accept: 'Open decision' },
  action: { label: 'Action', icon: <IconListCheck size={15} />, accept: 'Assign' },
  request: { label: 'Information request', icon: <IconInbox size={15} />, accept: 'Add to request list' },
  deliverable: { label: 'Deliverable update', icon: <IconFileText size={15} />, accept: 'Regenerate' },
  research: { label: 'External research', icon: <IconWorld size={15} />, accept: 'Record as finding' },
  playbook: { label: 'Playbook change', icon: <IconBook2 size={15} />, accept: 'Adopt' },
};

export function ProposalCard({ p, compact }: { p: Proposal; compact?: boolean }) {
  const accept = useStore((s) => s.acceptProposal);
  const dismiss = useStore((s) => s.dismissProposal);
  const m = KIND_META[p.kind];
  const done = p.status !== 'Pending';
  return (
    <Box p={compact ? 10 : 'sm'} style={{ border: '1px solid var(--app-border)', borderRadius: 8, background: done ? 'var(--app-subtle)' : 'white', opacity: done ? 0.7 : 1 }}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <Group gap={10} align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
          <Box c="ink.7" mt={2}>
            {m.icon}
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Group gap={6} mb={2}>
              <Text fz={10.5} fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>
                {m.label}
              </Text>
              <Text fz={10.5} c="dimmed">
                · {p.confidence} confidence
              </Text>
            </Group>
            <Text size="sm" fw={600} lh={1.35}>
              {p.title}
            </Text>
            <Text size="sm" c="dimmed" lh={1.45} mt={2}>
              {p.summary}
            </Text>
            {!compact && (
              <Text size="xs" c="violet.8" mt={4}>
                Why: {p.basis}
              </Text>
            )}
            {p.citations && p.citations.length > 0 && (
              <Box mt={6}>
                <CitationChips acqId={p.acqId} citations={p.citations} />
              </Box>
            )}
          </Box>
        </Group>
        {done ? (
          <Pill color={p.status === 'Accepted' ? 'teal' : 'gray'}>{p.status}</Pill>
        ) : (
          <Group gap={4} wrap="nowrap">
            <Tooltip label="Dismiss">
              <Button
                size="compact-sm"
                variant="subtle"
                color="gray"
                onClick={() => dismiss(p.id)}
                aria-label="Dismiss"
              >
                <IconX size={14} />
              </Button>
            </Tooltip>
            <Button
              size="compact-sm"
              leftSection={<IconCheck size={13} />}
              onClick={() => {
                accept(p.id);
                notifications.show({ message: `${m.label} accepted by ${personName(useStore.getState().currentUserId)}. Logged to the audit trail.`, color: 'ink' });
              }}
            >
              {m.accept}
            </Button>
          </Group>
        )}
      </Group>
    </Box>
  );
}

/** The Finding → Risk → Decision → Action chain Atlas drafted for one finding. */
export function ChainPanel({ findingId, findingStatus }: { findingId: string; findingStatus: string }) {
  const proposals = useStore(useShallow((s) => s.proposals.filter((p) => p.parentFindingId === findingId)));
  const acceptChain = useStore((s) => s.acceptChain);
  const pending = proposals.filter((p) => p.status === 'Pending');
  const [open, setOpen] = useState(true);
  if (!proposals.length) return null;
  return (
    <Box className="panel" style={{ borderColor: '#d9ccf7', overflow: 'hidden' }}>
      <Group justify="space-between" px="md" py={10} style={{ background: '#f7f3ff', borderBottom: '1px solid #ece4fb' }} wrap="nowrap">
        <UnstyledButton onClick={() => setOpen((o) => !o)}>
          <Group gap={8} wrap="nowrap">
            <IconSparkles size={16} color="#6d3fd4" />
            <Text size="sm" fw={600}>
              Atlas drafted the follow-through
            </Text>
            <Text size="xs" c="dimmed">
              {pending.length ? `${pending.length} awaiting review` : 'All reviewed'}
            </Text>
            <IconChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 120ms' }} />
          </Group>
        </UnstyledButton>
        {pending.length > 0 && (
          <Button
            size="compact-sm"
            color="violet"
            onClick={() => {
              acceptChain(findingId);
              notifications.show({ message: `${findingStatus === 'Proposed' ? 'Finding and ' : ''}${pending.length} linked items accepted.`, color: 'violet' });
            }}
          >
            {findingStatus === 'Proposed' ? 'Accept finding + all' : 'Accept all'}
          </Button>
        )}
      </Group>
      <Collapse expanded={open}>
        <Stack gap={8} p="md">
          {proposals.map((p) => (
            <ProposalCard key={p.id} p={p} compact />
          ))}
          <Text size="xs" c="dimmed">
            Accepting creates the linked records and keeps the chain. You can also accept items one at a time or edit them afterwards.
          </Text>
        </Stack>
      </Collapse>
    </Box>
  );
}

export function BriefRow({ icon, tone, title, children, href, cta, onClick }: { icon: ReactNode; tone: string; title: string; children: ReactNode; href?: string; cta?: string; onClick?: () => void }) {
  const ctaEl = cta ? (
    <Text size="xs" c="ink.7" fw={600} style={{ whiteSpace: 'nowrap' }}>
      {cta} <IconArrowRight size={11} style={{ verticalAlign: -1 }} />
    </Text>
  ) : null;
  const inner = (
    <Group align="flex-start" wrap="nowrap" gap="sm" px="md" py={12} className="row-link" style={{ borderRadius: 0 }}>
      <Box w={30} h={30} style={{ borderRadius: 8, display: 'grid', placeItems: 'center', background: tone, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text fz={10.5} fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.07em' }}>
          {title}
        </Text>
        <Box fz="sm" lh={1.45} mt={2}>
          {children}
        </Box>
      </Box>
      {ctaEl}
    </Group>
  );
  if (href)
    return (
      <Link href={href} style={{ display: 'block', borderBottom: '1px solid var(--app-border-soft)' }}>
        {inner}
      </Link>
    );
  return (
    <UnstyledButton onClick={onClick} style={{ display: 'block', width: '100%', borderBottom: '1px solid var(--app-border-soft)' }}>
      {inner}
    </UnstyledButton>
  );
}
