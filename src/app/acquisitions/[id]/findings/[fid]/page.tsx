'use client';

import { Alert, Box, Button, Grid, Group, Menu, SimpleGrid, Stack, Text, Badge, Anchor, ThemeIcon } from '@mantine/core';
import { IconChevronDown, IconSparkles, IconPlus, IconArrowRight, IconGavel, IconShieldExclamation, IconListCheck, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { wsLabel } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import { Claim, CitationLine, Field, Person, Section, SeverityBadge, StatusBadge, personName, Empty, WhyPopover } from '@/components/ui';
import { Comments } from '@/components/Comments';
import { NewDecisionModal, NewRiskModal, NewWorkItemModal } from '@/components/Forms';
import type { FindingStatus } from '@/lib/types';
import { PRIOR } from '@/data/portfolio';
import { ChainPanel } from '@/components/intel';

export default function FindingPage() {
  const { id, fid } = useParams<{ id: string; fid: string }>();
  const f = useStore((s) => s.findings.find((x) => x.id === fid));
  const acq = useStore((s) => s.acquisitions.find((a) => a.id === id))!;
  const risks = useStore((s) => s.risks);
  const decisions = useStore((s) => s.decisions);
  const work = useStore((s) => s.work);
  const update = useStore((s) => s.updateFinding);
  const accept = useStore((s) => s.acceptFinding);
  const dismiss = useStore((s) => s.dismissFinding);
  const [riskOpen, setRiskOpen] = useState(false);
  const [decOpen, setDecOpen] = useState(false);
  const [decDefaults, setDecDefaults] = useState<{ question?: string; options?: string[] }>({});
  const [workOpen, setWorkOpen] = useState(false);
  const [workTitle, setWorkTitle] = useState('');
  const base = `/acquisitions/${id}`;

  if (!f) return <Empty title="Finding not found" action={<Link href={`${base}/findings`}>Back to findings</Link>} />;

  const linkedRisks = risks.filter((r) => f.riskIds.includes(r.id) || r.findingIds.includes(f.id));
  const linkedDecisions = decisions.filter((d) => f.decisionIds.includes(d.id) || d.findingIds.includes(f.id));
  const linkedWork = work.filter((w) => f.workItemIds.includes(w.id) || w.findingIds?.includes(f.id));
  const assumption = f.thesisLink ? acq.thesis.assumptions.find((a) => a.id === f.thesisLink!.assumptionId) : undefined;
  const memory = f.id === 'f-conc' ? PRIOR.find((p) => p.id === 'pa-redriver') : f.id === 'f-owner' ? PRIOR.find((p) => p.id === 'pa-bluebonnet') : f.id === 'f-qoe' ? PRIOR.find((p) => p.id === 'pa-gulf') : f.id === 'f-turnover' ? PRIOR.find((p) => p.id === 'pa-pinecrest') : undefined;

  const statuses: FindingStatus[] = ['Open', 'Under Review', 'Confirmed', 'Resolved', 'Dismissed'];

  const startAction = (a: string) => {
    if (/decision|valuation|earn-out|escalate|ic/i.test(a)) {
      setDecDefaults({
        question: /earn-out/i.test(a) ? `Should we add earn-out protection for: ${f.title.toLowerCase()}?` : /valuation/i.test(a) ? `Should we adjust valuation for: ${f.title.toLowerCase()}?` : `How should we respond to: ${f.title.toLowerCase()}?`,
        options: /earn-out|valuation/i.test(a) ? ['Hold price', 'Reduce price', 'Contingent consideration (earn-out / holdback)'] : ['Accept and monitor', 'Mitigate in SPA', 'Escalate to IC'],
      });
      setDecOpen(true);
    } else {
      setWorkTitle(a);
      setWorkOpen(true);
    }
  };

  return (
    <Stack gap="md">
      <Anchor component={Link} href={`${base}/findings`} size="xs" c="dimmed">
        <IconArrowLeft size={11} /> Findings
      </Anchor>

      {f.status === 'Proposed' && (
        <Alert color="violet" variant="light" icon={<IconSparkles size={18} />} title="Proposed by Atlas — needs human review">
          <Text size="sm" mb="sm">
            Atlas proposed this finding after processing a new document. It is not used in the risk register, deal documents or IC materials until a person accepts it.
          </Text>
          <Group gap="xs">
            <Button size="xs" onClick={() => accept(f.id)}>
              Accept as finding
            </Button>
            <Button size="xs" variant="default" onClick={() => dismiss(f.id)}>
              Dismiss
            </Button>
          </Group>
        </Alert>
      )}

      <ChainPanel findingId={f.id} findingStatus={f.status} />

      <Box>
        <Group gap={8} mb={6}>
          <SeverityBadge severity={f.severity} positive={f.positive} />
          <StatusBadge status={f.status} />
          <Badge variant="default">{wsLabel(f.workstream)}</Badge>
          <Text size="xs" c="dimmed">
            Finding · identified by {personName(f.identifiedBy)} on {fmtDate(f.createdAt)}
          </Text>
        </Group>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text fz={24} fw={650} lh={1.25} style={{ letterSpacing: '-0.01em' }} maw={820}>
            {f.title}
          </Text>
          {f.status !== 'Proposed' && (
            <Menu position="bottom-end">
              <Menu.Target>
                <Button variant="default" rightSection={<IconChevronDown size={13} />}>
                  Status: {f.status}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {statuses.map((st) => (
                  <Menu.Item key={st} onClick={() => update(f.id, { status: st })} disabled={st === f.status}>
                    {st}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Box>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <Section title="Evidence" right={<WhyPopover acqId={id} citations={f.fact.citations} calculation={f.calculation} comparedWith={f.thesisLink ? `Thesis assumption: ${f.thesisLink.expected}` : undefined} />}>
              <Stack gap="md">
                <Claim kind="fact">{f.fact.text}</Claim>
                <Stack gap={8} pl={12}>
                  <Text className="label">Sources</Text>
                  {f.fact.citations.length === 0 && (
                    <Text size="xs" c="orange.8">
                      No source attached. Add a document reference before this finding is used in IC materials.
                    </Text>
                  )}
                  {f.fact.citations.map((c, i) => (
                    <CitationLine key={i} acqId={id} c={c} />
                  ))}
                </Stack>
                {f.calculation && (
                  <Box pl={12}>
                    <Text className="label" mb={4}>
                      Calculation
                    </Text>
                    <Text size="sm" className="num" style={{ background: '#f8fafc', border: '1px solid var(--app-border)', borderRadius: 6, padding: '6px 10px', display: 'inline-block' }}>
                      {f.calculation}
                    </Text>
                  </Box>
                )}
              </Stack>
            </Section>

            {f.thesisLink && (
              <Section title="Against the acquisition thesis">
                <SimpleGrid cols={3}>
                  <Field label="Thesis assumption">{assumption?.label ?? '—'}</Field>
                  <Field label="Expected">
                    <Text fw={600} className="num">
                      {f.thesisLink.expected}
                    </Text>
                  </Field>
                  <Field label="Diligence shows">
                    <Text fw={600} className="num" c={f.positive ? 'teal.8' : 'red.8'}>
                      {f.thesisLink.actual}
                    </Text>
                  </Field>
                </SimpleGrid>
              </Section>
            )}

            {(f.interpretation || f.recommendation) && (
              <Section title="What it means">
                <Stack gap="md">
                  {f.interpretation && <Claim kind="inference">{f.interpretation}</Claim>}
                  {f.recommendation && <Claim kind="recommendation">{f.recommendation}</Claim>}
                  {memory && (
                    <Claim kind="memory">
                      <b>{memory.name}</b> ({memory.closed.slice(0, 4)}): {memory.issues[0]}. Lesson: {memory.lessons[0].text}{' '}
                      <Anchor component={Link} href={`/memory#${memory.id}`} size="xs">
                        View
                      </Anchor>
                    </Claim>
                  )}
                </Stack>
              </Section>
            )}

            {f.implications.length > 0 && (
              <Section title="Potential implications">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {f.implications.map((x, i) => (
                    <Box key={i} p="sm" style={{ border: '1px solid var(--app-border)', borderRadius: 6 }}>
                      <Text className="label" mb={4}>
                        {x.area}
                      </Text>
                      <Text size="sm">{x.text}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Section>
            )}

            <Section title={`Discussion (${f.comments.length})`}>
              <Comments type="finding" id={f.id} comments={f.comments} />
            </Section>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <Section title="Ownership">
              <Stack gap="sm">
                <Field label="Owner">
                  <Person id={f.ownerId} withTitle />
                </Field>
                {f.valuationImpact && <Field label="Valuation impact (est.)">{f.valuationImpact}</Field>}
              </Stack>
            </Section>

            <Section
              title={
                <Group gap={6}>
                  <IconShieldExclamation size={15} /> Risk
                </Group>
              }
              right={
                <Button size="compact-xs" variant="subtle" leftSection={<IconPlus size={12} />} onClick={() => setRiskOpen(true)} disabled={f.status === 'Proposed'}>
                  Create risk
                </Button>
              }
            >
              <Stack gap={8}>
                {linkedRisks.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No risk linked. Not every finding is a risk.
                  </Text>
                )}
                {linkedRisks.map((r) => (
                  <Box key={r.id} component={Link} href={`${base}/risks?risk=${r.id}`} className="row-link" p={6}>
                    <Text size="sm" fw={500}>
                      {r.title}
                    </Text>
                    <Group gap={6} mt={2}>
                      <SeverityBadge severity={r.severity} />
                      <StatusBadge status={r.status} />
                      <Text size="xs" c="dimmed">
                        {personName(r.ownerId)}
                      </Text>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </Section>

            <Section
              title={
                <Group gap={6}>
                  <IconGavel size={15} /> Decision
                </Group>
              }
              right={
                <Button
                  size="compact-xs"
                  variant="subtle"
                  leftSection={<IconPlus size={12} />}
                  disabled={f.status === 'Proposed'}
                  onClick={() => {
                    setDecDefaults({});
                    setDecOpen(true);
                  }}
                >
                  Create decision
                </Button>
              }
            >
              <Stack gap={8}>
                {linkedDecisions.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No decision yet.
                  </Text>
                )}
                {linkedDecisions.map((d) => (
                  <Box key={d.id} component={Link} href={`${base}/decisions/${d.id}`} className="row-link" p={6}>
                    <Text size="sm" fw={500} lh={1.35}>
                      {d.question}
                    </Text>
                    <Group gap={6} mt={4}>
                      <StatusBadge status={d.status} />
                      <Text size="xs" c="dimmed">
                        Approver {personName(d.approverId)}
                      </Text>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </Section>

            {f.possibleActions && f.possibleActions.length > 0 && f.status !== 'Proposed' && (
              <Section title="Possible actions">
                <Stack gap={2}>
                  {f.possibleActions.map((a) => (
                    <Group key={a} justify="space-between" className="row-link" px={6} py={5} style={{ cursor: 'pointer' }} onClick={() => startAction(a)} wrap="nowrap">
                      <Text size="sm">{a}</Text>
                      <IconArrowRight size={13} color="var(--app-muted)" />
                    </Group>
                  ))}
                  <Text size="xs" c="dimmed" mt={4}>
                    Actions create a decision or an assigned work item. Nothing changes until a person approves it.
                  </Text>
                </Stack>
              </Section>
            )}

            <Section
              title={
                <Group gap={6}>
                  <IconListCheck size={15} /> Work
                </Group>
              }
              right={
                <Button
                  size="compact-xs"
                  variant="subtle"
                  leftSection={<IconPlus size={12} />}
                  onClick={() => {
                    setWorkTitle('');
                    setWorkOpen(true);
                  }}
                >
                  Assign
                </Button>
              }
            >
              <Stack gap={6}>
                {linkedWork.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No work linked.
                  </Text>
                )}
                {linkedWork.map((w) => (
                  <Group key={w.id} justify="space-between" wrap="nowrap" component="div">
                    <Anchor component={Link} href={`${base}/work?item=${w.id}`} size="sm" c="dark" lineClamp={1}>
                      {w.title}
                    </Anchor>
                    <StatusBadge status={w.status} size="xs" />
                  </Group>
                ))}
              </Stack>
            </Section>

            <Box p="sm" style={{ border: '1px dashed var(--app-border)', borderRadius: 8 }}>
              <Text className="label" mb={6}>
                Trace
              </Text>
              <Group gap={6} wrap="wrap">
                <TraceNode label="Finding" n={1} />
                <IconArrowRight size={12} color="var(--app-muted)" />
                <TraceNode label="Risk" n={linkedRisks.length} />
                <IconArrowRight size={12} color="var(--app-muted)" />
                <TraceNode label="Decision" n={linkedDecisions.length} />
                <IconArrowRight size={12} color="var(--app-muted)" />
                <TraceNode label="Action" n={linkedWork.length} />
              </Group>
            </Box>
          </Stack>
        </Grid.Col>
      </Grid>

      <NewRiskModal opened={riskOpen} onClose={() => setRiskOpen(false)} findingId={f.id} defaults={{ title: '', description: f.interpretation, severity: f.severity, ownerId: f.ownerId }} />
      <NewDecisionModal
        opened={decOpen}
        onClose={() => setDecOpen(false)}
        acqId={id}
        defaults={{ question: decDefaults.question, options: decDefaults.options, context: `${f.fact.text}${f.interpretation ? ' ' + f.interpretation : ''}`, findingIds: [f.id], riskIds: linkedRisks.map((r) => r.id), documentIds: f.fact.citations.map((c) => c.docId) }}
      />
      <NewWorkItemModal opened={workOpen} onClose={() => setWorkOpen(false)} acqId={id} defaults={{ title: workTitle, workstream: f.workstream, ownerId: f.ownerId, findingIds: [f.id], priority: 'High' }} />
    </Stack>
  );
}

function TraceNode({ label, n }: { label: string; n: number }) {
  return (
    <Group gap={4}>
      <ThemeIcon size={18} radius="xl" variant={n ? 'filled' : 'default'} color="ink.8">
        <Text fz={10} fw={600}>
          {n}
        </Text>
      </ThemeIcon>
      <Text size="xs" c={n ? undefined : 'dimmed'}>
        {label}
      </Text>
    </Group>
  );
}
