'use client';

import { ActionIcon, Badge, Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconDownload, IconTrash, IconCopy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { TopBar } from '@/components/Chrome';
import { PageHeader, Empty } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useUi } from '@/lib/ui-store';

export default function FeedbackPage() {
  const fb = useStore((s) => s.feedback);
  const remove = useStore((s) => s.removeFeedback);
  const setOpen = useUi((s) => s.setFeedbackOpen);
  const md = () =>
    `# Prototype feedback\n\nExported ${new Date().toLocaleString()}\n\n` +
    fb
      .slice()
      .reverse()
      .map((f) => `## ${f.path}\n\n- Rating: ${f.rating ?? '—'}\n- Time: ${new Date(f.at).toLocaleString()}\n\n${f.note}\n`)
      .join('\n');
  return (
    <Box>
      <TopBar />
      <Box px={{ base: 'md', md: 40 }} py={28} maw={960} mx="auto">
        <PageHeader
          eyebrow="SME validation"
          title="Feedback"
          description="Notes captured while using the prototype. Stored only in this browser. Export them and send them to the product team."
          right={
            <Group gap={6}>
              <Button variant="default" leftSection={<IconCopy size={14} />} disabled={!fb.length} onClick={() => navigator.clipboard.writeText(md()).then(() => notifications.show({ message: 'Copied as Markdown' }))}>
                Copy
              </Button>
              <Button
                leftSection={<IconDownload size={14} />}
                disabled={!fb.length}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(new Blob([md()], { type: 'text/markdown' }));
                  a.download = 'prototype-feedback.md';
                  a.click();
                }}
              >
                Export .md
              </Button>
            </Group>
          }
        />
        <Box style={{ background: 'white', border: '1px solid var(--app-border)', borderRadius: 8 }}>
          {fb.length === 0 ? (
            <Empty title="No feedback yet" action={<Button onClick={() => setOpen(true)}>Add a note</Button>}>
              Use the Feedback button on any screen. The screen you were on is recorded with your note.
            </Empty>
          ) : (
            <Stack gap={0}>
              {fb.map((f) => (
                <Group key={f.id} p="md" align="flex-start" wrap="nowrap" style={{ borderBottom: '1px solid #f5f5f4' }}>
                  <Box style={{ flex: 1 }}>
                    <Group gap={6} mb={4}>
                      <Text size="xs" ff="monospace" c="dimmed">
                        {f.path}
                      </Text>
                      {f.rating && <Badge size="xs" color={f.rating === 'Matches how we work' ? 'teal' : f.rating === 'Partly' ? 'yellow' : 'red'}>{f.rating}</Badge>}
                    </Group>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {f.note}
                    </Text>
                  </Box>
                  <ActionIcon variant="subtle" color="gray" onClick={() => remove(f.id)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
