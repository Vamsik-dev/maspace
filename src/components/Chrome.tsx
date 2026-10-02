'use client';

import { Box, Button, Group, Menu, Modal, SegmentedControl, Stack, Text, Textarea, UnstyledButton, Badge, Avatar } from '@mantine/core';
import { IconChevronDown, IconMessageCircle, IconRefresh, IconSparkles } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { PEOPLE, ACQUIRER, personById } from '@/data/people';
import { useStore } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import { SyntheticBadge } from './ui';

export function Logo() {
  return (
    <Group gap={8} wrap="nowrap">
      <Box w={22} h={22} style={{ borderRadius: 5, background: '#134a38', display: 'grid', placeItems: 'center' }}>
        <Text c="white" fz={12} fw={700} lh={1}>
          M
        </Text>
      </Box>
      <Text fw={600} size="sm" style={{ letterSpacing: '-0.01em' }}>
        {ACQUIRER.name}
      </Text>
    </Group>
  );
}

export function UserSwitcher() {
  const me = useStore((s) => s.currentUserId);
  const set = useStore((s) => s.setCurrentUser);
  const p = personById(me)!;
  return (
    <Menu position="bottom-end" width={280} shadow="md">
      <Menu.Target>
        <UnstyledButton px={6} py={3} style={{ borderRadius: 6 }} className="row-link">
          <Group gap={6} wrap="nowrap">
            <Avatar size={22} radius="xl" color={p.color} fz={10}>
              {p.initials}
            </Avatar>
            <Box visibleFrom="sm">
              <Text size="xs" fw={500} lh={1.1}>
                {p.name}
              </Text>
              <Text fz={10.5} c="dimmed" lh={1.1}>
                {p.function}
              </Text>
            </Box>
            <IconChevronDown size={12} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>View the workspace as… (prototype)</Menu.Label>
        {PEOPLE.map((x) => (
          <Menu.Item
            key={x.id}
            onClick={() => set(x.id)}
            leftSection={
              <Avatar size={20} radius="xl" color={x.color} fz={9} variant={x.org === 'Advisor' ? 'outline' : 'light'}>
                {x.initials}
              </Avatar>
            }
            rightSection={x.id === me ? <Badge size="xs">You</Badge> : x.org === 'Advisor' ? <Text fz={10} c="dimmed">Advisor</Text> : null}
          >
            <Text size="xs">{x.name}</Text>
            <Text fz={10.5} c="dimmed">
              {x.title}
            </Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
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
  const nav = [
    { href: '/', label: 'Portfolio', active: path === '/' || path.startsWith('/acquisitions') },
    { href: '/memory', label: 'Memory & Playbook', active: path.startsWith('/memory') },
    { href: '/guide', label: 'Prototype guide', active: path.startsWith('/guide') },
  ];
  return (
    <Group h={48} px="md" justify="space-between" wrap="nowrap" style={{ borderBottom: '1px solid var(--app-border)', background: 'white' }} className="no-print">
      <Group gap="lg" wrap="nowrap">
        <Link href="/">
          <Logo />
        </Link>
        <Group gap={2} visibleFrom="sm">
          {nav.map((n) => (
            <Button key={n.href} component={Link} href={n.href} variant={n.active ? 'light' : 'subtle'} color={n.active ? 'ink' : 'gray'} size="compact-sm" fw={500}>
              {n.label}
            </Button>
          ))}
        </Group>
      </Group>
      <Group gap={8} wrap="nowrap">
        <SyntheticBadge />
        {acqId && (
          <Button variant="light" color="violet" leftSection={<IconSparkles size={14} />} onClick={() => openAtlas()}>
            Ask Atlas
          </Button>
        )}
        <Button variant="default" leftSection={<IconMessageCircle size={14} />} onClick={() => setFb(true)}>
          Feedback{fbCount ? ` (${fbCount})` : ''}
        </Button>
        <Menu position="bottom-end">
          <Menu.Target>
            <Button variant="subtle" color="gray" px={6}>
              <IconRefresh size={14} />
            </Button>
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
      <FeedbackModal />
    </Group>
  );
}
