'use client';

import { Badge, Box, Center, Group, RingProgress, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCheck, IconLayoutDashboard, IconSparkles, IconColumns3, IconListCheck, IconAlertTriangle, IconShieldExclamation, IconGavel, IconFiles, IconFileText, IconUsers, IconActivity, IconInbox, IconRadar } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { DEMO_TODAY, PHASES } from '@/lib/meta';

function NavItem({ href, icon, label, count, active, countColor, onNavigate }: { href: string; icon: ReactNode; label: ReactNode; count?: number; active: boolean; countColor?: string; onNavigate?: () => void }) {
  return (
    <UnstyledButton component={Link} href={href} onClick={onNavigate} className="nav-link row-link" data-active={active || undefined} px={10} py={7}>
      <Group gap={10} wrap="nowrap" justify="space-between">
        <Group gap={10} wrap="nowrap">
          <Box c={active ? 'ink.7' : 'stone.5'} style={{ display: 'flex' }}>
            {icon}
          </Box>
          <Text fz={13.5} fw={active ? 600 : 500} c={active ? 'ink.9' : 'stone.8'} truncate>
            {label}
          </Text>
        </Group>
        {count ? (
          <Badge size="sm" variant={countColor ? 'light' : 'default'} color={countColor} radius="xl" miw={22}>
            {count}
          </Badge>
        ) : null}
      </Group>
    </UnstyledButton>
  );
}

export function PhaseGlyph({ status, progress }: { status: string; progress: number }) {
  if (status === 'complete')
    return (
      <Center w={16} h={16} style={{ borderRadius: 99, background: '#1f45a5' }}>
        <IconCheck size={10} color="white" stroke={3} />
      </Center>
    );
  if (status === 'active') return <RingProgress size={18} thickness={2.5} roundCaps sections={[{ value: Math.max(progress, 6), color: 'ink.6' }]} />;
  return <Box w={14} h={14} mx={1} style={{ borderRadius: 99, border: '1.5px dashed #cbd3df' }} />;
}

const Heading = ({ children }: { children: ReactNode }) => (
  <Text className="label" px={10} mt="lg" mb={6}>
    {children}
  </Text>
);

export function DealNav({ acqId, withPhases = true, onNavigate }: { acqId: string; withPhases?: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  const acq = useStore((s) => s.acquisitions.find((a) => a.id === acqId));
  const openFindings = useStore((s) => s.findings.filter((f) => f.acqId === acqId && ['Proposed', 'Open', 'Under Review'].includes(f.status)).length);
  const pendingDecisions = useStore((s) => s.decisions.filter((d) => d.acqId === acqId && (d.status === 'Open' || d.status === 'Under Review')).length);
  const openRisks = useStore((s) => s.risks.filter((r) => r.acqId === acqId && (r.status === 'Open' || r.status === 'Mitigating')).length);
  const overdue = useStore((s) => s.work.filter((w) => w.acqId === acqId && w.status !== 'Complete' && w.due && w.due < DEMO_TODAY).length);
  const proposed = useStore((s) => s.findings.filter((f) => f.acqId === acqId && f.status === 'Proposed').length);
  const review = useStore((s) => s.findings.filter((f) => f.acqId === acqId && f.status === 'Proposed').length + s.proposals.filter((x) => x.acqId === acqId && x.status === 'Pending').length);
  if (!acq) return null;
  const base = `/acquisitions/${acqId}`;
  const is = (p: string) => path === base + p || path.startsWith(base + p + '/');
  const p = { onNavigate };
  return (
    <Box>
      <Stack gap={2}>
        <NavItem {...p} href={base} icon={<IconLayoutDashboard size={17} stroke={1.7} />} label="Overview" active={path === base} />
        <NavItem {...p} href={`${base}/inbox`} icon={<IconInbox size={17} stroke={1.7} />} label="Atlas review" count={review} countColor="violet" active={is('/inbox') || is('/intake')} />
        <NavItem {...p} href={`${base}/research`} icon={<IconRadar size={17} stroke={1.7} />} label="Target intelligence" active={is('/research')} />
        <NavItem {...p} href={`${base}/atlas`} icon={<IconSparkles size={17} stroke={1.7} />} label="Ask Atlas" active={is('/atlas')} />
      </Stack>
      {withPhases && (
        <>
          <Heading>Deal phases</Heading>
          <Stack gap={2}>
            {PHASES.map((ph) => (
              <NavItem {...p} key={ph.key} href={`${base}/phase/${ph.key}`} active={is(`/phase/${ph.key}`)} icon={<PhaseGlyph status={acq.phases[ph.key].status} progress={acq.phases[ph.key].progress} />} label={`${ph.n}. ${ph.short}`} />
            ))}
          </Stack>
        </>
      )}
      <Heading>Diligence & execution</Heading>
      <Stack gap={2}>
        <NavItem {...p} href={`${base}/workstreams`} icon={<IconColumns3 size={17} stroke={1.7} />} label="Workstreams" active={is('/workstreams')} />
        <NavItem {...p} href={`${base}/work`} icon={<IconListCheck size={17} stroke={1.7} />} label="Work items" count={overdue} countColor="red" active={is('/work')} />
        <NavItem {...p} href={`${base}/findings`} icon={<IconAlertTriangle size={17} stroke={1.7} />} label="Findings" count={openFindings} countColor={proposed ? 'violet' : undefined} active={is('/findings')} />
        <NavItem {...p} href={`${base}/risks`} icon={<IconShieldExclamation size={17} stroke={1.7} />} label="Risk register" count={openRisks} active={is('/risks')} />
        <NavItem {...p} href={`${base}/decisions`} icon={<IconGavel size={17} stroke={1.7} />} label="Decisions" count={pendingDecisions} countColor="blue" active={is('/decisions')} />
      </Stack>
      <Heading>Materials & people</Heading>
      <Stack gap={2}>
        <NavItem {...p} href={`${base}/documents`} icon={<IconFiles size={17} stroke={1.7} />} label="Documents" active={is('/documents')} />
        <NavItem {...p} href={`${base}/deliverables`} icon={<IconFileText size={17} stroke={1.7} />} label="Deliverables" active={is('/deliverables')} />
        <NavItem {...p} href={`${base}/team`} icon={<IconUsers size={17} stroke={1.7} />} label="Deal team" active={is('/team')} />
        <NavItem {...p} href={`${base}/activity`} icon={<IconActivity size={17} stroke={1.7} />} label="Activity & audit" active={is('/activity')} />
      </Stack>
    </Box>
  );
}
