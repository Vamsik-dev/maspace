'use client';

import { Anchor, Box, Group, SegmentedControl, Stack, Switch, Text, Badge, Grid } from '@mantine/core';
import { IconRobot } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { fmtDate, refHref } from '@/lib/atlas';
import { PageHeader, PersonAvatar, personName, Section } from '@/components/ui';

export default function ActivityPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const [filter, setFilter] = useState('all');
  const base = `/acquisitions/${id}`;
  const list = s.activity
    .filter((a) => a.acqId === id)
    .filter((a) => (filter === 'all' ? true : filter === 'ai' ? a.actor === 'atlas' || a.actor === 'automation' : a.kind === filter))
    .sort((a, b) => b.at.localeCompare(a.at));
  const days = Array.from(new Set(list.map((a) => a.at.slice(0, 10))));

  return (
    <Stack gap="md">
      <PageHeader eyebrow="Audit" title="Activity & automation" description="Every material change — by a person, by Atlas, or by a workflow rule — is recorded here with who and when." />
      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <SegmentedControl
            size="xs"
            mb="sm"
            value={filter}
            onChange={setFilter}
            data={[
              { value: 'all', label: 'All' },
              { value: 'decision', label: 'Decisions' },
              { value: 'finding', label: 'Findings' },
              { value: 'document', label: 'Documents' },
              { value: 'ai', label: 'Atlas & automation' },
            ]}
          />
          <Box p="md" className="panel">
            <Stack gap="lg">
              {days.map((d) => (
                <Box key={d}>
                  <Text className="label" mb={8}>
                    {fmtDate(d)}
                  </Text>
                  <Stack gap={10}>
                    {list
                      .filter((a) => a.at.startsWith(d))
                      .map((a) => (
                        <Group key={a.id} gap={10} wrap="nowrap" align="flex-start">
                          <PersonAvatar id={a.actor} size={22} />
                          <Box style={{ flex: 1 }}>
                            <Text size="sm">
                              <b>{personName(a.actor)}</b>{' '}
                              {a.ref ? (
                                <Anchor component={Link} href={refHref(base, a.ref.type, a.ref.id)} c="dark" size="sm">
                                  {a.text}
                                </Anchor>
                              ) : (
                                a.text
                              )}
                            </Text>
                          </Box>
                          {(a.actor === 'atlas' || a.actor === 'automation') && (
                            <Badge size="xs" color={a.actor === 'atlas' ? 'violet' : 'gray'}>
                              {a.actor === 'atlas' ? 'AI' : 'Rule'}
                            </Badge>
                          )}
                          <Text size="xs" c="dimmed" className="num">
                            {a.at.slice(11, 16)}
                          </Text>
                        </Group>
                      ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Section
            title={
              <Group gap={6}>
                <IconRobot size={15} /> Workflow rules
              </Group>
            }
          >
            <Stack gap="md">
              <Text size="xs" c="dimmed">
                Simple M&A rules — event → rule → action. Not a general workflow builder. Toggle a rule to see its effect in the demo.
              </Text>
              {s.rules.map((r) => (
                <Group key={r.id} align="flex-start" wrap="nowrap" gap="sm">
                  <Switch size="xs" checked={r.enabled} onChange={() => s.toggleRule(r.id)} mt={2} />
                  <Box>
                    <Text size="sm">
                      <Text span c="dimmed" size="xs" fw={600} tt="uppercase">
                        When{' '}
                      </Text>
                      {r.when}
                    </Text>
                    <Text size="sm">
                      <Text span c="dimmed" size="xs" fw={600} tt="uppercase">
                        Then{' '}
                      </Text>
                      {r.then}
                    </Text>
                  </Box>
                </Group>
              ))}
            </Stack>
          </Section>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
