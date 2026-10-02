'use client';

import { Box, Group, SimpleGrid, Stack, Text, Badge, Progress, Table, Anchor, Button } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { TopBar } from '@/components/Chrome';
import { PageHeader, Section, PersonAvatar, SyntheticBadge } from '@/components/ui';
import { useStore } from '@/lib/store';
import { PHASES, DEMO_TODAY, fmtM, phaseLabel } from '@/lib/meta';
import { PRIOR } from '@/data/portfolio';
import { ACQUIRER } from '@/data/people';
import { fmtDate } from '@/lib/atlas';
import { NewAcquisitionButton } from '@/components/NewAcquisition';

function PhaseStrip({ phases }: { phases: Record<string, { status: string; progress: number }> }) {
  return (
    <Group gap={3} wrap="nowrap">
      {PHASES.map((p) => {
        const s = phases[p.key];
        return (
          <Box key={p.key} title={`${p.short}: ${s.status}${s.status === 'active' ? ` ${s.progress}%` : ''}`} style={{ flex: 1, height: 5, borderRadius: 2, background: '#e7e5e4', overflow: 'hidden' }}>
            <Box h="100%" w={`${s.status === 'complete' ? 100 : s.status === 'active' ? Math.max(s.progress, 8) : 0}%`} bg={s.status === 'complete' ? '#134a38' : '#4fa182'} />
          </Box>
        );
      })}
    </Group>
  );
}

export default function PortfolioPage() {
  const acqs = useStore((s) => s.acquisitions);
  const findings = useStore((s) => s.findings);
  const decisions = useStore((s) => s.decisions);
  const work = useStore((s) => s.work);
  const milestones = useStore((s) => s.milestones);
  const active = acqs.filter((a) => a.status === 'Active');
  const adopted = useStore((s) => s.adoptedLessons);
  const allLessons = PRIOR.flatMap((p) => p.lessons);
  const inPlaybook = allLessons.filter((l) => l.inPlaybook || adopted.includes(l.id)).length;

  return (
    <Box>
      <TopBar />
      <Box px={{ base: 'md', md: 40 }} py={28} maw={1280} mx="auto">
        <PageHeader
          eyebrow={ACQUIRER.name}
          title="Acquisition portfolio"
          description={`${active.length} active acquisitions · ${PRIOR.length} completed. ${ACQUIRER.strategy}`}
          right={<NewAcquisitionButton />}
        />

        <Text className="label" mb={8}>
          Active
        </Text>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb={32}>
          {active.map((a) => {
            const f = findings.filter((x) => x.acqId === a.id);
            const crit = f.filter((x) => (x.severity === 'Critical' || x.severity === 'High') && ['Open', 'Under Review', 'Proposed'].includes(x.status)).length;
            const dec = decisions.filter((x) => x.acqId === a.id && (x.status === 'Open' || x.status === 'Under Review')).length;
            const att = work.filter((x) => x.acqId === a.id && x.status !== 'Complete' && ((x.due && x.due < DEMO_TODAY) || x.status === 'Blocked')).length;
            const next = milestones.filter((m) => m.acqId === a.id && m.date >= DEMO_TODAY).sort((x, y) => x.date.localeCompare(y.date))[0];
            return (
              <Box key={a.id} component={Link} href={`/acquisitions/${a.id}`} p="md" style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8, display: 'block' }} className="row-link">
                <Group justify="space-between" align="flex-start" mb={4}>
                  <Box>
                    <Text fw={600} size="md">
                      {a.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {a.target.industry} · {a.target.hq}
                    </Text>
                  </Box>
                  <PersonAvatar id={a.dealLeadId} />
                </Group>
                <Group gap={16} my={12}>
                  <Box>
                    <Text className="label">Revenue</Text>
                    <Text fw={600} className="num">
                      {fmtM(a.target.revenue)}
                    </Text>
                  </Box>
                  <Box>
                    <Text className="label">EBITDA</Text>
                    <Text fw={600} className="num">
                      {fmtM(a.target.ebitda)}
                    </Text>
                  </Box>
                  <Box>
                    <Text className="label">EV</Text>
                    <Text fw={600} className="num">
                      {fmtM(a.ev)}
                    </Text>
                  </Box>
                </Group>
                <Text size="xs" fw={500} mb={6}>
                  {phaseLabel(a.currentPhase)}
                  {a.phases[a.currentPhase].status === 'active' && (
                    <Text span c="dimmed" size="xs">
                      {' '}
                      · {a.phases[a.currentPhase].progress}%
                    </Text>
                  )}
                </Text>
                <PhaseStrip phases={a.phases} />
                <Group gap={6} mt={14}>
                  {dec > 0 && <Badge color="blue">{dec} decisions</Badge>}
                  {crit > 0 && <Badge color="orange">{crit} high findings</Badge>}
                  {att > 0 && <Badge color="red">{att} need attention</Badge>}
                  {!dec && !crit && !att && <Badge color="gray">On track</Badge>}
                </Group>
                {next && (
                  <Text size="xs" c="dimmed" mt={10}>
                    Next: {next.title} · {fmtDate(next.date)}
                  </Text>
                )}
              </Box>
            );
          })}
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Section
            title="Completed acquisitions"
            right={
              <Anchor component={Link} href="/memory" size="xs">
                Outcomes & lessons <IconArrowRight size={11} />
              </Anchor>
            }
            pad={false}
          >
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Acquisition</Table.Th>
                  <Table.Th>Closed</Table.Th>
                  <Table.Th ta="right">EV</Table.Th>
                  <Table.Th>Thesis outcome</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {PRIOR.slice()
                  .reverse()
                  .map((p) => {
                    const met = p.outcomes.filter((o) => o.verdict !== 'Missed').length;
                    return (
                      <Table.Tr key={p.id}>
                        <Table.Td>
                          <Anchor component={Link} href={`/memory#${p.id}`} size="sm" c="dark" fw={500}>
                            {p.name}
                          </Anchor>
                          <Text size="xs" c="dimmed">
                            {p.industry} · {p.location}
                          </Text>
                        </Table.Td>
                        <Table.Td className="num">{p.closed}</Table.Td>
                        <Table.Td ta="right" className="num">
                          {fmtM(p.ev)}
                        </Table.Td>
                        <Table.Td>
                          <Group gap={6} wrap="nowrap">
                            <Progress value={(met / p.outcomes.length) * 100} w={60} size={5} color={met / p.outcomes.length >= 0.5 ? 'ink' : 'orange'} />
                            <Text size="xs" c="dimmed">
                              {met}/{p.outcomes.length} met
                            </Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
              </Table.Tbody>
            </Table>
          </Section>
          <Section title="Across the portfolio">
            <Stack gap="sm">
              <Text size="sm">
                <b>Recurring pattern:</b> customer concentration or founder licensing issues appeared in 2 of 5 completed deals and in the current ABC Mechanical diligence.
              </Text>
              <Text size="sm">
                <b>Playbook:</b> {inPlaybook} of {allLessons.length} lessons from completed deals are in Playbook v4; {allLessons.length - inPlaybook} awaiting adoption.
              </Text>
              <Group>
                <Button component={Link} href="/memory" variant="light" rightSection={<IconArrowRight size={13} />}>
                  Open acquisition memory
                </Button>
              </Group>
              <Group gap={6} mt="sm">
                <SyntheticBadge />
                <Text size="xs" c="dimmed">
                  Meridian Field Services and all deals are fictional.
                </Text>
              </Group>
            </Stack>
          </Section>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
