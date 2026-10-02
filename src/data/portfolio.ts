import type { Acquisition, Activity, DealDocument, Decision, Finding, Milestone, PriorAcquisition, Risk, WorkItem } from '@/lib/types';

// SYNTHETIC DEMO DATA. Two lighter active deals and five completed acquisitions
// that make up Meridian's "acquisition memory".

const basePhases = (current: 'strategy' | 'valuation'): Acquisition['phases'] => ({
  strategy:
    current === 'strategy'
      ? { status: 'active', progress: 55, summary: 'Screening against playbook. Owner open to a conversation.' }
      : { status: 'complete', progress: 100, completedOn: '2026-08-14', summary: 'Screened and approved for outreach.' },
  valuation:
    current === 'valuation'
      ? { status: 'active', progress: 40, summary: 'Building preliminary model from CIM. IOI due Oct 16.' }
      : { status: 'upcoming', progress: 0, summary: '' },
  loi: { status: 'upcoming', progress: 0, summary: '' },
  diligence: { status: 'upcoming', progress: 0, summary: '' },
  agreement: { status: 'upcoming', progress: 0, summary: '' },
  financing: { status: 'upcoming', progress: 0, summary: '' },
  closing: { status: 'upcoming', progress: 0, summary: '' },
  integration: { status: 'upcoming', progress: 0, summary: '' },
});

export const COASTAL: Acquisition = {
  id: 'acq-coastal',
  orgId: 'org-meridian',
  playbookId: 'pb-mech',
  codename: 'Project Pelican',
  name: 'Coastal Bend Plumbing',
  status: 'Active',
  currentPhase: 'valuation',
  stageLabel: 'Preliminary Valuation / IOI',
  dealLeadId: 'p-marcus',
  target: {
    legalName: 'Coastal Bend Plumbing & Drain, LLC',
    industry: 'Plumbing services',
    hq: 'Corpus Christi, Texas',
    founded: 1998,
    revenue: 11.4,
    ebitda: 1.9,
    ebitdaBasis: 'Seller adjusted FY2025 (unverified)',
    employees: 74,
    branches: ['Corpus Christi', 'Kingsville'],
    ownership: 'Two founding partners (50/50)',
    description: 'Residential and light-commercial plumbing, drain and water heater services. Strong residential brand; growing commercial service book.',
  },
  strategy: 'New geography: South Texas entry point for plumbing and later HVAC tuck-ins.',
  ev: 11.5,
  evBasis: 'Preliminary range $10.5–12.5M',
  thesis: {
    summary: 'Establish a South Texas hub with an established plumbing brand.',
    pillars: ['New geography', 'Residential brand strength', 'Tuck-in platform for HVAC'],
    assumptions: [
      { id: 'a1', label: 'Top-5 customer concentration', expected: '< 25%', current: '~9% (CIM)', status: 'Untested' },
      { id: 'a2', label: 'Recurring service revenue', expected: '≥ 25%', current: '14% (CIM)', status: 'At risk' },
    ],
  },
  phases: basePhases('valuation'),
  team: [
    { personId: 'p-marcus', dealRole: 'Owner', workstreams: ['commercial', 'financial'] },
    { personId: 'p-priya', dealRole: 'Approver', workstreams: ['financial'] },
    { personId: 'p-elena', dealRole: 'Contributor', workstreams: ['financial'] },
  ],
};

export const DELTA: Acquisition = {
  id: 'acq-delta',
  orgId: 'org-meridian',
  playbookId: 'pb-mech',
  codename: 'Project Ember',
  name: 'Delta Fire & Safety',
  status: 'Active',
  currentPhase: 'strategy',
  stageLabel: 'Strategy & Target Screening',
  dealLeadId: 'p-marcus',
  target: {
    legalName: 'Delta Fire & Safety Systems, Inc.',
    industry: 'Fire / life safety',
    hq: 'Houston, Texas',
    founded: 2011,
    revenue: 8.7,
    ebitda: 1.6,
    ebitdaBasis: 'Owner estimate',
    employees: 52,
    branches: ['Houston'],
    ownership: 'Founder-owned',
    description: 'Inspection, testing and maintenance of fire sprinkler and alarm systems for commercial buildings in Greater Houston.',
  },
  strategy: 'Tuck-in to Gulf Coast Fire Protection (acquired 2023): inspection route density.',
  ev: 9.5,
  evBasis: 'Indicative, pre-IOI',
  thesis: {
    summary: 'Add inspection density to Gulf Coast Fire Protection in Houston.',
    pillars: ['Route density', 'Inspection-led recurring revenue'],
    assumptions: [{ id: 'a1', label: 'Inspection revenue share', expected: '≥ 40%', status: 'Untested' }],
  },
  phases: basePhases('strategy'),
  team: [
    { personId: 'p-marcus', dealRole: 'Owner', workstreams: ['commercial'] },
    { personId: 'p-dan', dealRole: 'Approver', workstreams: [] },
  ],
};

export const SECONDARY_WORK: WorkItem[] = [
  { id: 'cw1', acqId: 'acq-coastal', title: 'Build preliminary valuation model', kind: 'Task', workstream: 'financial', phase: 'valuation', status: 'In Progress', priority: 'High', ownerId: 'p-elena', due: '2026-10-09', comments: [] },
  { id: 'cw2', acqId: 'acq-coastal', title: 'Draft IOI letter', kind: 'Task', workstream: 'legal', phase: 'valuation', status: 'Not Started', priority: 'Normal', ownerId: 'p-marcus', due: '2026-10-14', dependsOn: ['cw1'], comments: [] },
  { id: 'cw3', acqId: 'acq-coastal', title: 'Request customer list by segment', kind: 'Request', workstream: 'commercial', phase: 'valuation', status: 'Waiting', priority: 'Normal', ownerId: 'p-marcus', due: '2026-09-30', comments: [] },
  { id: 'dw1', acqId: 'acq-delta', title: 'Screen against playbook v4', kind: 'Task', workstream: 'commercial', phase: 'strategy', status: 'In Progress', priority: 'Normal', ownerId: 'p-marcus', due: '2026-10-08', comments: [] },
  { id: 'dw2', acqId: 'acq-delta', title: 'Intro call with founder', kind: 'Task', workstream: 'commercial', phase: 'strategy', status: 'Complete', priority: 'Normal', ownerId: 'p-marcus', due: '2026-09-24', comments: [] },
];

export const SECONDARY_FINDINGS: Finding[] = [
  {
    id: 'cf1',
    acqId: 'acq-coastal',
    title: 'Recurring revenue below playbook threshold',
    workstream: 'commercial',
    severity: 'Medium',
    status: 'Open',
    ownerId: 'p-marcus',
    identifiedBy: 'atlas',
    createdAt: '2026-09-21',
    fact: { text: 'Service agreements represent 14% of FY2025 revenue.', citations: [{ docId: 'cd1', page: 7 }] },
    interpretation: 'Below the 25% playbook threshold. Residential mix limits recurring potential without a membership program.',
    recommendation: 'Price on a lower multiple or underwrite a membership program launch.',
    thesisLink: { assumptionId: 'a2', expected: '≥ 25%', actual: '14%' },
    implications: [{ area: 'Valuation', text: 'Lower multiple than ABC.' }],
    riskIds: [],
    decisionIds: [],
    workItemIds: [],
    comments: [],
  },
];

export const SECONDARY_RISKS: Risk[] = [];
export const SECONDARY_DECISIONS: Decision[] = [];

export const SECONDARY_DOCS: DealDocument[] = [
  {
    id: 'cd1',
    acqId: 'acq-coastal',
    name: 'Coastal Bend Plumbing — CIM.pdf',
    type: 'PDF',
    category: 'CIM',
    workstream: 'commercial',
    uploadedBy: 'p-marcus',
    uploadedAt: '2026-09-15',
    version: 1,
    pageCount: 36,
    sizeKb: 4200,
    status: 'Processed',
    tags: ['seller', 'overview'],
    source: 'Seller',
    summary: 'Seller CIM. $11.4M revenue, $1.9M adjusted EBITDA.',
    pages: [
      { n: 7, heading: 'Revenue by service line', body: ['Service agreements: 14% of revenue. Repair and drain: 52%. Water heaters and replacement: 34%.'] },
    ],
  },
];

export const SECONDARY_MILESTONES: Milestone[] = [
  { id: 'cm1', acqId: 'acq-coastal', title: 'IOI due', date: '2026-10-16', phase: 'valuation', status: 'Upcoming' },
  { id: 'dm1', acqId: 'acq-delta', title: 'Screening decision', date: '2026-10-10', phase: 'strategy', status: 'Upcoming' },
];

export const SECONDARY_ACTIVITY: Activity[] = [
  { id: 'ca1', acqId: 'acq-coastal', at: '2026-09-21T10:00', actor: 'atlas', kind: 'finding', text: 'flagged recurring revenue below playbook threshold', ref: { type: 'finding', id: 'cf1' } },
  { id: 'ca2', acqId: 'acq-coastal', at: '2026-09-15T09:00', actor: 'p-marcus', kind: 'document', text: 'uploaded the CIM', ref: { type: 'document', id: 'cd1' } },
  { id: 'da1', acqId: 'acq-delta', at: '2026-09-24T15:00', actor: 'p-marcus', kind: 'work', text: 'completed intro call with founder' },
];

export const PRIOR: PriorAcquisition[] = [
  {
    id: 'pa-pinecrest',
    orgId: 'org-meridian',
    origin: 'Captured',
    name: 'Pinecrest Air',
    industry: 'HVAC',
    location: 'Dallas, TX',
    closed: '2022-04',
    ev: 11.0,
    revenueAtClose: 9.8,
    thesis: 'Platform foundation: residential HVAC with service agreements.',
    outcomes: [
      { metric: 'Year-2 revenue', predicted: '$11.5M', actual: '$12.1M', verdict: 'Exceeded' },
      { metric: 'Year-2 EBITDA margin', predicted: '17%', actual: '16.2%', verdict: 'Missed' },
      { metric: 'Technician retention (Y1)', predicted: '85%', actual: '81%', verdict: 'Missed' },
    ],
    issues: ['Pay-band misalignment caused technician departures in months 2–5'],
    lessons: [
      { id: 'l1', text: 'Align technician pay bands before Day 1, not after.', category: 'People', inPlaybook: true },
    ],
    atDiligence: { top5Pct: 14, recurringPct: 34, techRetentionPct: 79, askMultiple: 5.8 },
    tags: ['retention', 'pay bands'],
  },
  {
    id: 'pa-bluebonnet',
    orgId: 'org-meridian',
    origin: 'Captured',
    name: 'Bluebonnet Plumbing',
    industry: 'Plumbing',
    location: 'Fort Worth, TX',
    closed: '2023-02',
    ev: 8.5,
    revenueAtClose: 7.2,
    thesis: 'Add plumbing capability to DFW.',
    outcomes: [
      { metric: 'Time to full license transfer', predicted: '30 days', actual: '4 months', verdict: 'Missed' },
      { metric: 'Year-1 revenue', predicted: '$7.6M', actual: '$7.1M', verdict: 'Missed' },
    ],
    issues: ['Founder was sole Responsible Master Plumber; commercial bidding paused for 4 months post-close'],
    lessons: [
      { id: 'l2', text: 'Identify and license a successor qualifier before close where the founder is license holder.', category: 'Legal / Regulatory', inPlaybook: true },
    ],
    atDiligence: { top5Pct: 18, recurringPct: 19, techRetentionPct: 84, askMultiple: 5.6 },
    tags: ['licensing', 'owner dependency'],
  },
  {
    id: 'pa-gulf',
    orgId: 'org-meridian',
    origin: 'Captured',
    name: 'Gulf Coast Fire Protection',
    industry: 'Fire / life safety',
    location: 'Houston, TX',
    closed: '2023-09',
    ev: 14.0,
    revenueAtClose: 10.5,
    thesis: 'Enter fire/life safety with inspection-led recurring revenue.',
    outcomes: [
      { metric: 'Year-1 EBITDA', predicted: '$2.3M', actual: '$2.05M', verdict: 'Missed' },
      { metric: 'Inspection revenue share', predicted: '40%', actual: '44%', verdict: 'Exceeded' },
    ],
    issues: ['Warranty and callback costs presented as non-recurring were recurring (~$150K/yr)'],
    lessons: [
      { id: 'l3', text: 'Treat warranty/callback costs as recurring unless 3 years of evidence say otherwise.', category: 'Financial', inPlaybook: true },
    ],
    atDiligence: { top5Pct: 21, recurringPct: 44, techRetentionPct: 86, askMultiple: 6.4 },
    tags: ['QoE', 'warranty'],
  },
  {
    id: 'pa-summit',
    orgId: 'org-meridian',
    origin: 'Captured',
    name: 'Summit Electrical Services',
    industry: 'Electrical',
    location: 'San Antonio / Austin, TX',
    closed: '2024-06',
    ev: 16.0,
    revenueAtClose: 14.2,
    thesis: 'Central Texas electrical services platform.',
    outcomes: [
      { metric: 'Billing disruption', predicted: 'None', actual: '$1.1M collections delayed', verdict: 'Missed' },
      { metric: 'Year-2 revenue', predicted: '$16.0M', actual: '$16.8M', verdict: 'Exceeded' },
    ],
    issues: ['90-day field-service software migration overlapped peak season and disrupted invoicing'],
    lessons: [
      { id: 'l4', text: 'Defer field-service software migration until after the first peak season (≈ month 6).', category: 'Integration', inPlaybook: false },
    ],
    atDiligence: { top5Pct: 24, recurringPct: 27, techRetentionPct: 82, askMultiple: 6.2 },
    tags: ['integration', 'systems', 'ERP'],
  },
  {
    id: 'pa-redriver',
    orgId: 'org-meridian',
    origin: 'Captured',
    name: 'Red River Mechanical',
    industry: 'HVAC / Mechanical',
    location: 'Tyler, TX',
    closed: '2025-03',
    ev: 9.0,
    revenueAtClose: 8.1,
    thesis: 'East Texas commercial mechanical services.',
    outcomes: [
      { metric: 'Top-5 customer concentration at close', predicted: 'Acceptable', actual: '34%', verdict: 'Missed' },
      { metric: 'Year-1 revenue', predicted: '$8.6M', actual: '$7.1M', verdict: 'Missed' },
      { metric: 'Largest customer retained', predicted: 'Yes', actual: 'Lost in month 9', verdict: 'Missed' },
    ],
    issues: ['Largest customer (14% of revenue) re-bid its contract after change of control', 'No contingent consideration to share the loss'],
    lessons: [
      { id: 'l5', text: 'Where top-5 > 30%, use contingent consideration tied to top-customer retention.', category: 'Valuation', inPlaybook: false },
      { id: 'l6', text: 'Talk to top customers before signing, not after.', category: 'Commercial', inPlaybook: false },
    ],
    atDiligence: { top5Pct: 34, recurringPct: 23, techRetentionPct: 74, askMultiple: 6.0 },
    tags: ['customer concentration', 'change of control', 'earn-out'],
  },
];
