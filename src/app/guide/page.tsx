'use client';

import { Anchor, Box, Button, Group, SimpleGrid, Stack, Table, Text, Timeline } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { TopBar } from '@/components/Chrome';
import { PageHeader, Section } from '@/components/ui';
import { useUi } from '@/lib/ui-store';

const A = '/acquisitions/acq-abc';

const TOUR: { title: string; href: string; look: string }[] = [
  { title: 'Open ABC Mechanical', href: A, look: 'Can you tell in 30 seconds where the deal is, what needs attention and who owns what?' },
  { title: 'Open the customer concentration finding', href: `${A}/findings/f-conc`, look: 'Fact vs. interpretation vs. recommendation. Click "Why?" and follow a source to the page.' },
  { title: 'Review the purchase price decision', href: `${A}/decisions/dec-price`, look: 'Options, evidence, reviews. Switch to Dan Whitaker (CEO) to approve, and watch follow-up actions appear.' },
  { title: 'Ask Atlas to prepare you for the management meeting', href: `${A}/atlas`, look: 'Does it read like a capable associate, or a chatbot?' },
  { title: 'Open the IC memo draft', href: `${A}/deliverables/dl-ic`, look: 'Generated from deal data, editable, with sources. Is the structure what your IC expects?' },
  { title: 'Upload the Fleet Schedule', href: `${A}/documents`, look: 'Atlas proposes a finding; a human accepts or dismisses it.' },
  { title: 'Look at Memory & Playbook', href: '/memory', look: 'Would cross-deal lessons change how you run deal #6?' },
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
          title="Prototype guide"
          description="A front-end prototype of an acquisition workspace for lean serial acquirers. We want to know whether the workflow, terminology, objects and AI interactions match how your team actually runs deals — before we build the backend."
          right={
            <Button component={Link} href={A} rightSection={<IconArrowRight size={14} />} size="sm">
              Start with ABC Mechanical
            </Button>
          }
        />
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Stack gap="lg">
            <Section title="A 10-minute tour">
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
            <Section title="What we most want your view on">
              <Stack gap={6}>
                {[
                  'Are the 8 phases and 9 workstreams how you think about a deal?',
                  'Are Finding → Risk → Decision → Action the right objects? What would you call them?',
                  'Who on your team would use this daily, weekly, or only at IC?',
                  'Is the collaboration model (owner / reviewer / approver, advisors scoped to workstreams) realistic?',
                  'Does Atlas feel useful or gimmicky? Would you trust it more because it shows evidence?',
                  'What is missing that would stop you using it on your next deal?',
                  'What would this be worth to your team, and who would pay for it?',
                ].map((q) => (
                  <Text key={q} size="sm">
                    • {q}
                  </Text>
                ))}
                <Group mt="sm">
                  <Button variant="light" onClick={() => setFb(true)}>
                    Leave feedback
                  </Button>
                </Group>
              </Stack>
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
