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
  /** Other names practitioners use for the same phase. */
  aka?: string;
  purpose: string;
  activities: string[];
  deliverables: { key: string; label: string }[];
}

// Standard 8-phase M&A process. Typically 6–12 months for middle-market deals;
// in practice phases overlap (agreement, financing and integration planning run during diligence).
export const PHASES: PhaseDef[] = [
  { key: 'strategy', n: 1, label: 'Strategy & Target Screening', short: 'Strategy', purpose: 'Define why you are buying (market share, capabilities, geography, talent), screen targets and decide whether to engage.', activities: ['Define investment thesis, criteria and synergy hypotheses', 'Build long list, narrow to short list', 'Initial outreach; sign NDAs to receive teasers and CIMs'], deliverables: [{ key: 'target-list', label: 'Target list' }, { key: 'thesis', label: 'Investment thesis' }, { key: 'teaser', label: 'Teaser / CIM review' }] },
  { key: 'valuation', n: 2, label: 'Preliminary Valuation & IOI', short: 'Valuation', aka: 'Valuation & Initial Bid', purpose: 'Value the business on limited data and submit a non-binding indication of interest with a valuation range and deal structure.', activities: ['Comparable companies, precedent transactions and DCF on limited data', 'Review CIM and management information', 'Management meetings', 'Submit non-binding IOI'], deliverables: [{ key: 'valuation-range', label: 'Preliminary valuation range' }, { key: 'ioi', label: 'Indication of Interest (IOI)' }] },
  { key: 'loi', n: 3, label: 'LOI / Term Sheet', short: 'LOI', purpose: 'The winning bidder agrees headline terms and exclusivity.', activities: ['Negotiate exclusivity (typically 30–90 days)', 'Agree enterprise value, cash vs. stock, earn-outs, working capital peg', 'Agree management retention and timeline'], deliverables: [{ key: 'loi-terms', label: 'Structured LOI terms' }, { key: 'loi', label: 'Signed Letter of Intent' }, { key: 'exclusivity', label: 'Exclusivity period' }] },
  { key: 'diligence', n: 4, label: 'Due Diligence', short: 'Diligence', purpose: 'The deepest phase. Workstreams run in parallel, and findings re-cut valuation and deal protections.', activities: ['Financial: quality of earnings, net debt, working capital', 'Legal: contracts, litigation, IP, corporate structure', 'Commercial: market, customers, competitors', 'Operational / IT / HR: systems, key people, culture; plus tax and ESG', 'Information requests and Q&A with management', 'Findings re-cut valuation and deal protections'], deliverables: [{ key: 'dd-report', label: 'Due diligence report' }, { key: 'risk-register', label: 'Risk register' }, { key: 'ppa', label: 'Purchase price adjustments' }] },
  { key: 'agreement', n: 5, label: 'Definitive Agreement', short: 'Agreement', aka: 'Definitive Agreement Negotiation', purpose: 'Lawyers draft the SPA / merger agreement; diligence findings become contractual protections.', activities: ['Representations & warranties', 'Material adverse change (MAC) clause', 'Indemnification caps, baskets and escrow', 'Covenants, non-competes and closing conditions'], deliverables: [{ key: 'protections', label: 'Deal protections mapped to findings' }, { key: 'spa', label: 'Signed definitive agreement' }] },
  { key: 'financing', n: 6, label: 'Financing & Approvals', short: 'Financing', purpose: 'Finalize financing and obtain board, shareholder and regulatory approvals.', activities: ['Debt commitment letters and equity documents', 'HSR / antitrust filing; CFIUS if applicable', 'Investment committee, board and shareholder votes', 'Third-party consents'], deliverables: [{ key: 'financing', label: 'Committed financing' }, { key: 'clearances', label: 'Approvals and regulatory clearances' }] },
  { key: 'closing', n: 7, label: 'Closing', short: 'Closing', purpose: 'All conditions precedent met; funds wired, shares transferred, announcements made.', activities: ['Satisfy conditions precedent', 'Wire funds per the funds flow memo; transfer shares', 'Announce to employees, customers and suppliers'], deliverables: [{ key: 'funds-flow', label: 'Funds flow memo' }, { key: 'closed', label: 'Closed deal' }] },
  { key: 'integration', n: 8, label: 'Post-Merger Integration', short: 'Integration', aka: 'PMI', purpose: 'Where value is won or lost: Day 1 readiness, then a 100-day plan tracking synergies, retention and systems migration.', activities: ['Day 1 readiness', 'Revenue and cost synergy capture', 'Retention of key people and customers', 'Systems migration and culture integration', 'Track outcomes against the thesis'], deliverables: [{ key: 'day1', label: 'Day 1 plan' }, { key: '100day', label: '100-day plan' }, { key: 'kpis', label: 'Integration KPIs (synergies, retention, systems)' }] },
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
