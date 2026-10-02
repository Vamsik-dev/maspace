'use client';

import { Box, Group, SimpleGrid, Stack, Text, UnstyledButton, Badge, Anchor, Grid, ThemeIcon, Tooltip } from '@mantine/core';
import { IconProgress, IconTarget, IconAlertTriangle, IconGavel, IconClockExclamation, IconCalendarEvent, IconSparkles, IconCheck, IconBan, IconCircleDashed } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import { DEMO_TODAY, PHASES, fmtM, wsLabel } from '@/lib/meta';
import { fmtDate, refHref } from '@/lib/atlas';
import { workstreamProgress } from '@/lib/derive';
import { Section, PersonAvatar, Meter, personName, StatusBadge } from '@/components/ui';
import { differenceInCalendarDays } from 'date-fns';
import { BriefRow, ThesisFit } from '@/components/intel';
import { headlineBenchmark, similarDeals, thesisFit } from '@/lib/playbook';
import { IconFileSearch, IconScale, IconHistory, IconPresentation, IconChartDots } from '@tabler/icons-react';

function Kpi({ label, value, sub, tip, icon, tone }: { label: string; value: ReactNode; sub?: ReactNode; tip?: string; icon: ReactNode; tone: string }) {
  const inner = (
    <Box className="panel" p="md" h="100%">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={10}>
        <Text className="label">{label}</Text>
        <ThemeIcon size={26} radius="md" variant="light" color={tone}>
          {icon}
        </ThemeIcon>
      </Group>
      <Text fz={26} fw={600} className="num" lh={1.1} style={{ letterSpacing: '-0.02em' }}>
        {value}
      </Text>
      {sub && (
        <Text size="xs" c="dimmed" mt={6} lh={1.35}>
          {sub}
        </Text>
      )}
    </Box>
  );
  return tip ? (
    <Tooltip label={tip} multiline w={260}>
      {inner}
    </Tooltip>
  ) : (
    inner
  );
}

type AttentionRow = { key: string; icon: ReactNode; title: string; context: string; cta: string; href: string; tone: string };

export default function OverviewPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const openAtlas = useUi((u) => u.openAtlas);
  const acq = s.acquisitions.find((a) => a.id === id)!;
  const base = `/acquisitions/${id}`;
  const me = s.currentUserId;
  const findings = s.findings.filter((f) => f.acqId === id);
  const decisions = s.decisions.filter((d) => d.acqId === id);
  const work = s.work.filter((w) => w.acqId === id);
  const milestones = s.milestones.filter((m) => m.acqId === id).sort((a, b) => a.date.localeCompare(b.date));
  const activity = s.activity.filter((a) => a.acqId === id).sort((a, b) => b.at.localeCompare(a.at));

  const pendingDecisions = decisions.filter((d) => d.status === 'Open' || d.status === 'Under Review');
  const critical = findings.filter((f) => (f.severity === 'Critical' || f.severity === 'High') && ['Open', 'Under Review'].includes(f.status));
  const proposed = findings.filter((f) => f.status === 'Proposed');
  const overdue = work.filter((w) => w.status !== 'Complete' && w.due && w.due < DEMO_TODAY);
  const blocked = work.filter((w) => w.status === 'Blocked');
  const soon = milestones.filter((m) => m.date >= DEMO_TODAY && differenceInCalendarDays(new Date(m.date), new Date(DEMO_TODAY)) <= 7);

  const rows: AttentionRow[] = [
    ...proposed.map((f) => ({ key: f.id, icon: <IconSparkles size={15} />, tone: 'violet', title: f.title, context: `Atlas proposed · ${wsLabel(f.workstream)} · needs human review`, cta: 'Review', href: `${base}/findings/${f.id}` })),
    ...pendingDecisions
      .filter((d) => d.approverId === me || d.reviewers.some((r) => r.personId === me && r.verdict === 'Pending'))
      .map((d) => ({ key: d.id, icon: <IconGavel size={15} />, tone: 'blue', title: d.question, context: `${d.approverId === me ? 'Your approval' : 'Your review'}${d.due ? ` · due ${fmtDate(d.due)}` : ''}`, cta: d.approverId === me ? 'Decide' : 'Review', href: `${base}/decisions/${d.id}` })),
    ...pendingDecisions
      .filter((d) => !(d.approverId === me || d.reviewers.some((r) => r.personId === me && r.verdict === 'Pending')))
      .slice(0, 2)
      .map((d) => ({ key: d.id, icon: <IconGavel size={15} />, tone: 'blue', title: d.question, context: `Waiting on ${personName(d.approverId)}${d.due ? ` · due ${fmtDate(d.due)}` : ''}`, cta: 'View', href: `${base}/decisions/${d.id}` })),
    ...critical.map((f) => ({ key: f.id, icon: <IconAlertTriangle size={15} />, tone: f.severity === 'Critical' ? 'red' : 'orange', title: f.title, context: `${f.severity} finding · ${wsLabel(f.workstream)} · ${personName(f.ownerId)}`, cta: 'Review finding', href: `${base}/findings/${f.id}` })),
    ...blocked.map((w) => ({ key: w.id, icon: <IconBan size={15} />, tone: 'red', title: w.title, context: `Blocked · ${w.description ?? wsLabel(w.workstream)}`, cta: 'Unblock', href: `${base}/work?item=${w.id}` })),
    ...soon.map((m) => ({ key: m.id, icon: <IconCalendarEvent size={15} />, tone: 'gray', title: m.title, context: `${fmtDate(m.date)} · in ${differenceInCalendarDays(new Date(m.date), new Date(DEMO_TODAY))} days`, cta: /management/i.test(m.title) ? 'Prepare briefing' : 'View', href: /management/i.test(m.title) ? `${base}/deliverables/dl-mgmt` : `${base}/phase/${m.phase}` })),
  ];

  const ws = workstreamProgress(acq, s.work);
  const PRIORS = 5;
  const fit = thesisFit(acq);
  const sim = similarDeals(acq);
  const bench = headlineBenchmark(acq);
  const pendingProposals = s.proposals.filter((p) => p.acqId === id && p.status === 'Pending').length;
  const recentDocs = s.documents.filter((d) => d.acqId === id && d.uploadedAt >= '2026-09-25').length;
  const recentActs = activity.filter((a) => a.at >= '2026-09-25').length;
  const latest = activity[0];
  const myDecisions = pendingDecisions.filter((d) => d.approverId === me || d.reviewers.some((r) => r.personId === me && r.verdict === 'Pending')).length;
  const nextMeeting = milestones.find((m) => m.date >= DEMO_TODAY && /meeting|committee|IOI|decision/i.test(m.title));
  const closeIn = acq.targetClose ? differenceInCalendarDays(new Date(acq.targetClose), new Date(DEMO_TODAY)) : null;
  const isAbc = id === 'acq-abc';

  const asks: { label: string; prompt?: string; href?: string }[] = [
    { label: isAbc ? "Prepare me for Monday's management meeting" : 'Prepare me for the next management meeting', prompt: 'Prepare me for the management meeting' },
    { label: 'Review financial diligence', prompt: 'Review financial diligence' },
    { label: 'Show unresolved risks', prompt: 'What are the unresolved risks?' },
    { label: 'Prepare IC memo', href: isAbc ? `${base}/deliverables/dl-ic` : `${base}/deliverables` },
    { label: "What's changed this week?", prompt: "What's changed this week?" },
    { label: 'What changed since the original thesis?', prompt: 'What changed since the original thesis?' },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <Box>
          <Text className="label" c="ink.7" mb={4}>
            Deal overview
          </Text>
          <Text fz={24} fw={600} lh={1.2} style={{ letterSpacing: '-0.02em' }}>
            {acq.stageLabel}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {acq.targetClose ? `Target close ${fmtDate(acq.targetClose)} · ` : ''}Deal lead {personName(acq.dealLeadId)} · {acq.team.length} on the deal team
          </Text>
        </Box>
        <Text size="xs" c="dimmed">
          As of {fmtDate(DEMO_TODAY)}, 2026
        </Text>
      </Group>

      <Box className="panel" style={{ overflow: 'hidden' }}>
        <Group justify="space-between" px="md" h={46} style={{ borderBottom: '1px solid var(--app-border-soft)', background: 'linear-gradient(90deg, #f7f3ff, #ffffff 60%)' }}>
          <Group gap={8}>
            <IconSparkles size={16} color="#6d3fd4" />
            <Text fw={600} fz={13.5}>
              Atlas briefing for {personName(me).split(' ')[0]}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Updated {fmtDate(DEMO_TODAY)} · from documents, playbook and {PRIORS} past deals
          </Text>
        </Group>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
          <BriefRow icon={<IconFileSearch size={16} color="#4b5a70" />} tone="#f1f4f9" title="What changed" href={`${base}/activity`} cta="Activity">
            <b>{recentDocs} document{recentDocs === 1 ? '' : 's'}</b> analyzed and <b>{recentActs} changes</b> in the last 7 days.{latest ? ` Latest: ${personName(latest.actor)} ${latest.text.length > 90 ? latest.text.slice(0, 88) + '…' : latest.text}.` : ''}
          </BriefRow>
          <BriefRow icon={<IconSparkles size={16} color="#6d3fd4" />} tone="#f5effd" title="Atlas found" href={`${base}/inbox`} cta="Review">
            {proposed.length + pendingProposals > 0 ? (
              <>
                {proposed.length > 0 && (
                  <>
                    <b>{proposed.length} proposed finding{proposed.length === 1 ? '' : 's'}</b>
                    {pendingProposals ? ' and ' : ' '}
                  </>
                )}
                {pendingProposals > 0 && <b>{pendingProposals} drafted item{pendingProposals === 1 ? '' : 's'}</b>} waiting for your review.
                {proposed[0] ? ` Top: ${proposed[0].title}.` : ''}
              </>
            ) : (
              <>
                <b>{critical.length} material issues</b> remain open: {critical.slice(0, 2).map((f) => f.title.toLowerCase()).join('; ')}.
              </>
            )}
          </BriefRow>
          <BriefRow icon={<IconHistory size={16} color="#4b5a70" />} tone="#f1f4f9" title="Based on your playbook" href={`${base}/research`} cta="Thesis fit">
            {fit ? (
              <>
                <b>{fit.fail} of {fit.rows.length} criteria fail</b> {fit.watch ? `and ${fit.watch} need watching ` : ''}against Playbook v4.
                {sim.length ? ` Resembles ${sim.slice(0, 2).map((x) => `${x.deal.name} (${x.reasons[0]})`).join(' and ')}.` : ''}
              </>
            ) : (
              'Atlas will score the target once financials and the customer file arrive.'
            )}
          </BriefRow>
          <BriefRow icon={<IconGavel size={16} color="#2f53bb" />} tone="#eef3ff" title="Decisions needed" href={`${base}/decisions`} cta="Decide">
            <b>{pendingDecisions.length} decision{pendingDecisions.length === 1 ? '' : 's'}</b> {pendingDecisions.length === 1 ? 'is' : 'are'} waiting for human review
            {myDecisions ? `, ${myDecisions} of them yours` : ''}.{pendingDecisions[0] ? ` Most urgent: ${pendingDecisions.slice().sort((a, b) => (a.due ?? '9').localeCompare(b.due ?? '9'))[0].question}` : ''}
          </BriefRow>
          <BriefRow icon={<IconPresentation size={16} color="#b25e09" />} tone="#fff3e6" title="Prepare me" onClick={() => openAtlas(nextMeeting ? 'Prepare me for the management meeting' : 'What needs my attention?')} cta={nextMeeting ? 'Generate briefing' : 'Ask Atlas'}>
            {nextMeeting ? (
              <>
                <b>{nextMeeting.title}</b> is {fmtDate(nextMeeting.date)}, in {differenceInCalendarDays(new Date(nextMeeting.date), new Date(DEMO_TODAY))} days. Atlas can prepare questions, open issues and lessons from past deals.
              </>
            ) : (
              'No meetings in the next week. Ask Atlas what needs your attention.'
            )}
          </BriefRow>
          <BriefRow icon={<IconChartDots size={16} color="#b42318" />} tone="#fdecec" title="This deal vs. your previous deals" href={`${base}/research`} cta="Benchmarks">
            {bench ?? 'Benchmarks appear once Atlas has extracted the target’s metrics.'}
          </BriefRow>
        </SimpleGrid>
      </Box>

      <SimpleGrid cols={{ base: 2, sm: 3, xl: 6 }} spacing="md">
        <Kpi tone="ink" icon={<IconProgress size={16} />} label={PHASES.find((p) => p.key === acq.currentPhase)!.short} value={`${acq.phases[acq.currentPhase].progress}%`} sub={ws.length ? `${ws.reduce((a, w) => a + w.done, 0)} of ${ws.reduce((a, w) => a + w.total, 0)} diligence items` : 'current phase'} />
        <Kpi tone="blue" icon={<IconGavel size={16} />} label="Decisions" value={pendingDecisions.length} sub={`pending · ${decisions.filter((d) => d.status === 'Approved').length} approved`} />
        <Kpi tone="orange" icon={<IconAlertTriangle size={16} />} label="High findings" value={critical.length} sub={`open · ${findings.filter((f) => f.status !== 'Dismissed').length} findings total`} />
        <Kpi tone="red" icon={<IconClockExclamation size={16} />} label="Overdue" value={overdue.length} sub={`work items · ${blocked.length} blocked`} />
        <Kpi tone="teal" icon={<IconTarget size={16} />} label="Thesis" value={`${acq.thesis.assumptions.filter((a) => a.status === 'Supported').length}/${acq.thesis.assumptions.length}`} sub={`supported · ${acq.thesis.assumptions.filter((a) => a.status === 'Contradicted').length} contradicted`} />
        <Kpi tone="gray" icon={<IconCalendarEvent size={16} />} label="Close in" value={closeIn !== null ? `${closeIn} days` : '—'} sub={acq.targetClose ? fmtDate(acq.targetClose) : 'Not set'} tip={acq.evBasis} />
      </SimpleGrid>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <Section
              title={
                <Group gap={8}>
                  Needs attention
                  <Badge color="red" variant="light">
                    {rows.length}
                  </Badge>
                </Group>
              }
              right={
                <Group gap={12}>
                  <Text size="xs" c="dimmed">
                    {pendingDecisions.length} decisions · {critical.length} high findings · {overdue.length} overdue items
                  </Text>
                </Group>
              }
              pad={false}
            >
              {rows.length === 0 ? (
                <Text p="md" size="sm" c="dimmed">
                  Nothing needs attention right now.
                </Text>
              ) : (
                <Stack gap={0}>
                  {rows.slice(0, 9).map((r) => (
                    <UnstyledButton key={r.key} component={Link} href={r.href} px="md" py={9} className="row-link" style={{ borderBottom: '1px solid #f1f4f9', borderRadius: 0 }}>
                      <Group wrap="nowrap" gap="sm">
                        <ThemeIcon variant="light" color={r.tone} size={26}>
                          {r.icon}
                        </ThemeIcon>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" fw={500} truncate>
                            {r.title}
                          </Text>
                          <Text size="xs" c="dimmed" truncate>
                            {r.context}
                          </Text>
                        </Box>
                        <Text size="xs" c="ink.8" fw={500} style={{ whiteSpace: 'nowrap' }}>
                          {r.cta} →
                        </Text>
                      </Group>
                    </UnstyledButton>
                  ))}
                  {overdue.length > 0 && (
                    <UnstyledButton component={Link} href={`${base}/work?view=overdue`} px="md" py={9} className="row-link">
                      <Group gap="sm">
                        <ThemeIcon variant="light" color="red" size={26}>
                          <IconClockExclamation size={15} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>
                          {overdue.length} overdue work items
                        </Text>
                        <Text size="xs" c="dimmed">
                          {Array.from(new Set(overdue.map((w) => wsLabel(w.workstream)))).join(', ')}
                        </Text>
                      </Group>
                    </UnstyledButton>
                  )}
                </Stack>
              )}
            </Section>

            <Section title="Ask Atlas for an outcome">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={8}>
                {asks.map((a) => {
                  const content = (
                    <Group gap={8} wrap="nowrap" p={10} style={{ border: '1px solid var(--app-border)', borderRadius: 6, height: '100%' }} className="row-link">
                      <IconSparkles size={14} color="#7c3aed" style={{ flexShrink: 0 }} />
                      <Text size="sm" lh={1.3}>
                        {a.label}
                      </Text>
                    </Group>
                  );
                  return a.href ? (
                    <Link key={a.label} href={a.href}>
                      {content}
                    </Link>
                  ) : (
                    <UnstyledButton key={a.label} onClick={() => openAtlas(a.prompt)}>
                      {content}
                    </UnstyledButton>
                  );
                })}
              </SimpleGrid>
            </Section>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Section
                title="Workstreams"
                right={
                  <Anchor component={Link} href={`${base}/workstreams`} size="xs">
                    All
                  </Anchor>
                }
              >
                <Stack gap={8}>
                  {ws.map((w) => (
                    <Link key={w.key} href={`${base}/workstreams/${w.key}`}>
                    <Group justify="space-between" wrap="nowrap" className="row-link" px={4}>
                      <Group gap={6}>
                        <Text size="sm">{w.label}</Text>
                        {w.blocked > 0 && (
                          <Badge size="xs" color="red">
                            blocked
                          </Badge>
                        )}
                      </Group>
                      <Meter value={w.pct} color={w.pct < 50 ? 'orange' : 'ink'} />
                    </Group>
                    </Link>
                  ))}
                  {ws.length === 0 && (
                    <Text size="sm" c="dimmed">
                      Workstreams are created when the LOI is signed.
                    </Text>
                  )}
                </Stack>
              </Section>
              <Section
                title={acq.metrics ? 'Playbook fit' : 'Thesis tracker'}
                right={
                  <Anchor component={Link} href={`${base}/phase/strategy`} size="xs">
                    Thesis
                  </Anchor>
                }
              >
                {acq.metrics ? (
                  <ThesisFit acq={acq} compact />
                ) : (
                <Stack gap={8}>
                  {acq.thesis.assumptions.map((a) => {
                    const color = { Supported: 'teal', 'At risk': 'orange', Contradicted: 'red', Untested: 'gray' }[a.status];
                    const f = a.findingIds?.[0];
                    const row = (
                      <Group justify="space-between" wrap="nowrap" align="flex-start" className="row-link" px={4}>
                        <Box style={{ minWidth: 0 }}>
                          <Text size="sm">{a.label}</Text>
                          <Text size="xs" c="dimmed">
                            Expected {a.expected}
                            {a.current ? ` · now ${a.current}` : ''}
                          </Text>
                        </Box>
                        <Badge color={color} size="sm" style={{ flexShrink: 0 }}>
                          {a.status}
                        </Badge>
                      </Group>
                    );
                    return f ? (
                      <Link key={a.id} href={`${base}/findings/${f}`}>
                        {row}
                      </Link>
                    ) : (
                      <Box key={a.id}>{row}</Box>
                    );
                  })}
                </Stack>
                )}
              </Section>
            </SimpleGrid>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <Section title="Transaction snapshot">
              <Stack gap={0}>
                {[
                  ['Target', acq.target.legalName],
                  ['Ownership', acq.target.ownership],
                  ['Structure', '100% equity · cash-free, debt-free'],
                  ['Working EV', `${fmtM(acq.ev)} · ${(acq.ev / acq.target.ebitda).toFixed(2)}x adj. EBITDA`],
                  ['EV basis', acq.evBasis],
                  ['Strategy', acq.strategy],
                ].map(([k, v]) => (
                  <Group key={k} justify="space-between" align="flex-start" wrap="nowrap" py={7} style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
                    <Text size="xs" c="dimmed" w={90} style={{ flexShrink: 0 }}>
                      {k}
                    </Text>
                    <Text size="sm" ta="right" className="num" lh={1.4}>
                      {v}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Section>

            <Section title="Milestones">
              <Stack gap={6}>
                {milestones.map((m) => (
                  <Group key={m.id} justify="space-between" wrap="nowrap">
                    <Text size="sm" c={m.status === 'Done' ? 'dimmed' : undefined} td={m.status === 'Done' ? 'line-through' : undefined}>
                      {m.title}
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      {m.status === 'At risk' && (
                        <Badge size="xs" color="orange">
                          At risk
                        </Badge>
                      )}
                      <Text size="xs" c="dimmed" className="num">
                        {fmtDate(m.date)}
                      </Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Section>

            <Section
              title="Decisions"
              right={
                <Anchor component={Link} href={`${base}/decisions`} size="xs">
                  All
                </Anchor>
              }
            >
              <Stack gap={10}>
                {decisions.slice(0, 5).map((d) => (
                  <Box key={d.id} component={Link} href={`${base}/decisions/${d.id}`} className="row-link" px={4}>
                    <Text size="sm" lh={1.35}>
                      {d.question}
                    </Text>
                    <Group gap={6} mt={2}>
                      <StatusBadge status={d.status} size="xs" />
                      <Text size="xs" c="dimmed">
                        {d.outcome ? `${personName(d.outcome.decidedBy)} · ${fmtDate(d.outcome.decidedAt.slice(0, 10))}` : `Approver: ${personName(d.approverId)}`}
                      </Text>
                    </Group>
                  </Box>
                ))}
                {decisions.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No decisions yet.
                  </Text>
                )}
              </Stack>
            </Section>

            <Section
              title="Recent activity"
              right={
                <Anchor component={Link} href={`${base}/activity`} size="xs">
                  All
                </Anchor>
              }
            >
              <Stack gap={10}>
                {activity.slice(0, 7).map((a) => (
                  <Group key={a.id} gap={8} wrap="nowrap" align="flex-start">
                    <PersonAvatar id={a.actor} size={20} />
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" lh={1.35}>
                        <b>{personName(a.actor)}</b>{' '}
                        {a.ref ? (
                          <Anchor component={Link} href={refHref(base, a.ref.type, a.ref.id)} c="dark" size="sm">
                            {a.text}
                          </Anchor>
                        ) : (
                          a.text
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {fmtDate(a.at.slice(0, 10))}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Section>
          </Stack>
        </Grid.Col>
      </Grid>
      <Text size="xs" c="dimmed">
        Demo date is fixed at {fmtDate(DEMO_TODAY)}, 2026 so the story stays coherent.
      </Text>
    </Stack>
  );
}
