// Domain model for the prototype. Shaped so a real API can replace the
// in-memory store later without changing the screens.

export type PhaseKey =
  | 'strategy'
  | 'valuation'
  | 'loi'
  | 'diligence'
  | 'agreement'
  | 'financing'
  | 'closing'
  | 'integration';

/** Workstreams are defined by each playbook, so the key is open-ended. */
export type WorkstreamKey = string;

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type DealRole = 'Owner' | 'Contributor' | 'Reviewer' | 'Approver' | 'Observer';

export interface Organization {
  id: string;
  name: string;
  short: string;
  description: string;
  strategy: string;
  playbookId: string;
  vertical: string;
}

export interface Person {
  id: string;
  /** Tenant the person belongs to. Advisors are engaged per tenant. */
  orgId: string;
  name: string;
  initials: string;
  title: string;
  /** Functional role on M&A work, e.g. CFO, Legal, QoE */
  function: string;
  org: 'Internal' | 'Advisor';
  firm?: string;
  color: string;
}

export interface TeamMember {
  personId: string;
  dealRole: DealRole;
  workstreams: WorkstreamKey[];
  note?: string;
}

export interface Citation {
  docId: string;
  page?: number;
  /** Sheet / section / row locator for spreadsheets and contracts */
  locator?: string;
  quote?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  at: string;
  body: string;
}

export interface ThesisAssumption {
  id: string;
  label: string;
  expected: string;
  current?: string;
  status: 'Supported' | 'At risk' | 'Contradicted' | 'Untested';
  findingIds?: string[];
}

export interface PhaseState {
  status: 'complete' | 'active' | 'upcoming';
  progress: number;
  completedOn?: string;
  summary: string;
}

export interface ValuationLine {
  label: string;
  value: number; // $K
  kind: 'base' | 'adjustment' | 'total';
  citation?: Citation;
}

export interface Acquisition {
  id: string;
  orgId: string;
  playbookId: string;
  codename: string;
  name: string;
  status: 'Active' | 'Completed' | 'Paused';
  currentPhase: PhaseKey;
  stageLabel: string;
  targetClose?: string;
  dealLeadId: string;
  target: {
    legalName: string;
    industry: string;
    hq: string;
    founded: number;
    revenue: number; // $M
    ebitda: number; // $M
    ebitdaBasis: string;
    employees: number;
    branches: string[];
    ownership: string;
    description: string;
  };
  strategy: string;
  ev: number; // $M current working view
  evBasis: string;
  thesis: { summary: string; pillars: string[]; assumptions: ThesisAssumption[] };
  phases: Record<PhaseKey, PhaseState>;
  valuation?: { multiple: number; lines: ValuationLine[]; note: string };
  /** Initial diligence request list status (items not tracked individually as work items). */
  requestList?: Partial<Record<WorkstreamKey, { done: number; total: number }>>;
  metrics?: TargetMetrics;
  loiTerms?: LoiTerms;
  /** One line on why the team is interested, entered at creation. */
  rationale?: string;
  team: TeamMember[];
}

export type WorkItemStatus = 'Not Started' | 'In Progress' | 'Waiting' | 'Needs Review' | 'Blocked' | 'Complete';
export type Priority = 'Urgent' | 'High' | 'Normal' | 'Low';

export interface WorkItem {
  id: string;
  acqId: string;
  title: string;
  description?: string;
  kind: 'Task' | 'Request' | 'Review' | 'Approval';
  workstream: WorkstreamKey;
  phase: PhaseKey;
  status: WorkItemStatus;
  priority: Priority;
  ownerId: string;
  contributorIds?: string[];
  reviewerId?: string;
  due?: string;
  dependsOn?: string[];
  documentIds?: string[];
  findingIds?: string[];
  decisionIds?: string[];
  comments: Comment[];
  createdBy?: string; // personId | 'automation' | 'atlas'
}

export type FindingStatus = 'Proposed' | 'Open' | 'Under Review' | 'Confirmed' | 'Resolved' | 'Dismissed';

export interface Finding {
  id: string;
  acqId: string;
  title: string;
  workstream: WorkstreamKey;
  severity: Severity;
  status: FindingStatus;
  ownerId: string;
  identifiedBy: string; // personId | 'atlas'
  createdAt: string;
  positive?: boolean;
  fact: { text: string; citations: Citation[] };
  calculation?: string;
  interpretation?: string;
  recommendation?: string;
  thesisLink?: { assumptionId: string; expected: string; actual: string };
  implications: { area: 'Financial' | 'Valuation' | 'Commercial' | 'Legal' | 'Integration' | 'Operations' | 'Tax' | 'People'; text: string }[];
  valuationImpact?: string;
  possibleActions?: string[];
  riskIds: string[];
  decisionIds: string[];
  workItemIds: string[];
  comments: Comment[];
}

export type RiskStatus = 'Open' | 'Mitigating' | 'Accepted' | 'Closed';

export interface Risk {
  id: string;
  acqId: string;
  title: string;
  description: string;
  workstream: WorkstreamKey;
  severity: Severity;
  probability: 'Likely' | 'Possible' | 'Unlikely';
  ownerId: string;
  mitigation: string;
  status: RiskStatus;
  findingIds: string[];
  decisionIds: string[];
  comments: Comment[];
}

export type DecisionStatus = 'Open' | 'Under Review' | 'Approved' | 'Rejected' | 'Deferred';

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface Decision {
  id: string;
  acqId: string;
  question: string;
  context: string;
  phase: PhaseKey;
  status: DecisionStatus;
  options: DecisionOption[];
  recommendation?: { optionId: string; rationale: string; by: string };
  proposedBy: string;
  proposedAt: string;
  reviewers: { personId: string; verdict: 'Pending' | 'Concur' | 'Concerns'; note?: string }[];
  approverId: string;
  due?: string;
  outcome?: { optionId: string; rationale: string; decidedAt: string; decidedBy: string };
  findingIds: string[];
  riskIds: string[];
  documentIds: string[];
  downstream: string[];
  comments: Comment[];
}

export type DocType = 'PDF' | 'XLSX' | 'DOCX' | 'PPTX' | 'CSV';

export interface DocPage {
  n: number;
  heading: string;
  body: string[]; // paragraphs
  table?: { columns: string[]; rows: (string | number)[][]; highlightRows?: number[] };
}

export interface DealDocument {
  id: string;
  acqId: string;
  name: string;
  type: DocType;
  category: string;
  workstream: WorkstreamKey;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  pageCount: number;
  sizeKb: number;
  status: 'Processed' | 'Processing' | 'Queued';
  tags: string[];
  summary: string;
  pages: DocPage[];
  source: 'Seller' | 'Advisor' | 'Internal' | 'Public';
}

export interface Deliverable {
  id: string;
  acqId: string;
  title: string;
  type: 'Investment Thesis' | 'Target Brief' | 'IOI Letter' | 'Letter of Intent' | 'Management Meeting Brief' | 'Due Diligence Report' | 'IC Memo' | 'Weekly Deal Update' | 'Day 1 Plan' | '100-Day Plan';
  status: 'Draft' | 'In Review' | 'Final';
  ownerId: string;
  generatedAt: string;
  sources: string[];
  // BlockNote document JSON. Kept as unknown so the store does not depend on the editor.
  content?: unknown;
}

export interface Activity {
  id: string;
  acqId: string;
  at: string;
  actor: string; // personId | 'atlas' | 'automation'
  text: string;
  kind: 'finding' | 'risk' | 'decision' | 'document' | 'work' | 'phase' | 'deliverable' | 'comment' | 'automation' | 'team';
  ref?: { type: 'finding' | 'risk' | 'decision' | 'document' | 'work' | 'deliverable'; id: string };
}

export interface Milestone {
  id: string;
  acqId: string;
  title: string;
  date: string;
  phase: PhaseKey;
  status: 'Done' | 'Upcoming' | 'At risk';
}

export interface AutomationRule {
  id: string;
  when: string;
  then: string;
  enabled: boolean;
}

export interface PriorAcquisition {
  id: string;
  orgId: string;
  /** How the record got into memory: captured live, or reconstructed from an archive. */
  origin?: 'Captured' | 'Reconstructed';
  confidence?: 'High' | 'Medium' | 'Low';
  name: string;
  industry: string;
  location: string;
  closed: string;
  ev: number;
  revenueAtClose: number;
  thesis: string;
  outcomes: { metric: string; predicted: string; actual: string; verdict: 'Met' | 'Missed' | 'Exceeded' }[];
  issues: string[];
  lessons: { id: string; text: string; category: string; inPlaybook: boolean }[];
  tags: string[];
  /** Characteristics measured in diligence, for benchmarking new targets. */
  atDiligence: Record<string, number>;
}

export interface FeedbackNote {
  id: string;
  at: string;
  screen: string;
  path: string;
  rating?: 'Matches how we work' | 'Partly' | 'Not how we work';
  note: string;
}

// ---------- Intelligence layer ----------

/** Measured target characteristics that the playbook can score. */
export interface TargetMetrics {
  /** Values keyed by playbook criterion key. */
  values: Record<string, number | string>;
  sources?: Record<string, Citation[]>;
}

export type CriterionTest =
  | { type: 'between'; min: number; max: number }
  | { type: 'below'; pass: number; watch: number }
  | { type: 'atLeast'; pass: number; watch: number }
  | { type: 'atMost'; pass: number; watch: number }
  | { type: 'level'; pass: string[]; watch: string[] };

export interface PlaybookCriterion {
  key: string;
  label: string;
  unit: '%' | 'x' | '$M' | 'level';
  test: CriterionTest;
  /** Used to benchmark against prior deals. */
  benchmark?: { better: 'low' | 'high' };
  /** Prior-deal tag that indicates the same issue when the metric was not captured. */
  similarTag?: string;
  why: string;
}

export interface Playbook {
  id: string;
  name: string;
  vertical: string;
  version: string;
  status: 'Active' | 'Template';
  description: string;
  criteria: PlaybookCriterion[];
  workstreams: { key: string; label: string; scope: string }[];
  requestList: { workstream: string; items: string[] }[];
  decisionGates: string[];
  integrationPriorities: string[];
  outcomeMetrics: string[];
  history?: { version: string; date: string; change: string }[];
}

export type ProposalKind = 'risk' | 'decision' | 'action' | 'request' | 'deliverable' | 'research' | 'playbook';

/** Something Atlas drafted that a person must accept, edit or dismiss. */
export interface Proposal {
  id: string;
  acqId: string;
  kind: ProposalKind;
  title: string;
  summary: string;
  basis: string; // why Atlas proposes it
  confidence: 'High' | 'Medium' | 'Low';
  createdAt: string;
  status: 'Pending' | 'Accepted' | 'Dismissed';
  parentFindingId?: string;
  citations?: Citation[];
  // What gets created on accept.
  payload?: {
    risk?: { title: string; description: string; severity: Severity; probability: 'Likely' | 'Possible' | 'Unlikely'; ownerId: string; mitigation: string };
    decision?: { question: string; context: string; options: { label: string; description: string }[]; recommended?: number; approverId: string; phase: PhaseKey };
    action?: { title: string; ownerId: string; workstream: WorkstreamKey; due: string; kind: WorkItem['kind'] };
    deliverableId?: string;
    finding?: Omit<Finding, 'id' | 'acqId' | 'createdAt' | 'comments' | 'riskIds' | 'decisionIds' | 'workItemIds' | 'status' | 'identifiedBy'>;
  };
}

export interface ResearchItem {
  id: string;
  acqId: string;
  topic: 'Market' | 'Competition' | 'Regulatory' | 'Company records' | 'Reputation' | 'People';
  headline: string;
  detail: string;
  source: string; // descriptive source, synthetic in prototype
  sourceType: 'Public record' | 'Government' | 'Industry data' | 'News' | 'Reviews' | 'Web';
  relevance: 'Material' | 'Context';
  asOf: string;
}

export interface SellerClaim {
  id: string;
  acqId: string;
  claim: string;
  claimSource: Citation;
  verdict: 'Verified' | 'Contradicted' | 'Partly true' | 'Unverified';
  evidence: string;
  evidenceSources: Citation[];
}

// ---------- Phase 1 sourcing and Phase 4 Q&A ----------

export type PipelineStage = 'Long list' | 'Short list' | 'NDA signed' | 'CIM received' | 'Passed';

/** A candidate target before it becomes an acquisition. */
export interface PipelineTarget {
  id: string;
  orgId: string;
  name: string;
  industry: string;
  hq: string;
  source: 'Banker teaser' | 'Proprietary outreach' | 'Referral' | 'Inbound';
  stage: PipelineStage;
  revenue?: number;
  ebitda?: number;
  /** Metrics known from the teaser or outreach, keyed by playbook criterion. */
  teaser: Record<string, number | string>;
  ownerId: string;
  nextStep: string;
  note?: string;
  passReason?: string;
  acquisitionId?: string;
  /** Uses the organization's sample data room when promoted (demo). */
  hasSample?: boolean;
}

export interface QAItem {
  id: string;
  acqId: string;
  question: string;
  workstream: string;
  askedOf: 'Seller' | 'Management' | 'Banker';
  askedBy: string;
  status: 'Draft' | 'Sent' | 'Answered' | 'Follow-up';
  askedAt: string;
  answer?: string;
  answeredAt?: string;
  findingId?: string;
  draftedBy?: string;
}

/** Structured LOI / term sheet. Makes offers comparable and feeds the LOI document. */
export interface LoiTerms {
  status: 'Draft' | 'Sent' | 'Signed';
  signedOn?: string;
  structure: 'Equity purchase (SPA)' | 'Asset purchase (APA)' | 'Merger';
  ev: number; // $M, cash-free / debt-free
  cashAtClose: number;
  sellerNote: number;
  earnoutMax: number;
  earnoutBasis: string;
  rolloverPct: number;
  nwcPeg: string;
  exclusivityDays: number;
  diligenceDays: number;
  managementRetention: string;
  conditions: string[];
  /** Why Atlas proposed each field, when it drafted the terms. */
  basis?: Partial<Record<keyof Omit<LoiTerms, 'basis' | 'status' | 'signedOn' | 'conditions'>, string>>;
}
