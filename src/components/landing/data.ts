// Content for the product site. Product-specific statements only: no third-party
// performance statistics. Pricing is indicative and labelled as such.

export const THESIS = [
  { k: 'Evidence', t: 'Every acquisition creates evidence.', d: 'CIMs, QoE reports, contracts, customer files, management answers, decisions, integration results.' },
  { k: 'Intelligence', t: 'Atlas turns that evidence into intelligence.', d: 'Cited findings, verified claims, risks, decisions and actions, scored against your playbook.' },
  { k: 'Memory', t: 'That intelligence improves the next acquisition.', d: 'What you predicted, what happened and what you learned becomes part of the playbook.' },
];

export const LOOP = [
  { k: 'Understand', d: 'Thesis, criteria and playbook guardrails are set before the first target.' },
  { k: 'Research', d: 'Targets are screened and researched against the playbook and past deals.' },
  { k: 'Diligence', d: 'Evidence is read, findings are cited and seller claims are checked.' },
  { k: 'Decide', d: 'Findings become risks and decisions with options, owners and approvers.' },
  { k: 'Execute', d: 'Price, terms, protections, approvals and closing follow from the decisions.' },
  { k: 'Integrate', d: 'Day 1 and 100-day plans are built from what diligence found.' },
  { k: 'Measure', d: 'Synergies, retention and systems are tracked against the thesis.' },
  { k: 'Learn', d: 'Predictions are compared with outcomes and lessons are recorded.' },
  { k: 'Next acquisition', d: 'The playbook is updated before the next deal starts.' },
];

export const SYSTEM = [
  { k: 'Acquisition Playbook', d: 'Every target is evaluated against your own thesis, thresholds and historical benchmarks, calculated in code and versioned like policy.' },
  { k: 'Decision Intelligence', d: 'Evidence, finding, risk, decision and action stay connected, so every decision can be traced to the page that prompted it.' },
  { k: 'Acquisition Memory', d: 'What the team predicted, what actually happened and what was learned, kept for every completed acquisition.' },
  { k: 'Seller Claim Verification', d: 'Claims in the CIM and management presentations are compared with evidence in the data room, and discrepancies are surfaced.' },
  { k: 'Continuous Review', d: 'Proposed findings, research, decisions and playbook changes arrive in one review queue. A named person accepts, edits or dismisses each.' },
  { k: 'Built for Serial Acquirers', d: 'Designed for teams that acquire repeatedly, from a lean deal team to an enterprise M&A organization with several playbooks.' },
];

export const PILLARS = [
  { k: 'Strategy', t: 'Screen against the thesis', d: 'Targets are pre-screened against the playbook, pass reasons are kept, and thesis assumptions are tracked from screening to Day 100.' },
  { k: 'Diligence', t: 'Find what matters before pricing', d: 'Workstreams share one record of cited findings, information requests and Q&A instead of separate trackers.' },
  { k: 'Terms', t: 'Turn findings into terms', d: 'Findings flow into valuation, LOI terms and definitive-agreement protections, with the reasoning behind each number.' },
  { k: 'Integration', t: 'Measure what you paid for', d: 'Day 1 and 100-day plans carry diligence forward; synergy, retention and systems KPIs are tracked against the thesis.' },
];

export type Mark = 2 | 1 | 0;
export const COMPARE_COLS = ['Spreadsheets & email', 'Virtual data rooms', 'Deal pipeline CRMs', 'General AI assistants', 'Atlas'];
export const COMPARE: { row: string; v: Mark[] }[] = [
  { row: 'Covers strategy through integration', v: [1, 0, 1, 0, 2] },
  { row: 'Cites the exact page behind every finding', v: [0, 1, 0, 1, 2] },
  { row: 'Evaluates targets against your own playbook', v: [1, 0, 1, 0, 2] },
  { row: 'Keeps predictions, outcomes and lessons from past deals', v: [0, 0, 1, 0, 2] },
  { row: 'Connects findings to risks, decisions and actions', v: [0, 0, 1, 1, 2] },
  { row: 'Separates verified from seller-stated figures', v: [0, 0, 0, 0, 2] },
  { row: 'Audit trail of every human decision', v: [0, 1, 1, 0, 2] },
];

export const TRUST = [
  { t: 'Every finding has a source', d: 'Findings link to the page, cell or clause they came from. Where there is no source, Atlas says so.' },
  { t: 'Labelled, never blended', d: 'Fact, AI interpretation, recommendation and human decision are always shown as different things.' },
  { t: 'Language models read; code computes', d: 'Multiples, benchmarks and playbook results are calculated deterministically, so the same inputs give the same answer.' },
  { t: 'People approve', d: 'Nothing Atlas proposes becomes a record until a named person accepts it. Every approval is in the audit trail.' },
  { t: 'Your acquisitions stay yours', d: 'Each customer is an isolated tenant. Your documents and deal history are not used to train shared models.' },
  { t: 'Clear about our stage', d: 'Atlas is in expert validation. Security attestations such as SOC 2 will be published before general availability.' },
];

export const SEGMENTS = [
  { k: 'Lean deal teams', t: 'Independent sponsors and first acquisitions', d: 'One or two acquisitions a year with outside advisors. Atlas provides the playbook, the checklists and a consistent record of every decision.', plan: 'Deal' },
  { k: 'Serial acquirers', t: 'Platforms and programmatic acquirers', d: 'Several add-ons a year in one or two sectors. Each acquisition adds to the playbook and the memory used for the next one.', plan: 'Platform' },
  { k: 'Enterprise M&A', t: 'Corporate development organizations', d: 'Several playbooks, business units and approvers. Atlas adds consistency, governance and portfolio-level visibility alongside your advisors and data room.', plan: 'Enterprise' },
];

export const TIERS = [
  {
    name: 'Deal',
    for: 'Independent sponsors, search funds and first acquisitions',
    monthly: 990,
    annual: 790,
    cta: 'Start with one acquisition',
    features: ['1 active acquisition', 'Up to 5 deal team members', 'Industry playbook templates', 'Cited findings and seller claim verification', 'Review queue, Q&A and information requests', 'IOI, LOI, due diligence report and IC memo'],
  },
  {
    name: 'Platform',
    for: 'Serial acquirers and PE platforms',
    monthly: 3500,
    annual: 2900,
    popular: true,
    cta: 'Run your program',
    features: ['Up to 6 active acquisitions', 'Up to 25 deal team members', 'Your own acquisition playbook, versioned', 'Acquisition memory: load up to 50 past deals', 'Target pipeline with playbook pre-screen', 'Day 1, 100-day plan and value realization', 'Advisors and sellers join free as guests'],
  },
  {
    name: 'Enterprise',
    for: 'Corporate development across business units',
    monthly: null,
    annual: null,
    cta: 'Talk to us',
    features: ['Unlimited acquisitions and playbooks', 'SSO / SAML and SCIM provisioning', 'Dedicated tenant or private cloud, data residency', 'Audit export and retention policies', 'Data room, ERP and CRM integrations', 'Named success team and SLA'],
  },
];

export const FAQ = [
  { q: 'Does Atlas replace our advisors or data room?', a: 'No. Your QoE provider, counsel and bankers do the work they are accountable for, and your data room stays where it is. Atlas reads their output alongside the seller’s documents, applies your playbook and past deals, and keeps the deal team’s record of findings and decisions.' },
  { q: 'What happens when Atlas is wrong?', a: 'Every finding shows its source and its label, so a reviewer can check it in one click. Nothing becomes a finding, risk or decision until a person accepts it, and numbers are computed in code rather than generated by a language model.' },
  { q: 'Is our data used to train models?', a: 'No. Each customer is an isolated tenant and your documents and deal history are not used to train shared models. Enterprise customers can choose a dedicated tenant or private cloud.' },
  { q: 'How do past acquisitions get into Acquisition Memory?', a: 'From the IC memos, diligence reports and integration reviews you already have. Atlas proposes the structured record for each past deal, including thesis, findings, outcomes and lessons, and your team confirms it.' },
  { q: 'What deal sizes is Atlas built for?', a: 'The engine is the same at any size. It is tuned today for lower-middle-market and mid-market operating companies in services, healthcare and software, where teams are lean and repeatable playbooks matter most.' },
  { q: 'How will we know it is working?', a: 'During a pilot we measure it on your own acquisitions: time from data room to IC, findings raised before pricing, and decisions traced to evidence. We do not claim savings we have not measured.' },
];
