'use client';

import { Alert, Anchor, Badge, Box, Button, Grid, Group, Radio, SimpleGrid, Stack, Text, Textarea, List } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconRobot, IconLock } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useStore } from '@/lib/store';
import { phaseLabel } from '@/lib/meta';
import { fmtDate } from '@/lib/atlas';
import { Claim, CitationChips, Field, Person, PersonAvatar, Section, SeverityBadge, StatusBadge, personName, Empty } from '@/components/ui';
import { Comments } from '@/components/Comments';

export default function DecisionPage() {
  const { id, did } = useParams<{ id: string; did: string }>();
  const d = useStore((s) => s.decisions.find((x) => x.id === did));
  const findings = useStore((s) => s.findings);
  const risks = useStore((s) => s.risks);
  const docs = useStore((s) => s.documents);
  const activity = useStore((s) => s.activity);
  const me = useStore((s) => s.currentUserId);
  const decide = useStore((s) => s.decide);
  const review = useStore((s) => s.reviewDecision);
  const rules = useStore((s) => s.rules);
  const setUser = useStore((s) => s.setCurrentUser);
  const [choice, setChoice] = useState<string | undefined>(d?.recommendation?.optionId);
  const [rationale, setRationale] = useState('');
  const [note, setNote] = useState('');
  const base = `/acquisitions/${id}`;

  if (!d) return <Empty title="Decision not found" action={<Link href={`${base}/decisions`}>Back</Link>} />;

  const open = d.status === 'Open' || d.status === 'Under Review';
  const isApprover = d.approverId === me;
  const myReview = d.reviewers.find((r) => r.personId === me);
  const linkedF = findings.filter((f) => d.findingIds.includes(f.id));
  const linkedR = risks.filter((r) => d.riskIds.includes(r.id));
  const linkedD = docs.filter((x) => d.documentIds.includes(x.id));
  const trail = activity.filter((a) => a.ref?.type === 'decision' && a.ref.id === d.id).sort((a, b) => a.at.localeCompare(b.at));
  const ruleOn = rules.find((r) => r.id === 'rule-decision')?.enabled;

  return (
    <Stack gap="md">
      <Anchor component={Link} href={`${base}/decisions`} size="xs" c="dimmed">
        <IconArrowLeft size={11} /> Decisions
      </Anchor>
      <Box>
        <Group gap={8} mb={6}>
          <StatusBadge status={d.status} />
          <Badge variant="default">{phaseLabel(d.phase)}</Badge>
          <Text size="xs" c="dimmed">
            Decision · proposed by {personName(d.proposedBy)} on {fmtDate(d.proposedAt)}
          </Text>
        </Group>
        <Text fz={24} fw={650} lh={1.25} maw={880} style={{ letterSpacing: '-0.01em' }}>
          {d.question}
        </Text>
      </Box>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <Section title="Context">
              <Text size="sm" lh={1.6}>
                {d.context}
              </Text>
            </Section>

            {(linkedF.length > 0 || linkedR.length > 0 || linkedD.length > 0) && (
              <Section title="Evidence">
                <Stack gap="md">
                  {linkedF.map((f) => (
                    <Box key={f.id}>
                      <Group gap={6} mb={4}>
                        <SeverityBadge severity={f.severity} positive={f.positive} />
                        <Anchor component={Link} href={`${base}/findings/${f.id}`} size="sm" fw={600} c="dark">
                          {f.title}
                        </Anchor>
                      </Group>
                      <Claim kind="fact" acqId={id} citations={f.fact.citations} calculation={f.calculation} compact>
                        {f.fact.text}
                      </Claim>
                    </Box>
                  ))}
                  {linkedR.length > 0 && (
                    <Box>
                      <Text className="label" mb={4}>
                        Risks addressed
                      </Text>
                      {linkedR.map((r) => (
                        <Group key={r.id} gap={6}>
                          <SeverityBadge severity={r.severity} />
                          <Anchor component={Link} href={`${base}/risks?risk=${r.id}`} size="sm" c="dark">
                            {r.title}
                          </Anchor>
                          <StatusBadge status={r.status} size="xs" />
                        </Group>
                      ))}
                    </Box>
                  )}
                  {linkedD.length > 0 && (
                    <Box>
                      <Text className="label" mb={4}>
                        Documents
                      </Text>
                      <CitationChips acqId={id} citations={linkedD.map((x) => ({ docId: x.id }))} />
                    </Box>
                  )}
                </Stack>
              </Section>
            )}

            <Section title="Options">
              <Stack gap="sm">
                {d.options.map((o, idx) => {
                  const rec = d.recommendation?.optionId === o.id;
                  const chosen = d.outcome?.optionId === o.id;
                  return (
                    <Box key={o.id} p="md" style={{ border: `1px solid ${chosen ? '#1f45a5' : rec ? '#cbd3df' : 'var(--app-border)'}`, borderRadius: 8, background: chosen ? '#eef3ff' : 'white' }}>
                      <Group justify="space-between" mb={4}>
                        <Text fw={600} size="sm">
                          Option {idx + 1}: {o.label}
                        </Text>
                        <Group gap={6}>
                          {rec && <Badge color={d.recommendation!.by === 'atlas' ? 'violet' : 'orange'}>{d.recommendation!.by === 'atlas' ? 'Atlas recommends' : `Recommended by ${personName(d.recommendation!.by)}`}</Badge>}
                          {chosen && (
                            <Badge color="ink" variant="filled" leftSection={<IconCheck size={11} />}>
                              Decided
                            </Badge>
                          )}
                        </Group>
                      </Group>
                      {o.description && (
                        <Text size="sm" c="dimmed" mb={6}>
                          {o.description}
                        </Text>
                      )}
                      {(o.pros.length > 0 || o.cons.length > 0) && (
                        <SimpleGrid cols={2} spacing="md">
                          <Box>
                            <Text className="label" c="teal.8" mb={2}>
                              For
                            </Text>
                            <List size="sm" spacing={2}>
                              {o.pros.map((p) => (
                                <List.Item key={p}>{p}</List.Item>
                              ))}
                            </List>
                          </Box>
                          <Box>
                            <Text className="label" c="red.8" mb={2}>
                              Against
                            </Text>
                            <List size="sm" spacing={2}>
                              {o.cons.map((p) => (
                                <List.Item key={p}>{p}</List.Item>
                              ))}
                            </List>
                          </Box>
                        </SimpleGrid>
                      )}
                    </Box>
                  );
                })}
                {d.recommendation && (
                  <Claim kind="recommendation">
                    <b>{d.recommendation.by === 'atlas' ? 'Atlas' : personName(d.recommendation.by)}:</b> {d.recommendation.rationale}
                  </Claim>
                )}
              </Stack>
            </Section>

            <Section title="Reviews">
              <Stack gap="sm">
                {d.reviewers.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No reviewers assigned.
                  </Text>
                )}
                {d.reviewers.map((r) => (
                  <Group key={r.personId} justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap={8} align="flex-start" wrap="nowrap">
                      <PersonAvatar id={r.personId} size={24} />
                      <Box>
                        <Text size="sm" fw={500}>
                          {personName(r.personId)}
                        </Text>
                        {r.note && (
                          <Text size="sm" c="dimmed">
                            “{r.note}”
                          </Text>
                        )}
                      </Box>
                    </Group>
                    <Badge color={r.verdict === 'Concur' ? 'teal' : r.verdict === 'Concerns' ? 'orange' : 'gray'}>{r.verdict}</Badge>
                  </Group>
                ))}
              </Stack>
            </Section>

            <Section title={`Discussion (${d.comments.length})`}>
              <Comments type="decision" id={d.id} comments={d.comments} />
            </Section>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            {d.outcome && (
              <Section title="Outcome">
                <Stack gap="sm">
                  <Claim kind="decision">
                    <b>{d.status}</b>
                    {d.outcome.optionId && `: ${d.options.find((o) => o.id === d.outcome!.optionId)?.label}`}
                  </Claim>
                  <Field label="Rationale">{d.outcome.rationale}</Field>
                  <Field label="Decided by">
                    <Person id={d.outcome.decidedBy} withTitle />
                  </Field>
                  <Field label="Date">{fmtDate(d.outcome.decidedAt.slice(0, 10))}</Field>
                </Stack>
              </Section>
            )}

            {open && isApprover && (
              <Section title="Your decision">
                <Stack gap="sm">
                  <Radio.Group value={choice} onChange={setChoice}>
                    <Stack gap={6}>
                      {d.options.map((o) => (
                        <Radio key={o.id} value={o.id} label={o.label} size="sm" />
                      ))}
                    </Stack>
                  </Radio.Group>
                  <Textarea size="sm" label="Rationale (recorded permanently)" autosize minRows={3} value={rationale} onChange={(e) => setRationale(e.currentTarget.value)} />
                  {d.reviewers.some((r) => r.verdict === 'Pending') && (
                    <Text size="xs" c="orange.8">
                      {d.reviewers.filter((r) => r.verdict === 'Pending').length} review(s) still pending.
                    </Text>
                  )}
                  <Group gap={6}>
                    <Button
                      size="sm"
                      disabled={!choice || !rationale.trim()}
                      onClick={() => {
                        decide(d.id, 'Approved', choice, rationale);
                        notifications.show({ title: 'Decision approved and recorded', message: ruleOn && d.downstream.length ? `${d.downstream.length} follow-up actions created.` : 'Logged to the audit trail.', color: 'ink' });
                      }}
                    >
                      Approve
                    </Button>
                    <Button size="sm" variant="default" disabled={!rationale.trim()} onClick={() => decide(d.id, 'Deferred', undefined, rationale)}>
                      Defer
                    </Button>
                    <Button size="sm" variant="subtle" color="red" disabled={!rationale.trim()} onClick={() => decide(d.id, 'Rejected', choice, rationale)}>
                      Reject
                    </Button>
                  </Group>
                </Stack>
              </Section>
            )}

            {open && !isApprover && myReview?.verdict === 'Pending' && (
              <Section title="Your review">
                <Stack gap="sm">
                  <Textarea size="sm" placeholder="Note (optional)" autosize minRows={2} value={note} onChange={(e) => setNote(e.currentTarget.value)} />
                  <Group gap={6}>
                    <Button size="sm" onClick={() => review(d.id, 'Concur', note || undefined)}>
                      Concur
                    </Button>
                    <Button size="sm" variant="default" onClick={() => review(d.id, 'Concerns', note || undefined)}>
                      Raise concerns
                    </Button>
                  </Group>
                </Stack>
              </Section>
            )}

            {open && !isApprover && myReview?.verdict !== 'Pending' && (
              <Alert variant="light" color="gray" icon={<IconLock size={16} />}>
                <Text size="sm">
                  Only <b>{personName(d.approverId)}</b> can approve this decision.
                </Text>
                <Button size="xs" variant="subtle" px={0} mt={4} onClick={() => setUser(d.approverId)}>
                  Prototype: switch to {personName(d.approverId)} →
                </Button>
              </Alert>
            )}

            <Section title="Details">
              <Stack gap="sm">
                <Field label="Approver">
                  <Person id={d.approverId} withTitle />
                </Field>
                {d.due && <Field label="Decide by">{fmtDate(d.due)}</Field>}
                <Field label="Phase">{phaseLabel(d.phase)}</Field>
              </Stack>
            </Section>

            <Section title="Downstream impact">
              {d.downstream.length === 0 ? (
                <Text size="sm" c="dimmed">
                  None recorded.
                </Text>
              ) : (
                <Stack gap={6}>
                  {d.downstream.map((x) => (
                    <Text key={x} size="sm">
                      • {x}
                    </Text>
                  ))}
                  {open && ruleOn && (
                    <Group gap={6} mt={4} wrap="nowrap" align="flex-start">
                      <IconRobot size={14} color="var(--app-muted)" style={{ marginTop: 2 }} />
                      <Text size="xs" c="dimmed">
                        On approval, automation creates a follow-up action for each item and moves linked risks to Mitigating.
                      </Text>
                    </Group>
                  )}
                </Stack>
              )}
            </Section>

            <Section title="Audit trail">
              <Stack gap={8}>
                {trail.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No events yet.
                  </Text>
                )}
                {trail.map((a) => (
                  <Group key={a.id} gap={8} wrap="nowrap" align="flex-start">
                    <PersonAvatar id={a.actor} size={18} />
                    <Box>
                      <Text size="xs">
                        <b>{personName(a.actor)}</b> {a.text}
                      </Text>
                      <Text fz={10.5} c="dimmed">
                        {fmtDate(a.at.slice(0, 10))} {a.at.slice(11, 16)}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Section>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
