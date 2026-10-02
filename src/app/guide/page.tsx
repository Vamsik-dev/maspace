'use client';

import { Anchor, Box, Button, Group, SimpleGrid, Stack, Table, Text, Timeline } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { TopBar } from '@/components/Chrome';
import { PageHeader, Section } from '@/components/ui';
import { useUi } from '@/lib/ui-store';

const A = '/acquisitions/acq-abc';

const TOUR: { title: string; href: string; look: string }[] = [
  { title: 'Start a new acquisition with six fields', href: '/new', look: 'Use the sample target and attach its data room. Watch Atlas read 10 documents and propose findings, requests and a playbook score. You typed six fields.' },
  { title: 'Review what Atlas found', href: '/new', look: 'In the new deal, open Atlas review. Accept a finding and see the risk, decision and actions Atlas drafted for it. Accept, edit or dismiss each one.' },
  { title: 'Check target intelligence', href: `${A}/research`, look: 'Playbook fit, benchmarks against your five past deals, seller claims checked against the data, and external research kept separate.' },
  { title: 'Open ABC Mechanical, a deal six weeks in', href: A, look: 'The Atlas briefing: what changed, what Atlas found, playbook and prior-deal signals, decisions needed, and meeting prep.' },
  { title: 'Follow one finding to a decision', href: `${A}/findings/f-conc`, look: 'Fact vs. interpretation vs. recommendation, with "Why?" sources. Then the price decision: switch to Dan Whitaker (CEO) to approve it.' },
  { title: 'Ask for an outcome, not a summary', href: `${A}/atlas`, look: '"Prepare me for the management meeting" or "Research this target". Does it read like a capable associate?' },
  { title: 'See the learning loop', href: '/memory', look: 'Past outcomes become lessons; Atlas proposes playbook changes from patterns across deals; the next deal is scored against them.' },
];

const BOUNDARY: [string, boolean, string][] = [
  ['Read documents, extract facts, calculate metrics', true, ''],
  ['Identify anomalies and contradictions', true, ''],
  ['Compare against the thesis, playbook and prior deals', true, ''],
  ['Research the target', true, 'Review'],
  ['Propose findings, risks, questions and requests', true, 'Accept / edit / dismiss'],
  ['Draft IC memo and deal updates', true, 'Edit / approve'],
  ['Recommend actions', true, 'Decide'],
  ['Make the transaction decision', false, 'Own'],
  ['Approve valuation and risk acceptance', false, 'Own'],
  ['Record outcomes and learn from them', true, 'Validate'],
];

const STORY: { when: string; what: string; href: string }[] = [
  { when: 'Jun 3', what: 'Target created; Atlas drafts the target brief from the CIM', href: `${A}/deliverables/dl-brief` },
  { when: 'Jun 12', what: 'Screened against Playbook v4; thesis approved', href: `${A}/phase/strategy` },
  { when: 'Jul 24', what: 'IOI submitted at $21–23M', href: `${A}/phase/valuation` },
  { when: 'Aug 28', what: 'LOI signed at $22.0M; automation creates 9 workstreams and the request list', href: `${A}/phase/loi` },
  { when: 'Sep 5–19', what: 'Atlas flags concentration, founder dependency and change-of-control clauses from documents', href: `${A}/findings` },
  { when: 'Sep 25', what: 'QoE finds a $420K EBITDA adjustment', href: `${A}/findings/f-qoe` },
  { when: 'Sep 28', what: 'Revised price proposed; CFO and QoE concur; CEO approval pending', href: `${A}/decisions/dec-price` },
  { when: 'Oct 5', what: 'Management meeting #2 (brief ready)', href: `${A}/deliverables/dl-mgmt` },
  { when: 'Oct 14', what: 'Investment Committee (IC memo in draft)', href: `${A}/deliverables/dl-ic` },
  { when: 'Nov 20', what: 'Target close (closing checklist)', href: `${A}/phase/closing` },
  { when: 'Nov 23', what: 'Day 1 (integration plan in draft)', href: `${A}/deliverables/dl-day1` },
  { when: 'Post-close', what: 'Outcomes vs. thesis feed acquisition memory', href: '/memory' },
];

export default function GuidePage() {
  const setFb = useUi((s) => s.setFeedbackOpen);
  return (
    <Box>
      <TopBar />
      <Box px={{ base: 'md', md: 40 }} py={28} maw={1180} mx="auto">
        <PageHeader
          eyebrow="For reviewers"
          title="The system that helps an acquisition team understand the deal, decide what matters, and get smarter with every acquisition"
          description="People provide context, documents and decisions. Atlas does the reading, connecting, researching and drafting. People validate and decide. This is a front-end prototype with synthetic data; we want to know which parts would change how your team runs a deal."
          right={
            <Group gap="xs">
              <Button component={Link} href={A} variant="default" size="sm">
                Open ABC Mechanical
              </Button>
              <Button component={Link} href="/new" rightSection={<IconArrowRight size={14} />} size="sm">
                Start a new acquisition
              </Button>
            </Group>
          }
        />
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Stack gap="lg">
            <Section title="A 15-minute tour">
              <Stack gap={10}>
                {TOUR.map((t, i) => (
                  <Group key={t.title} align="flex-start" wrap="nowrap" gap="sm">
                    <Text fw={600} c="dimmed" size="sm" w={16}>
                      {i + 1}
                    </Text>
                    <Box>
                      <Anchor component={Link} href={t.href} size="sm" fw={600}>
                        {t.title}
                      </Anchor>
                      <Text size="sm" c="dimmed">
                        {t.look}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Section>
            <Section title="The one question we most want answered">
              <Text fz={17} fw={600} lh={1.4} style={{ letterSpacing: '-0.01em' }}>
                “If the system could do all of this automatically from the documents and information your team already produces, which parts would actually change how you run an acquisition?”
              </Text>
              <Stack gap={4} mt="md">
                {[
                  'Are Finding → Risk → Decision → Action the right objects? What would you call them?',
                  'Which AI proposals would you trust enough to accept without re-checking the source?',
                  'Who on your team would review the Atlas queue, and how often?',
                  'What would this be worth to your team, and who would pay for it?',
                ].map((q) => (
                  <Text key={q} size="sm" c="dimmed">
                    • {q}
                  </Text>
                ))}
              </Stack>
              <Group mt="md">
                <Button variant="light" onClick={() => setFb(true)}>
                  Leave feedback
                </Button>
              </Group>
            </Section>
            <Section title="Who does what">
              <Table fz="sm" verticalSpacing={6}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Activity</Table.Th>
                    <Table.Th ta="center">Atlas</Table.Th>
                    <Table.Th>Human</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {BOUNDARY.map(([a, ai, human]) => (
                    <Table.Tr key={a}>
                      <Table.Td>{a}</Table.Td>
                      <Table.Td ta="center">{ai ? '✓' : ''}</Table.Td>
                      <Table.Td c={human === 'Own' ? 'ink.8' : 'dimmed'} fw={human === 'Own' ? 600 : 400}>
                        {human}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Text size="xs" c="dimmed" mt={6}>
                Atlas proposes. People own judgment.
              </Text>
            </Section>
          </Stack>
          <Stack gap="lg">
            <Section title="The ABC Mechanical story">
              <Timeline active={7} bulletSize={12} lineWidth={2} color="ink">
                {STORY.map((s) => (
                  <Timeline.Item key={s.when} title={<Text size="xs" c="dimmed" fw={600}>{s.when}</Text>}>
                    <Anchor component={Link} href={s.href} size="sm" c="dark">
                      {s.what}
                    </Anchor>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Section>
            <Section title="What is real and what is simulated" pad={false}>
              <Table>
                <Table.Tbody>
                  {[
                    ['Navigation, screens, forms, state changes', 'Real (in your browser)'],
                    ['Workflow rules (e.g. approval → follow-up actions)', 'Real, rule-based'],
                    ['Deliverable generation from deal data', 'Real, deterministic templates'],
                    ['Rich-text editing of deliverables', 'Real (BlockNote)'],
                    ['Atlas answers', 'Simulated from structured demo data'],
                    ['Document text extraction', 'Simulated; excerpts are pre-written'],
                    ['Uploading your own file', 'Simulated; contents are not read'],
                    ['Login, permissions, multi-user sync', 'Not built — use the user switcher'],
                    ['All companies, people and numbers', 'Synthetic'],
                  ].map(([a, b]) => (
                    <Table.Tr key={a}>
                      <Table.Td>{a}</Table.Td>
                      <Table.Td c="dimmed">{b}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Text size="xs" c="dimmed" p="sm">
                Changes are saved in this browser. Use the reset button in the top bar to restore the starting state.
              </Text>
            </Section>
          </Stack>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
