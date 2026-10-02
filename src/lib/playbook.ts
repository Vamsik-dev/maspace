import type { Acquisition, Citation, Playbook, PlaybookCriterion, PriorAcquisition } from './types';

// Generic playbook engine. A playbook is data; this code evaluates any of them.
// The model may read documents to extract metric values, but every test,
// threshold and benchmark runs here, deterministically and with sources.

export type Result = 'Pass' | 'Watch' | 'Fail';

export function evaluate(c: PlaybookCriterion, v: number | string | undefined): Result | null {
  if (v === undefined || v === null || v === '') return null;
  const t = c.test;
  if (t.type === 'level') return t.pass.includes(String(v)) ? 'Pass' : t.watch.includes(String(v)) ? 'Watch' : 'Fail';
  const n = Number(v);
  switch (t.type) {
    case 'between':
      return n >= t.min && n <= t.max ? 'Pass' : 'Fail';
    case 'below':
      return n < t.pass ? 'Pass' : n < t.watch ? 'Watch' : 'Fail';
    case 'atLeast':
      return n >= t.pass ? 'Pass' : n >= t.watch ? 'Watch' : 'Fail';
    case 'atMost':
      return n <= t.pass ? 'Pass' : n <= t.watch ? 'Watch' : 'Fail';
  }
}

const u = (c: PlaybookCriterion, n: number) => (c.unit === '%' ? `${n}%` : c.unit === 'x' ? `${n.toFixed(1)}x` : c.unit === '$M' ? `$${n}M` : String(n));

export function ruleText(c: PlaybookCriterion) {
  const t = c.test;
  switch (t.type) {
    case 'between':
      return `${u(c, t.min)}–${u(c, t.max)}`;
    case 'below':
      return `< ${u(c, t.pass)}`;
    case 'atLeast':
      return `≥ ${u(c, t.pass)}`;
    case 'atMost':
      return `≤ ${u(c, t.pass)}`;
    case 'level':
      return t.pass.concat(t.watch).join(' or ');
  }
}

export function fmtValue(c: PlaybookCriterion, v: number | string) {
  if (c.unit === 'level' || typeof v === 'string') return String(v);
  return c.unit === '%' ? `${v.toFixed(1)}%` : c.unit === 'x' ? `${v.toFixed(2)}x` : c.unit === '$M' ? `$${v.toFixed(1)}M` : String(v);
}

export function thesisFit(acq: Acquisition, pb: Playbook | undefined) {
  const m = acq.metrics;
  if (!m || !pb) return null;
  const rows = pb.criteria
    .map((c) => {
      const v = m.values[c.key];
      const result = evaluate(c, v);
      return result ? { key: c.key, label: c.label, rule: ruleText(c), value: fmtValue(c, v), result, sources: (m.sources?.[c.key] ?? []) as Citation[] } : null;
    })
    .filter((r): r is NonNullable<typeof r> => !!r);
  return { rows, pass: rows.filter((r) => r.result === 'Pass').length, fail: rows.filter((r) => r.result === 'Fail').length, watch: rows.filter((r) => r.result === 'Watch').length };
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export function benchmarks(acq: Acquisition, pb: Playbook | undefined, priors: PriorAcquisition[]) {
  const m = acq.metrics;
  if (!m || !pb) return [];
  return pb.criteria
    .filter((c) => c.benchmark && typeof m.values[c.key] === 'number')
    .map((c) => {
      const prior = priors.filter((p) => typeof p.atDiligence[c.key] === 'number').map((p) => ({ name: p.name, value: p.atDiligence[c.key] }));
      if (prior.length < 2) return null;
      const value = Number(m.values[c.key]);
      const med = median(prior.map((p) => p.value));
      const delta = value - med;
      const better = c.benchmark!.better;
      return { key: c.key, label: c.label, unit: c.unit === 'x' ? 'x' : '%', better, prior, median: med, value, delta, worse: better === 'low' ? delta > 0 : delta < 0 };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
}

/** Headline comparison for the briefing: the largest unfavourable gap. */
export function headlineBenchmark(acq: Acquisition, pb: Playbook | undefined, priors: PriorAcquisition[]) {
  const b = benchmarks(acq, pb, priors).filter((x) => x.worse && x.unit === '%');
  if (!b.length) return null;
  const top = b.sort((a, z) => Math.abs(z.delta) - Math.abs(a.delta))[0];
  return `${top.label} is ${Math.abs(top.delta).toFixed(1)} pts ${top.better === 'low' ? 'above' : 'below'} your historical median (${top.median.toFixed(0)}%) across ${top.prior.length} deals.`;
}

/** Prior deals that failed or were on watch on the same criteria as this target. */
export function similarDeals(acq: Acquisition, pb: Playbook | undefined, priors: PriorAcquisition[]) {
  const m = acq.metrics;
  if (!m || !pb) return [];
  const weak = pb.criteria.filter((c) => {
    const r = evaluate(c, m.values[c.key]);
    return r === 'Fail' || r === 'Watch';
  });
  return priors
    .map((p) => {
      const reasons = weak
        .filter((c) => {
          if (c.key === 'revenue' || c.key === 'askMultiple') return false;
          const pv = p.atDiligence[c.key];
          if (typeof pv === 'number') {
            const r = evaluate(c, pv);
            return r === 'Fail' || r === 'Watch';
          }
          return !!c.similarTag && p.tags.some((t) => t.includes(c.similarTag!));
        })
        .map((c) => c.label.toLowerCase());
      return { deal: p, reasons };
    })
    .filter((x) => x.reasons.length)
    .sort((a, b) => b.reasons.length - a.reasons.length);
}

/** Thesis assumptions generated from a playbook, so every deal is tested the same way. */
export function assumptionsFrom(pb: Playbook) {
  return pb.criteria.filter((c) => c.key !== 'revenue' && c.key !== 'askMultiple').map((c) => ({ id: c.key, label: c.label, expected: ruleText(c), status: 'Untested' as const }));
}

export const statusFor = (r: Result) => (r === 'Pass' ? 'Supported' : r === 'Watch' ? 'At risk' : 'Contradicted') as 'Supported' | 'At risk' | 'Contradicted';
