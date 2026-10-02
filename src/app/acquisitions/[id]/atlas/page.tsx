'use client';

import { Box, Group, Stack, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { AtlasConversation } from '@/components/Atlas';
import { CLAIM_META, ClaimTag } from '@/components/ui';
import type { ClaimKind } from '@/lib/atlas';

export default function AtlasPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <Stack gap="md" h="calc(100vh - 110px)">
      <Group justify="space-between" align="flex-end">
        <Box>
          <Text className="label">Intelligence</Text>
          <Text fz={22} fw={650}>
            Ask Atlas
          </Text>
          <Text size="sm" c="dimmed" maw={720}>
            Atlas works inside this acquisition — not a blank chat window. It answers from the deal&apos;s documents, findings, decisions and Meridian&apos;s prior acquisitions, and shows its evidence.
          </Text>
        </Box>
        <Stack gap={4}>
          {(Object.keys(CLAIM_META) as ClaimKind[]).map((k) => (
            <Group key={k} gap={6}>
              <Box w={10} h={2} style={{ background: CLAIM_META[k].color }} />
              <ClaimTag kind={k} />
            </Group>
          ))}
        </Stack>
      </Group>
      <Box style={{ flex: 1, minHeight: 0, background: 'white', border: '1px solid var(--app-border)', borderRadius: 8, overflow: 'hidden' }}>
        <Box maw={860} mx="auto" h="100%">
          <AtlasConversation acqId={id} />
        </Box>
      </Box>
    </Stack>
  );
}
