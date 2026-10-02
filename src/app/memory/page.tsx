'use client';

import { Anchor, Badge, Box, Button, Group, Loader, SimpleGrid, Stack, Table, Text, UnstyledButton } from '@mantine/core';
import { IconCheck, IconCloudDownload, IconSparkles, IconArrowRight, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { TopBar } from '@/components/Chrome';
import { PageHeader, Section, Claim, Pill } from '@/components/ui';
import { fmtM } from '@/lib/meta';
import { useStore } from '@/lib/store';
import { useOrg, useOrgPlaybook, usePriors } from '@/lib/hooks';
import { similarDeals } from '@/lib/playbook';
import { ARCHIVES } from '@/data/archive';
import type { PriorAcquisition } from '@/lib/types';

type Answer = { title: string; lines: { text: string; sub?: string; href?: string }[]; note?: string };

/** Deterministic queries over structured memory. */
function answer(q: string, priors: PriorAcquisition[], current: { name: string; id: string; reasons: { deal: PriorAcquisition; reasons: string[] }[] }[]): Answer {
  if (q === 'predictive') {
    const tags = Array.from(new Set(priors.flatMap((p) => p.tags)));
    const rows = tags
      .map((t) => {
        const withTag = priors.filter((p) => p.tags.includes(t));
        const missed = withTag.filter((p) => p.outcomes.some((o) => o.verdict === 'Missed'));
        return { t, n: withTag.length, missed: missed.length, deals: missed.map((p) => p.name) };
      })
      .filter((r) => r.missed > 0)
      .sort((a, b) => b.missed - a.missed || b.n - a.n);
    return {
      title: 'Diligence issues present in deals that later missed plan',
      lines: rows.slice(0, 6).map((r) => ({ text: `${r.t}: ${r.missed} of ${r.n} deal${r.n > 1 ? 's' : ''} with this issue missed at least one outcome`, sub: r.deals.join(', ') })),
      note: `Based on ${priors.length} acquisitions in memory. Small sample: treat as patterns to test, not statistics.`,
    };
  }
  if (q === 'assumptions') {
    const missed = priors.flatMap((p) => p.outcomes.filter((o) => o.verdict === 'Missed').map((o) => ({ p, o })));
    return {
      title: 'Assumptions that turned out wrong',
      lines: missed.map(({ p, o }) => ({ text: `${o.metric}: predicted ${o.predicted}, actual ${o.actual}`, sub: `${p.name} (${p.closed})`, href: `#${p.id}` })),
      note: `${missed.length} of ${priors.reduce((n, p) => n + p.outcomes.length, 0)} tracked predictions missed.`,
    };
  }
  if (q === 'integration') {
    const lessons = priors.flatMap((p) => p.lessons.filter((l) => /Integration|People|Physicians|Regulatory|Legal/.test(l.category)).map((l) => ({ p, l })));
    return {
      title: 'Integration and people problems that repeated',
      lines: lessons.map(({ p, l }) => ({ text: l.text, sub: `${p.name} · ${l.category}${l.inPlaybook ? ' · in playbook' : ''}` })),
    };
  }
  return {
    title: 'Past acquisitions similar to active targets',
    lines: current.flatMap((c) => c.reasons.map((r) => ({ text: `${c.name} resembles ${r.deal.name}`, sub: `On: ${r.reasons.join(', ')}. What happened: ${r.deal.issues[0]}.`, href: `/acquisitions/${c.id}/research` }))),
    note: current.length ? undefined : 'No active target has been analyzed yet.',
  };
}

const QUESTIONS = [
  { key: 'similar', label: 'Show acquisitions similar to our active targets' },
  { key: 'predictive', label: 'Which diligence findings predicted underperformance?' },
  { key: 'assumptions', label: 'Which assumptions have historically been wrong?' },
  { key: 'integration', label: 'What integration risks repeatedly caused problems?' },
];

export default function MemoryPage() {
  const org = useOrg();
  const pb = useOrgPlaybook();
  const priors = usePriors(org.id);
  const acqs = useStore(useShallow((s) => s.acquisitions.filter((a) => a.orgId === org.id && a.status === 'Active' && a.metrics)));
  const adopted = useStore((s) => s.adoptedLessons);
  const adopt = useStore((s) => s.adoptLesson);
  const playbookProposals = useStore(useShallow((s) => s.proposals.filter((p) => p.kind === 'playbook' && acqs.some((a) => a.id === p.acqId))));
  const acceptProposal = useStore((s) => s.acceptProposal);
  const arc = useStore((s) => s.archive[org.id]);
  const importArchive = useStore((s) => s.importArchive);
  const confirm = useStore((s) => s.confirmArchived);
  const [q, setQ] = useState('similar');

  const archive = ARCHIVES[org.id];
  const current = acqs.map((a) => ({ name: a.name, id: a.id, reasons: similarDeals(a, pb, priors) }));
  const ans = answer(q, priors, current);
  const lessons = priors.flatMap((p) => p.lessons.map((l) => ({ ...l, deal: p.name, inPlaybook: l.inPlaybook || adopted.includes(l.id) })));
  const reconstructed = priors.filter((p) => p.origin === 'Reconstructed').length;
  const patterns = current.flatMap((c) => c.reasons.flatMap((r) => r.reasons.map((reason) => ({ reason, prior: r.deal, now: c }))));

  return (
    <Box>
      <TopBar />
      <Box px={{ base: 'md', md: 40 }} py={28} maw={1280} mx="auto">
        <PageHeader
          eyebrow={`${org.name} · organizational memory`}
          title="Acquisition memory"
          description="What you thought, what you found, what you decided, what happened after closing, and what changed in your playbook. Atlas uses this memory, and only this organization’s memory, when it reviews a new deal."
        />

        <Box className="panel" mb={24} style={{ overflow: 'hidden' }}>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing={0}>
            {[
              ['Acquisitions in memory', String(priors.length), `${priors.length - reconstructed} captured live · ${reconstructed} reconstructed`],
              ['Tracked predictions', String(priors.reduce((n, p) => n + p.outcomes.length, 0)), `${priors.reduce((n, p) => n + p.outcomes.filter((o) => o.verdict === 'Missed').length, 0)} missed plan`],
              ['Lessons', String(lessons.length), `${lessons.filter((l) => l.inPlaybook).length} in ${pb.name} ${pb.version}`],
              ['Active targets matched', String(current.filter((c) => c.reasons.length).length), 'to at least one past deal'],
            ].map(([k, v, sub], i) => (
              <Box key={k} px="lg" py="md" style={{ borderLeft: i ? '1px solid var(--app-border-soft)' : undefined }}>
                <Text className="label">{k}</Text>
                <Text fz={26} fw={600} className="num" mt={4}>
                  {v}
                </Text>
                <Text size="xs" c="dimmed">
                  {sub}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb="lg">
          <Section title={<Group gap={6}><IconSparkles size={15} color="#6d3fd4" />Ask your acquisition memory</Group>}>
            <Stack gap="sm">
              <Group gap={6}>
                {QUESTIONS.map((x) => (
                  <UnstyledButton key={x.key} onClick={() => setQ(x.key)} px={10} py={6} style={{ borderRadius: 99, fontSize: 12.5, fontWeight: 500, border: '1px solid var(--app-border)', background: q === x.key ? 'var(--app-brand-soft)' : 'white', color: q === x.key ? '#1f45a5' : undefined }}>
                    {x.label}
                  </UnstyledButton>
                ))}
              </Group>
              <Text fw={600} size="sm" mt={4}>
                {ans.title}
              </Text>
              <Stack gap={6}>
                {ans.lines.length === 0 && (
                  <Text size="sm" c="dimmed">
                    Nothing yet.
                  </Text>
                )}
                {ans.lines.map((l, i) => (
                  <Claim key={i} kind="memory" compact>
                    {l.href ? (
                      <Anchor component={Link} href={l.href} c="dark" size="sm" fw={500}>
                        {l.text}
                      </Anchor>
                    ) : (
                      <Text span size="sm" fw={500}>
                        {l.text}
                      </Text>
                    )}
                    {l.sub && (
                      <Text size="xs" c="dimmed">
                        {l.sub}
                      </Text>
                    )}
                  </Claim>
                ))}
              </Stack>
              {ans.note && (
                <Text size="xs" c="dimmed">
                  {ans.note}
                </Text>
              )}
            </Stack>
          </Section>

          {archive && (
            <Section
              title={<Group gap={6}><IconCloudDownload size={15} />Import past acquisitions</Group>}
              right={
                (!arc || arc.status === 'idle') && (
                  <Button size="compact-sm" onClick={() => importArchive(org.id)}>
                    Connect archive
                  </Button>
                )
              }
            >
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  Most acquirers already have years of deals in folders, IC memos, models and integration reports. Atlas reconstructs each deal into structured memory (thesis, metrics, outcomes, lessons), with confidence and gaps shown. A person confirms each record before it is used.
                </Text>
                <Text size="xs" c="dimmed">
                  Source: {archive.source} · {archive.folders} deal folders · {archive.documents} documents (synthetic)
                </Text>
                {arc && (
                  <Stack gap={6}>
                    {arc.log.map((l, i) => (
                      <Group key={i} gap={8} wrap="nowrap" align="flex-start">
                        {arc.status === 'running' && i === arc.log.length - 1 ? <Loader size={12} color="violet" mt={3} /> : <IconCheck size={13} color="#12a383" style={{ marginTop: 3, flexShrink: 0 }} />}
                        <Text size="sm">{l}</Text>
                      </Group>
                    ))}
                  </Stack>
                )}
                {arc && arc.pending.length > 0 && arc.status === 'review' && (
                  <Stack gap={8}>
                    {archive.deals
                      .filter((d) => arc.pending.includes(d.record.id))
                      .map((d) => (
                        <Box key={d.record.id} p="sm" style={{ border: '1px solid #ece4fb', background: '#f7f3ff', borderRadius: 8 }}>
                          <Group justify="space-between" wrap="nowrap" align="flex-start">
                            <Box>
                              <Group gap={6}>
                                <Text size="sm" fw={600}>
                                  {d.record.name} · {d.record.closed}
                                </Text>
                                <Pill color={d.record.confidence === 'High' ? 'teal' : d.record.confidence === 'Medium' ? 'yellow' : 'red'}>{d.record.confidence} confidence</Pill>
                              </Group>
                              <Text size="xs" c="dimmed">
                                From: {d.fromDocs.join(', ')}
                              </Text>
                              {d.missing.length > 0 && (
                                <Text size="xs" c="orange.8">
                                  Missing: {d.missing.join('; ')}
                                </Text>
                              )}
                              <Text size="sm" mt={4}>
                                {d.record.issues[0]}.
                              </Text>
                            </Box>
                            <Group gap={4} wrap="nowrap">
                              <Button size="compact-sm" variant="subtle" color="gray" onClick={() => confirm(d.record.id, false)} aria-label="Reject">
                                <IconX size={14} />
                              </Button>
                              <Button size="compact-sm" leftSection={<IconCheck size={13} />} onClick={() => confirm(d.record.id, true)}>
                                Confirm
                              </Button>
                            </Group>
                          </Group>
                        </Box>
                      ))}
                  </Stack>
                )}
                {arc && arc.status === 'review' && arc.pending.length === 0 && (
                  <Text size="sm" c="teal.8">
                    {arc.confirmed.length} reconstructed acquisitions added to memory. Benchmarks and similar-deal matching now include them.
                  </Text>
                )}
              </Stack>
            </Section>
          )}
        </SimpleGrid>

        <Stack gap="lg">
          <Section title="Patterns recurring in the current pipeline" pad={false}>
            {patterns.length === 0 ? (
              <Text p="md" size="sm" c="dimmed">
                No active target has been matched yet. Patterns appear once Atlas has analyzed a target.
              </Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Pattern</Table.Th>
                    <Table.Th>Seen before</Table.Th>
                    <Table.Th>What happened</Table.Th>
                    <Table.Th>Seen now</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {patterns.map((p, i) => (
                    <Table.Tr key={i}>
                      <Table.Td fw={500}>{p.reason}</Table.Td>
                      <Table.Td>{p.prior.name}</Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {p.prior.issues[0]}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Anchor component={Link} href={`/acquisitions/${p.now.id}/research`} size="sm">
                          {p.now.name}
                        </Anchor>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Section>

          <Section
            title="Lessons → playbook"
            right={
              <Anchor component={Link} href="/playbooks" size="xs">
                Open {pb.name} {pb.version} <IconArrowRight size={11} />
              </Anchor>
            }
          >
            <Stack gap={8}>
              {playbookProposals.map((p) => (
                <Box key={p.id} p="sm" style={{ background: '#f7f3ff', borderRadius: 8, border: '1px solid #ece4fb' }}>
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Box>
                      <Text fz={10.5} fw={600} tt="uppercase" c="violet.8" style={{ letterSpacing: '0.06em' }}>
                        Proposed by Atlas from a cross-deal pattern
                      </Text>
                      <Text size="sm" fw={600}>
                        {p.title.replace('Propose playbook change: ', '')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {p.summary}
                      </Text>
                    </Box>
                    {p.status === 'Pending' ? (
                      <Button size="compact-xs" color="violet" onClick={() => acceptProposal(p.id)} style={{ flexShrink: 0 }}>
                        Adopt
                      </Button>
                    ) : (
                      <Badge color={p.status === 'Accepted' ? 'teal' : 'gray'} style={{ flexShrink: 0 }}>
                        {p.status === 'Accepted' ? 'In playbook' : 'Dismissed'}
                      </Badge>
                    )}
                  </Group>
                </Box>
              ))}
              {lessons.map((l) => (
                <Group key={l.id} justify="space-between" wrap="nowrap" align="flex-start">
                  <Box>
                    <Text size="sm">{l.text}</Text>
                    <Text size="xs" c="dimmed">
                      {l.category} · from {l.deal}
                    </Text>
                  </Box>
                  {l.inPlaybook ? (
                    <Badge color="teal" leftSection={<IconCheck size={10} />} style={{ flexShrink: 0, cursor: adopted.includes(l.id) ? 'pointer' : undefined }} onClick={() => adopted.includes(l.id) && adopt(l.id)}>
                      In playbook
                    </Badge>
                  ) : (
                    <Button size="compact-xs" variant="default" onClick={() => adopt(l.id)} style={{ flexShrink: 0 }}>
                      Adopt
                    </Button>
                  )}
                </Group>
              ))}
            </Stack>
          </Section>

          <Text className="label" mt="sm">
            Completed acquisitions: predicted vs. actual
          </Text>
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            {priors
              .slice()
              .sort((a, b) => b.closed.localeCompare(a.closed))
              .map((p) => (
                <Box key={p.id} id={p.id} className="panel" style={{ scrollMarginTop: 16, overflow: 'hidden' }}>
                  <Group justify="space-between" px="md" py={10} style={{ borderBottom: '1px solid var(--app-border)' }} wrap="nowrap">
                    <Box style={{ minWidth: 0 }}>
                      <Text fw={600}>{p.name}</Text>
                      <Text size="xs" c="dimmed">
                        {p.industry} · {p.location} · closed {p.closed} · {fmtM(p.ev)} EV
                      </Text>
                    </Box>
                    {p.origin === 'Reconstructed' ? <Pill color="violet">Reconstructed · {p.confidence}</Pill> : <Pill color="gray">Captured</Pill>}
                  </Group>
                  <Box p="md">
                    <Text size="sm" c="dimmed" mb="sm">
                      Thesis: {p.thesis}
                    </Text>
                    <Box style={{ overflowX: 'auto' }}>
                      <Table fz="sm" mb="sm">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Metric</Table.Th>
                            <Table.Th>Predicted</Table.Th>
                            <Table.Th>Actual</Table.Th>
                            <Table.Th />
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody className="num">
                          {p.outcomes.map((o) => (
                            <Table.Tr key={o.metric}>
                              <Table.Td>{o.metric}</Table.Td>
                              <Table.Td>{o.predicted}</Table.Td>
                              <Table.Td fw={500}>{o.actual}</Table.Td>
                              <Table.Td>
                                <Badge size="xs" color={o.verdict === 'Missed' ? 'red' : o.verdict === 'Exceeded' ? 'teal' : 'gray'}>
                                  {o.verdict}
                                </Badge>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Box>
                    <Stack gap={6}>
                      {p.issues.map((i) => (
                        <Claim key={i} kind="fact" compact>
                          {i}
                        </Claim>
                      ))}
                      {p.lessons.map((l) => (
                        <Claim key={l.id} kind="memory" compact>
                          Lesson: {l.text}
                        </Claim>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              ))}
          </SimpleGrid>
        </Stack>
      </Box>
    </Box>
  );
}
