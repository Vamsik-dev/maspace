import type { PhaseKey, WorkstreamKey, Severity } from './types';
import { ALL_WORKSTREAMS, MECH_WORKSTREAMS } from '@/data/playbooks';

export const DEMO_TODAY = '2026-10-02';

/** True in the single-file shareable build (hash routing, sandboxed frame). */
export const IS_SHARE = process.env.NEXT_PUBLIC_SHARE === '1';
export const appHref = (path: string) => (IS_SHARE ? `#${path}` : path);

export interface PhaseDef {
  key: PhaseKey;
  n: number;
  label: string;
  short: string;
  purpose: string;
  activities: string[];
  deliverables: { key: string; label: string }[];
}

// Standard 8-phase M&A process (activities and key deliverables per phase).
export const PHASES: PhaseDef[] = [
  { key: 'strategy', n: 1, label: 'Strategy & Target Screening', short: 'Strategy', purpose: 'Define why you are buying, screen targets and decide whether to engage.', activities: ['Define investment thesis, criteria and synergy hypotheses', 'Build long list, narrow to short list', 'Sign NDA; receive teaser and CIM', 'Initial outreach to owners'], deliverables: [{ key: 'target-list', label: 'Target list' }, { key: 'thesis', label: 'Investment thesis' }, { key: 'teaser', label: 'Teaser / CIM review' }] },
  { key: 'valuation', n: 2, label: 'Preliminary Valuation & IOI', short: 'Valuation', purpose: 'Value the business on limited data and submit a non-binding indication of interest.', activities: ['Comparable companies, precedent transactions and DCF', 'Review CIM and management information', 'Management meetings'], deliverables: [{ key: 'valuation-range', label: 'Preliminary valuation range' }, { key: 'ioi', label: 'Indication of Interest (IOI)' }] },
  { key: 'loi', n: 3, label: 'LOI / Term Sheet', short: 'LOI', purpose: 'Agree price, structure, exclusivity, key terms and timeline.', activities: ['Negotiate price and structure', 'Agree exclusivity and key terms', 'Set the deal timeline'], deliverables: [{ key: 'loi', label: 'Signed Letter of Intent' }, { key: 'exclusivity', label: 'Exclusivity period' }] },
  { key: 'diligence', n: 4, label: 'Due Diligence', short: 'Diligence', purpose: 'Test the thesis across financial, legal, tax, commercial, operational, IT, HR and ESG workstreams.', activities: ['Workstream diligence (financial, legal, tax, commercial, operational, IT, HR, ESG)', 'Information requests and Q&A with management', 'Findings, risks and price implications'], deliverables: [{ key: 'dd-report', label: 'Due diligence report' }, { key: 'risk-register', label: 'Risk register' }, { key: 'ppa', label: 'Purchase price adjustments' }] },
  { key: 'agreement', n: 5, label: 'Definitive Agreement', short: 'Agreement', purpose: 'Negotiate the SPA / merger agreement: reps & warranties, indemnities, covenants and conditions.', activities: ['Negotiate reps & warranties and indemnities', 'Agree covenants and closing conditions', 'Map every material finding to a contractual protection'], deliverables: [{ key: 'spa', label: 'Signed definitive agreement' }] },
  { key: 'financing', n: 6, label: 'Financing & Approvals', short: 'Financing', purpose: 'Secure financing and board, shareholder, regulatory and antitrust approvals.', activities: ['Secure debt / equity financing', 'Investment committee and board approval', 'Regulatory and antitrust filings; third-party consents'], deliverables: [{ key: 'financing', label: 'Committed financing' }, { key: 'clearances', label: 'Approvals and regulatory clearances' }] },
  { key: 'closing', n: 7, label: 'Closing', short: 'Closing', purpose: 'Satisfy closing conditions, fund and transfer ownership.', activities: ['Satisfy closing conditions', 'Fund the transaction', 'Transfer ownership'], deliverables: [{ key: 'funds-flow', label: 'Funds flow memo' }, { key: 'closed', label: 'Closed deal' }] },
  { key: 'integration', n: 8, label: 'Post-Merger Integration', short: 'Integration', purpose: 'Day 1 readiness, synergy capture and systems, people and culture integration.', activities: ['Day 1 planning', 'Synergy capture', 'Systems, people and culture integration', 'Track outcomes against the thesis'], deliverables: [{ key: 'day1', label: 'Day 1 plan' }, { key: '100day', label: '100-day plan' }, { key: 'kpis', label: 'Integration KPIs' }] },
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
