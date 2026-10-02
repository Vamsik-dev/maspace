'use client';

import { Box, Button, Group, Stack, Text, Textarea } from '@mantine/core';
import { useState } from 'react';
import type { Comment } from '@/lib/types';
import { useStore } from '@/lib/store';
import { PersonAvatar, personName } from './ui';
import { fmtDate } from '@/lib/atlas';

function renderBody(body: string) {
  return body.split(/(@[A-Z][a-z]+)/g).map((part, i) =>
    part.startsWith('@') ? (
      <Text key={i} span c="ink.8" fw={500}>
        {part}
      </Text>
    ) : (
      part
    ),
  );
}

export function Comments({ type, id, comments }: { type: 'work' | 'finding' | 'risk' | 'decision'; id: string; comments: Comment[] }) {
  const add = useStore((s) => s.addComment);
  const me = useStore((s) => s.currentUserId);
  const [v, setV] = useState('');
  return (
    <Stack gap="sm">
      {comments.length === 0 && (
        <Text size="sm" c="dimmed">
          No discussion yet.
        </Text>
      )}
      {comments.map((c) => (
        <Group key={c.id} gap={10} align="flex-start" wrap="nowrap">
          <PersonAvatar id={c.authorId} size={24} />
          <Box style={{ flex: 1 }}>
            <Group gap={6}>
              <Text size="sm" fw={600}>
                {personName(c.authorId)}
              </Text>
              <Text size="xs" c="dimmed">
                {fmtDate(c.at.slice(0, 10))} {c.at.slice(11, 16)}
              </Text>
            </Group>
            <Text size="sm" lh={1.5}>
              {renderBody(c.body)}
            </Text>
          </Box>
        </Group>
      ))}
      <Group gap={10} align="flex-start" wrap="nowrap">
        <PersonAvatar id={me} size={24} />
        <Box style={{ flex: 1 }}>
          <Textarea size="sm" autosize minRows={1} placeholder="Comment, or @mention a teammate…" value={v} onChange={(e) => setV(e.currentTarget.value)} />
          {v.trim() && (
            <Group justify="flex-end" mt={6}>
              <Button
                onClick={() => {
                  add(type, id, v.trim());
                  setV('');
                }}
              >
                Comment
              </Button>
            </Group>
          )}
        </Box>
      </Group>
    </Stack>
  );
}
