'use client';

import { ActionIcon, Badge, Box, Button, Drawer, Group, Loader, ScrollArea, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { IconArrowRight, IconArrowUpRight, IconSend, IconTrash, IconMaximize } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ask, SUGGESTED, type AtlasAnswer, type AtlasBlock } from '@/lib/atlas';
import { useStore } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import { AtlasAvatar, Claim, ClaimTag, CLAIM_META } from './ui';

function BlockView({ b, acqId, onNavigate }: { b: AtlasBlock; acqId: string; onNavigate?: () => void }) {
  if (b.type === 'heading')
    return (
      <Text className="label" mt={6}>
        {b.text}
      </Text>
    );
  if (b.type === 'note')
    return (
      <Text size="xs" c="dimmed" fs="italic">
        {b.text}
      </Text>
    );
  if (b.type === 'claim') {
    const c = b.claim;
    return (
      <Claim kind={c.kind} citations={c.citations} calculation={c.calculation} comparedWith={c.comparedWith} acqId={acqId}>
        {c.text}{' '}
        {c.href && (
          <Text component={Link} href={c.href} onClick={onNavigate} span size="xs" c="ink.8" fw={500}>
            Open <IconArrowUpRight size={11} style={{ verticalAlign: -1 }} />
          </Text>
        )}
      </Claim>
    );
  }
  const kind = b.items.find((i) => i.kind)?.kind;
  return (
    <Box pl={10} style={{ borderLeft: kind ? `2px solid ${CLAIM_META[kind].color}` : undefined }}>
      {(b.title || kind) && (
        <Group gap={8} mb={4}>
          {kind && <ClaimTag kind={kind} />}
          {b.title && (
            <Text size="xs" fw={600} c="dimmed">
              {kind ? '· ' : ''}
              {b.title}
            </Text>
          )}
        </Group>
      )}
      {b.items.length === 0 && (
        <Text size="xs" c="dimmed">
          Nothing here.
        </Text>
      )}
      <Stack gap={0}>
        {b.items.map((it, i) => {
          const inner = (
            <Group gap={8} wrap="nowrap" align="flex-start" px={6} py={5} className="row-link">
              <Text size="sm" style={{ flex: 1 }} lh={1.45}>
                {it.text}
              </Text>
              {it.meta && (
                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  {it.meta}
                </Text>
              )}
            </Group>
          );
          return it.href ? (
            <Link key={i} href={it.href} onClick={onNavigate}>
              {inner}
            </Link>
          ) : (
            <Box key={i}>{inner}</Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function AnswerView({ a, acqId, onAsk, onNavigate }: { a: AtlasAnswer; acqId: string; onAsk: (q: string) => void; onNavigate?: () => void }) {
  return (
    <Stack gap={10}>
      <Group justify="flex-end">
        <Box px={12} py={7} style={{ background: '#f5f5f4', borderRadius: 10, maxWidth: '85%' }}>
          <Text size="sm">{a.question}</Text>
        </Box>
      </Group>
      <Group gap={10} align="flex-start" wrap="nowrap">
        <AtlasAvatar size={24} />
        <Stack gap={10} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500}>
            {a.intro}
          </Text>
          {a.blocks.map((b, i) => (
            <BlockView key={i} b={b} acqId={acqId} onNavigate={onNavigate} />
          ))}
          {a.actions.length > 0 && (
            <Group gap={6}>
              {a.actions.map((x) => (
                <Button key={x.href} component={Link} href={x.href} onClick={onNavigate} variant="light" rightSection={<IconArrowRight size={13} />}>
                  {x.label}
                </Button>
              ))}
            </Group>
          )}
          <Group gap={6}>
            {a.followUps.map((f) => (
              <Badge key={f} variant="default" style={{ cursor: 'pointer', fontWeight: 400 }} onClick={() => onAsk(f)}>
                {f}
              </Badge>
            ))}
          </Group>
          <Text size="xs" c="dimmed">
            Scope: {a.scope}
          </Text>
        </Stack>
      </Group>
    </Stack>
  );
}

export function AtlasConversation({ acqId, onNavigate, autoPrompt }: { acqId: string; onNavigate?: () => void; autoPrompt?: string | null }) {
  const thread = useUi((s) => s.threads[acqId]) ?? [];
  const push = useUi((s) => s.pushAnswer);
  const clear = useUi((s) => s.clearThread);
  const acq = useStore((s) => s.acquisitions.find((a) => a.id === acqId));
  const docCount = useStore((s) => s.documents.filter((d) => d.acqId === acqId).length);
  const [q, setQ] = useState('');
  const [thinking, setThinking] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const handled = useRef<string | null>(null);

  const submit = (question: string) => {
    if (!question.trim() || thinking) return;
    setQ('');
    setThinking(question);
    setTimeout(() => {
      push(acqId, ask(question, acqId));
      setThinking(null);
    }, 700);
  };

  useEffect(() => {
    if (!autoPrompt) {
      handled.current = null;
      return;
    }
    if (handled.current !== autoPrompt) {
      handled.current = autoPrompt;
      submit(autoPrompt);
      useUi.getState().consumePrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrompt]);

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
  }, [thread.length, thinking]);

  return (
    <Stack h="100%" gap={0}>
      <ScrollArea style={{ flex: 1 }} viewportRef={viewport} px="md" py="md">
        {thread.length === 0 && !thinking && (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Atlas knows this acquisition: its thesis, phase, team, {docCount} documents, findings, risks, decisions and Meridian&apos;s prior deals. Every
              statement is labeled as fact, interpretation, recommendation or decision, and facts link to their source.
            </Text>
            <Text className="label" mt="xs">
              Try
            </Text>
            {SUGGESTED.map((s) => (
              <UnstyledButton key={s} onClick={() => submit(s)} className="row-link" px={8} py={6}>
                <Group gap={8}>
                  <IconArrowRight size={13} color="var(--app-muted)" />
                  <Text size="sm">{s}</Text>
                </Group>
              </UnstyledButton>
            ))}
          </Stack>
        )}
        <Stack gap="xl">
          {thread.map((a, i) => (
            <AnswerView key={i} a={a} acqId={acqId} onAsk={submit} onNavigate={onNavigate} />
          ))}
          {thinking && (
            <Stack gap={8}>
              <Group justify="flex-end">
                <Box px={12} py={7} style={{ background: '#f5f5f4', borderRadius: 10 }}>
                  <Text size="sm">{thinking}</Text>
                </Box>
              </Group>
              <Group gap={8}>
                <Loader size={14} color="violet" />
                <Text size="xs" c="dimmed">
                  Reading {acq?.name} findings, decisions and {docCount} documents…
                </Text>
              </Group>
            </Stack>
          )}
        </Stack>
      </ScrollArea>
      <Box p="sm" style={{ borderTop: '1px solid var(--app-border)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(q);
          }}
        >
          <Group gap={6} wrap="nowrap">
            <TextInput
              size="sm"
              style={{ flex: 1 }}
              placeholder={`Ask about ${acq?.name ?? 'this acquisition'}…`}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
              rightSection={
                <ActionIcon type="submit" variant="subtle" disabled={!q.trim()}>
                  <IconSend size={15} />
                </ActionIcon>
              }
            />
            {thread.length > 0 && (
              <ActionIcon variant="subtle" color="gray" onClick={() => clear(acqId)} title="Clear conversation">
                <IconTrash size={15} />
              </ActionIcon>
            )}
          </Group>
        </form>
        <Text size="xs" c="dimmed" mt={6}>
          Prototype: Atlas is simulated from structured demo data. Humans approve anything material.
        </Text>
      </Box>
    </Stack>
  );
}

export function AtlasDrawer({ acqId }: { acqId: string }) {
  const open = useUi((s) => s.atlasOpen);
  const close = useUi((s) => s.closeAtlas);
  const prompt = useUi((s) => s.atlasPrompt);
  return (
    <Drawer
      opened={open}
      onClose={close}
      position="right"
      size={520}
      padding={0}
      withOverlay={false}
      shadow="xl"
      title={
        <Group gap={8}>
          <AtlasAvatar size={22} />
          <Text fw={600} size="sm">
            Ask Atlas
          </Text>
          <ActionIcon component={Link} href={`/acquisitions/${acqId}/atlas`} onClick={close} variant="subtle" color="gray" size="sm" title="Open full screen">
            <IconMaximize size={14} />
          </ActionIcon>
        </Group>
      }
      styles={{ header: { borderBottom: '1px solid var(--app-border)', paddingInline: 16, minHeight: 48 }, body: { height: 'calc(100% - 49px)' }, content: { display: 'flex', flexDirection: 'column' } }}
    >
      <AtlasConversation acqId={acqId} onNavigate={close} autoPrompt={prompt} />
    </Drawer>
  );
}
