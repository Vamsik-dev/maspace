'use client';

import { ActionIcon, Box, Burger, Button, Drawer, Group, Menu, Modal, SegmentedControl, Stack, Text, Textarea, UnstyledButton, Badge, Avatar, Tooltip, ScrollArea } from '@mantine/core';
import { IconChevronDown, IconMessageCircle, IconRefresh, IconSparkles, IconSearch, IconAlertTriangle, IconGavel, IconFileText, IconBuildingSkyscraper, IconShieldExclamation, IconListCheck, IconFiles } from '@tabler/icons-react';
import { Spotlight, spotlight, type SpotlightActionData } from '@mantine/spotlight';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { PEOPLE, personById } from '@/data/people';
import { ORGS } from '@/data/playbooks';
import { useOrg } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import { wsLabel } from '@/lib/meta';
import { DealNav } from './DealNav';

export function Logo({ dark = true }: { dark?: boolean }) {
  const org = useOrg();
  return (
    <Group gap={10} wrap="nowrap">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <rect width="26" height="26" rx="6" fill="#3a5fd1" />
        <path d="M6 18.5V8l7 6.2L20 8v10.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="20" cy="18.5" r="1.9" fill="#c9a24b" />
      </svg>
      <Box lh={1.05} visibleFrom={dark ? 'sm' : undefined}>
        <Text fw={600} fz={13.5} c={dark ? 'white' : 'dark'} style={{ letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
          {org.name}
        </Text>
        <Text fz={10.5} c={dark ? '#8fa2c0' : 'dimmed'} fw={500} style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {org.vertical}
        </Text>
      </Box>
    </Group>
  );
}

export function UserSwitcher() {
  const me = useStore((s) => s.currentUserId);
  const orgId = useStore((s) => s.currentOrgId);
  const set = useStore((s) => s.setCurrentUser);
  const p = personById(me)!;
  return (
    <Menu position="bottom-end" width={290} shadow="md">
      <Menu.Target>
        <UnstyledButton px={6} py={4} style={{ borderRadius: 7 }} className="topnav-btn">
          <Group gap={8} wrap="nowrap">
            <Avatar size={26} radius="xl" color={p.color} variant="filled" fz={10.5}>
              {p.initials}
            </Avatar>
            <Box visibleFrom="xl" lh={1.15} style={{ whiteSpace: 'nowrap' }}>
              <Text fz={12.5} fw={600} c="white">
                {p.name}
              </Text>
              <Text fz={10.5} c="#8fa2c0">
                {p.title}
              </Text>
            </Box>
            <IconChevronDown size={13} color="#8fa2c0" />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>View the workspace as… (prototype)</Menu.Label>
        <ScrollArea.Autosize mah={420}>
          {PEOPLE.filter((x) => x.orgId === orgId).map((x) => (
            <Menu.Item
              key={x.id}
              onClick={() => set(x.id)}
              leftSection={
                <Avatar size={22} radius="xl" color={x.color} fz={9} variant={x.org === 'Advisor' ? 'outline' : 'light'}>
                  {x.initials}
                </Avatar>
              }
              rightSection={x.id === me ? <Badge size="xs">Current</Badge> : x.org === 'Advisor' ? <Text fz={10} c="dimmed">Advisor</Text> : null}
            >
              <Text size="xs" fw={500}>
                {x.name}
              </Text>
              <Text fz={10.5} c="dimmed">
                {x.title}
              </Text>
            </Menu.Item>
          ))}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}

export function OrgSwitcher() {
  const org = useOrg();
  const setOrg = useStore((s) => s.setOrg);
  const router = useRouter();
  return (
    <Menu position="bottom-start" width={340}>
      <Menu.Target>
        <UnstyledButton aria-label="Switch organization" className="topnav-btn" px={6}>
          <Group gap={8} wrap="nowrap">
            <Logo />
            <IconChevronDown size={13} color="#8fa2c0" />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Organization (separate customers in the demo)</Menu.Label>
        {ORGS.map((o) => (
          <Menu.Item
            key={o.id}
            onClick={() => {
              setOrg(o.id);
              router.push('/');
            }}
            rightSection={o.id === org.id ? <Badge size="xs">Current</Badge> : null}
          >
            <Text size="sm" fw={600}>
              {o.name}
            </Text>
            <Text fz={11} c="dimmed">
              {o.vertical}
            </Text>
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Text fz={11} c="dimmed" px="sm" py={6}>
          Each organization is its own tenant: deals, documents, people, playbook and acquisition memory never cross between them.
        </Text>
      </Menu.Dropdown>
    </Menu>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const all = useStore();
  const orgAcq = all.acquisitions.filter((a) => a.orgId === all.currentOrgId);
  const ids = new Set(orgAcq.map((a) => a.id));
  const s = {
    acquisitions: orgAcq,
    findings: all.findings.filter((x) => ids.has(x.acqId)),
    decisions: all.decisions.filter((x) => ids.has(x.acqId)),
    risks: all.risks.filter((x) => ids.has(x.acqId)),
    documents: all.documents.filter((x) => ids.has(x.acqId)),
    deliverables: all.deliverables.filter((x) => ids.has(x.acqId)),
    work: all.work.filter((x) => ids.has(x.acqId)),
  };
  const actions: SpotlightActionData[] = useMemo(() => {
    const acqName = (id: string) => s.acquisitions.find((a) => a.id === id)?.name ?? '';
    const go = (href: string) => () => router.push(href);
    return [
      ...s.acquisitions.map((a) => ({ id: a.id, label: a.name, description: `Acquisition · ${a.stageLabel}`, onClick: go(`/acquisitions/${a.id}`), leftSection: <IconBuildingSkyscraper size={17} stroke={1.6} /> })),
      ...s.findings.filter((f) => f.status !== 'Dismissed').map((f) => ({ id: f.id, label: f.title, description: `Finding · ${f.severity} · ${wsLabel(f.workstream)} · ${acqName(f.acqId)}`, onClick: go(`/acquisitions/${f.acqId}/findings/${f.id}`), leftSection: <IconAlertTriangle size={17} stroke={1.6} /> })),
      ...s.decisions.map((d) => ({ id: d.id, label: d.question, description: `Decision · ${d.status} · ${acqName(d.acqId)}`, onClick: go(`/acquisitions/${d.acqId}/decisions/${d.id}`), leftSection: <IconGavel size={17} stroke={1.6} /> })),
      ...s.risks.map((r) => ({ id: r.id, label: r.title, description: `Risk · ${r.severity} · ${acqName(r.acqId)}`, onClick: go(`/acquisitions/${r.acqId}/risks?risk=${r.id}`), leftSection: <IconShieldExclamation size={17} stroke={1.6} /> })),
      ...s.documents.map((d) => ({ id: d.id, label: d.name, description: `Document · ${d.category} · ${acqName(d.acqId)}`, keywords: d.tags, onClick: go(`/acquisitions/${d.acqId}/documents/${d.id}`), leftSection: <IconFiles size={17} stroke={1.6} /> })),
      ...s.deliverables.map((d) => ({ id: d.id, label: d.title, description: `Deliverable · ${d.status}`, onClick: go(`/acquisitions/${d.acqId}/deliverables/${d.id}`), leftSection: <IconFileText size={17} stroke={1.6} /> })),
      ...s.work.map((w) => ({ id: w.id, label: w.title, description: `Work item · ${w.status} · ${acqName(w.acqId)}`, onClick: go(`/acquisitions/${w.acqId}/work?item=${w.id}`), leftSection: <IconListCheck size={17} stroke={1.6} /> })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all.acquisitions, all.findings, all.decisions, all.risks, all.documents, all.deliverables, all.work, all.currentOrgId, router]);
  return (
    <Spotlight
      actions={actions}
      limit={9}
      shortcut={['mod + K', '/']}
      nothingFound="Nothing matches. Try a customer, clause, person or workstream."
      highlightQuery
      scrollable
      maxHeight={460}
      searchProps={{ leftSection: <IconSearch size={18} stroke={1.6} />, placeholder: 'Search acquisitions, findings, decisions, documents…' }}
      radius="lg"
    />
  );
}

export function FeedbackModal() {
  const open = useUi((s) => s.feedbackOpen);
  const setOpen = useUi((s) => s.setFeedbackOpen);
  const add = useStore((s) => s.addFeedback);
  const path = usePathname();
  const [note, setNote] = useState('');
  const [rating, setRating] = useState<string>('Partly');
  return (
    <Modal opened={open} onClose={() => setOpen(false)} title={<Text fw={600}>Feedback on this screen</Text>} size="lg">
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          Screen: <code>{path}</code>. Notes stay in this browser and can be exported from the Feedback page.
        </Text>
        <Box>
          <Text size="sm" fw={500} mb={6}>
            Does this reflect how your team actually works?
          </Text>
          <SegmentedControl size="xs" value={rating} onChange={setRating} data={['Matches how we work', 'Partly', 'Not how we work']} />
        </Box>
        <Textarea
          autosize
          minRows={4}
          size="sm"
          label="What's wrong, missing, or unnecessary?"
          placeholder="e.g. We'd never call this a 'finding' — we'd call it an issue. Also, the QoE provider would own this, not the controller…"
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
        <Group justify="space-between">
          <Button component={Link} href="/feedback" variant="subtle" color="gray" onClick={() => setOpen(false)}>
            View all feedback
          </Button>
          <Button
            size="sm"
            disabled={!note.trim()}
            onClick={() => {
              add({ screen: document.title, path, note, rating: rating as never });
              setNote('');
              setOpen(false);
              notifications.show({ message: 'Feedback saved', color: 'ink' });
            }}
          >
            Save feedback
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function TopBar({ acqId }: { acqId?: string }) {
  const path = usePathname();
  const openAtlas = useUi((s) => s.openAtlas);
  const setFb = useUi((s) => s.setFeedbackOpen);
  const reset = useStore((s) => s.reset);
  const fbCount = useStore((s) => s.feedback.length);
  const [menu, setMenu] = useState(false);
  const nav = [
    { href: '/', label: 'Portfolio', active: path === '/' || path.startsWith('/acquisitions') || path.startsWith('/new') },
    { href: '/pipeline', label: 'Pipeline', active: path.startsWith('/pipeline') },
    { href: '/memory', label: 'Memory', active: path.startsWith('/memory') },
    { href: '/playbooks', label: 'Playbooks', active: path.startsWith('/playbooks') },
    { href: '/guide', label: 'Guide', active: path.startsWith('/guide') },
  ];
  return (
    <>
      <Group h={56} px={{ base: 'md', md: 'lg' }} justify="space-between" wrap="nowrap" gap="md" style={{ background: 'var(--app-navy)', borderBottom: '1px solid #000814', flexShrink: 0 }} className="no-print">
        <Group gap="lg" wrap="nowrap">
          <Burger opened={menu} onClick={() => setMenu(true)} size="sm" color="#c3cee0" hiddenFrom="md" aria-label="Open navigation" />
          <OrgSwitcher />
          <Group gap={2} visibleFrom="md" wrap="nowrap">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="topnav-btn" data-active={n.active || undefined}>
                {n.label}
              </Link>
            ))}
          </Group>
        </Group>
        <UnstyledButton className="search-trigger" onClick={() => spotlight.open()} visibleFrom="xl" aria-label="Search" style={{ width: 280 }}>
          <IconSearch size={14} />
          <span style={{ flex: 1 }}>Search the deal portfolio</span>
          <span className="kbd">⌘K</span>
        </UnstyledButton>
        <Group gap={6} wrap="nowrap">
          <ActionIcon variant="subtle" color="gray.4" onClick={() => spotlight.open()} hiddenFrom="xl" aria-label="Search">
            <IconSearch size={17} />
          </ActionIcon>
          <Tooltip label="Every company, person, document and number in this prototype is fictional." multiline w={240}>
            <Box visibleFrom="xl" px={8} py={3} style={{ whiteSpace: 'nowrap', border: '1px solid rgba(201,162,75,.45)', borderRadius: 5, color: '#e3c27a', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Synthetic data
            </Box>
          </Tooltip>
          {acqId && (
            <>
              <Button variant="filled" color="ink.6" leftSection={<IconSparkles size={14} />} onClick={() => openAtlas()} radius="md" visibleFrom="sm">
                Ask Atlas
              </Button>
              <ActionIcon variant="filled" color="ink.6" onClick={() => openAtlas()} hiddenFrom="sm" aria-label="Ask Atlas">
                <IconSparkles size={15} />
              </ActionIcon>
            </>
          )}
          <Tooltip label="Leave feedback on this screen">
            <UnstyledButton visibleFrom="sm" className="topnav-btn" onClick={() => setFb(true)} aria-label="Feedback">
              <Group gap={6} wrap="nowrap">
                <IconMessageCircle size={16} />
                <Box visibleFrom="xl">Feedback</Box>
                {fbCount > 0 && (
                  <Badge size="xs" circle color="ink.5" variant="filled">
                    {fbCount}
                  </Badge>
                )}
              </Group>
            </UnstyledButton>
          </Tooltip>
          <Menu position="bottom-end">
            <Menu.Target>
              <UnstyledButton visibleFrom="sm" className="topnav-btn" aria-label="Demo settings">
                <IconRefresh size={16} />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Demo data</Menu.Label>
              <Menu.Item
                color="red"
                onClick={() => {
                  reset();
                  notifications.show({ message: 'Demo data reset. Your feedback notes were kept.' });
                }}
              >
                Reset demo to starting state
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <UserSwitcher />
        </Group>
      </Group>
      <Drawer opened={menu} onClose={() => setMenu(false)} size={290} padding="md" title={<Logo dark={false} />}>
        <Stack gap={2} mb="md">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="row-link nav-link" data-active={n.active || undefined} style={{ padding: '8px 10px', fontSize: 14, fontWeight: 500 }}>
              {n.label}
            </Link>
          ))}
        </Stack>
        {acqId && <DealNav acqId={acqId} onNavigate={() => setMenu(false)} />}
        <Stack gap={6} mt="lg">
          <Button variant="default" leftSection={<IconMessageCircle size={14} />} onClick={() => { setMenu(false); setFb(true); }}>
            Leave feedback
          </Button>
          <Button variant="subtle" color="red" onClick={() => { reset(); setMenu(false); notifications.show({ message: 'Demo data reset. Your feedback notes were kept.' }); }}>
            Reset demo data
          </Button>
        </Stack>
      </Drawer>
      <GlobalSearch />
      <FeedbackModal />
    </>
  );
}
