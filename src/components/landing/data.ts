// Content for the product site. Every external number carries a source id that
// resolves to SOURCES; product pricing is indicative and labelled as such.

export const SOURCES = [
  { id: 1, label: 'Christensen, Alton, Rising & Waldeck, “The New M&A Playbook”, Harvard Business Review, March 2011', url: 'https://store.hbr.org/product/the-new-m-a-playbook/R1103B' },
  { id: 2, label: 'McKinsey & Company, “Where mergers go wrong”', url: 'https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/where-mergers-go-wrong' },
  { id: 3, label: 'McKinsey & Company, “How one approach to M&A is more likely to create value than all others”', url: 'https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/how-one-approach-to-m-and-a-is-more-likely-to-create-value-than-all-others' },
  { id: 4, label: 'McKinsey & Company, “Gen AI in M&A: From theory to practice to high performance”', url: 'https://www.mckinsey.com/capabilities/m-and-a/our-insights/gen-ai-in-m-and-a-from-theory-to-practice-to-high-performance' },
  { id: 5, label: 'SS&C Intralinks, “AI in M&A Dealmaking” report', url: 'https://www3.intralinks.com/rs/414-BKN-706/images/SS&C-Intralinks-AI-in-M&A-Dealmaking-Report.pdf' },
  { id: 6, label: 'Bain & Company, M&A Report 2026: “Five ways AI is creating more value in M&A right now”', url: 'https://www.bain.com/insights/capability-for-a-new-era-m-and-a-report-2026/' },
  { id: 7, label: 'McKinsey Global Institute, “The social economy”, 2012', url: 'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy' },
];

/** The problem: why repeat acquirers need institutional intelligence. */
export const PROBLEM = [
  { n: '70–90%', t: 'of acquisitions fail to deliver what was expected of them.', src: 1 },
  { n: '~70%', t: 'of mergers miss their revenue-synergy estimates; cost synergies are overestimated in about a third of deals.', src: 2 },
  { n: '19%', t: 'of a knowledge worker’s week goes to searching for and gathering information.', src: 7 },
  { n: '+2%', t: 'a year in excess shareholder returns for programmatic acquirers, the only M&A approach that beats peers on average.', src: 3 },
];

/** What AI is already doing for dealmakers. Industry benchmarks, not Atlas results. */
export const BENCHMARKS = [
  { n: '~20%', t: 'average reduction in M&A cost reported by teams using gen AI', src: 4 },
  { n: '30–50%', t: 'faster deal cycles, reported by 40% of gen-AI users', src: 4 },
  { n: 'Up to 30%', t: 'of due-diligence time saved, reported by over a third of dealmakers', src: 5 },
  { n: '2–3×', t: 'faster identification and confirmation of cost synergies in leading integration programs', src: 6 },
];

export const PILLARS = [
  {
    k: 'Strategy',
    t: 'Screen smarter, earlier',
    d: 'Every target is pre-screened against your playbook before anyone builds a model. Pass reasons are kept, so the team stops re-evaluating the same companies, and the thesis assumptions are tracked from screening to Day 100.',
    m: ['Pipeline pre-screen', 'Investment thesis with testable assumptions', 'Benchmarks against your own past deals'],
  },
  {
    k: 'Diligence',
    t: 'Find what matters before the price is set',
    d: 'Findings are drafted as documents arrive, each linked to the page it came from. Seller claims are checked against the evidence, and the workstreams share one record instead of nine spreadsheets.',
    m: ['Page-level citations', 'Seller claims vs. evidence', 'Q&A and information requests drafted from findings'],
  },
  {
    k: 'Terms',
    t: 'Turn evidence into price and protection',
    d: 'Findings flow into the valuation, the LOI terms and the definitive agreement. Each decision comes with options, the precedent from your prior deals and the reasoning behind every number.',
    m: ['Structured LOI terms', 'Finding → SPA protection map', 'Decisions with approvers and rationale'],
  },
  {
    k: 'Integration',
    t: 'Capture the value you paid for',
    d: 'Day 1 and 100-day plans are generated from diligence, with synergy, retention and systems KPIs tracked against the thesis. What you learn becomes a playbook change for the next deal.',
    m: ['100-day plan and KPIs', 'Outcomes vs. thesis', 'Lessons feed the playbook'],
  },
];

export type Mark = 2 | 1 | 0;
export const COMPARE_COLS = ['Spreadsheets & email', 'Virtual data rooms', 'Deal pipeline CRMs', 'General AI assistants', 'Atlas'];
export const COMPARE: { row: string; v: Mark[] }[] = [
  { row: 'Covers strategy through integration', v: [1, 0, 1, 0, 2] },
  { row: 'Reads documents and cites the exact page', v: [0, 1, 0, 1, 2] },
  { row: 'Scores targets against your own playbook', v: [1, 0, 1, 0, 2] },
  { row: 'Learns from your past acquisitions', v: [0, 0, 1, 0, 2] },
  { row: 'Drafts risks, decisions and terms for approval', v: [0, 0, 1, 1, 2] },
  { row: 'Separates verified from seller-stated figures', v: [0, 0, 0, 0, 2] },
  { row: 'Audit trail of every human decision', v: [0, 1, 1, 0, 2] },
];

export const TRUST = [
  { t: 'Every claim has a source', d: 'Facts link to the page, cell or clause they came from. If Atlas can’t cite it, it says so.' },
  { t: 'Labelled, never blended', d: 'Fact, AI interpretation, recommendation and human decision are always shown as different things.' },
  { t: 'Language models read; code computes', d: 'Multiples, benchmarks and playbook scores are calculated deterministically, so the same inputs give the same answer.' },
  { t: 'People approve, Atlas proposes', d: 'Nothing Atlas drafts becomes a record until a named person accepts it. Every approval is in the audit trail.' },
  { t: 'Your deals stay yours', d: 'Each customer is an isolated tenant. Your documents and deal history are not used to train shared models.' },
  { t: 'Honest about where we are', d: 'Atlas is in expert validation. Security attestations such as SOC 2 will be published before general availability; we don’t claim what we haven’t earned.' },
];

export const SEGMENTS = [
  {
    k: 'Independent sponsors & first-time acquirers',
    t: 'A seasoned deal team in a box',
    d: 'One or two acquisitions a year, a lean team and outside advisors. Atlas gives you the playbook, the checklists and the second pair of eyes a corp dev team would.',
    plan: 'Deal',
  },
  {
    k: 'Serial acquirers & PE platforms',
    t: 'Repeatable, and better every time',
    d: 'Three to twenty add-ons a year in one or two verticals. Atlas turns each deal into institutional memory, so pricing, diligence and integration improve with volume.',
    plan: 'Platform',
  },
  {
    k: 'Enterprise corporate development',
    t: 'Governance across many deals and verticals',
    d: 'Multiple playbooks, business units and approvers. Atlas adds consistency, audit and portfolio-level visibility without replacing your advisors or data room.',
    plan: 'Enterprise',
  },
];

export const TIERS = [
  {
    name: 'Deal',
    for: 'Independent sponsors, search funds and first acquisitions',
    monthly: 990,
    annual: 790,
    cta: 'Start with one deal',
    features: ['1 active acquisition', 'Up to 5 team members', 'Industry playbook templates', 'Atlas document reading and citations', 'Q&A, information requests and review queue', 'IOI, LOI, due diligence report and IC memo'],
  },
  {
    name: 'Platform',
    for: 'Serial acquirers and PE platforms',
    monthly: 3500,
    annual: 2900,
    popular: true,
    cta: 'Run your program',
    features: ['Up to 6 active acquisitions', 'Up to 25 team members', 'Your own playbook, versioned', 'Acquisition memory: backfill up to 50 past deals', 'Target pipeline with playbook pre-screen', 'Day 1, 100-day plan and integration KPIs', 'Advisors and sellers join free as guests'],
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
  { q: 'Does Atlas replace our advisors?', a: 'No. Your QoE provider, counsel and bankers do the work they are accountable for. Atlas reads their output alongside the seller’s documents, connects it to your playbook and past deals, and keeps the deal team’s record. Advisors can join a deal as guests at no cost.' },
  { q: 'What happens when the AI is wrong?', a: 'Every statement shows its source and its label, so a reviewer can check it in one click. Nothing becomes a finding, risk or decision until a person accepts it, and numbers are computed in code rather than generated by a language model.' },
  { q: 'Is our data used to train models?', a: 'No. Each customer is an isolated tenant and your documents and deal history are not used to train shared models. Enterprise customers can choose a dedicated tenant or private cloud.' },
  { q: 'How long does it take to get started?', a: 'A single deal can start the same day using an industry playbook. Building your own playbook and backfilling past acquisitions typically happens in the first weeks, from the IC memos and integration reports you already have.' },
  { q: 'What deal sizes is Atlas built for?', a: 'The engine is the same at any size. Today it is tuned for lower-middle-market and mid-market operating companies, in services, healthcare and software, where teams are lean and repeatable playbooks matter most.' },
  { q: 'Are the savings on this page guaranteed?', a: 'No. The benchmarks are published industry research, not Atlas results, and the estimator uses your own inputs. We will publish measured results from pilot customers when we have them.' },
];
