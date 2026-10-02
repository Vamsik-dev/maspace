'use client';

import { Anchor, Badge, Box, Button, Group, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { TopBar } from '@/components/Chrome';
import { PageHeader, Section, Claim } from '@/components/ui';
import { PRIOR } from '@/data/portfolio';
import { fmtM } from '@/lib/meta';
import { useStore } from '@/lib/store';

const PATTERNS = [
  { pattern: 'Customer concentration above threshold', prior: ['Red River Mechanical'], current: 'ABC Mechanical (38.4%)', href: '/acquisitions/acq-abc/findings/f-conc', impact: 'Red River: largest customer lost in month 9; Year-1 revenue −18% vs plan' },
  { pattern: 'Founder is license holder of record', prior: ['Bluebonnet Plumbing'], current: 'ABC Mechanical (2 of 3 branches)', href: '/acquisitions/acq-abc/findings/f-owner', impact: 'Bluebonnet: commercial bidding paused 4 months' },
  { pattern: 'Warranty / callback costs presented as non-recurring', prior: ['Gulf Coast Fire Protection'], current: 'ABC Mechanical ($140K)', href: '/acquisitions/acq-abc/findings/f-qoe', impact: 'Gulf Coast: Year-1 EBITDA 11% below plan' },
  { pattern: 'Technician attrition after close', prior: ['Pinecrest Air'], current: 'ABC Mechanical (28% turnover)', href: '/acquisitions/acq-abc/findings/f-turnover', impact: 'Pinecrest: retention 81% vs 85% plan' },
  { pattern: 'Systems migration during peak season', prior: ['Summit Electrical Services'], current: 'ABC Mechanical (open decision)', href: '/acquisitions/acq-abc/decisions/dec-fsm', impact: 'Summit: $1.1M collections delayed' },
];

export default function MemoryPage() {
  const adopted = useStore((s) => s.adoptedLessons);
  const adopt = useStore((s) => s.adoptLesson);
  const lessons = PRIOR.flatMap((p) => p.lessons.map((l) => ({ ...l, deal: p.name, inPlaybook: l.inPlaybook || adopted.includes(l.id) })));
  return (
    <Box>
      <TopBar />
      <Box px={{ base: 'md', md: 40 }} py={28} maw={1280} mx="auto">
        <PageHeader
          eyebrow="Cross-acquisition intelligence"
          title="Acquisition memory & playbook"
          description="What Meridian predicted, what actually happened, and what changed in the playbook as a result. Atlas uses this memory when it reviews a new deal."
        />
        <Stack gap="lg">
          <Section title="Patterns recurring in the current pipeline" pad={false}>
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
                {PATTERNS.map((p) => (
                  <Table.Tr key={p.pattern}>
                    <Table.Td fw={500}>{p.pattern}</Table.Td>
                    <Table.Td>{p.prior.join(', ')}</Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {p.impact}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Anchor component={Link} href={p.href} size="sm">
                        {p.current}
                      </Anchor>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Section>

          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <Section title="Playbook v4 — screening thresholds">
              <Stack gap={6}>
                {[
                  ['Top-5 customer concentration', '< 25% of revenue'],
                  ['Recurring service revenue', '≥ 25% of revenue'],
                  ['Owner transition', 'Achievable within 12 months'],
                  ['Technician retention', '≥ 80%'],
                  ['Valuation guardrail ($15–25M revenue)', '5.5x–6.5x QoE-adjusted EBITDA'],
                ].map(([k, v]) => (
                  <Group key={k} justify="space-between">
                    <Text size="sm">{k}</Text>
                    <Text size="sm" fw={500} className="num">
                      {v}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Section>
            <Section title="Lessons → playbook">
              <Stack gap={8}>
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
          </SimpleGrid>

          <Text className="label" mt="sm">
            Completed acquisitions — predicted vs. actual
          </Text>
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            {PRIOR.slice()
              .reverse()
              .map((p) => (
                <Box key={p.id} id={p.id} className="panel" style={{ scrollMarginTop: 16, overflow: 'hidden' }}>
                  <Group justify="space-between" px="md" py={10} style={{ borderBottom: '1px solid var(--app-border)' }}>
                    <Box>
                      <Text fw={600}>{p.name}</Text>
                      <Text size="xs" c="dimmed">
                        {p.industry} · {p.location} · closed {p.closed} · {fmtM(p.ev)} EV
                      </Text>
                    </Box>
                    <Group gap={4}>
                      {p.tags.map((t) => (
                        <Badge key={t} variant="default" size="xs">
                          {t}
                        </Badge>
                      ))}
                    </Group>
                  </Group>
                  <Box p="md">
                    <Text size="sm" c="dimmed" mb="sm">
                      Thesis: {p.thesis}
                    </Text>
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
