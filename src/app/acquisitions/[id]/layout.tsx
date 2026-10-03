'use client';

import { Box, Button, Group, ScrollArea, Text, Tooltip } from '@mantine/core';
import { ORGS } from '@/data/playbooks';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { TopBar } from '@/components/Chrome';
import { AtlasDrawer } from '@/components/Atlas';
import { DealNav } from '@/components/DealNav';
import { NextStep } from '@/components/PhaseDeliverables';
import { useStore } from '@/lib/store';
import { PHASES, DEMO_TODAY, fmtM } from '@/lib/meta';
import { Empty, PersonAvatar, Pill } from '@/components/ui';

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Text className="label" fz={10}>
        {label}
      </Text>
      <Text fz={15} fw={600} className="num" lh={1.3}>
        {value}
      </Text>
    </Box>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const path = usePathname();
  const acq = useStore((s) => s.acquisitions.find((a) => a.id === id));
  const orgId = useStore((s) => s.currentOrgId);
  const setOrg = useStore((s) => s.setOrg);

  if (!acq)
    return (
      <>
        <TopBar />
        <Empty title="Acquisition not found" action={<Link href="/">Back to portfolio</Link>} />
      </>
    );

  if (acq.orgId !== orgId)
    return (
      <>
        <TopBar />
        <Box maw={560} mx="auto" mt={80} p="xl" className="panel">
          <Text fw={600} fz={18} mb={6}>
            This acquisition belongs to another organization
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            Each customer is a separate tenant. Deals, documents, people and acquisition memory are never visible across organizations, and Atlas never retrieves from another tenant.
          </Text>
          <Button variant="default" onClick={() => setOrg(acq.orgId)}>
            Prototype only: switch to {ORGS.find((o) => o.id === acq.orgId)?.name}
          </Button>
        </Box>
      </>
    );

  const base = `/acquisitions/${id}`;
  const closeIn = acq.targetClose ? differenceInCalendarDays(new Date(acq.targetClose), new Date(DEMO_TODAY)) : null;

  return (
    <Box h="100dvh" style={{ display: 'flex', flexDirection: 'column' }}>
      <TopBar acqId={id} />
      {/* Deal record header */}
      <Box px={{ base: 'md', md: 'lg' }} pt={12} pb={12} style={{ background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)', flexShrink: 0 }} className="no-print">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm" mb={10}>
          <Box style={{ minWidth: 0 }}>
            <Group gap={6} mb={2}>
              <Text component={Link} href="/" fz={12} c="dimmed" fw={500}>
                Portfolio
              </Text>
              <IconChevronRight size={12} color="#94a3b8" />
              <Text fz={12} c="dimmed" fw={500}>
                {acq.codename}
              </Text>
            </Group>
            <Group gap={10} wrap="wrap">
              <Text component={Link} href={base} fz={20} fw={600} style={{ letterSpacing: '-0.015em' }}>
                {acq.name}
              </Text>
              <Pill color={acq.status === 'Active' ? 'teal' : 'gray'}>{acq.status}</Pill>
              <Text fz={12.5} c="dimmed">
                {acq.target.industry} · {acq.target.hq}
              </Text>
              <NextStep acq={acq} />
            </Group>
          </Box>
          <Group gap="xl" wrap="nowrap" visibleFrom="sm">
            <Metric label="Revenue" value={fmtM(acq.target.revenue)} />
            <Metric label="Adj. EBITDA" value={fmtM(acq.target.ebitda)} />
            <Tooltip label={acq.evBasis} multiline w={260}>
              <Box>
                <Metric label="Working EV" value={fmtM(acq.ev)} />
              </Box>
            </Tooltip>
            <Metric label="Target close" value={closeIn !== null ? `${closeIn}d` : '—'} />
            <Group gap={-6} visibleFrom="lg">
              {acq.team.slice(0, 6).map((m) => (
                <PersonAvatar key={m.personId} id={m.personId} size={28} />
              ))}
              {acq.team.length > 6 && (
                <Text fz={11} c="dimmed" ml={10}>
                  +{acq.team.length - 6}
                </Text>
              )}
            </Group>
          </Group>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <nav className="stepper" style={{ minWidth: 760 }} aria-label="Deal phases">
            {PHASES.map((p) => {
              const ph = acq.phases[p.key];
              const current = path.startsWith(`${base}/phase/${p.key}`);
              return (
                <Link key={p.key} href={`${base}/phase/${p.key}`} className="step" data-status={ph.status} data-current={current || undefined} title={p.label}>
                  {p.short}
                  <small>{ph.status === 'complete' ? '✓' : ph.status === 'active' ? `${ph.progress}%` : ''}</small>
                </Link>
              );
            })}
          </nav>
        </Box>
      </Box>
      <Box style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box w={240} style={{ borderRight: '1px solid var(--app-border)', background: 'var(--app-sidebar)', flexShrink: 0 }} className="no-print" visibleFrom="md">
          <ScrollArea h="100%" px={10} py={14}>
            <DealNav acqId={id} withPhases={false} />
          </ScrollArea>
        </Box>
        <ScrollArea style={{ flex: 1, minWidth: 0 }} id="workspace-scroll">
          <Box px={{ base: 'md', md: 32 }} py={{ base: 'md', md: 28 }} maw={1360}>
            {children}
          </Box>
        </ScrollArea>
      </Box>
      <AtlasDrawer acqId={id} />
    </Box>
  );
}
