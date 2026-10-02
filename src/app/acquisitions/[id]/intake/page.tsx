'use client';

import { Box, Button, Grid, Group, Loader, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconFileSearch, IconAlertTriangle, IconScale, IconHistory, IconInbox, IconWorld, IconSparkles, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { Section, DocIcon, SeverityBadge, PageHeader } from '@/components/ui';
import { ThesisFit } from '@/components/intel';

const KIND_ICON = {
  doc: <IconFileSearch size={14} />,
  finding: <IconAlertTriangle size={14} />,
  check: <IconScale size={14} />,
  memory: <IconHistory size={14} />,
  gap: <IconInbox size={14} />,
  research: <IconWorld size={14} />,
  done: <IconCheck size={14} />,
};
const KIND_COLOR = { doc: 'gray', finding: 'orange', check: 'ink', memory: 'grape', gap: 'blue', research: 'teal', done: 'teal' };

export default function IntakePage() {
  const { id } = useParams<{ id: string }>();
  const acq = useStore((s) => s.acquisitions.find((a) => a.id === id))!;
  const run = useStore((s) => s.runs[id]);
  const docs = useStore(useShallow((s) => s.documents.filter((d) => d.acqId === id)));
  const proposedRaw = useStore(useShallow((s) => s.findings.filter((f) => f.acqId === id && f.status === 'Proposed')));
  const sev = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const proposed = [...proposedRaw].sort((a, b) => Number(!!a.positive) - Number(!!b.positive) || sev[a.severity] - sev[b.severity]);
  const requests = useStore((s) => s.proposals.filter((p) => p.acqId === id && p.status === 'Pending').length);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [run?.log.length]);

  const running = run?.status === 'running';
  const pct = run ? Math.round((run.done / run.total) * 100) : 100;

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Data room analysis"
        title={running ? `Atlas is reading ${acq.name}’s data room` : `Atlas analyzed ${acq.name}’s data room`}
        description={running ? 'You can leave this page; analysis continues and findings land in the review queue.' : 'Nothing below is final. Review the proposed findings and requests, then decide what to pursue.'}
        right={
          !running && (
            <Group gap="xs">
              <Button component={Link} href={`/acquisitions/${id}/research`} variant="default">
                Thesis fit & research
              </Button>
              <Button component={Link} href={`/acquisitions/${id}/inbox`} rightSection={<IconArrowRight size={14} />}>
                Review {proposed.length + requests} items
              </Button>
            </Group>
          )
        }
      />
      <Box className="panel" p="md">
        <Group justify="space-between" mb={8}>
          <Group gap={8}>
            {running ? <Loader size={16} color="violet" /> : <ThemeIcon size={20} radius="xl" color="teal"><IconCheck size={12} /></ThemeIcon>}
            <Text size="sm" fw={600}>
              {running ? `Reading ${run?.current ?? 'documents'}…` : 'Analysis complete'}
            </Text>
          </Group>
          <Text size="sm" c="dimmed" className="num">
            {run ? `${run.done} of ${run.total} documents` : `${docs.length} documents`} · {proposed.length} proposed findings · {requests} requests drafted
          </Text>
        </Group>
        <Progress value={pct} color={running ? 'violet' : 'teal'} size={6} animated={running} />
      </Box>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap="lg">
            <Section title={<Group gap={6}><IconSparkles size={15} color="#6d3fd4" />What Atlas is doing</Group>} pad={false}>
              <Box ref={logRef} p="md" style={{ maxHeight: 380, overflowY: 'auto', fontSize: 13.5 }}>
                {!run && <Text size="sm" c="dimmed">Run log not available after a page reload. The results below are saved.</Text>}
                <Stack gap={8}>
                  {run?.log.map((l, i) => (
                    <Group key={i} gap={10} wrap="nowrap" align="flex-start">
                      <ThemeIcon size={22} radius="md" variant="light" color={KIND_COLOR[l.kind]}>
                        {KIND_ICON[l.kind]}
                      </ThemeIcon>
                      <Text size="sm" style={{ flex: 1 }} fw={l.kind === 'finding' || l.kind === 'done' ? 600 : 400}>
                        {l.text}
                      </Text>
                      <Text fz={10.5} c="dimmed" ff="monospace">
                        {l.t}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Box>
            </Section>
            {proposed.length > 0 && (
              <Section title={`Proposed findings (${proposed.length})`} right={<Button size="compact-xs" variant="subtle" component={Link} href={`/acquisitions/${id}/inbox`}>Review all</Button>} pad={false}>
                {proposed.map((f) => (
                  <Link key={f.id} href={`/acquisitions/${id}/findings/${f.id}`} style={{ display: 'block', borderBottom: '1px solid var(--app-border-soft)' }}>
                    <Group px="md" py={10} gap="sm" wrap="nowrap" className="row-link" style={{ borderRadius: 0 }}>
                      <SeverityBadge severity={f.severity} positive={f.positive} />
                      <Text size="sm" style={{ flex: 1 }}>
                        {f.title}
                      </Text>
                    </Group>
                  </Link>
                ))}
              </Section>
            )}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="lg">
            <Section title="Playbook fit">
              <ThesisFit acq={acq} compact />
            </Section>
            <Section title={`Documents (${docs.length})`} pad={false}>
              {docs.map((d) => (
                <Group key={d.id} px="md" py={8} justify="space-between" wrap="nowrap" style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
                  <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                    <DocIcon type={d.type} size={15} />
                    <Text size="sm" truncate>
                      {d.name}
                    </Text>
                  </Group>
                  {d.status === 'Processed' ? <IconCheck size={15} color="#12a383" /> : d.status === 'Processing' ? <Loader size={13} color="violet" /> : <Text size="xs" c="dimmed">Queued</Text>}
                </Group>
              ))}
            </Section>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
