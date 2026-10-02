import type { Proposal, ResearchItem, SellerClaim } from '@/lib/types';

// SYNTHETIC DEMO DATA. Intelligence-layer seed for ABC Mechanical: what Atlas
// has drafted for review, external research, and checks on seller claims.

const A = 'acq-abc';

export const ABC_PROPOSALS: Proposal[] = [
  {
    id: 'pr-ic-stale',
    acqId: A,
    kind: 'deliverable',
    title: 'IC memo draft is out of date',
    summary: 'Since the draft was generated on Oct 1, the QoE finding was confirmed and a sales-tax finding was added. Sections 4, 5 and 6 are affected.',
    basis: 'Deliverables are linked to the findings and decisions they cite.',
    confidence: 'High',
    createdAt: '2026-10-02',
    status: 'Pending',
    payload: { deliverableId: 'dl-ic' },
  },
  {
    id: 'pr-gap-ar',
    acqId: A,
    kind: 'request',
    title: 'Request AR aging as of Sep 30',
    summary: 'Not in the data room. The QoE recommends an NWC peg but the latest aging is from June.',
    basis: 'Playbook v4 request list: current AR aging before SPA.',
    confidence: 'High',
    createdAt: '2026-10-02',
    status: 'Pending',
    payload: { action: { title: 'Request AR aging as of Sep 30, 2026', ownerId: 'p-elena', workstream: 'financial', due: '2026-10-07', kind: 'Request' } },
  },
  {
    id: 'pr-risk-tax',
    acqId: A,
    kind: 'risk',
    parentFindingId: 'f-salestax',
    title: 'Voluntary disclosure may surface additional periods',
    summary: 'A voluntary disclosure for 2023–2025 can prompt review of earlier years. Exposure could exceed the $150K escrow.',
    basis: 'Sales-tax finding + standard VDA look-back practice.',
    confidence: 'Medium',
    createdAt: '2026-10-01',
    status: 'Pending',
    payload: { risk: { title: 'Sales-tax exposure may exceed the escrow', description: 'A voluntary disclosure may extend the look-back beyond 2023.', severity: 'Medium', probability: 'Possible', ownerId: 'p-nora', mitigation: 'Size escrow on a 4-year look-back; indemnity survival of 4 years.' } },
  },
  {
    id: 'pr-research-wages',
    acqId: A,
    kind: 'research',
    title: 'A competitor opened a Round Rock branch in August',
    summary: 'A PE-backed HVAC platform is hiring technicians in Round Rock at a posted range ~8% above ABC’s median technician pay.',
    basis: 'External research: job postings and press releases (synthetic).',
    confidence: 'Medium',
    createdAt: '2026-10-01',
    status: 'Pending',
    payload: {
      finding: {
        title: 'Competitor hiring in Round Rock at ~8% higher technician pay',
        workstream: 'hr',
        severity: 'Medium',
        ownerId: 'p-tom',
        fact: { text: 'A PE-backed HVAC platform opened a Round Rock branch in August 2026 and is posting technician roles at a pay range about 8% above ABC’s median technician pay.', citations: [{ docId: 'd-emp', page: 2 }] },
        interpretation: 'Adds pressure to an already elevated 28% turnover rate during the transaction.',
        recommendation: 'Size the retention pool assuming market pay moves up 5–8%.',
        implications: [{ area: 'People', text: 'Retention pool sizing.' }],
      },
    },
  },
  {
    id: 'pr-playbook-escrow',
    acqId: A,
    kind: 'playbook',
    title: 'Propose playbook change: single-customer escrow above 10%',
    summary: 'Red River (14%) and ABC (11.2%) both had a single customer above 10% with change-of-control rights. Propose: any customer above 10% triggers a concentration escrow or earn-out.',
    basis: 'Pattern across 2 acquisitions; Red River outcome.',
    confidence: 'Medium',
    createdAt: '2026-09-30',
    status: 'Pending',
  },
];

export const ABC_RESEARCH: ResearchItem[] = [
  { id: 'rs1', acqId: A, topic: 'Market', headline: 'Austin metro HVAC demand driven by commercial and multifamily growth', detail: 'Continued population growth and data-center and medical construction support replacement demand. Residential new-build has slowed since 2024, which matters less for ABC given its commercial mix.', source: 'Regional construction and permit data (synthetic)', sourceType: 'Industry data', relevance: 'Context', asOf: '2026-09-10' },
  { id: 'rs2', acqId: A, topic: 'Competition', headline: 'Three consolidators active in Central Texas HVAC', detail: 'PE-backed platforms have acquired four Austin-area HVAC businesses since 2024. Expect competition for technicians and for ABC’s top commercial accounts.', source: 'Press releases (synthetic)', sourceType: 'News', relevance: 'Material', asOf: '2026-09-12' },
  { id: 'rs3', acqId: A, topic: 'Regulatory', headline: 'Licenses are tied to an individual license holder', detail: 'Texas ACR contractor licensing requires a licensed individual. A change of company ownership does not transfer the individual’s license; a successor must be licensed.', source: 'State licensing agency guidance (summarized)', sourceType: 'Government', relevance: 'Material', asOf: '2026-09-01' },
  { id: 'rs4', acqId: A, topic: 'Company records', headline: 'No open litigation; one settled warranty dispute (2022)', detail: 'County records show one settled commercial warranty dispute and no liens or judgments. Consistent with the outside counsel search.', source: 'County court records (synthetic)', sourceType: 'Public record', relevance: 'Context', asOf: '2026-09-18' },
  { id: 'rs5', acqId: A, topic: 'Reputation', headline: '4.7★ across 2,100 reviews; Waco branch trails', detail: 'Austin and Round Rock average 4.8★. Waco averages 4.2★ with recurring comments about response times, consistent with its staffing gaps.', source: 'Public review sites (synthetic)', sourceType: 'Reviews', relevance: 'Context', asOf: '2026-09-25' },
  { id: 'rs6', acqId: A, topic: 'People', headline: 'Founder serves on the Brazos Valley ISD facilities advisory board', detail: 'Public board minutes list Gary Castillo as a community member of the district’s facilities advisory board since 2019, which helps explain the relationship strength and the consent risk.', source: 'Public meeting minutes (synthetic)', sourceType: 'Public record', relevance: 'Material', asOf: '2026-09-22' },
];

export const ABC_CLAIMS: SellerClaim[] = [
  { id: 'cl1', acqId: A, claim: 'A diversified base of more than 2,300 customers; no customer above 12%.', claimSource: { docId: 'd-cim', page: 14 }, verdict: 'Partly true', evidence: 'True by count and for the largest customer (11.2%), but top-5 customers are 38.4% of revenue.', evidenceSources: [{ docId: 'd-cust', page: 1 }, { docId: 'd-qoe', page: 17 }] },
  { id: 'cl2', acqId: A, claim: 'FY2025 Adjusted EBITDA of $3.62M.', claimSource: { docId: 'd-cim', page: 24 }, verdict: 'Contradicted', evidence: 'QoE supports $3.20M after rejecting $420K of add-backs.', evidenceSources: [{ docId: 'd-qoe', page: 11 }] },
  { id: 'cl3', acqId: A, claim: 'Recurring maintenance agreements are 31% of revenue.', claimSource: { docId: 'd-cim', page: 9 }, verdict: 'Verified', evidence: 'Customer revenue file shows 31.0% for FY2025.', evidenceSources: [{ docId: 'd-cust', page: 2 }] },
  { id: 'cl4', acqId: A, claim: 'Long-tenured relationships averaging nine years with top accounts.', claimSource: { docId: 'd-cim', page: 14 }, verdict: 'Unverified', evidence: 'Retention data requested Sep 8; not yet received.', evidenceSources: [] },
  { id: 'cl5', acqId: A, claim: '92% renewal rate on maintenance agreements.', claimSource: { docId: 'd-mp', page: 8 }, verdict: 'Unverified', evidence: 'Agreement-level churn data not yet provided.', evidenceSources: [] },
];
