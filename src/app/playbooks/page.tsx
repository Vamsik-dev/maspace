'use client';

import { Badge, Box, Group, Modal, NumberInput, SimpleGrid, Stack, Table, Text, UnstyledButton, Anchor } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { TopBar } from '@/components/Chrome';
import { PageHeader, Section, Pill } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useOrg, useOrgPlaybook } from '@/lib/hooks';
import { ruleText, thesisFit } from '@/lib/playbook';
import type { Playbook, PlaybookCriterion, CriterionTest } from '@/lib/types';

const LAYERS = ['Acquisition strategy', 'Thesis', 'Thresholds', 'Workstreams', 'Diligence requests', 'Decision gates', 'Integration priorities', 'Outcome metrics'];

function ThresholdEditor({ pb, c }: { pb: Playbook; c: PlaybookCriterion }) {
  const update = useStore((s) => s.updateCriterion);
  const t = c.test;
  const set = (patch: Partial<CriterionTest>) => update(pb.id, c.key, { ...t, ...patch } as CriterionTest);
  const step = c.unit === 'x' ? 0.1 : 1;
  if (t.type === 'level') return <Text size="sm">{ruleText(c)}</Text>;
  if (t.type === 'between')
    return (
      <Group gap={6} wrap="nowrap">
        <NumberInput size="xs" w={78} value={t.min} step={step} onChange={(v) => set({ min: Number(v) })} aria-label={`${c.label} minimum`} />
        <Text size="xs">to</Text>
        <NumberInput size="xs" w={78} value={t.max} step={step} onChange={(v) => set({ max: Number(v) })} aria-label={`${c.label} maximum`} />
      </Group>
    );
  return (
    <Group gap={6} wrap="nowrap">
      <Text size="xs" c="dimmed" w={34}>
        Pass
      </Text>
      <NumberInput size="xs" w={78} value={t.pass} step={step} decimalScale={c.unit === 'x' ? 1 : 0} onChange={(v) => set({ pass: Number(v) })} aria-label={`${c.label} pass threshold`} />
      <Text size="xs" c="dimmed" w={40} ta="right">
        Watch
      </Text>
      <NumberInput size="xs" w={78} value={t.watch} step={step} decimalScale={c.unit === 'x' ? 1 : 0} onChange={(v) => set({ watch: Number(v) })} aria-label={`${c.label} watch threshold`} />
    </Group>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <Stack gap={4}>
      {items.map((i) => (
        <Text key={i} size="sm">
          • {i}
        </Text>
      ))}
    </Stack>
  );
}

export default function PlaybooksPage() {
  const org = useOrg();
  const pb = useOrgPlaybook();
  const templates = useStore(useShallow((s) => s.playbooks.filter((p) => p.status === 'Template')));
  const deals = useStore(useShallow((s) => s.acquisitions.filter((a) => a.orgId === org.id && a.metrics)));
  const [preview, setPreview] = useState<Playbook | null>(null);

  return (
    <Box>
      <TopBar />
      <Box px={{ base: 'md', md: 40 }} py={28} maw={1280} mx="auto">
        <PageHeader
          eyebrow={`${org.name} · acquisition knowledge`}
          title="Playbooks"
          description="The engine is the same for every industry. What changes is the acquirer’s knowledge: thresholds, workstreams, requests, decision gates, integration priorities and outcome metrics. Each organization owns and edits its own playbook."
        />

        <Box className="panel" p="md" mb="lg">
          <Text className="label" mb={8}>
            What a playbook configures
          </Text>
          <Group gap={4} wrap="wrap">
            {LAYERS.map((l, i) => (
              <Group key={l} gap={4} wrap="nowrap">
                <Box px={10} py={5} style={{ borderRadius: 6, background: i === 2 ? 'var(--app-brand-soft)' : 'var(--app-subtle)', border: '1px solid var(--app-border)', fontSize: 12.5, fontWeight: 600, color: i === 2 ? '#1f45a5' : undefined }}>
                  {l}
                </Box>
                {i < LAYERS.length - 1 && <IconChevronRight size={13} color="#94a3b8" />}
              </Group>
            ))}
          </Group>
          <Text size="xs" c="dimmed" mt={8}>
            Underneath, every playbook drives the same model: Target → Thesis → Evidence → Finding → Risk → Decision → Action → Integration → Outcome → Learning.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
          <Box style={{ gridColumn: 'span 2' }} className="span-lg">
            <Stack gap="lg">
              <Section
                title={
                  <Group gap={8}>
                    {pb.name} {pb.version}
                    <Pill color="teal">Active</Pill>
                  </Group>
                }
                right={<Text size="xs" c="dimmed">{pb.vertical}</Text>}
                pad={false}
              >
                <Text size="sm" c="dimmed" px="md" pt="md">
                  {pb.description} Change a threshold and every deal below is re-scored immediately.
                </Text>
                <Box style={{ overflowX: 'auto' }}>
                  <Table mt="sm" style={{ minWidth: 620 }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Criterion</Table.Th>
                        <Table.Th>Rule</Table.Th>
                        <Table.Th>Thresholds</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {pb.criteria.map((c) => (
                        <Table.Tr key={c.key}>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {c.label}
                            </Text>
                            {c.why && (
                              <Text size="xs" c="dimmed">
                                {c.why}
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td className="num" fw={600}>
                            {ruleText(c)}
                          </Table.Td>
                          <Table.Td>
                            <ThresholdEditor pb={pb} c={c} />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              </Section>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Section title={`Workstreams (${pb.workstreams.length})`}>
                  <Stack gap={6}>
                    {pb.workstreams.map((w) => (
                      <Box key={w.key}>
                        <Text size="sm" fw={500}>
                          {w.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {w.scope}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Section>
                <Stack gap="lg">
                  <Section title="Decision gates">
                    <List items={pb.decisionGates} />
                  </Section>
                  <Section title="Integration priorities">
                    <List items={pb.integrationPriorities} />
                  </Section>
                  <Section title="Outcome metrics tracked after close">
                    <List items={pb.outcomeMetrics} />
                  </Section>
                </Stack>
              </SimpleGrid>

              <Section title="Standard diligence requests">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  {pb.requestList.map((r) => (
                    <Box key={r.workstream}>
                      <Text className="label" mb={4}>
                        {pb.workstreams.find((w) => w.key === r.workstream)?.label ?? r.workstream}
                      </Text>
                      <List items={r.items} />
                    </Box>
                  ))}
                </SimpleGrid>
                <Text size="xs" c="dimmed" mt="sm">
                  Atlas compares each data room against this list and drafts seller requests for what is missing.
                </Text>
              </Section>
            </Stack>
          </Box>

          <Stack gap="lg">
            <Section title="Live re-scoring">
              <Stack gap={10}>
                {deals.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No analyzed deals yet. Start a new acquisition to see scoring.
                  </Text>
                )}
                {deals.map((a) => {
                  const fit = thesisFit(a, pb)!;
                  return (
                    <Box key={a.id}>
                      <Anchor component={Link} href={`/acquisitions/${a.id}/research`} size="sm" fw={600} c="dark">
                        {a.name}
                      </Anchor>
                      <Group gap={6} mt={4}>
                        <Pill color="teal">{fit.pass} pass</Pill>
                        <Pill color="yellow">{fit.watch} watch</Pill>
                        <Pill color="red">{fit.fail} fail</Pill>
                      </Group>
                    </Box>
                  );
                })}
              </Stack>
            </Section>
            {pb.history && (
              <Section title="Version history">
                <Stack gap={8}>
                  {pb.history.map((h) => (
                    <Box key={h.version}>
                      <Text size="sm" fw={600}>
                        {h.version} · {h.date}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {h.change}
                      </Text>
                    </Box>
                  ))}
                  <Anchor component={Link} href="/memory" size="xs">
                    Lessons waiting to be adopted →
                  </Anchor>
                </Stack>
              </Section>
            )}
            <Section title="Industry templates">
              <Stack gap={8}>
                <Text size="xs" c="dimmed">
                  Starting points maintained by us. An acquirer copies one, then tunes it to its own strategy and history.
                </Text>
                {templates.map((t) => (
                  <UnstyledButton key={t.id} onClick={() => setPreview(t)} p="sm" className="row-link" style={{ border: '1px solid var(--app-border)', borderRadius: 8 }}>
                    <Group justify="space-between" wrap="nowrap">
                      <Box>
                        <Text size="sm" fw={600}>
                          {t.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {t.vertical} · {t.criteria.length} criteria · {t.workstreams.length} workstreams
                        </Text>
                      </Box>
                      <Badge variant="default" style={{ flexShrink: 0 }}>
                        Preview
                      </Badge>
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>
            </Section>
          </Stack>
        </SimpleGrid>
      </Box>

      <Modal opened={!!preview} onClose={() => setPreview(null)} size="lg" title={<Text fw={600}>{preview?.name} template</Text>}>
        {preview && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {preview.description}
            </Text>
            <Box>
              <Text className="label" mb={6}>
                Screening criteria
              </Text>
              <Table fz="sm">
                <Table.Tbody>
                  {preview.criteria.map((c) => (
                    <Table.Tr key={c.key}>
                      <Table.Td>{c.label}</Table.Td>
                      <Table.Td className="num" fw={600}>
                        {ruleText(c)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
            <Box>
              <Text className="label" mb={6}>
                Workstreams
              </Text>
              <List items={preview.workstreams.map((w) => `${w.label}: ${w.scope}`)} />
            </Box>
            <Text size="xs" c="dimmed">
              Prototype: templates are previews. Copying a template into a new organization is part of onboarding in the product.
            </Text>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
