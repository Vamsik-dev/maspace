'use client';

import { Anchor, Box, Drawer, Group, SegmentedControl, Select, SimpleGrid, Stack, Table, Text, Textarea, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { wsLabel } from '@/lib/meta';
import { PageHeader, Person, SeverityBadge, StatusBadge, Field, personName, Empty, Claim } from '@/components/ui';
import { Comments } from '@/components/Comments';
import type { Risk, RiskStatus, Severity } from '@/lib/types';

const sevOrder: Severity[] = ['Critical', 'High', 'Medium', 'Low'];
const probOrder: Risk['probability'][] = ['Likely', 'Possible', 'Unlikely'];

function Heatmap({ risks, onPick }: { risks: Risk[]; onPick: (id: string) => void }) {
  const bg = (si: number, pi: number) => {
    const score = (3 - si) + (2 - pi);
    return score >= 4 ? '#fee2e2' : score >= 3 ? '#ffedd5' : score >= 2 ? '#fef9c3' : '#f5f5f4';
  };
  return (
    <Box>
      <Group gap={4} align="stretch" wrap="nowrap">
        <Stack gap={4} justify="space-around" w={64}>
          {sevOrder.map((s) => (
            <Text key={s} size="xs" c="dimmed" ta="right" h={44} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {s}
            </Text>
          ))}
        </Stack>
        <Box style={{ flex: 1 }}>
          <SimpleGrid cols={3} spacing={4} verticalSpacing={4}>
            {sevOrder.flatMap((s, si) =>
              probOrder.map((p, pi) => {
                const cell = risks.filter((r) => r.severity === s && r.probability === p);
                return (
                  <Box key={s + p} h={44} p={4} style={{ background: bg(si, pi), borderRadius: 4, display: 'flex', gap: 4, flexWrap: 'wrap', alignContent: 'flex-start' }}>
                    {cell.map((r) => (
                      <Tooltip key={r.id} label={r.title}>
                        <Box onClick={() => onPick(r.id)} w={18} h={18} style={{ borderRadius: 99, background: '#1c1917', color: 'white', fontSize: 10, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                          {risks.indexOf(r) + 1}
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                );
              }),
            )}
          </SimpleGrid>
          <SimpleGrid cols={3} spacing={4} mt={4}>
            {probOrder.map((p) => (
              <Text key={p} size="xs" c="dimmed" ta="center">
                {p}
              </Text>
            ))}
          </SimpleGrid>
        </Box>
      </Group>
    </Box>
  );
}

function RisksInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const all = useStore(useShallow((s) => s.risks.filter((r) => r.acqId === id)));
  const findings = useStore((s) => s.findings);
  const decisions = useStore((s) => s.decisions);
  const update = useStore((s) => s.updateRisk);
  const [view, setView] = useState('open');
  const sel = params.get('risk');
  const risk = all.find((r) => r.id === sel);
  const [mit, setMit] = useState('');
  useEffect(() => setMit(risk?.mitigation ?? ''), [risk?.id, risk?.mitigation]);

  const list = all
    .filter((r) => (view === 'open' ? r.status === 'Open' || r.status === 'Mitigating' : true))
    .sort((a, b) => sevOrder.indexOf(a.severity) - sevOrder.indexOf(b.severity));
  const pick = (rid: string | null) => router.replace(`/acquisitions/${id}/risks${rid ? `?risk=${rid}` : ''}`, { scroll: false });

  return (
    <Stack gap="md">
      <PageHeader eyebrow="Diligence" title="Risk register" description="What could go wrong, how likely it is, who owns it and how we will mitigate it. Risks come from findings and are addressed by decisions." />
      <Group align="flex-start" gap="lg" wrap="nowrap">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <SegmentedControl size="xs" mb="sm" value={view} onChange={setView} data={[{ value: 'open', label: 'Open & mitigating' }, { value: 'all', label: `All (${all.length})` }]} />
          <Box style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
            {list.length === 0 ? (
              <Empty title="No risks recorded">Create risks from findings. A finding is what we observed; a risk is what could go wrong because of it.</Empty>
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={28}>#</Table.Th>
                    <Table.Th>Risk</Table.Th>
                    <Table.Th w={90}>Severity</Table.Th>
                    <Table.Th w={90}>Probability</Table.Th>
                    <Table.Th w={150}>Owner</Table.Th>
                    <Table.Th w={100}>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {list.map((r) => (
                    <Table.Tr key={r.id} onClick={() => pick(r.id)} style={{ cursor: 'pointer' }} bg={sel === r.id ? '#f5f5f4' : undefined}>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {all.indexOf(r) + 1}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {r.title}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {wsLabel(r.workstream)} · Mitigation: {r.mitigation}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <SeverityBadge severity={r.severity} />
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{r.probability}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Person id={r.ownerId} />
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={r.status} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Box>
        </Box>
        <Box w={300} p="md" style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8, flexShrink: 0 }} visibleFrom="md">
          <Text size="sm" fw={600} mb="sm">
            Severity × probability
          </Text>
          <Heatmap risks={all.filter((r) => r.status !== 'Closed')} onPick={pick} />
        </Box>
      </Group>

      <Drawer opened={!!risk} onClose={() => pick(null)} position="right" size={520} title={<Text fw={600}>Risk</Text>}>
        {risk && (
          <Stack gap="md">
            <Text fz={19} fw={600} lh={1.3}>
              {risk.title}
            </Text>
            <Text size="sm">{risk.description}</Text>
            <SimpleGrid cols={2}>
              <Select size="xs" label="Status" data={['Open', 'Mitigating', 'Accepted', 'Closed']} value={risk.status} onChange={(v) => v && update(risk.id, { status: v as RiskStatus })} />
              <Select size="xs" label="Severity" data={sevOrder} value={risk.severity} onChange={(v) => v && update(risk.id, { severity: v as Severity })} />
              <Select size="xs" label="Probability" data={probOrder} value={risk.probability} onChange={(v) => v && update(risk.id, { probability: v as Risk['probability'] })} />
              <Field label="Owner">
                <Person id={risk.ownerId} />
              </Field>
            </SimpleGrid>
            {risk.status === 'Accepted' && (
              <Text size="xs" c="orange.8">
                Accepting a risk is a human decision. It is recorded with your name in the activity log.
              </Text>
            )}
            <Textarea size="sm" label="Mitigation" autosize minRows={2} value={mit} onChange={(e) => setMit(e.currentTarget.value)} onBlur={() => mit !== risk.mitigation && update(risk.id, { mitigation: mit })} />
            <Box>
              <Text className="label" mb={6}>
                Arises from
              </Text>
              <Stack gap={8}>
                {findings
                  .filter((f) => risk.findingIds.includes(f.id))
                  .map((f) => (
                    <Claim key={f.id} kind="fact" acqId={id} citations={f.fact.citations} calculation={f.calculation} compact>
                      <Anchor component={Link} href={`/acquisitions/${id}/findings/${f.id}`} size="sm" fw={500} c="dark">
                        {f.title}
                      </Anchor>
                    </Claim>
                  ))}
              </Stack>
            </Box>
            <Box>
              <Text className="label" mb={6}>
                Addressed by decisions
              </Text>
              {decisions.filter((d) => risk.decisionIds.includes(d.id)).length === 0 && (
                <Text size="sm" c="dimmed">
                  None yet.
                </Text>
              )}
              {decisions
                .filter((d) => risk.decisionIds.includes(d.id))
                .map((d) => (
                  <Group key={d.id} gap={6} mb={4} wrap="nowrap">
                    <StatusBadge status={d.status} size="xs" />
                    <Anchor component={Link} href={`/acquisitions/${id}/decisions/${d.id}`} size="sm" c="dark">
                      {d.question}
                    </Anchor>
                  </Group>
                ))}
            </Box>
            <Box>
              <Text className="label" mb={6}>
                Discussion
              </Text>
              <Comments type="risk" id={risk.id} comments={risk.comments} />
            </Box>
            <Text size="xs" c="dimmed">
              Owner: {personName(risk.ownerId)}
            </Text>
          </Stack>
        )}
      </Drawer>
    </Stack>
  );
}

export default function RisksPage() {
  return (
    <Suspense>
      <RisksInner />
    </Suspense>
  );
}
