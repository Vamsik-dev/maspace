'use client';

import { Anchor, Box, Button, Group, NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Textarea, Tooltip } from '@mantine/core';
import { IconSparkles, IconFileText } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useStore, nowIso } from '@/lib/store';
import { usePlaybook } from '@/lib/hooks';
import { evaluate } from '@/lib/playbook';
import { fmtDate } from '@/lib/atlas';
import type { Acquisition, Finding, LoiTerms, Playbook } from '@/lib/types';
import { Pill, Section, StatusBadge } from './ui';

/** Atlas drafts LOI terms from the playbook guardrail and diligence findings; a person edits them. */
export function draftLoiTerms(acq: Acquisition, pb: Playbook, findings: Finding[]): LoiTerms {
  const price = pb.criteria.find((c) => c.key === 'askMultiple');
  const guard = price && price.test.type === 'atMost' ? price.test.pass : 6.0;
  const failing = pb.criteria.filter((c) => c.key !== 'revenue' && c.key !== 'askMultiple' && evaluate(c, acq.metrics?.values[c.key]) === 'Fail');
  const multiple = failing.length ? guard - 0.25 : guard;
  const ev = Math.round(acq.target.ebitda * multiple * 10) / 10;
  const concentration = failing.filter((c) => /concentration|referral|physician/i.test(c.label));
  const earnoutMax = concentration.length ? Math.round(ev * 0.1 * 10) / 10 : 0;
  const ownerRisk = failing.some((c) => /founder|physician/i.test(c.label));
  const sellerNote = ownerRisk ? Math.round(ev * 0.05 * 10) / 10 : 0;
  const healthcare = pb.id === 'pb-health';
  const text = (f: Finding) => (f.title + ' ' + f.fact.text).toLowerCase();
  const open = findings.filter((f) => !f.positive && f.status !== 'Dismissed');
  const conditions = [
    'Satisfactory due diligence, including a quality of earnings review',
    ...(open.some((f) => /change of control|consent/.test(text(f))) ? ['Required consents from the largest customer or payer contracts'] : []),
    ...(open.some((f) => /change-of-ownership|medicare enrollment|chow/.test(text(f))) ? ['Medicare change-of-ownership filings submitted before closing'] : []),
    ...(open.some((f) => /license/.test(text(f))) ? ['Successor license qualifier in place at closing'] : []),
    ...(open.some((f) => /leased from the founder|related-party|rent/.test(text(f))) ? ['New market-rate lease for the founder-owned premises'] : []),
    'Definitive agreement and customary closing conditions',
  ];
  return {
    status: 'Draft',
    structure: 'Equity purchase (SPA)',
    ev,
    cashAtClose: Math.round((ev - earnoutMax - sellerNote) * 10) / 10,
    sellerNote,
    earnoutMax,
    earnoutBasis: earnoutMax ? (healthcare ? 'Referral volume and retention of the top two physicians over 24 months' : 'Retention of top-5 customer revenue at ≥ 90% over 18 months') : '',
    rolloverPct: healthcare ? 10 : 0,
    nwcPeg: 'Trailing-12-month average, adjusted for seasonality; set from the QoE',
    exclusivityDays: 60,
    diligenceDays: 60,
    managementRetention: healthcare ? 'Retention agreements with the top physicians signed at closing' : ownerRisk ? 'Founder employment agreement (18–24 months) and named successor license qualifier' : 'Retention letters for branch managers',
    conditions,
    basis: {
      ev: `${acq.target.ebitda.toFixed(2)}M EBITDA × ${multiple.toFixed(2)}x: ${pb.name} guardrail ${guard}x${failing.length ? `, less 0.25x for ${failing.length} failed criteria` : ''}.`,
      earnoutMax: earnoutMax ? `${concentration.map((c) => c.label).join(', ')} fails the playbook; shift that risk to contingent consideration.` : 'No concentration criterion fails; no earn-out proposed.',
      sellerNote: sellerNote ? 'Owner or physician dependency fails the playbook; a seller note keeps the seller aligned through transition.' : undefined,
      rolloverPct: healthcare ? 'Physician equity rollover aligns the partners who generate the referrals.' : undefined,
      exclusivityDays: 'Playbook default; confirmatory diligence takes about 60 days.',
      managementRetention: 'From the playbook’s integration priorities and open findings.',
    },
  };
}

function Field({ label, basis, children }: { label: string; basis?: string; children: React.ReactNode }) {
  return (
    <Box>
      <Group gap={4} mb={2} wrap="nowrap">
        <Text className="label">{label}</Text>
        {basis && (
          <Tooltip label={basis} multiline w={280}>
            <Box c="violet.6" style={{ display: 'flex' }}>
              <IconSparkles size={12} />
            </Box>
          </Tooltip>
        )}
      </Group>
      {children}
    </Box>
  );
}

export function LoiTermsPanel({ acq }: { acq: Acquisition }) {
  const pb = usePlaybook(acq);
  const findings = useStore((s) => s.findings).filter((f) => f.acqId === acq.id);
  const priceDecision = useStore((s) => s.decisions.find((d) => d.acqId === acq.id && /price|valuation/i.test(d.question)));
  const set = useStore((s) => s.setLoiTerms);
  const add = useStore((s) => s.addDeliverable);
  const me = useStore((s) => s.currentUserId);
  const router = useRouter();
  const t = acq.loiTerms;

  if (!t)
    return (
      <Section title="LOI terms">
        <Stack gap="sm" align="flex-start">
          <Text size="sm" c="dimmed">
            Structured terms make offers comparable and feed the LOI document: enterprise value, cash at close, earn-out, seller note, rollover, working capital peg, exclusivity and management retention.
          </Text>
          <Button
            leftSection={<IconSparkles size={14} />}
            color="violet"
            disabled={!pb}
            onClick={() => {
              set(acq.id, draftLoiTerms(acq, pb!, findings));
              notifications.show({ message: 'Atlas drafted LOI terms from the playbook and findings. Review every field.', color: 'violet' });
            }}
          >
            Draft terms with Atlas
          </Button>
        </Stack>
      </Section>
    );

  const editable = t.status === 'Draft';
  const upd = (patch: Partial<LoiTerms>) => set(acq.id, { ...t, ...patch });
  const num = (k: 'ev' | 'cashAtClose' | 'sellerNote' | 'earnoutMax' | 'rolloverPct' | 'exclusivityDays' | 'diligenceDays', label: string, unit: string) => (
    <Field label={label} basis={t.basis?.[k]}>
      {editable ? (
        <NumberInput size="xs" value={t[k]} decimalScale={unit === '$M' ? 1 : 0} min={0} onChange={(v) => upd({ [k]: Number(v) } as Partial<LoiTerms>)} rightSection={<Text size="xs" c="dimmed">{unit}</Text>} aria-label={label} />
      ) : (
        <Text fw={600} className="num">
          {unit === '$M' ? `$${t[k].toFixed(1)}M` : `${t[k]}${unit === '%' ? '%' : ` ${unit}`}`}
        </Text>
      )}
    </Field>
  );
  const consideration = t.cashAtClose + t.sellerNote + t.earnoutMax;
  const multiple = acq.target.ebitda ? t.ev / acq.target.ebitda : 0;

  return (
    <Section
      title={
        <Group gap={8}>
          LOI terms <StatusBadge status={t.status === 'Signed' ? 'Approved' : t.status === 'Sent' ? 'Under Review' : 'Draft'} />
          <Text size="xs" c="dimmed" fw={400}>
            {t.status === 'Signed' && t.signedOn ? `Signed ${fmtDate(t.signedOn)}` : t.status === 'Sent' ? 'Sent to seller' : 'Draft, editable'}
          </Text>
        </Group>
      }
      right={
        <Group gap={6}>
          {t.status === 'Draft' && (
            <Button size="compact-sm" variant="default" onClick={() => upd({ status: 'Sent' })}>
              Mark sent
            </Button>
          )}
          {t.status === 'Sent' && (
            <Button size="compact-sm" onClick={() => upd({ status: 'Signed', signedOn: nowIso().slice(0, 10) })}>
              Mark signed
            </Button>
          )}
          <Button
            size="compact-sm"
            variant="light"
            leftSection={<IconFileText size={13} />}
            onClick={() => {
              const id = add({ acqId: acq.id, title: `Letter of Intent — ${acq.name}`, type: 'Letter of Intent', status: 'Draft', ownerId: me, generatedAt: nowIso().slice(0, 10), sources: [] });
              router.push(`/acquisitions/${acq.id}/deliverables/${id}`);
            }}
          >
            Generate LOI
          </Button>
        </Group>
      }
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          {num('ev', 'Enterprise value', '$M')}
          {num('cashAtClose', 'Cash at close', '$M')}
          {num('sellerNote', 'Seller note', '$M')}
          {num('earnoutMax', 'Earn-out (max)', '$M')}
          {num('rolloverPct', 'Equity rollover', '%')}
          {num('exclusivityDays', 'Exclusivity', 'days')}
          {num('diligenceDays', 'Diligence period', 'days')}
          <Field label="Structure">
            {editable ? (
              <Select size="xs" data={['Equity purchase (SPA)', 'Asset purchase (APA)', 'Merger']} value={t.structure} onChange={(v) => v && upd({ structure: v as LoiTerms['structure'] })} aria-label="Structure" />
            ) : (
              <Text fw={600}>{t.structure}</Text>
            )}
          </Field>
        </SimpleGrid>
        <Group gap="lg">
          <Text size="xs" c="dimmed" className="num">
            Implied multiple <b>{multiple.toFixed(2)}x</b> adj. EBITDA
          </Text>
          <Text size="xs" c={Math.abs(consideration - t.ev) > 0.05 ? 'orange.8' : 'dimmed'} className="num">
            Consideration components ${consideration.toFixed(1)}M {Math.abs(consideration - t.ev) > 0.05 ? `≠ EV $${t.ev.toFixed(1)}M (check)` : '= EV'}
          </Text>
        </Group>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Field label="Earn-out basis" basis={t.basis?.earnoutMax}>
            {editable ? <TextInput size="xs" value={t.earnoutBasis} onChange={(e) => upd({ earnoutBasis: e.currentTarget.value })} placeholder="None" aria-label="Earn-out basis" /> : <Text size="sm">{t.earnoutBasis || 'None'}</Text>}
          </Field>
          <Field label="Working capital peg">
            {editable ? <TextInput size="xs" value={t.nwcPeg} onChange={(e) => upd({ nwcPeg: e.currentTarget.value })} aria-label="Working capital peg" /> : <Text size="sm">{t.nwcPeg}</Text>}
          </Field>
          <Field label="Management retention" basis={t.basis?.managementRetention}>
            {editable ? <TextInput size="xs" value={t.managementRetention} onChange={(e) => upd({ managementRetention: e.currentTarget.value })} aria-label="Management retention" /> : <Text size="sm">{t.managementRetention}</Text>}
          </Field>
          <Field label="Conditions">
            {editable ? (
              <Textarea size="xs" autosize minRows={2} value={t.conditions.join('\n')} onChange={(e) => upd({ conditions: e.currentTarget.value.split('\n') })} aria-label="Conditions" />
            ) : (
              <Stack gap={2}>
                {t.conditions.map((c) => (
                  <Text key={c} size="sm">
                    • {c}
                  </Text>
                ))}
              </Stack>
            )}
          </Field>
        </SimpleGrid>
        {t.status === 'Signed' && priceDecision && (
          <Group gap={8} p="sm" style={{ background: 'var(--app-subtle)', borderRadius: 8 }}>
            <Pill color={priceDecision.status === 'Approved' ? 'teal' : 'blue'}>{priceDecision.status === 'Approved' ? 'Amendment approved' : 'Amendment under review'}</Pill>
            <Text size="sm">
              Diligence findings re-cut the price:{' '}
              <Anchor component={Link} href={`/acquisitions/${acq.id}/decisions/${priceDecision.id}`} size="sm">
                {priceDecision.question}
              </Anchor>
            </Text>
          </Group>
        )}
        {t.basis && t.status === 'Draft' && (
          <Text size="xs" c="violet.8">
            Drafted by Atlas. Hover the sparkle next to a field to see why. Atlas proposes terms; the deal lead owns them.
          </Text>
        )}
      </Stack>
    </Section>
  );
}
