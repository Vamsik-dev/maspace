'use client';

import { Anchor, Badge, Box, Button, Grid, Group, Progress, SimpleGrid, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { PHASES, fmtM } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import { workstreamProgress } from '@/lib/derive';
import { Claim, Section, StatusBadge, SeverityBadge, Meter, Empty, personName, WhyPopover } from '@/components/ui';
import { WorkTable } from '@/components/WorkTable';
import { WorkItemDrawer } from '@/components/WorkItemDrawer';
import type { Acquisition, PhaseKey } from '@/lib/types';
import { PRIOR } from '@/data/portfolio';

type S = ReturnType<typeof useStore.getState>;

function Strategy({ acq }: { acq: Acquisition }) {
  const color = { Supported: 'teal', 'At risk': 'orange', Contradicted: 'red', Untested: 'gray' } as const;
  return (
    <Stack gap="lg">
      <Section title="Acquisition thesis">
        <Stack gap="sm">
          <Text size="sm" lh={1.6}>
            {acq.thesis.summary}
          </Text>
          {acq.thesis.pillars.length > 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              {acq.thesis.pillars.map((p, i) => (
                <Group key={p} gap={8} wrap="nowrap" align="flex-start" p="xs" style={{ border: '1px solid var(--app-border)', borderRadius: 6 }}>
                  <Text size="xs" c="dimmed" fw={600}>
                    {i + 1}
                  </Text>
                  <Text size="sm">{p}</Text>
                </Group>
              ))}
            </SimpleGrid>
          )}
          <Text size="xs" c="dimmed">
            Strategy: {acq.strategy}
          </Text>
        </Stack>
      </Section>
      <Section title="Testable assumptions" pad={false}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Assumption</Table.Th>
              <Table.Th>Thesis expects</Table.Th>
              <Table.Th>Diligence shows</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {acq.thesis.assumptions.map((a) => (
              <Table.Tr key={a.id}>
                <Table.Td>
                  {a.findingIds?.[0] ? (
                    <Anchor component={Link} href={`/acquisitions/${acq.id}/findings/${a.findingIds[0]}`} size="sm" c="dark">
                      {a.label}
                    </Anchor>
                  ) : (
                    <Text size="sm">{a.label}</Text>
                  )}
                </Table.Td>
                <Table.Td className="num">{a.expected}</Table.Td>
                <Table.Td className="num">{a.current ?? '—'}</Table.Td>
                <Table.Td>
                  <Badge color={color[a.status]}>{a.status}</Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Section>
      <Section title="Target profile">
        <SimpleGrid cols={{ base: 2, md: 4 }}>
          {[
            ['Legal name', acq.target.legalName],
            ['HQ', acq.target.hq],
            ['Founded', acq.target.founded || '—'],
            ['Ownership', acq.target.ownership],
            ['Revenue', fmtM(acq.target.revenue)],
            ['EBITDA', fmtM(acq.target.ebitda)],
            ['Employees', acq.target.employees || '—'],
            ['Branches', acq.target.branches.join(', ') || '—'],
          ].map(([k, v]) => (
            <Box key={String(k)}>
              <Text className="label">{k}</Text>
              <Text size="sm">{v}</Text>
            </Box>
          ))}
        </SimpleGrid>
        {acq.target.description && (
          <Text size="sm" mt="md" c="dimmed">
            {acq.target.description}
          </Text>
        )}
      </Section>
    </Stack>
  );
}

function Valuation({ acq, s }: { acq: Acquisition; s: S }) {
  const v = acq.valuation;
  if (!v)
    return (
      <Section title="Valuation">
        <Empty title="Valuation not built yet">Build the preliminary model from the CIM. The bridge from seller EBITDA to diligence-adjusted EBITDA will appear here.</Empty>
      </Section>
    );
  const max = Math.max(...v.lines.map((l) => Math.abs(l.value)));
  let running = 0;
  const price = s.decisions.find((d) => d.id === 'dec-price');
  const qoe = v.lines[v.lines.length - 1].value / 1000;
  return (
    <Stack gap="lg">
      <Section title="EBITDA bridge (FY2025, $K)" right={<WhyPopover acqId={acq.id} citations={v.lines.filter((l) => l.citation).map((l) => l.citation!).filter((c, i, a) => a.findIndex((x) => x.docId === c.docId && x.page === c.page) === i)} calculation="3,620 − 185 − 140 − 95 = 3,200" />}>
        <Stack gap={6}>
          {v.lines.map((l) => {
            const start = l.kind === 'adjustment' ? running + l.value : 0;
            const width = Math.abs(l.value);
            if (l.kind !== 'adjustment') running = l.value;
            else running += l.value;
            return (
              <Group key={l.label} wrap="nowrap" gap="sm">
                <Text size="sm" w={230} fw={l.kind === 'adjustment' ? 400 : 600}>
                  {l.label}
                </Text>
                <Box style={{ flex: 1, position: 'relative', height: 20 }}>
                  <Box
                    style={{
                      position: 'absolute',
                      left: `${(start / max) * 100}%`,
                      width: `${Math.max((width / max) * 100, 0.6)}%`,
                      top: 2,
                      bottom: 2,
                      borderRadius: 2,
                      background: l.kind === 'adjustment' ? '#f97316' : l.kind === 'total' ? '#1f45a5' : '#94a3b8',
                    }}
                  />
                </Box>
                <Text size="sm" w={70} ta="right" className="num" fw={l.kind === 'adjustment' ? 400 : 600} c={l.kind === 'adjustment' ? 'orange.8' : undefined}>
                  {l.kind === 'adjustment' ? `(${Math.abs(l.value)})` : l.value.toLocaleString()}
                </Text>
              </Group>
            );
          })}
        </Stack>
      </Section>
      <Section title="Implied enterprise value" pad={false}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Scenario</Table.Th>
              <Table.Th ta="right">EBITDA</Table.Th>
              <Table.Th ta="right">Multiple</Table.Th>
              <Table.Th ta="right">EV</Table.Th>
              <Table.Th>Basis</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody className="num">
            <Table.Tr>
              <Table.Td>LOI</Table.Td>
              <Table.Td ta="right">$3.62M</Table.Td>
              <Table.Td ta="right">6.08x</Table.Td>
              <Table.Td ta="right">$22.0M</Table.Td>
              <Table.Td>Seller adjusted EBITDA</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>LOI multiple on QoE</Table.Td>
              <Table.Td ta="right">{fmtM(qoe)}</Table.Td>
              <Table.Td ta="right">6.08x</Table.Td>
              <Table.Td ta="right">$19.5M</Table.Td>
              <Table.Td>Diligence-adjusted</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Proposed</Table.Td>
              <Table.Td ta="right">{fmtM(qoe)}</Table.Td>
              <Table.Td ta="right">6.25x</Table.Td>
              <Table.Td ta="right">$20.0M + $1.5M</Table.Td>
              <Table.Td>Earn-out on top-5 retention</Table.Td>
            </Table.Tr>
            <Table.Tr bg="#f8fafc">
              <Table.Td fw={600}>Working view</Table.Td>
              <Table.Td />
              <Table.Td ta="right">{(acq.ev / acq.target.ebitda).toFixed(2)}x</Table.Td>
              <Table.Td ta="right" fw={600}>
                {fmtM(acq.ev)}
              </Table.Td>
              <Table.Td>{acq.evBasis}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Box p="md">
          <Claim kind="inference">Playbook guardrail is 5.5x–6.5x QoE-adjusted EBITDA for this revenue band. LOI terms imply 6.9x on QoE EBITDA.</Claim>
          {price && (
            <Group mt="sm" gap={8}>
              <StatusBadge status={price.status} />
              <Anchor component={Link} href={`/acquisitions/${acq.id}/decisions/${price.id}`} size="sm">
                {price.question}
              </Anchor>
            </Group>
          )}
        </Box>
      </Section>
    </Stack>
  );
}

function Loi({ acq, s }: { acq: Acquisition; s: S }) {
  const loi = s.documents.find((d) => d.acqId === acq.id && d.category === 'Deal Document' && /LOI|Letter of Intent/i.test(d.name));
  if (!loi) return null;
  return (
    <Section title="Key LOI terms">
      <Stack gap="sm">
        {loi.pages[0].body.map((b, i) => (
          <Claim key={i} kind="fact" acqId={acq.id} citations={[{ docId: loi.id, page: 1 }]}>
            {b}
          </Claim>
        ))}
      </Stack>
    </Section>
  );
}

function Diligence({ acq, s }: { acq: Acquisition; s: S }) {
  const ws = workstreamProgress(acq, s.work, s.playbooks.find((p) => p.id === acq.playbookId)?.workstreams ?? []);
  const f = s.findings.filter((x) => x.acqId === acq.id && x.status !== 'Dismissed');
  const by = (sev: string) => f.filter((x) => x.severity === sev && !x.positive).length;
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Section title="Workstream progress">
        <Stack gap={8}>
          {ws.map((w) => (
            <Group key={w.key} justify="space-between">
              <Anchor component={Link} href={`/acquisitions/${acq.id}/workstreams/${w.key}`} size="sm" c="dark">
                {w.label}
              </Anchor>
              <Meter value={w.pct} color={w.pct < 50 ? 'orange' : 'ink'} />
            </Group>
          ))}
          {ws.length === 0 && (
            <Text size="sm" c="dimmed">
              Workstreams are created when the LOI is signed.
            </Text>
          )}
        </Stack>
      </Section>
      <Section title="Findings">
        <SimpleGrid cols={4} mb="md">
          {['Critical', 'High', 'Medium', 'Low'].map((x) => (
            <Box key={x}>
              <Text className="label">{x}</Text>
              <Text fz={22} fw={600} className="num">
                {by(x)}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
        <Anchor component={Link} href={`/acquisitions/${acq.id}/findings`} size="sm">
          All findings <IconArrowRight size={12} />
        </Anchor>
      </Section>
    </SimpleGrid>
  );
}

function Agreement({ acq, s }: { acq: Acquisition; s: S }) {
  const rows = s.findings
    .filter((f) => f.acqId === acq.id && !f.positive && !['Dismissed', 'Proposed'].includes(f.status) && ['Critical', 'High', 'Medium'].includes(f.severity))
    .map((f) => {
      const protection =
        f.id === 'f-qoe'
          ? 'Purchase price reset; financial statement reps on QoE basis; NWC peg $2.05–2.20M'
          : f.id === 'f-conc'
            ? 'Earn-out schedule tied to top-5 revenue retention'
            : f.id === 'f-coc'
              ? 'BVISD consent as closing condition; covenant to cooperate on Lakeline'
              : f.id === 'f-owner'
                ? 'Founder employment agreement (24 mo.); successor qualifier as closing deliverable'
                : f.id === 'f-salestax'
                  ? 'Specific indemnity + $150K escrow'
                  : f.id === 'f-turnover'
                    ? 'Key employee retention letters at signing'
                    : 'To be determined';
      return { f, protection };
    });
  return (
    <Section title="From diligence to the SPA" pad={false}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Finding</Table.Th>
            <Table.Th>Proposed contractual protection</Table.Th>
            <Table.Th w={110}>Owner</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map(({ f, protection }) => (
            <Table.Tr key={f.id}>
              <Table.Td>
                <Group gap={6} wrap="nowrap">
                  <SeverityBadge severity={f.severity} />
                  <Anchor component={Link} href={`/acquisitions/${acq.id}/findings/${f.id}`} size="sm" c="dark">
                    {f.title}
                  </Anchor>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{protection}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{personName('p-ben')}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Text size="xs" c="dimmed" p="sm">
        Drafted by counsel; mapping shown so the deal team can see every material finding has a contractual answer.
      </Text>
    </Section>
  );
}

function Checklist({ title, items }: { title: string; items: { label: string; done: boolean; note?: string; href?: string }[] }) {
  return (
    <Section title={title}>
      <Stack gap={6}>
        {items.map((i) => (
          <Group key={i.label} gap={8} wrap="nowrap" align="flex-start">
            <Box mt={2} w={16} h={16} style={{ borderRadius: 4, border: i.done ? 'none' : '1.5px solid #cbd3df', background: i.done ? '#1f45a5' : undefined, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {i.done && <IconCheck size={11} color="white" stroke={3} />}
            </Box>
            <Box>
              {i.href ? (
                <Anchor component={Link} href={i.href} size="sm" c="dark">
                  {i.label}
                </Anchor>
              ) : (
                <Text size="sm">{i.label}</Text>
              )}
              {i.note && (
                <Text size="xs" c="dimmed">
                  {i.note}
                </Text>
              )}
            </Box>
          </Group>
        ))}
      </Stack>
    </Section>
  );
}

function Integration({ acq, s }: { acq: Acquisition; s: S }) {
  const imps = s.findings.filter((f) => f.acqId === acq.id && f.status !== 'Dismissed').flatMap((f) => f.implications.filter((x) => x.area === 'Integration').map((x) => ({ f, x })));
  const decisions = s.decisions.filter((d) => d.acqId === acq.id && d.phase === 'integration');
  const lessons = s.priors.filter((p) => p.orgId === acq.orgId).flatMap((p) => p.lessons.filter((l) => ['Integration', 'People'].includes(l.category)).map((l) => ({ p, l })));
  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Section title="Integration implications from diligence">
          <Stack gap={8}>
            {imps.map(({ f, x }, i) => (
              <Box key={i}>
                <Text size="sm">{x.text}</Text>
                <Anchor component={Link} href={`/acquisitions/${acq.id}/findings/${f.id}`} size="xs" c="dimmed">
                  from: {f.title}
                </Anchor>
              </Box>
            ))}
            {imps.length === 0 && (
              <Text size="sm" c="dimmed">
                None yet.
              </Text>
            )}
          </Stack>
        </Section>
        <Section title="Integration decisions">
          <Stack gap={8}>
            {decisions.map((d) => (
              <Group key={d.id} gap={6} wrap="nowrap">
                <StatusBadge status={d.status} size="xs" />
                <Anchor component={Link} href={`/acquisitions/${acq.id}/decisions/${d.id}`} size="sm" c="dark">
                  {d.question}
                </Anchor>
              </Group>
            ))}
            {decisions.length === 0 && (
              <Text size="sm" c="dimmed">
                None yet.
              </Text>
            )}
            {acq.id === 'acq-abc' && (
              <Button component={Link} href={`/acquisitions/${acq.id}/deliverables/dl-day1`} variant="light" mt="sm" w="fit-content" rightSection={<IconArrowRight size={13} />}>
                Open Day-1 integration plan
              </Button>
            )}
          </Stack>
        </Section>
      </SimpleGrid>
      <Section title="Value realization targets" pad={false}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Synergy / value lever</Table.Th>
              <Table.Th ta="right">Year-1 target</Table.Th>
              <Table.Th ta="right">Run-rate</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th>Tracking</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody className="num">
            {[
              ['Fire/life-safety cross-sell', '$0.4M rev', '$1.2M rev', 'p-marcus'],
              ['Purchasing consolidation (equipment, parts)', '$120K', '$210K', 'p-rachel'],
              ['Insurance program consolidation', '$60K', '$60K', 'p-priya'],
              ['Back-office (outsourced CPA, payroll)', '$90K', '$140K', 'p-elena'],
            ].map(([a, b, c, d]) => (
              <Table.Tr key={a}>
                <Table.Td>{a}</Table.Td>
                <Table.Td ta="right">{b}</Table.Td>
                <Table.Td ta="right">{c}</Table.Td>
                <Table.Td>{personName(d)}</Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    Starts Day 1
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Text size="xs" c="dimmed" p="sm">
          Post-close, actuals are tracked against these targets and feed acquisition memory.
        </Text>
      </Section>
      <Section title="Lessons from prior integrations">
        <Stack gap={8}>
          {lessons.map(({ p, l }) => (
            <Claim key={l.id} kind="memory" compact>
              <b>{p.name}:</b> {l.text}
            </Claim>
          ))}
        </Stack>
      </Section>
    </Stack>
  );
}

export default function PhasePage() {
  const { id, phase } = useParams<{ id: string; phase: PhaseKey }>();
  const s = useStore();
  const [item, setItem] = useState<string | null>(null);
  const acq = s.acquisitions.find((a) => a.id === id)!;
  const meta = PHASES.find((p) => p.key === phase);
  if (!meta) return <Empty title="Unknown phase" />;
  const ph = acq.phases[phase];
  const work = s.work.filter((w) => w.acqId === id && w.phase === phase);
  const decisions = s.decisions.filter((d) => d.acqId === id && d.phase === phase);
  const milestones = s.milestones.filter((m) => m.acqId === id && m.phase === phase);
  const isAbc = id === 'acq-abc';

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Box maw={760}>
          <Text className="label">
            Phase {meta.n} of 8 · {ph.status === 'complete' ? `Completed ${ph.completedOn ? fmtDate(ph.completedOn) : ''}` : ph.status === 'active' ? 'In progress' : 'Not started'}
          </Text>
          <Text fz={24} fw={650}>
            {meta.label}
          </Text>
          <Text size="sm" c="dimmed">
            {meta.purpose}
          </Text>
          {ph.summary && (
            <Text size="sm" mt={6}>
              {ph.summary}
            </Text>
          )}
        </Box>
        <Group gap="sm">
          {ph.status === 'active' && (
            <Box w={160}>
              <Progress value={ph.progress} size={6} color="ink" />
              <Text size="xs" c="dimmed" mt={4}>
                {ph.progress}% complete
              </Text>
            </Box>
          )}
          {ph.status === 'active' && (
            <Tooltip label="Phase completion is a human decision; it is logged with your name.">
              <Button variant="default" onClick={() => s.setPhaseStatus(id, phase, 'complete')}>
                {phase === 'loi' ? 'Record LOI as signed' : 'Mark phase complete'}
              </Button>
            </Tooltip>
          )}
          {ph.status === 'upcoming' && (
            <Button variant="default" onClick={() => s.setPhaseStatus(id, phase, 'active')}>
              Start phase
            </Button>
          )}
        </Group>
      </Group>

      {phase === 'loi' && ph.status === 'active' && !acq.requestList && (
        <Text size="xs" c="dimmed" mt={-8}>
          Workflow: recording the LOI as signed creates the 9 standard diligence workstreams and the initial request list.
        </Text>
      )}

      {phase === 'strategy' && <Strategy acq={acq} />}
      {phase === 'valuation' && <Valuation acq={acq} s={s} />}
      {phase === 'loi' && <Loi acq={acq} s={s} />}
      {phase === 'diligence' && <Diligence acq={acq} s={s} />}
      {phase === 'agreement' && isAbc && <Agreement acq={acq} s={s} />}
      {phase === 'financing' && isAbc && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Checklist
            title="Approvals"
            items={[
              { label: 'CFO concurrence on revised price', done: true, href: `/acquisitions/${id}/decisions/dec-price` },
              { label: 'CEO approval of price revision', done: s.decisions.find((d) => d.id === 'dec-price')?.status === 'Approved', href: `/acquisitions/${id}/decisions/dec-price` },
              { label: 'Investment Committee approval (Oct 14)', done: false, href: `/acquisitions/${id}/deliverables/dl-ic` },
              { label: 'Board notification', done: false },
            ]}
          />
          <Checklist
            title="Financing"
            items={[
              { label: 'Acquisition facility draw request', done: true, note: '$16.0M draw on existing facility' },
              { label: 'Lender credit memo updated for revised price', done: false, href: `/acquisitions/${id}/work?item=w-lender` },
              { label: 'Leverage covenant headroom confirmed', done: false, note: 'Pro forma 2.9x vs 3.5x covenant (est.)' },
            ]}
          />
        </SimpleGrid>
      )}
      {phase === 'closing' && isAbc && (
        <Checklist
          title="Closing conditions & deliverables"
          items={[
            { label: 'Brazos Valley ISD consent to change of control', done: false, href: `/acquisitions/${id}/decisions/dec-consent` },
            { label: 'Founder employment agreement executed', done: false, href: `/acquisitions/${id}/decisions/dec-founder` },
            { label: 'Successor ACR license qualifier in place (Austin, Round Rock)', done: false, href: `/acquisitions/${id}/work?item=w-qualifier` },
            { label: 'Sales tax escrow funded ($150K)', done: false },
            { label: 'Payoff letters for existing debt', done: false },
            { label: 'Funds flow memo approved by CFO', done: false },
            { label: 'Insurance binders effective at close', done: false },
          ]}
        />
      )}
      {phase === 'integration' && <Integration acq={acq} s={s} />}

      {milestones.length > 0 && (
        <Section title="Milestones">
          <Stack gap={6}>
            {milestones.map((m) => (
              <Group key={m.id} justify="space-between">
                <Text size="sm">{m.title}</Text>
                <Group gap={6}>
                  {m.status !== 'Upcoming' && <Badge color={m.status === 'Done' ? 'teal' : 'orange'}>{m.status}</Badge>}
                  <Text size="xs" c="dimmed">
                    {fmtDate(m.date)}
                  </Text>
                </Group>
              </Group>
            ))}
          </Stack>
        </Section>
      )}

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: decisions.length ? 8 : 12 }}>
          <Section title={`Work in this phase (${work.length})`} pad={false}>
            <WorkTable items={work} onOpen={setItem} />
          </Section>
        </Grid.Col>
        {decisions.length > 0 && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Section title="Decisions in this phase">
              <Stack gap={10}>
                {decisions.map((d) => (
                  <Box key={d.id}>
                    <Anchor component={Link} href={`/acquisitions/${id}/decisions/${d.id}`} size="sm" c="dark">
                      {d.question}
                    </Anchor>
                    <Group gap={6} mt={2}>
                      <StatusBadge status={d.status} size="xs" />
                    </Group>
                  </Box>
                ))}
              </Stack>
            </Section>
          </Grid.Col>
        )}
      </Grid>
      <Text size="xs" c="dimmed">
        Phases overlap in practice: work and decisions belong to a phase for navigation, but link across phases.
      </Text>
      <WorkItemDrawer itemId={item} onClose={() => setItem(null)} />
    </Stack>
  );
}
