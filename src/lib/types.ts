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

export type WorkstreamKey =
  | 'financial'
  | 'tax'
  | 'legal'
  | 'commercial'
  | 'operations'
  | 'it'
  | 'hr'
  | 'insurance'
  | 'environmental';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type DealRole = 'Owner' | 'Contributor' | 'Reviewer' | 'Approver' | 'Observer';

export interface Person {
  id: string;
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
  type: 'IC Memo' | 'Target Brief' | 'Management Meeting Brief' | 'Weekly Deal Update' | 'Day-1 Integration Plan' | 'Diligence Summary';
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
}

export interface FeedbackNote {
  id: string;
  at: string;
  screen: string;
  path: string;
  rating?: 'Matches how we work' | 'Partly' | 'Not how we work';
  note: string;
}
