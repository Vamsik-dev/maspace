import type { PhaseKey, WorkstreamKey, Severity } from './types';
import { ALL_WORKSTREAMS, MECH_WORKSTREAMS } from '@/data/playbooks';

export const DEMO_TODAY = '2026-10-02';

/** True in the single-file shareable build (hash routing, sandboxed frame). */
export const IS_SHARE = process.env.NEXT_PUBLIC_SHARE === '1';
export const appHref = (path: string) => (IS_SHARE ? `#${path}` : path);

export const PHASES: { key: PhaseKey; n: number; label: string; short: string; purpose: string }[] = [
  { key: 'strategy', n: 1, label: 'Strategy & Target Screening', short: 'Strategy', purpose: 'Why this target fits the acquisition strategy, and whether to engage.' },
  { key: 'valuation', n: 2, label: 'Preliminary Valuation / IOI', short: 'Valuation', purpose: 'What the business is worth to us and what we are willing to offer.' },
  { key: 'loi', n: 3, label: 'LOI / Term Sheet', short: 'LOI', purpose: 'Agree headline terms, structure and exclusivity.' },
  { key: 'diligence', n: 4, label: 'Due Diligence', short: 'Diligence', purpose: 'Test the thesis. Surface findings, risks and price implications.' },
  { key: 'agreement', n: 5, label: 'Definitive Agreement', short: 'Agreement', purpose: 'Translate findings into reps, indemnities, escrows and price mechanics.' },
  { key: 'financing', n: 6, label: 'Financing & Approvals', short: 'Financing', purpose: 'Secure funding, IC / board approval and third-party consents.' },
  { key: 'closing', n: 7, label: 'Closing', short: 'Closing', purpose: 'Satisfy conditions, fund, and transfer ownership.' },
  { key: 'integration', n: 8, label: 'Post-Merger Integration', short: 'Integration', purpose: 'Day-1 readiness, 100-day plan and value realization.' },
];

export const phaseLabel = (k: PhaseKey) => PHASES.find((p) => p.key === k)!.label;
export const phaseShort = (k: PhaseKey) => PHASES.find((p) => p.key === k)!.short;

/** Default (mechanical services) workstreams. Each playbook defines its own. */
export const WORKSTREAMS = MECH_WORKSTREAMS;

export const wsLabel = (k: WorkstreamKey) => ALL_WORKSTREAMS.find((w) => w.key === k)?.label ?? k.charAt(0).toUpperCase() + k.slice(1);

export const SEVERITY_COLOR: Record<Severity, string> = {
  Critical: 'red',
  High: 'orange',
  Medium: 'yellow',
  Low: 'gray',
};

export const STATUS_COLOR: Record<string, string> = {
  'Not Started': 'gray',
  'In Progress': 'blue',
  Waiting: 'grape',
  'Needs Review': 'orange',
  Blocked: 'red',
  Complete: 'teal',
  Proposed: 'violet',
  Open: 'orange',
  'Under Review': 'blue',
  Confirmed: 'red',
  Resolved: 'teal',
  Dismissed: 'gray',
  Mitigating: 'blue',
  Accepted: 'gray',
  Closed: 'teal',
  Approved: 'teal',
  Rejected: 'red',
  Deferred: 'gray',
  Draft: 'gray',
  'In Review': 'blue',
  Final: 'teal',
};

export const fmtM = (n: number) => `$${n.toFixed(1)}M`;
export const fmtK = (n: number) => (Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(2)}M` : `$${n.toLocaleString()}K`);
