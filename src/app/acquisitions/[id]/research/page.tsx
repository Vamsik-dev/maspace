'use client';

import { Badge, Box, Button, Grid, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { IconWorld, IconFileCheck } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { notifications } from '@mantine/notifications';
import { useStore } from '@/lib/store';
import { fmtDate } from '@/lib/atlas';
import { PageHeader, Section, Pill, CitationChips, Empty } from '@/components/ui';
import { ThesisFit, Benchmarks, SimilarDeals } from '@/components/intel';

const VERDICT = { Verified: 'teal', Contradicted: 'red', 'Partly true': 'yellow', Unverified: 'gray' } as const;

export default function ResearchPage() {
  const { id } = useParams<{ id: string }>();
  const acq = useStore((s) => s.acquisitions.find((a) => a.id === id))!;
  const research = useStore(useShallow((s) => s.research.filter((r) => r.acqId === id)));
  const claims = useStore(useShallow((s) => s.claims.filter((c) => c.acqId === id)));
  const addFinding = useStore((s) => s.addFinding);
  const [tab, setTab] = useState('fit');
  const [recorded, setRecorded] = useState<string[]>([]);

  return (
    <Stack gap="md">
      <PageHeader
        eyebrow="Intelligence"
        title="Target intelligence"
        description="How the target compares with your playbook and past deals, what outside sources say, and which seller statements hold up. Seller-provided, external and internal information are kept separate."
      />
      <SegmentedControl
        w="fit-content"
        value={tab}
        onChange={setTab}
        data={[
          { value: 'fit', label: 'Thesis fit & benchmarks' },
          { value: 'claims', label: `Seller claims (${claims.length})` },
          { value: 'external', label: `External research (${research.length})` },
        ]}
      />

      {tab === 'fit' && (
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap="lg">
              <Section title="Fit against your acquisition playbook">
                <ThesisFit acq={acq} />
              </Section>
              <Section title="Resembles these past acquisitions">
                <SimilarDeals acq={acq} />
              </Section>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Section title="This deal vs. your previous deals">
              {acq.metrics ? <Benchmarks acq={acq} /> : <Text size="sm" c="dimmed">Benchmarks appear once Atlas has extracted the target’s metrics.</Text>}
            </Section>
          </Grid.Col>
        </Grid>
      )}

      {tab === 'claims' && (
        <Box className="panel" style={{ overflow: 'hidden' }}>
          {claims.length === 0 ? (
            <Empty title="No seller claims checked yet">Atlas extracts factual claims from the CIM and management presentation, then checks each one against the underlying data.</Empty>
          ) : (
            claims.map((c) => (
              <Group key={c.id} align="flex-start" wrap="nowrap" gap="md" p="md" style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
                <Box w={110} style={{ flexShrink: 0 }}>
                  <Pill color={VERDICT[c.verdict]} solid={c.verdict === 'Contradicted'}>
                    {c.verdict}
                  </Pill>
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600}>
                    “{c.claim}”
                  </Text>
                  <Box mt={4} mb={8}>
                    <CitationChips acqId={id} citations={[c.claimSource]} />
                  </Box>
                  <Text size="sm" c="dimmed">
                    {c.evidence}
                  </Text>
                  {c.evidenceSources.length > 0 && (
                    <Box mt={6}>
                      <CitationChips acqId={id} citations={c.evidenceSources} />
                    </Box>
                  )}
                </Box>
              </Group>
            ))
          )}
        </Box>
      )}

      {tab === 'external' && (
        <Stack gap="sm">
          <Group gap={8}>
            <IconWorld size={15} color="#5b6b82" />
            <Text size="xs" c="dimmed">
              External sources are labeled separately from seller-provided documents. In this prototype they are synthetic; in the product Atlas would research permitted public sources and cite each one.
            </Text>
          </Group>
          {research.length === 0 && (
            <Box className="panel">
              <Empty title="No external research yet">Atlas researches the market, competitors, regulation, public records and reputation once a target is created.</Empty>
            </Box>
          )}
          {research.map((r) => (
            <Box key={r.id} className="panel" p="md">
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                <Box style={{ minWidth: 0 }}>
                  <Group gap={6} mb={4}>
                    <Badge variant="default">{r.topic}</Badge>
                    {r.relevance === 'Material' && <Pill color="orange">Material</Pill>}
                    <Text size="xs" c="dimmed">
                      {r.sourceType} · {r.source} · as of {fmtDate(r.asOf)}
                    </Text>
                  </Group>
                  <Text fw={600} size="sm">
                    {r.headline}
                  </Text>
                  <Text size="sm" c="dimmed" mt={2} lh={1.5}>
                    {r.detail}
                  </Text>
                </Box>
                {r.relevance === 'Material' && (
                  <Button
                    size="compact-sm"
                    variant={recorded.includes(r.id) ? 'light' : 'default'}
                    leftSection={<IconFileCheck size={13} />}
                    disabled={recorded.includes(r.id)}
                    onClick={() => {
                      addFinding({ acqId: id, title: r.headline, workstream: r.topic === 'Regulatory' ? 'environmental' : r.topic === 'People' ? 'legal' : 'commercial', severity: 'Medium', status: 'Open', ownerId: acq.dealLeadId, identifiedBy: 'atlas', fact: { text: `${r.detail} (External: ${r.source})`, citations: [] }, interpretation: 'From external research; verify with management.', implications: [] });
                      setRecorded((x) => [...x, r.id]);
                      notifications.show({ message: 'Recorded as a finding (external source).', color: 'ink' });
                    }}
                  >
                    {recorded.includes(r.id) ? 'Recorded' : 'Record as finding'}
                  </Button>
                )}
              </Group>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
