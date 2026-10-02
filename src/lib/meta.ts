import type { PhaseKey, WorkstreamKey, Severity } from './types';

export const DEMO_TODAY = '2026-10-02';

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

export const WORKSTREAMS: { key: WorkstreamKey; label: string; scope: string }[] = [
  { key: 'financial', label: 'Financial', scope: 'Quality of earnings, working capital, debt-like items, forecast.' },
  { key: 'tax', label: 'Tax', scope: 'Income, sales & use, payroll tax exposure; structure.' },
  { key: 'legal', label: 'Legal', scope: 'Contracts, change of control, litigation, licenses, corporate records.' },
  { key: 'commercial', label: 'Commercial', scope: 'Customers, concentration, recurring revenue, pricing, market.' },
  { key: 'operations', label: 'Operations', scope: 'Branches, dispatch, fleet, technicians, service delivery.' },
  { key: 'it', label: 'IT', scope: 'Field service software, ERP, data, cyber hygiene.' },
  { key: 'hr', label: 'HR', scope: 'Workforce, key people, compensation, retention, benefits.' },
  { key: 'insurance', label: 'Insurance / Risk', scope: 'Coverage, claims history, warranty exposure.' },
  { key: 'environmental', label: 'Environmental / Regulatory', scope: 'Refrigerant handling, permits, licensing compliance.' },
];

export const wsLabel = (k: WorkstreamKey) => WORKSTREAMS.find((w) => w.key === k)!.label;

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
