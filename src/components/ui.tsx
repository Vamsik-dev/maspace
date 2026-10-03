'use client';

import { Avatar, Badge, Group, Text, Tooltip, Stack, Box, Progress, ThemeIcon, Anchor, Popover, Button, Divider } from '@mantine/core';
import { IconFileTypePdf, IconFileSpreadsheet, IconFileTypeDocx, IconPresentation, IconFileTypeCsv, IconSparkles, IconRobot, IconHelpCircle, IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { personById } from '@/data/people';
import { SEVERITY_COLOR, STATUS_COLOR } from '@/lib/meta';
import type { Citation, DocType, Severity } from '@/lib/types';
import { useStore } from '@/lib/store';
import type { ClaimKind } from '@/lib/atlas';

export function PersonAvatar({ id, size = 22 }: { id: string; size?: number }) {
  if (id === 'atlas') return <AtlasAvatar size={size} />;
  if (id === 'automation')
    return (
      <Tooltip label="Workflow automation">
        <ThemeIcon size={size} radius="xl" variant="light" color="gray">
          <IconRobot size={size * 0.6} />
        </ThemeIcon>
      </Tooltip>
    );
  const p = personById(id);
  if (!p) return null;
  return (
    <Tooltip label={`${p.name} · ${p.title}${p.firm ? ` · ${p.firm}` : ''}`}>
      <Avatar size={size} radius="xl" color={p.color} variant={p.org === 'Advisor' ? 'outline' : 'light'} fz={size * 0.4}>
        {p.initials}
      </Avatar>
    </Tooltip>
  );
}

export function AtlasAvatar({ size = 22 }: { size?: number }) {
  return (
    <Tooltip label="Atlas — the deal intelligence layer (simulated in this prototype)">
      <ThemeIcon size={size} radius="xl" color="violet" variant="light">
        <IconSparkles size={size * 0.6} />
      </ThemeIcon>
    </Tooltip>
  );
}

export function Person({ id, withTitle, size = 20 }: { id: string; withTitle?: boolean; size?: number }) {
  const name = id === 'atlas' ? 'Atlas' : id === 'automation' ? 'Automation' : personById(id)?.name ?? id;
  const p = personById(id);
  return (
    <Group gap={6} wrap="nowrap">
      <PersonAvatar id={id} size={size} />
      <Text size="sm" truncate>
        {name}
        {withTitle && p && (
          <Text span c="dimmed" size="xs">
            {' '}· {p.function}
          </Text>
        )}
      </Text>
    </Group>
  );
}

export const personName = (id: string) => (id === 'atlas' ? 'Atlas' : id === 'automation' ? 'Automation' : personById(id)?.name ?? id);

const PILL: Record<string, [string, string, string]> = {
  gray: ['#f1f4f9', '#4b5a70', '#94a3b8'],
  blue: ['#eef3ff', '#2f53bb', '#3a5fd1'],
  teal: ['#e7f6f1', '#0e7c66', '#12a383'],
  orange: ['#fff3e6', '#b25e09', '#f08c1c'],
  red: ['#fdecec', '#b42318', '#e5484d'],
  yellow: ['#fdf6e3', '#8a6510', '#d6a419'],
  grape: ['#f5effd', '#6d3fd4', '#8e5cf0'],
  violet: ['#f5effd', '#6d3fd4', '#8e5cf0'],
  ink: ['#eef3ff', '#2f53bb', '#3a5fd1'],
};

export function Pill({ color = 'gray', children, solid }: { color?: string; children: ReactNode; solid?: boolean }) {
  const [bg, fg, dot] = PILL[color] ?? PILL.gray;
  return (
    <span className="pill" style={solid ? { background: dot, color: 'white' } : { background: bg, color: fg }}>
      <i style={{ background: solid ? 'rgba(255,255,255,.85)' : dot }} />
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string; size?: 'xs' | 'sm' | 'md' }) {
  return <Pill color={STATUS_COLOR[status] ?? 'gray'}>{status}</Pill>;
}

export function SeverityBadge({ severity, positive }: { severity: Severity; positive?: boolean }) {
  if (positive) return <Pill color="teal">Supports thesis</Pill>;
  return (
    <Pill color={SEVERITY_COLOR[severity]} solid={severity === 'Critical'}>
      {severity}
    </Pill>
  );
}

export function SeverityDot({ severity }: { severity: Severity }) {
  const c = { Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#94a3b8' }[severity];
  return <Box w={8} h={8} style={{ borderRadius: 99, background: c, flexShrink: 0 }} />;
}

export const CLAIM_META: Record<ClaimKind, { label: string; color: string; hint: string }> = {
  fact: { label: 'Fact', color: 'var(--fact)', hint: 'Source-backed: stated in a deal document and cited.' },
  inference: { label: 'AI interpretation', color: 'var(--inference)', hint: 'Atlas’s reading of the facts. Not stated in any source.' },
  recommendation: { label: 'Recommendation', color: 'var(--recommendation)', hint: 'Suggested action. Requires a human decision.' },
  decision: { label: 'Decision', color: 'var(--decision)', hint: 'Recorded human decision, or one awaiting a human.' },
  memory: { label: 'From prior deals', color: 'var(--memory)', hint: 'Drawn from Meridian’s completed acquisitions.' },
};

export function ClaimTag({ kind }: { kind: ClaimKind }) {
  const m = CLAIM_META[kind];
  return (
    <Tooltip label={m.hint} multiline w={240}>
      <Text span fz={10.5} fw={600} tt="uppercase" style={{ color: m.color, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        {m.label}
      </Text>
    </Tooltip>
  );
}

/** A labeled block of text whose epistemic status is always visible. */
export function Claim({ kind, children, citations, calculation, comparedWith, acqId, compact }: { kind: ClaimKind; children: ReactNode; citations?: Citation[]; calculation?: string; comparedWith?: string; acqId?: string; compact?: boolean }) {
  return (
    <Box pl={10} py={compact ? 2 : 4} style={{ borderLeft: `2px solid ${CLAIM_META[kind].color}` }}>
      <Group gap={8} mb={2} justify="space-between" wrap="nowrap">
        <ClaimTag kind={kind} />
        {acqId && (citations?.length || calculation) ? <WhyPopover acqId={acqId} citations={citations ?? []} calculation={calculation} comparedWith={comparedWith} /> : null}
      </Group>
      <Box fz="sm" lh={1.5}>
        {children}
      </Box>
    </Box>
  );
}

export function WhyPopover({ acqId, citations, calculation, comparedWith, label = 'Why?' }: { acqId: string; citations: Citation[]; calculation?: string; comparedWith?: string; label?: string }) {
  return (
    <Popover width={360} position="bottom-end" shadow="md" withArrow>
      <Popover.Target>
        <Button variant="subtle" size="compact-xs" color="gray" leftSection={<IconHelpCircle size={13} />} fw={500}>
          {label}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap={8}>
          <Text className="label">Based on</Text>
          {citations.length === 0 && <Text size="xs" c="dimmed">No document source. Treat as interpretation.</Text>}
          {citations.map((c, i) => (
            <CitationLine key={i} acqId={acqId} c={c} />
          ))}
          {calculation && (
            <>
              <Divider />
              <Text className="label">Calculation</Text>
              <Text size="xs" className="num">
                {calculation}
              </Text>
            </>
          )}
          {comparedWith && (
            <>
              <Divider />
              <Text className="label">Compared with</Text>
              <Text size="xs">{comparedWith}</Text>
            </>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

export function CitationLine({ acqId, c }: { acqId: string; c: Citation }) {
  const doc = useStore((s) => s.documents.find((d) => d.id === c.docId));
  if (!doc) return null;
  return (
    <Box>
      <Anchor component={Link} href={`/acquisitions/${acqId}/documents/${doc.id}${c.page ? `?page=${c.page}` : ''}`} size="xs" fw={500}>
        <Group gap={6} wrap="nowrap" align="flex-start">
          <DocIcon type={doc.type} size={14} />
          <span>
            {doc.name}
            {c.page ? `, p.${c.page}` : ''}
            {c.locator ? ` · ${c.locator}` : ''}
          </span>
        </Group>
      </Anchor>
      {c.quote && (
        <Text size="xs" c="dimmed" pl={20} mt={2}>
          “{c.quote}”
        </Text>
      )}
    </Box>
  );
}

export function CitationChips({ acqId, citations }: { acqId: string; citations: Citation[] }) {
  const docs = useStore((s) => s.documents);
  return (
    <Group gap={4}>
      {citations.map((c, i) => {
        const d = docs.find((x) => x.id === c.docId);
        if (!d) return null;
        return (
          <Badge
            key={i}
            component={Link}
            href={`/acquisitions/${acqId}/documents/${d.id}${c.page ? `?page=${c.page}` : ''}`}
            variant="default"
            size="sm"
            leftSection={<DocIcon type={d.type} size={11} />}
            rightSection={<IconExternalLink size={10} />}
            style={{ cursor: 'pointer', fontWeight: 500 }}
          >
            {d.name.replace(/\.(pdf|xlsx|docx|pptx|csv)$/i, '').slice(0, 34)}
            {c.page ? ` p.${c.page}` : ''}
          </Badge>
        );
      })}
    </Group>
  );
}

export function DocIcon({ type, size = 16 }: { type: DocType; size?: number }) {
  const props = { size, stroke: 1.6 };
  switch (type) {
    case 'PDF':
      return <IconFileTypePdf {...props} color="#b91c1c" />;
    case 'XLSX':
      return <IconFileSpreadsheet {...props} color="#15803d" />;
    case 'DOCX':
      return <IconFileTypeDocx {...props} color="#1d4ed8" />;
    case 'PPTX':
      return <IconPresentation {...props} color="#c2410c" />;
    case 'CSV':
      return <IconFileTypeCsv {...props} color="#15803d" />;
  }
}

export function PageHeader({ eyebrow, title, description, right }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; right?: ReactNode }) {
  return (
    <Group justify="space-between" align="flex-end" mb="lg" gap="md">
      <Box style={{ minWidth: 0, flex: '1 1 420px' }}>
        {eyebrow && (
          <Text className="label" mb={6} c="ink.7">
            {eyebrow}
          </Text>
        )}
        <Text fz={26} fw={600} lh={1.2} style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
          {title}
        </Text>
        {description && (
          <Text size="sm" c="dimmed" mt={6} maw={760} lh={1.55}>
            {description}
          </Text>
        )}
      </Box>
      {right}
    </Group>
  );
}

export function Section({ title, right, children, pad = true }: { title: ReactNode; right?: ReactNode; children: ReactNode; pad?: boolean }) {
  return (
    <Box className="panel" style={{ overflow: 'hidden' }}>
      <Group justify="space-between" px="md" h={46} wrap="nowrap" style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
        <Box fz={13.5} fw={600} c="#0f1b2d" style={{ letterSpacing: '-0.005em' }}>
          {title}
        </Box>
        {right}
      </Group>
      <Box p={pad ? 'md' : 0} style={{ overflowX: pad ? undefined : 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <Stack align="center" gap={6} py="xl" px="md">
      <Text size="sm" fw={600}>
        {title}
      </Text>
      {children && (
        <Text size="xs" c="dimmed" ta="center" maw={380}>
          {children}
        </Text>
      )}
      {action}
    </Stack>
  );
}

export function Meter({ value, color = 'ink', w = 80 }: { value: number; color?: string; w?: number }) {
  return (
    <Group gap={8} wrap="nowrap">
      <Progress value={value} w={w} size={5} color={color} />
      <Text size="xs" c="dimmed" className="num" w={30}>
        {value}%
      </Text>
    </Group>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Text className="label" mb={3}>
        {label}
      </Text>
      <Box fz="sm">{children}</Box>
    </Box>
  );
}

export function SyntheticBadge() {
  return (
    <Tooltip label="Every company, person, document and number in this prototype is fictional." multiline w={240}>
      <Badge color="yellow" variant="light" size="sm">
        Synthetic demo data
      </Badge>
    </Tooltip>
  );
}
