'use client';

import { Box, Button, Checkbox, Group, NumberInput, Select, SimpleGrid, Stack, Stepper, Text, TextInput, Textarea, FileButton, Table } from '@mantine/core';
import { IconArrowRight, IconSparkles, IconUpload, IconShieldCheck } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { TopBar } from '@/components/Chrome';
import { PageHeader, DocIcon, Section } from '@/components/ui';
import { useStore } from '@/lib/store';
import { SAMPLES } from '@/data/samples';
import { useOrg, useOrgPlaybook } from '@/lib/hooks';

const STRATEGIES = [
  'New geography: entry point for future tuck-ins',
  'Platform add-on: density in an existing market',
  'New service line: add capability to existing customers',
  'Tuck-in to an existing portfolio company',
];

const INDUSTRIES: Record<string, string[]> = {
  'org-meridian': ['HVAC services', 'Plumbing services', 'Electrical services', 'Fire / life safety', 'Landscaping', 'Facilities services', 'Specialty contracting', 'Environmental services', 'Industrial services'],
  'org-halcyon': ['Orthopedics & spine', 'Sports medicine', 'Hand & upper extremity', 'Pain management', 'Physical therapy', 'Ambulatory surgery center'],
};

const BOUNDARY: [string, string, string][] = [
  ['Read and classify every document', 'Atlas', ''],
  ['Extract facts and calculate metrics', 'Atlas', 'Math runs in code, with sources'],
  ['Score against your playbook and past deals', 'Atlas', ''],
  ['Propose findings, risks, questions and requests', 'Atlas', 'You accept, edit or dismiss'],
  ['Research the market and public records', 'Atlas', 'Labeled as external'],
  ['Make deal, valuation and risk decisions', 'You', 'Recorded with rationale'],
];

function NewAcquisitionInner() {
  const router = useRouter();
  const org = useOrg();
  const pb = useOrgPlaybook();
  const SAMPLE = SAMPLES[org.id];
  const LS_DEFAULTS = SAMPLE.defaults;
  const LS_DOCS = SAMPLE.docs;
  const params = useSearchParams();
  const fromId = params.get('from');
  const fromTarget = useStore((s) => s.pipeline.find((t) => t.id === fromId));
  const linkPipeline = useStore((s) => s.linkPipeline);
  const add = useStore((s) => s.addAcquisition);
  const run = useStore((s) => s.runAnalysis);
  const [step, setStep] = useState(0);
  const [sample, setSample] = useState(!fromTarget || !!fromTarget.hasSample);
  const [ownFiles, setOwnFiles] = useState<File[]>([]);
  const prefill = fromTarget?.hasSample ? LS_DEFAULTS : fromTarget ? { name: fromTarget.name, industry: fromTarget.industry, hq: fromTarget.hq, revenue: fromTarget.revenue ?? '', ebitda: fromTarget.ebitda ?? '', rationale: fromTarget.note ?? '' } : null;
  const [v, setV] = useState({ name: '', industry: INDUSTRIES[org.id][0], hq: '', revenue: '' as number | string, ebitda: '' as number | string, rationale: '', strategy: STRATEGIES[0], ...(prefill ?? {}) } as { name: string; industry: string; hq: string; revenue: number | string; ebitda: number | string; rationale: string; strategy: string });
  const valid = v.name.trim() && v.hq.trim() && Number(v.revenue) > 0 && Number(v.ebitda) > 0;

  const create = () => {
    const id = add({ name: v.name, industry: v.industry, hq: v.hq, revenue: Number(v.revenue), ebitda: Number(v.ebitda), strategy: v.strategy, thesis: v.rationale || v.strategy, rationale: v.rationale });
    if (fromTarget) linkPipeline(fromTarget.id, id);
    if (sample) {
      run(id);
      router.push(`/acquisitions/${id}/intake`);
    } else router.push(`/acquisitions/${id}`);
  };

  return (
    <Box>
      <TopBar />
      <Box px={{ base: 'md', md: 40 }} py={28} maw={1080} mx="auto">
        <PageHeader eyebrow="New acquisition" title="Tell us the basics. Atlas does the reading." description={`Six fields and the seller’s documents are enough. Atlas reads the data room, scores the target against ${pb.name} ${pb.version} and your past deals, researches it, and drafts findings and requests for your team to review.`} />
        <Stepper active={step} size="sm" mb="xl" color="ink.7">
          <Stepper.Step label="Target" description="Six fields" />
          <Stepper.Step label="Documents" description="Seller data room" />
        </Stepper>

        {step === 0 && (
          <Section title="Target">
            <Stack gap="md">
              <Group justify="space-between" p="sm" style={{ background: 'var(--app-brand-soft)', borderRadius: 8 }}>
                <Text size="sm">For the demo, use the sample target ({LS_DEFAULTS.name}) and its synthetic data room.</Text>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => {
                    setV({ ...v, ...LS_DEFAULTS });
                    setSample(true);
                  }}
                >
                  Use sample target
                </Button>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput size="sm" id="t-name" label="Target name" placeholder={`e.g. ${LS_DEFAULTS.name}`} value={v.name} onChange={(e) => setV({ ...v, name: e.currentTarget.value })} />
                <Select size="sm" id="t-ind" label="Industry" data={INDUSTRIES[org.id]} value={v.industry} onChange={(x) => setV({ ...v, industry: x ?? v.industry })} />
                <TextInput size="sm" id="t-hq" label="Location" placeholder="City, State" value={v.hq} onChange={(e) => setV({ ...v, hq: e.currentTarget.value })} />
                <Group grow>
                  <NumberInput size="sm" id="t-rev" label="Revenue (~$M)" decimalScale={1} min={0} value={v.revenue} onChange={(x) => setV({ ...v, revenue: x })} />
                  <NumberInput size="sm" id="t-ebitda" label="EBITDA (~$M)" decimalScale={2} min={0} value={v.ebitda} onChange={(x) => setV({ ...v, ebitda: x })} />
                </Group>
              </SimpleGrid>
              <Textarea size="sm" id="t-why" label="Why we’re interested" autosize minRows={2} placeholder="One or two sentences" value={v.rationale} onChange={(e) => setV({ ...v, rationale: e.currentTarget.value })} />
              <Select size="sm" id="t-strat" label="Acquisition strategy" data={STRATEGIES} value={v.strategy} onChange={(x) => setV({ ...v, strategy: x ?? v.strategy })} />
              <Group justify="flex-end">
                <Button size="sm" disabled={!valid} rightSection={<IconArrowRight size={14} />} onClick={() => setStep(1)}>
                  Continue
                </Button>
              </Group>
            </Stack>
          </Section>
        )}

        {step === 1 && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Section title="Seller documents">
              <Stack gap="sm">
                <Checkbox
                  id="t-sample"
                  checked={sample}
                  onChange={(e) => setSample(e.currentTarget.checked)}
                  label={<Text size="sm" fw={500}>Attach the sample seller data room ({LS_DOCS.length} documents)</Text>}
                  description={`Synthetic: ${LS_DOCS.slice(0, 5).map((d) => d.category.toLowerCase()).join(', ')} and more.`}
                />
                {sample && (
                  <Box style={{ border: '1px solid var(--app-border)', borderRadius: 8, maxHeight: 260, overflowY: 'auto' }}>
                    <Table fz="sm" verticalSpacing={6}>
                      <Table.Tbody>
                        {LS_DOCS.map((d) => (
                          <Table.Tr key={d.key}>
                            <Table.Td>
                              <Group gap={8} wrap="nowrap">
                                <DocIcon type={d.type} size={15} />
                                <Text size="sm" truncate>
                                  {d.name}
                                </Text>
                              </Group>
                            </Table.Td>
                            <Table.Td c="dimmed" ta="right">
                              {d.category}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Box>
                )}
                <Group gap="sm">
                  <FileButton multiple onChange={(f) => setOwnFiles(f)} accept=".pdf,.docx,.xlsx,.pptx,.csv">
                    {(props) => (
                      <Button {...props} variant="default" leftSection={<IconUpload size={14} />}>
                        Add your own files
                      </Button>
                    )}
                  </FileButton>
                  {ownFiles.length > 0 && (
                    <Text size="xs" c="dimmed">
                      {ownFiles.length} selected — prototype does not read their contents.
                    </Text>
                  )}
                </Group>
                <Group gap={6} wrap="nowrap" align="flex-start">
                  <IconShieldCheck size={14} color="#5b6b82" style={{ marginTop: 2 }} />
                  <Text size="xs" c="dimmed">
                    Documents stay inside your organization’s workspace. They are never used to train models.
                  </Text>
                </Group>
              </Stack>
            </Section>
            <Section title="What happens next">
              <Table fz="sm" verticalSpacing={7}>
                <Table.Tbody>
                  {BOUNDARY.map(([a, who, note]) => (
                    <Table.Tr key={a}>
                      <Table.Td>{a}</Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={700} c={who === 'You' ? 'ink.8' : 'violet.7'}>
                          {who}
                        </Text>
                      </Table.Td>
                      <Table.Td c="dimmed" fz="xs">
                        {note}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Group justify="space-between" mt="md">
                <Button variant="default" size="sm" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button size="sm" leftSection={<IconSparkles size={15} />} onClick={create}>
                  {sample ? 'Create and analyze' : 'Create acquisition'}
                </Button>
              </Group>
            </Section>
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}

export default function NewAcquisitionPage() {
  return (
    <Suspense>
      <NewAcquisitionInner />
    </Suspense>
  );
}
