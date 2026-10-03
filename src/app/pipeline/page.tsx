'use client';

import { Anchor, Badge, Box, Button, Group, Menu, ScrollArea, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowRight, IconDots, IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { TopBar } from '@/components/Chrome';
import { PageHeader, Pill, PersonAvatar } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useOrg, useOrgPlaybook } from '@/lib/hooks';
import { evaluate } from '@/lib/playbook';
import type { PipelineStage, PipelineTarget } from '@/lib/types';
import { fmtM } from '@/lib/meta';

const STAGES: { stage: PipelineStage; hint: string }[] = [
  { stage: 'Long list', hint: 'Identified; not yet screened' },
  { stage: 'Short list', hint: 'Fits the strategy; outreach' },
  { stage: 'NDA signed', hint: 'Awaiting teaser / CIM' },
  { stage: 'CIM received', hint: 'Ready to evaluate' },
];
const NEXT: Record<PipelineStage, PipelineStage | null> = { 'Long list': 'Short list', 'Short list': 'NDA signed', 'NDA signed': 'CIM received', 'CIM received': null, Passed: null };

function TargetCard({ t }: { t: PipelineTarget }) {
  const pb = useOrgPlaybook();
  const move = useStore((s) => s.movePipeline);
  const router = useRouter();
  const known = pb.criteria.map((c) => ({ c, r: evaluate(c, t.teaser[c.key]) })).filter((x) => x.r);
  const fails = known.filter((x) => x.r === 'Fail');
  const next = NEXT[t.stage];
  return (
    <Box className="panel" p="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={4}>
        <Box style={{ minWidth: 0 }}>
          <Text size="sm" fw={600} lh={1.3}>
            {t.name}
          </Text>
          <Text size="xs" c="dimmed">
            {t.industry} · {t.hq}
          </Text>
        </Box>
        <Menu position="bottom-end">
          <Menu.Target>
            <Button size="compact-xs" variant="subtle" color="gray" aria-label="Target actions">
              <IconDots size={14} />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {(['Long list', 'Short list', 'NDA signed', 'CIM received'] as PipelineStage[])
              .filter((s) => s !== t.stage)
              .map((s) => (
                <Menu.Item key={s} onClick={() => move(t.id, s)}>
                  Move to {s}
                </Menu.Item>
              ))}
            <Menu.Divider />
            <Menu.Item color="red" onClick={() => move(t.id, 'Passed', 'Did not meet strategy (recorded by user)')}>
              Pass on this target
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Group gap={10} my={6}>
        {t.revenue !== undefined && (
          <Text size="xs" className="num">
            <b>{fmtM(t.revenue)}</b> rev
          </Text>
        )}
        {t.ebitda !== undefined && (
          <Text size="xs" className="num">
            <b>{fmtM(t.ebitda)}</b> EBITDA
          </Text>
        )}
        <Text size="xs" c="dimmed">
          {t.source}
        </Text>
      </Group>
      <Tooltip
        multiline
        w={260}
        label={known.length ? known.map((x) => `${x.c.label}: ${x.r}`).join(' · ') : 'Not enough teaser data to pre-screen.'}
      >
        <Group gap={4} mb={6}>
          <Text fz={10.5} c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            Pre-screen
          </Text>
          <Pill color={fails.length ? 'red' : known.length ? 'teal' : 'gray'}>
            {known.length ? `${known.length - fails.length} pass · ${fails.length} fail` : 'No data'}
          </Pill>
          <Text fz={10.5} c="dimmed">
            of {pb.criteria.length}
          </Text>
        </Group>
      </Tooltip>
      {t.note && (
        <Text size="xs" c="dimmed" mb={6}>
          {t.note}
        </Text>
      )}
      <Group justify="space-between" wrap="nowrap" mt={4}>
        <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
          <PersonAvatar id={t.ownerId} size={18} />
          <Text size="xs" truncate>
            Next: {t.nextStep}
          </Text>
        </Group>
        {t.acquisitionId ? (
          <Button size="compact-xs" variant="light" style={{ flexShrink: 0 }} component={Link} href={`/acquisitions/${t.acquisitionId}`} rightSection={<IconExternalLink size={11} />}>
            Open
          </Button>
        ) : t.stage === 'CIM received' ? (
          <Button size="compact-xs" style={{ flexShrink: 0 }} onClick={() => router.push(`/new?from=${t.id}`)} rightSection={<IconArrowRight size={11} />}>
            Evaluate
          </Button>
        ) : next ? (
          <Tooltip label={`Move to ${next}`}>
            <Button size="compact-xs" variant="default" style={{ flexShrink: 0 }} onClick={() => move(t.id, next)}>
              Advance
            </Button>
          </Tooltip>
        ) : null}
      </Group>
    </Box>
  );
}

export default function PipelinePage() {
  const org = useOrg();
  const pb = useOrgPlaybook();
  const targets = useStore(useShallow((s) => s.pipeline.filter((t) => t.orgId === org.id)));
  const active = useStore(useShallow((s) => s.acquisitions.filter((a) => a.orgId === org.id && a.status === 'Active')));
  const passed = targets.filter((t) => t.stage === 'Passed');
  return (
    <Box>
      <TopBar />
      <Box px={{ base: 'md', md: 40 }} py={28} maw={1440} mx="auto">
        <PageHeader
          eyebrow="Phase 1 · Strategy & Target Screening"
          title="Target pipeline"
          description={`Long list to short list, NDA and CIM, before a target becomes an acquisition. Each card is pre-screened against ${pb.name} ${pb.version} using whatever the teaser discloses. This is your own buy-side list, not a marketplace.`}
        />
        <ScrollArea type="auto" offsetScrollbars>
          <Group align="flex-start" gap="md" wrap="nowrap" mb="lg">
            {STAGES.map(({ stage, hint }) => {
              const col = targets.filter((t) => t.stage === stage);
              return (
                <Box key={stage} w={290} style={{ flexShrink: 0 }}>
                  <Group justify="space-between" mb={8} px={2}>
                    <Box>
                      <Text size="sm" fw={600}>
                        {stage}
                      </Text>
                      <Text fz={11} c="dimmed">
                        {hint}
                      </Text>
                    </Box>
                    <Badge variant="default" radius="xl">
                      {col.length}
                    </Badge>
                  </Group>
                  <Stack gap="sm" p={8} style={{ background: '#e9edf4', borderRadius: 10, minHeight: 120 }}>
                    {col.map((t) => (
                      <TargetCard key={t.id} t={t} />
                    ))}
                    {col.length === 0 && (
                      <Text size="xs" c="dimmed" ta="center" py="md">
                        None
                      </Text>
                    )}
                  </Stack>
                </Box>
              );
            })}
            <Box w={290} style={{ flexShrink: 0 }}>
              <Group justify="space-between" mb={8} px={2}>
                <Box>
                  <Text size="sm" fw={600}>
                    Active acquisitions
                  </Text>
                  <Text fz={11} c="dimmed">
                    IOI, LOI, diligence and beyond
                  </Text>
                </Box>
                <Badge variant="default" radius="xl">
                  {active.length}
                </Badge>
              </Group>
              <Stack gap="sm" p={8} style={{ background: '#e9edf4', borderRadius: 10, minHeight: 120 }}>
                {active.map((a) => (
                  <Box key={a.id} component={Link} href={`/acquisitions/${a.id}`} className="panel card-link" p="sm" style={{ display: 'block' }}>
                    <Text size="sm" fw={600}>
                      {a.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {a.stageLabel}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Group>
        </ScrollArea>
        {passed.length > 0 && (
          <Box className="panel" p="md">
            <Text size="sm" fw={600} mb={6}>
              Passed ({passed.length})
            </Text>
            <Stack gap={6}>
              {passed.map((t) => (
                <Group key={t.id} gap={8} wrap="nowrap">
                  <Text size="sm" fw={500}>
                    {t.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t.passReason}
                  </Text>
                </Group>
              ))}
            </Stack>
            <Text size="xs" c="dimmed" mt={8}>
              Pass reasons are kept so the memory learns which targets you declined and why.
            </Text>
          </Box>
        )}
        <Anchor component={Link} href="/" size="xs" mt="md" display="block">
          Back to portfolio
        </Anchor>
      </Box>
    </Box>
  );
}
