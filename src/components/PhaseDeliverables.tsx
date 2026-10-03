'use client';

import { Box, Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCheck, IconArrowRight, IconSparkles } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, nowIso } from '@/lib/store';
import { PHASES } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import type { Acquisition, Deliverable, PhaseKey } from '@/lib/types';
import { Pill } from './ui';

type Status = { label: 'Done' | 'In progress' | 'Not started'; detail?: string; href?: string; generate?: Deliverable['type'] };

/** Status of each standard key deliverable, derived from the acquisition's records. */
export function useDeliverableStatus(acq: Acquisition): Record<string, Status> {
  const s = useStore();
  const base = `/acquisitions/${acq.id}`;
  const dl = (t: Deliverable['type']) => s.deliverables.find((d) => d.acqId === acq.id && d.type === t);
  const docs = s.documents.filter((d) => d.acqId === acq.id);
  const ms = (re: RegExp) => s.milestones.find((m) => m.acqId === acq.id && re.test(m.title));
  const ph = (k: PhaseKey) => acq.phases[k].status;
  const fromDl = (t: Deliverable['type'], fallbackDone?: boolean): Status => {
    const d = dl(t);
    if (d) return { label: d.status === 'Final' ? 'Done' : 'In progress', detail: `${d.status} · ${fmtDate(d.generatedAt)}`, href: `${base}/deliverables/${d.id}` };
    if (fallbackDone) return { label: 'Done', detail: 'Recorded before this workspace' };
    return { label: 'Not started', generate: t };
  };
  const risks = s.risks.filter((r) => r.acqId === acq.id);
  const price = s.decisions.find((d) => d.acqId === acq.id && /price|valuation/i.test(d.question));
  const exclusivity = ms(/exclusivity/i);
  const spa = ms(/SPA|definitive/i);
  return {
    'target-list': { label: 'Done', detail: 'On the target pipeline', href: '/pipeline' },
    thesis: dl('Investment Thesis') ? fromDl('Investment Thesis') : acq.thesis.summary ? { label: 'In progress', detail: `${acq.thesis.assumptions.length} testable assumptions`, href: `${base}/phase/strategy`, generate: 'Investment Thesis' } : { label: 'Not started', generate: 'Investment Thesis' },
    teaser: docs.some((d) => d.category === 'CIM') ? { label: 'Done', detail: 'CIM in documents', href: `${base}/documents` } : { label: 'Not started', detail: 'Request CIM after NDA' },
    'valuation-range': acq.valuation ? { label: 'Done', detail: 'EBITDA bridge and implied EV', href: `${base}/phase/valuation` } : acq.metrics ? { label: 'In progress', detail: `Seller ask ${acq.evBasis.toLowerCase()}`, href: `${base}/research` } : { label: 'Not started' },
    ioi: fromDl('IOI Letter', ph('valuation') === 'complete'),
    loi: docs.some((d) => /letter of intent|LOI/i.test(d.name)) ? { label: 'Done', detail: 'Executed LOI in documents', href: `${base}/phase/loi` } : ph('loi') === 'complete' ? { label: 'Done' } : { label: 'Not started' },
    exclusivity: exclusivity ? { label: 'Done', detail: `Through ${fmtDate(exclusivity.date)}` } : { label: 'Not started' },
    'dd-report': fromDl('Due Diligence Report'),
    'risk-register': risks.length ? { label: 'In progress', detail: `${risks.length} risks`, href: `${base}/risks` } : { label: 'Not started', href: `${base}/risks` },
    ppa: price ? { label: price.status === 'Approved' ? 'Done' : 'In progress', detail: `Price decision: ${price.status.toLowerCase()}`, href: `${base}/decisions/${price.id}` } : { label: 'Not started' },
    spa: spa ? { label: spa.status === 'Done' ? 'Done' : 'In progress', detail: `Signing ${fmtDate(spa.date)}${spa.status === 'At risk' ? ' · at risk' : ''}`, href: `${base}/phase/agreement` } : { label: ph('agreement') === 'complete' ? 'Done' : 'Not started' },
    financing: { label: ph('financing') === 'complete' ? 'Done' : ph('financing') === 'active' ? 'In progress' : 'Not started', href: `${base}/phase/financing` },
    clearances: { label: ph('financing') === 'complete' ? 'Done' : ph('financing') === 'active' ? 'In progress' : 'Not started', href: `${base}/phase/financing` },
    'funds-flow': { label: ph('closing') === 'complete' ? 'Done' : 'Not started' },
    closed: { label: ph('closing') === 'complete' ? 'Done' : 'Not started' },
    day1: fromDl('Day 1 Plan'),
    '100day': fromDl('100-Day Plan'),
    kpis: { label: ph('integration') === 'active' ? 'In progress' : 'Not started', detail: 'Outcome metrics from the playbook', href: '/playbooks' },
  };
}

/** The first unfinished key deliverable in the current phase (guided next step). */
export function NextStep({ acq }: { acq: Acquisition }) {
  const status = useDeliverableStatus(acq);
  const meta = PHASES.find((p) => p.key === acq.currentPhase)!;
  const next = meta.deliverables.find((d) => status[d.key]?.label !== 'Done');
  if (!next) return null;
  return (
    <Text component={Link} href={`/acquisitions/${acq.id}/phase/${acq.currentPhase}`} fz={12} fw={600} c="ink.7" style={{ whiteSpace: 'nowrap' }}>
      Next step: {next.label} →
    </Text>
  );
}

const COLOR = { Done: 'teal', 'In progress': 'blue', 'Not started': 'gray' } as const;

export function PhaseDeliverables({ acq, phase }: { acq: Acquisition; phase: PhaseKey }) {
  const meta = PHASES.find((p) => p.key === phase)!;
  const status = useDeliverableStatus(acq);
  const add = useStore((s) => s.addDeliverable);
  const me = useStore((s) => s.currentUserId);
  const router = useRouter();
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Box className="panel" p="md">
        <Text className="label" mb={8}>
          Key activities
        </Text>
        <Stack gap={6}>
          {meta.activities.map((a) => (
            <Group key={a} gap={8} wrap="nowrap" align="flex-start">
              <Box w={6} h={6} mt={7} style={{ borderRadius: 99, background: '#94a3b8', flexShrink: 0 }} />
              <Text size="sm">{a}</Text>
            </Group>
          ))}
        </Stack>
      </Box>
      <Box className="panel" p="md">
        <Text className="label" mb={8}>
          Key deliverables
        </Text>
        <Stack gap={8}>
          {meta.deliverables.map((d) => {
            const st = status[d.key] ?? { label: 'Not started' };
            return (
              <Group key={d.key} justify="space-between" wrap="nowrap" gap="sm">
                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                  {st.label === 'Done' ? <IconCheck size={15} color="#12a383" /> : <Box w={15} />}
                  <Box style={{ minWidth: 0 }}>
                    {st.href ? (
                      <Text component={Link} href={st.href} size="sm" fw={500}>
                        {d.label}
                      </Text>
                    ) : (
                      <Text size="sm" fw={500}>
                        {d.label}
                      </Text>
                    )}
                    {st.detail && (
                      <Text size="xs" c="dimmed">
                        {st.detail}
                      </Text>
                    )}
                  </Box>
                </Group>
                <Group gap={6} wrap="nowrap">
                  {st.generate && st.label !== 'Done' && (
                    <Button
                      size="compact-xs"
                      variant="light"
                      color="violet"
                      leftSection={<IconSparkles size={11} />}
                      onClick={() => {
                        const id = add({ acqId: acq.id, title: `${st.generate} — ${acq.name}`, type: st.generate!, status: 'Draft', ownerId: me, generatedAt: nowIso().slice(0, 10), sources: [] });
                        router.push(`/acquisitions/${acq.id}/deliverables/${id}`);
                      }}
                    >
                      Draft
                    </Button>
                  )}
                  <Pill color={COLOR[st.label]}>{st.label}</Pill>
                  {st.href && st.label === 'Done' && <IconArrowRight size={12} color="#94a3b8" />}
                </Group>
              </Group>
            );
          })}
        </Stack>
      </Box>
    </SimpleGrid>
  );
}
