'use client';

import { Box, Group, ScrollArea, Stack, Text, UnstyledButton, RingProgress, Badge, Center } from '@mantine/core';
import { IconCheck, IconLayoutDashboard, IconSparkles, IconColumns3, IconListCheck, IconAlertTriangle, IconShieldExclamation, IconGavel, IconFiles, IconFileText, IconUsers, IconActivity, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { TopBar } from '@/components/Chrome';
import { AtlasDrawer } from '@/components/Atlas';
import { useStore } from '@/lib/store';
import { PHASES, DEMO_TODAY } from '@/lib/meta';
import { Empty } from '@/components/ui';

function NavItem({ href, icon, label, count, active, countColor }: { href: string; icon: ReactNode; label: ReactNode; count?: number; active: boolean; countColor?: string }) {
  return (
    <UnstyledButton component={Link} href={href} className="nav-link row-link" data-active={active || undefined} px={8} py={5}>
      <Group gap={8} wrap="nowrap" justify="space-between">
        <Group gap={8} wrap="nowrap">
          <Box c={active ? 'ink.8' : 'stone.6'} style={{ display: 'flex' }}>
            {icon}
          </Box>
          <Text size="sm" fw={active ? 600 : 450} truncate>
            {label}
          </Text>
        </Group>
        {count ? (
          <Badge size="xs" variant={countColor ? 'light' : 'default'} color={countColor} circle={count < 10}>
            {count}
          </Badge>
        ) : null}
      </Group>
    </UnstyledButton>
  );
}

function PhaseGlyph({ status, progress }: { status: string; progress: number }) {
  if (status === 'complete')
    return (
      <Center w={16} h={16} style={{ borderRadius: 99, background: '#134a38' }}>
        <IconCheck size={10} color="white" stroke={3} />
      </Center>
    );
  if (status === 'active') return <RingProgress size={18} thickness={2.5} roundCaps sections={[{ value: Math.max(progress, 6), color: 'ink.6' }]} />;
  return <Box w={14} h={14} mx={1} style={{ borderRadius: 99, border: '1.5px dashed #d6d3d1' }} />;
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const path = usePathname();
  const acq = useStore((s) => s.acquisitions.find((a) => a.id === id));
  const openFindings = useStore((s) => s.findings.filter((f) => f.acqId === id && ['Proposed', 'Open', 'Under Review'].includes(f.status)).length);
  const pendingDecisions = useStore((s) => s.decisions.filter((d) => d.acqId === id && (d.status === 'Open' || d.status === 'Under Review')).length);
  const openRisks = useStore((s) => s.risks.filter((r) => r.acqId === id && (r.status === 'Open' || r.status === 'Mitigating')).length);
  const overdue = useStore((s) => s.work.filter((w) => w.acqId === id && w.status !== 'Complete' && w.due && w.due < DEMO_TODAY).length);
  const proposed = useStore((s) => s.findings.filter((f) => f.acqId === id && f.status === 'Proposed').length);

  if (!acq)
    return (
      <>
        <TopBar />
        <Empty title="Acquisition not found" action={<Link href="/">Back to portfolio</Link>} />
      </>
    );

  const base = `/acquisitions/${id}`;
  const is = (p: string) => path === base + p || path.startsWith(base + p + '/');

  return (
    <Box h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      <TopBar acqId={id} />
      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box w={236} style={{ borderRight: '1px solid var(--app-border)', background: 'var(--app-sidebar)', flexShrink: 0 }} className="no-print" visibleFrom="sm">
          <ScrollArea h="100%" px={10} py={12}>
            <UnstyledButton component={Link} href="/" px={8} mb={8}>
              <Group gap={4}>
                <IconArrowLeft size={12} color="var(--app-muted)" />
                <Text size="xs" c="dimmed">
                  Portfolio
                </Text>
              </Group>
            </UnstyledButton>
            <Box px={8} mb={12}>
              <Text fw={650} size="md" lh={1.2}>
                {acq.name}
              </Text>
              <Text size="xs" c="dimmed">
                {acq.codename} · {acq.target.industry}
              </Text>
            </Box>
            <Stack gap={1}>
              <NavItem href={base} icon={<IconLayoutDashboard size={16} />} label="Overview" active={path === base} />
              <NavItem href={`${base}/atlas`} icon={<IconSparkles size={16} />} label="Ask Atlas" active={is('/atlas')} />
            </Stack>

            <Text className="label" px={8} mt="md" mb={4}>
              Deal phases
            </Text>
            <Stack gap={1}>
              {PHASES.map((p) => (
                <NavItem
                  key={p.key}
                  href={`${base}/phase/${p.key}`}
                  active={is(`/phase/${p.key}`)}
                  icon={<PhaseGlyph status={acq.phases[p.key].status} progress={acq.phases[p.key].progress} />}
                  label={
                    <>
                      <Text span c="dimmed" size="xs" mr={4}>
                        {p.n}
                      </Text>
                      {p.short}
                    </>
                  }
                />
              ))}
            </Stack>

            <Text className="label" px={8} mt="md" mb={4}>
              Execution
            </Text>
            <Stack gap={1}>
              <NavItem href={`${base}/workstreams`} icon={<IconColumns3 size={16} />} label="Workstreams" active={is('/workstreams')} />
              <NavItem href={`${base}/work`} icon={<IconListCheck size={16} />} label="Work items" count={overdue} countColor="red" active={is('/work')} />
              <NavItem href={`${base}/findings`} icon={<IconAlertTriangle size={16} />} label="Findings" count={openFindings} countColor={proposed ? 'violet' : undefined} active={is('/findings')} />
              <NavItem href={`${base}/risks`} icon={<IconShieldExclamation size={16} />} label="Risks" count={openRisks} active={is('/risks')} />
              <NavItem href={`${base}/decisions`} icon={<IconGavel size={16} />} label="Decisions" count={pendingDecisions} countColor="blue" active={is('/decisions')} />
            </Stack>

            <Text className="label" px={8} mt="md" mb={4}>
              Materials & people
            </Text>
            <Stack gap={1}>
              <NavItem href={`${base}/documents`} icon={<IconFiles size={16} />} label="Documents" active={is('/documents')} />
              <NavItem href={`${base}/deliverables`} icon={<IconFileText size={16} />} label="Deliverables" active={is('/deliverables')} />
              <NavItem href={`${base}/team`} icon={<IconUsers size={16} />} label="Deal team" active={is('/team')} />
              <NavItem href={`${base}/activity`} icon={<IconActivity size={16} />} label="Activity & automation" active={is('/activity')} />
            </Stack>
          </ScrollArea>
        </Box>
        <ScrollArea style={{ flex: 1 }} id="workspace-scroll">
          <Box px={{ base: 'md', md: 32 }} py={24} maw={1320}>
            {children}
          </Box>
        </ScrollArea>
      </Box>
      <AtlasDrawer acqId={id} />
    </Box>
  );
}
