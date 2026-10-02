import type { Acquisition, Citation, TargetMetrics } from './types';
import { PRIOR } from '@/data/portfolio';

// The acquirer's playbook expressed as data. Scoring is deterministic code:
// the model may read documents to extract metrics, but it never does the math.

export interface Criterion {
  key: keyof Omit<TargetMetrics, 'sources' | 'grossMarginPct'>;
  label: string;
  rule: string;
  test: (m: TargetMetrics) => 'Pass' | 'Fail' | 'Watch';
  fmt: (m: TargetMetrics) => string;
}

export const PLAYBOOK_VERSION = 'Playbook v4 (adopted Mar 2026)';

export const CRITERIA: Criterion[] = [
  { key: 'revenue', label: 'Revenue', rule: '$10–25M', test: (m) => (m.revenue >= 10 && m.revenue <= 25 ? 'Pass' : 'Fail'), fmt: (m) => `$${m.revenue.toFixed(1)}M` },
  { key: 'recurringPct', label: 'Recurring service revenue', rule: '≥ 25%', test: (m) => (m.recurringPct >= 25 ? 'Pass' : m.recurringPct >= 20 ? 'Watch' : 'Fail'), fmt: (m) => `${m.recurringPct.toFixed(1)}%` },
  { key: 'top5Pct', label: 'Top-5 customer concentration', rule: '< 25%', test: (m) => (m.top5Pct < 25 ? 'Pass' : m.top5Pct < 30 ? 'Watch' : 'Fail'), fmt: (m) => `${m.top5Pct.toFixed(1)}%` },
  { key: 'techRetentionPct', label: 'Technician retention', rule: '≥ 80%', test: (m) => (m.techRetentionPct >= 80 ? 'Pass' : m.techRetentionPct >= 75 ? 'Watch' : 'Fail'), fmt: (m) => `${m.techRetentionPct.toFixed(1)}%` },
  { key: 'ownerDependency', label: 'Founder dependency', rule: 'Low or moderate', test: (m) => (m.ownerDependency === 'High' ? 'Fail' : m.ownerDependency === 'Moderate' ? 'Watch' : 'Pass'), fmt: (m) => m.ownerDependency },
  { key: 'askMultiple', label: 'Price vs. guardrail', rule: '5.5x–6.5x adj. EBITDA', test: (m) => (m.askMultiple <= 6.5 ? 'Pass' : m.askMultiple <= 6.8 ? 'Watch' : 'Fail'), fmt: (m) => `${m.askMultiple.toFixed(2)}x` },
];

export function thesisFit(acq: Acquisition) {
  const m = acq.metrics;
  if (!m) return null;
  const rows = CRITERIA.map((c) => ({ ...c, value: c.fmt(m), result: c.test(m), sources: (m.sources?.[c.key] ?? []) as Citation[] }));
  return { rows, pass: rows.filter((r) => r.result === 'Pass').length, fail: rows.filter((r) => r.result === 'Fail').length, watch: rows.filter((r) => r.result === 'Watch').length };
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export const BENCH_METRICS: { key: 'top5Pct' | 'recurringPct' | 'techRetentionPct' | 'evMultiple'; label: string; unit: string; better: 'low' | 'high' }[] = [
  { key: 'top5Pct', label: 'Top-5 customer concentration', unit: '%', better: 'low' },
  { key: 'recurringPct', label: 'Recurring service revenue', unit: '%', better: 'high' },
  { key: 'techRetentionPct', label: 'Technician retention', unit: '%', better: 'high' },
  { key: 'evMultiple', label: 'EV / adj. EBITDA', unit: 'x', better: 'low' },
];

export function benchmarks(acq: Acquisition) {
  const m = acq.metrics;
  if (!m) return [];
  const cur = { top5Pct: m.top5Pct, recurringPct: m.recurringPct, techRetentionPct: m.techRetentionPct, evMultiple: m.askMultiple };
  return BENCH_METRICS.map((b) => {
    const prior = PRIOR.map((p) => ({ name: p.name, value: p.atDiligence[b.key] }));
    const med = median(prior.map((p) => p.value));
    const value = cur[b.key];
    const delta = value - med;
    const worse = b.better === 'low' ? delta > 0 : delta < 0;
    return { ...b, prior, median: med, value, delta, worse };
  });
}

/** Headline comparison for the briefing, picking the largest unfavourable gap. */
export function headlineBenchmark(acq: Acquisition) {
  const b = benchmarks(acq).filter((x) => x.worse && x.unit === '%');
  if (!b.length) return null;
  const top = b.sort((a, z) => Math.abs(z.delta) - Math.abs(a.delta))[0];
  return `${top.label} is ${Math.abs(top.delta).toFixed(1)} pts ${top.better === 'low' ? 'above' : 'below'} your historical median (${top.median.toFixed(0)}${top.unit}).`;
}

/** Prior deals that look like this one on the metrics that went wrong before. */
export function similarDeals(acq: Acquisition) {
  const m = acq.metrics;
  if (!m) return [];
  return PRIOR.map((p) => {
    const reasons: string[] = [];
    if (m.top5Pct >= 28 && p.atDiligence.top5Pct >= 28) reasons.push('customer concentration');
    if (m.techRetentionPct < 80 && p.atDiligence.techRetentionPct < 80) reasons.push('technician retention');
    if (m.ownerDependency === 'High' && p.tags.includes('licensing')) reasons.push('founder licensing');
    if (m.recurringPct < 25 && p.atDiligence.recurringPct < 25) reasons.push('low recurring revenue');
    return { deal: p, reasons };
  })
    .filter((x) => x.reasons.length)
    .sort((a, b) => b.reasons.length - a.reasons.length);
}
