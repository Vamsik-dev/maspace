'use client';

import { Button, Modal, NumberInput, Select, Stack, TextInput, Textarea, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/lib/store';

const STRATEGIES = [
  'Platform add-on: route density in an existing market',
  'New geography: entry point for future tuck-ins',
  'New service line: add capability to existing customers',
  'Tuck-in to an existing portfolio company',
];

export function NewAcquisitionButton() {
  const [open, setOpen] = useState(false);
  const add = useStore((s) => s.addAcquisition);
  const router = useRouter();
  const [v, setV] = useState({ name: '', industry: 'HVAC services', hq: '', revenue: 10 as number | string, ebitda: 1.5 as number | string, strategy: STRATEGIES[0], thesis: '' });
  const valid = v.name.trim() && v.hq.trim() && Number(v.revenue) > 0 && Number(v.ebitda) > 0;
  return (
    <>
      <Button leftSection={<IconPlus size={14} />} onClick={() => setOpen(true)}>
        New acquisition
      </Button>
      <Modal opened={open} onClose={() => setOpen(false)} title={<Text fw={600}>New acquisition</Text>} size="md">
        <Stack gap="sm">
          <TextInput size="sm" label="Target name" placeholder="e.g. Hill Country Electric" value={v.name} onChange={(e) => setV({ ...v, name: e.currentTarget.value })} data-autofocus />
          <Group grow>
            <Select size="sm" label="Industry" data={['HVAC services', 'Plumbing services', 'Electrical services', 'Fire / life safety', 'Landscaping', 'Facilities services', 'Specialty contracting', 'Environmental services', 'Industrial services']} value={v.industry} onChange={(x) => setV({ ...v, industry: x ?? v.industry })} />
            <TextInput size="sm" label="Headquarters" placeholder="City, State" value={v.hq} onChange={(e) => setV({ ...v, hq: e.currentTarget.value })} />
          </Group>
          <Group grow>
            <NumberInput size="sm" label="Revenue ($M)" decimalScale={1} min={0} value={v.revenue} onChange={(x) => setV({ ...v, revenue: x })} />
            <NumberInput size="sm" label="EBITDA ($M, seller)" decimalScale={2} min={0} value={v.ebitda} onChange={(x) => setV({ ...v, ebitda: x })} />
          </Group>
          <Select size="sm" label="Acquisition strategy" data={STRATEGIES} value={v.strategy} onChange={(x) => setV({ ...v, strategy: x ?? v.strategy })} />
          <Textarea size="sm" label="Initial thesis" autosize minRows={2} placeholder="Why this target, in one or two sentences" value={v.thesis} onChange={(e) => setV({ ...v, thesis: e.currentTarget.value })} />
          <Text size="xs" c="dimmed">
            The acquisition starts in Strategy & Target Screening. Playbook screening tasks and standard thesis assumptions are created automatically.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!valid}
              onClick={() => {
                const id = add({ ...v, revenue: Number(v.revenue), ebitda: Number(v.ebitda) });
                setOpen(false);
                router.push(`/acquisitions/${id}`);
              }}
            >
              Create acquisition
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
