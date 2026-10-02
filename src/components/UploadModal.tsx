'use client';

import { Box, Button, Group, Modal, Stack, Text, UnstyledButton, FileButton, Badge } from '@mantine/core';
import { IconUpload, IconShieldCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { UPLOAD_CATALOG } from '@/data/uploads';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { DocIcon } from './ui';

export function UploadModal({ opened, onClose, acqId }: { opened: boolean; onClose: () => void; acqId: string }) {
  const upload = useStore((s) => s.uploadDocument);
  const existing = useStore(useShallow((s) => s.documents.filter((d) => d.acqId === acqId).map((d) => d.name)));
  const go = (catalogId: string | null, name?: string) => {
    upload(acqId, catalogId, name);
    onClose();
    notifications.show({ title: 'Uploading', message: 'Scanning, extracting text and indexing. Atlas will check it against open findings.', color: 'ink' });
  };
  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={600}>Upload documents</Text>} size="lg">
      <Stack gap="md">
        <Box p="sm" style={{ background: '#fafaf9', border: '1px solid var(--app-border)', borderRadius: 6 }}>
          <Text className="label" mb={6}>
            Processing pipeline
          </Text>
          <Group gap={6}>
            {['Upload', 'Security scan', 'Encrypted storage', 'Text & table extraction', 'Page-level indexing', 'Atlas review'].map((s, i) => (
              <Group key={s} gap={6}>
                {i > 0 && <Text c="dimmed">→</Text>}
                <Text size="xs">{s}</Text>
              </Group>
            ))}
          </Group>
        </Box>
        <Box>
          <Text size="sm" fw={600} mb={4}>
            New in the seller data room
          </Text>
          <Text size="xs" c="dimmed" mb="sm">
            Synthetic responses to open information requests. Upload one to see Atlas propose a finding for review.
          </Text>
          <Stack gap={6}>
            {UPLOAD_CATALOG.map((c) => {
              const done = existing.includes(c.doc.name);
              return (
                <UnstyledButton key={c.id} onClick={() => !done && go(c.id)} disabled={done} className="row-link" p="sm" style={{ border: '1px solid var(--app-border)', borderRadius: 6, opacity: done ? 0.5 : 1 }}>
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <DocIcon type={c.doc.type} size={20} />
                      <Box>
                        <Text size="sm" fw={500}>
                          {c.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {c.from}
                        </Text>
                      </Box>
                    </Group>
                    {done ? <Badge color="gray">Uploaded</Badge> : <Badge variant="filled" color="ink.8">Upload</Badge>}
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Box>
        <Box p="md" style={{ border: '1px dashed #d6d3d1', borderRadius: 8, textAlign: 'center' }}>
          <FileButton onChange={(f) => f && go(null, f.name)} accept=".pdf,.docx,.xlsx,.pptx,.csv">
            {(props) => (
              <Button {...props} variant="default" leftSection={<IconUpload size={14} />}>
                Choose a file from your computer
              </Button>
            )}
          </FileButton>
          <Text size="xs" c="dimmed" mt={6}>
            Prototype: the file never leaves your browser and its contents are not read.
          </Text>
        </Box>
        <Group gap={6}>
          <IconShieldCheck size={14} color="var(--app-muted)" />
          <Text size="xs" c="dimmed">
            In the product: tenant-isolated encrypted storage, signed URLs, and retrieval scoped to this acquisition&apos;s permissions. Customer data is never used for model training.
          </Text>
        </Group>
      </Stack>
    </Modal>
  );
}
