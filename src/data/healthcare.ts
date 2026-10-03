import type { Acquisition, PriorAcquisition } from '@/lib/types';
import type { Sample } from './samples';
import { assumptionsFrom } from '@/lib/playbook';
import { PLAYBOOKS } from './playbooks';

// SYNTHETIC DEMO DATA. Halcyon Health Partners and every practice, physician,
// payer and referral source below are fictional.

const HB = PLAYBOOKS.find((p) => p.id === 'pb-health')!;

const upcoming = { status: 'upcoming' as const, progress: 0, summary: '' };

export const BROOKFIELD: Acquisition = {
  id: 'acq-brookfield',
  orgId: 'org-halcyon',
  playbookId: 'pb-health',
  codename: 'Project Wren',
  name: 'Brookfield Hand Center',
  status: 'Active',
  currentPhase: 'strategy',
  stageLabel: 'Strategy & Target Screening',
  dealLeadId: 'p-h-sameer',
  target: { legalName: 'Brookfield Hand & Upper Extremity, PC', industry: 'Hand & upper-extremity surgery', hq: 'Lexington, KY', founded: 2009, revenue: 16.8, ebitda: 2.9, ebitdaBasis: 'Owner estimate', employees: 64, branches: ['Lexington', 'Georgetown'], ownership: 'Physician-owned (4 partners)', description: 'Single-specialty hand and upper-extremity practice with in-office procedure suites.' },
  strategy: 'Tuck-in: add hand subspecialty to the Lexington market.',
  ev: 23.0,
  evBasis: 'Indicative, pre-IOI',
  thesis: { summary: 'Add hand subspecialty capacity to the Lexington orthopedic network.', pillars: ['Subspecialty coverage', 'Procedure volume into Halcyon ASC'], assumptions: assumptionsFrom(HB) },
  phases: {
    strategy: { status: 'active', progress: 35, summary: 'Partners open to a conversation; CIM requested.' },
    valuation: upcoming,
    loi: upcoming,
    diligence: upcoming,
    agreement: upcoming,
    financing: upcoming,
    closing: upcoming,
    integration: upcoming,
  },
  team: [
    { personId: 'p-h-sameer', dealRole: 'Owner', workstreams: ['referrals', 'rcm'] },
    { personId: 'p-h-grace', dealRole: 'Approver', workstreams: ['rcm'] },
  ],
};

export const HALCYON_PRIOR: PriorAcquisition[] = [
  {
    id: 'pa-lakeside',
    orgId: 'org-halcyon',
    origin: 'Captured',
    name: 'Lakeside Orthopedics',
    industry: 'Orthopedics',
    location: 'Columbus, OH',
    closed: '2023-05',
    ev: 42.0,
    revenueAtClose: 24.0,
    thesis: 'Enter Columbus with an established general orthopedic group.',
    outcomes: [
      { metric: 'Referral volume (Y1)', predicted: 'Flat', actual: '−22%', verdict: 'Missed' },
      { metric: 'Year-1 collections', predicted: '$25.1M', actual: '$21.4M', verdict: 'Missed' },
      { metric: 'Physician retention (Y1)', predicted: '100%', actual: '100%', verdict: 'Met' },
    ],
    issues: ['Second-largest referral source affiliated with a hospital system in month 5 and redirected referrals'],
    lessons: [{ id: 'hl1', text: 'Check every top-5 referral source for pending hospital or PE affiliation before LOI.', category: 'Referrals', inPlaybook: true }],
    tags: ['referral concentration', 'hospital affiliation'],
    atDiligence: { commercialPayerPct: 58, top3ReferralPct: 47, top2PhysicianPct: 31, providerRetentionPct: 88, askMultiple: 8.6 },
  },
  {
    id: 'pa-crestview',
    orgId: 'org-halcyon',
    origin: 'Captured',
    name: 'Crestview Spine & Joint',
    industry: 'Spine / ASC',
    location: 'Cincinnati, OH',
    closed: '2024-08',
    ev: 55.0,
    revenueAtClose: 31.0,
    thesis: 'Add spine surgery and a Medicare-certified ASC.',
    outcomes: [
      { metric: 'Billing continuity', predicted: 'No interruption', actual: '94-day Medicare billing hold', verdict: 'Missed' },
      { metric: 'Year-2 collections', predicted: '$34.0M', actual: '$35.2M', verdict: 'Exceeded' },
    ],
    issues: ['Medicare change-of-ownership processing delayed ASC billing for 94 days; $2.3M of collections deferred'],
    lessons: [{ id: 'hl2', text: 'File change-of-ownership enrollment 90 days before close and arrange bridge working capital.', category: 'Regulatory', inPlaybook: true }],
    tags: ['CHOW', 'regulatory', 'billing'],
    atDiligence: { commercialPayerPct: 61, top3ReferralPct: 38, top2PhysicianPct: 41, providerRetentionPct: 83, askMultiple: 9.2 },
  },
  {
    id: 'pa-valley',
    orgId: 'org-halcyon',
    origin: 'Captured',
    name: 'Valley Sports Medicine',
    industry: 'Sports medicine',
    location: 'Dayton, OH',
    closed: '2025-04',
    ev: 28.0,
    revenueAtClose: 17.0,
    thesis: 'Add sports medicine referral engine to the Dayton network.',
    outcomes: [
      { metric: 'Physician retention (Y1)', predicted: '100%', actual: '86% (senior physician retired month 7)', verdict: 'Missed' },
      { metric: 'Year-1 collections', predicted: '$17.6M', actual: '$14.4M', verdict: 'Missed' },
    ],
    issues: ['Senior physician generating 29% of collections retired in month 7; no retention agreement in place'],
    lessons: [{ id: 'hl3', text: 'Top physicians’ retention agreements are a closing condition when two physicians exceed 35% of collections.', category: 'Physicians', inPlaybook: false }],
    tags: ['physician dependency', 'retention'],
    atDiligence: { commercialPayerPct: 55, top3ReferralPct: 42, top2PhysicianPct: 52, providerRetentionPct: 76, askMultiple: 8.4 },
  },
];

export const RB_SAMPLE: Sample = {
  defaults: { name: 'Riverbend Orthopedic & Spine', industry: 'Orthopedics & spine', hq: 'Louisville, KY', revenue: 38.4, ebitda: 6.1, rationale: 'Enter Louisville with a 6-clinic orthopedic group and ASC; anchor for Kentucky expansion.' },
  enrich: {
    target: { legalName: 'Riverbend Orthopedic & Spine, PLLC', industry: 'Orthopedics & spine', hq: 'Louisville, KY', founded: 2004, revenue: 38.4, ebitda: 6.1, ebitdaBasis: 'Seller adjusted FY2025 (unverified)', employees: 212, branches: ['6 clinics', '1 ASC (4 ORs)'], ownership: 'Physician-owned (9 partners)', description: 'Six-clinic orthopedic and spine practice with a Medicare-certified ambulatory surgery center.' },
    ev: 61.0,
    evBasis: 'Seller ask: 10.0x $6.1M adj. EBITDA',
  },
  docs: [
    { key: 'cim', name: 'Riverbend — Confidential Information Memorandum.pdf', type: 'PDF', category: 'CIM', workstream: 'referrals', version: 1, pageCount: 46, sizeKb: 7100, tags: ['seller'], source: 'Seller', summary: 'Seller CIM by Ridgeline Healthcare Advisors (fictional).', pages: [
      { n: 5, heading: 'Investment highlights', body: ['Strong physician retention, with a stable partner group averaging 11 years of tenure.', 'A diversified referral base across primary care, urgent care and sports performance partners.', 'Medicare-certified, fully accredited ambulatory surgery center.'] },
      { n: 21, heading: 'Financial summary', body: ['FY2025 net revenue of $38.4M; adjusted EBITDA of $6.1M after $0.68M of adjustments, including $410K physician compensation normalization.', 'Seller expectation: 10.0x adjusted EBITDA.'] },
    ] },
    { key: 'payer', name: 'Payer Mix & Collections FY2023–FY2025.xlsx', type: 'XLSX', category: 'Revenue Cycle', workstream: 'rcm', version: 1, pageCount: 3, sizeKb: 640, tags: ['payer mix'], source: 'Seller', summary: 'Collections by payer class and location.', pages: [
      { n: 1, heading: 'Sheet: Payer mix (% of collections)', body: ['Net collections FY2025: $38.4M.'], table: { columns: ['Payer class', 'FY2023', 'FY2024', 'FY2025'], rows: [['Commercial', '53.0%', '50.6%', '48.2%'], ['Medicare / MA', '28.9%', '30.4%', '31.5%'], ['Medicaid', '8.6%', '9.1%', '9.8%'], ['Workers’ comp / PI', '9.5%', '9.9%', '10.5%']], highlightRows: [0] } },
    ] },
    { key: 'ref', name: 'Referral Source Report FY2025.xlsx', type: 'XLSX', category: 'Referrals', workstream: 'referrals', version: 1, pageCount: 2, sizeKb: 410, tags: ['referrals'], source: 'Seller', summary: 'New-patient referrals by source and receiving physician.', pages: [
      { n: 1, heading: 'Sheet: Top referral sources (new patients)', body: ['14,820 new-patient referrals in FY2025.'], table: { columns: ['Referral source', 'Referrals', '% of total'], rows: [['Tri-County Primary Care Network', '4,594', '31.0%'], ['Ohio Valley Urgent Care', '2,594', '17.5%'], ['Westbrook Family Medicine', '1,853', '12.5%'], ['Self-referral / web', '1,334', '9.0%'], ['All other (212 sources)', '4,445', '30.0%']], highlightRows: [0, 1, 2] } },
      { n: 2, heading: 'Sheet: Referrals by receiving physician', body: ['Dr. Elena Marsh and Dr. Thomas Reid received 7,114 of 14,820 referrals (48.0%), most of them by name.'] },
    ] },
    { key: 'prod', name: 'Provider Productivity FY2025.xlsx', type: 'XLSX', category: 'Physicians', workstream: 'physicians', version: 1, pageCount: 1, sizeKb: 190, tags: ['wRVU', 'collections'], source: 'Seller', summary: 'wRVUs and professional collections for 14 physicians.', pages: [
      { n: 1, heading: 'Sheet: Top physicians by professional collections', body: ['Professional collections FY2025: $24.6M (excludes ASC facility fees).'], table: { columns: ['Physician', 'Specialty', 'Collections ($K)', '% of total'], rows: [['Dr. Elena Marsh', 'Spine', '6,420', '26.1%'], ['Dr. Thomas Reid', 'Joint replacement', '5,290', '21.5%'], ['Dr. Priya Anand', 'Sports medicine', '2,310', '9.4%'], ['11 other physicians', '—', '10,580', '43.0%']], highlightRows: [0, 1] } },
    ] },
    { key: 'emp', name: 'Physician Employment Agreements — Summary.pdf', type: 'PDF', category: 'Physicians', workstream: 'physicians', version: 1, pageCount: 18, sizeKb: 900, tags: ['employment', 'non-compete'], source: 'Seller', summary: 'Key terms for partner and employed physician agreements.', pages: [
      { n: 3, heading: 'Partner agreements — term and restrictive covenants', body: ['Dr. Marsh: term expires June 30, 2027. Dr. Reid: term expires November 30, 2027.', 'Restrictive covenant: 10 miles for 12 months after separation. No retention or deferred compensation provisions.'] },
    ] },
    { key: 'roster', name: 'Provider Roster & Departures 2023–2026.xlsx', type: 'XLSX', category: 'Physicians', workstream: 'physicians', version: 1, pageCount: 1, sizeKb: 80, tags: ['retention'], source: 'Seller', summary: 'Physician and APP roster with start and departure dates.', pages: [
      { n: 1, heading: 'Sheet: Physician retention', body: ['14 physicians at Jan 1, 2023; 3 departed by Sep 30, 2026 (2 to a hospital-employed group, 1 retired). Three-year retention 78.6%.'] },
    ] },
    { key: 'lic', name: 'Licensure & Medicare Enrollment Register.xlsx', type: 'XLSX', category: 'Regulatory', workstream: 'regulatory', version: 1, pageCount: 1, sizeKb: 70, tags: ['Medicare', 'licensure'], source: 'Seller', summary: 'State licenses, Medicare enrollments and certifications by entity.', pages: [
      { n: 1, heading: 'Sheet: Enrollments', body: ['Group practice and ASC are separately enrolled in Medicare. The ASC holds Medicare certification as a separate entity.'], table: { columns: ['Entity', 'Enrollment', 'Note'], rows: [['Riverbend Orthopedic & Spine, PLLC', 'Medicare group enrollment', 'Revalidation due Mar 2027'], ['Riverbend Surgery Center, LLC', 'Medicare-certified ASC', 'Ownership change requires CMS notification and enrollment update'], ['Clinic 6 (Shelbyville)', 'State facility license', 'Renewal pending since Aug 2026']], highlightRows: [1, 2] } },
    ] },
    { key: 'accr', name: 'ASC Accreditation Survey — Jun 2026.pdf', type: 'PDF', category: 'Clinical Quality', workstream: 'clinical', version: 1, pageCount: 14, sizeKb: 760, tags: ['accreditation'], source: 'Seller', summary: 'Triennial accreditation survey report for the ASC.', pages: [
      { n: 4, heading: 'Findings', body: ['Accreditation granted with two deficiencies requiring a plan of correction within 60 days: (1) incomplete sterilization load logs for Q1 2026; (2) two credentialing files missing current peer references.'] },
    ] },
    { key: 'payk', name: 'Heartland Health Plan — Provider Agreement.pdf', type: 'PDF', category: 'Payer Contract', workstream: 'payer', version: 1, pageCount: 32, sizeKb: 1500, tags: ['payer', 'assignment'], source: 'Seller', summary: 'Largest commercial payer agreement (22% of collections).', pages: [
      { n: 27, heading: 'Section 12 — Assignment', body: ['12.1 Provider may not assign this Agreement, including by change of control, without Plan’s prior written consent. Rates in Exhibit B expire March 31, 2027.'] },
    ] },
    { key: 'it', name: 'EHR & IT Assessment.pdf', type: 'PDF', category: 'Technology', workstream: 'ehr', version: 1, pageCount: 12, sizeKb: 540, tags: ['EHR', 'security'], source: 'Seller', summary: 'Internal assessment of EHR, billing and security controls.', pages: [
      { n: 2, heading: 'Summary', body: ['The current EHR version reaches vendor end of support in December 2027.', 'The billing system does not enforce multi-factor authentication. The last HIPAA security risk assessment was completed in 2023.'] },
    ] },
    { key: 'mal', name: 'Malpractice Claims History 2019–2026.pdf', type: 'PDF', category: 'Legal', workstream: 'legal', version: 1, pageCount: 6, sizeKb: 210, tags: ['malpractice'], source: 'Seller', summary: 'Professional liability claims and insurance.', pages: [{ n: 1, heading: 'Summary', body: ['Two closed claims (2020, 2022) settled within policy limits. One open claim (2025) reserved at $150K, within limits.'] }] },
  ],
  metrics: {
    values: { revenue: 38.4, commercialPayerPct: 48.2, top3ReferralPct: 61.0, top2PhysicianPct: 47.6, providerRetentionPct: 78.6, askMultiple: 10.0 },
    sources: { revenue: [{ docId: 'cim', page: 21 }], commercialPayerPct: [{ docId: 'payer', page: 1 }], top3ReferralPct: [{ docId: 'ref', page: 1 }], top2PhysicianPct: [{ docId: 'prod', page: 1 }], providerRetentionPct: [{ docId: 'roster', page: 1 }], askMultiple: [{ docId: 'cim', page: 21 }] },
  },
  discoveries: [
    {
      key: 'ref',
      afterDoc: 'ref',
      finding: {
        title: 'Referral concentration is materially higher than the CIM states',
        workstream: 'referrals',
        severity: 'High',
        ownerId: 'p-h-sameer',
        fact: { text: 'The top 3 referral sources account for 61.0% of new-patient referrals. The CIM describes the referral base as diversified.', citations: [{ docId: 'ref', page: 1, locator: 'Sheet "Top referral sources"' }, { docId: 'cim', page: 5 }] },
        calculation: '(4,594 + 2,594 + 1,853) ÷ 14,820 = 61.0%',
        interpretation: 'Well above the 40% playbook threshold and Halcyon’s historical median of 42%. At Lakeside, losing one referral source to a hospital affiliation cut volume 22%.',
        recommendation: 'Diligence the affiliation status of each top-5 referral source; price or structure for referral retention.',
        thesisLink: { assumptionId: 'top3ReferralPct', expected: '< 40%', actual: '61.0%' },
        implications: [
          { area: 'Commercial', text: 'Referral concentration: three primary-care and urgent-care groups drive most new patients.' },
          { area: 'People', text: 'Two physicians receive 48% of referrals, most by name.' },
          { area: 'Legal', text: 'Referral relationships need a Stark / anti-kickback review (medical directorships, leases).' },
          { area: 'Valuation', text: 'Revenue at risk if a top source affiliates elsewhere.' },
          { area: 'Integration', text: 'Referral-source outreach and physician retention become Day 1 priorities.' },
        ],
        possibleActions: ['Check top-5 referral sources for pending affiliations', 'Adjust valuation'],
      },
      chain: [
        { kind: 'risk', title: 'Referral volume depends on three outside groups', summary: 'A single affiliation change could redirect 12–31% of new patients.', basis: 'Finding + Lakeside precedent.', confidence: 'High', payload: { risk: { title: 'Referral volume depends on three outside groups', description: 'Top-3 sources are 61% of new patients; none are under Halcyon’s control.', severity: 'High', probability: 'Possible', ownerId: 'p-h-sameer', mitigation: 'Affiliation checks; referral-volume earn-out; Day 1 outreach plan.' } } },
        { kind: 'decision', title: 'Should the acquisition proceed at the current valuation?', summary: 'Three options drafted from the playbook and Halcyon’s past deals.', basis: 'Referral and physician concentration both fail Playbook v2; seller ask is 10.0x vs. 9.0x guardrail.', confidence: 'Medium', payload: { decision: { question: 'Should the acquisition proceed at the current valuation?', context: 'Seller asks 10.0x $6.1M. Top-3 referral sources 61%; top-2 physicians 47.6% of collections; commercial payer mix 48%.', options: [{ label: 'Proceed at 10.0x', description: 'Accept seller ask.' }, { label: 'Reduce to 8.5x', description: 'Price the concentration risk.' }, { label: '9.0x + earn-out on referral and physician retention', description: 'Up to 1.0x contingent on 24-month referral volume and both top physicians retained.' }], recommended: 2, approverId: 'p-h-laura', phase: 'valuation' } } },
        { kind: 'action', title: 'Check top-5 referral sources for pending affiliations', summary: 'Owner: Sameer Patel · due Oct 12', basis: 'Playbook lesson from Lakeside (adopted 2023).', confidence: 'High', payload: { action: { title: 'Check top-5 referral sources for pending hospital or PE affiliations', ownerId: 'p-h-sameer', workstream: 'referrals', due: '2026-10-12', kind: 'Task' } } },
      ],
    },
    {
      key: 'claim',
      afterDoc: 'ref',
      finding: {
        title: 'CIM claim of a “diversified referral base” is contradicted',
        workstream: 'referrals',
        severity: 'Medium',
        ownerId: 'p-h-sameer',
        fact: { text: 'The CIM calls the referral base diversified; the referral report shows 61% from three sources.', citations: [{ docId: 'cim', page: 5 }, { docId: 'ref', page: 1 }] },
        interpretation: 'Lowers confidence in other CIM statements, including physician retention.',
        recommendation: 'Ask the banker for the basis; verify remaining CIM claims.',
        implications: [{ area: 'Commercial', text: 'Seller statements need independent verification.' }],
      },
      chain: [],
    },
    {
      key: 'phys',
      afterDoc: 'emp',
      finding: {
        title: 'Two physicians generate 48% of collections; both contracts expire within 14 months',
        workstream: 'physicians',
        severity: 'Critical',
        ownerId: 'p-h-reyes',
        fact: { text: 'Drs. Marsh and Reid generate 47.6% of professional collections and receive 48.0% of referrals. Their agreements expire June and November 2027, with no retention provisions.', citations: [{ docId: 'prod', page: 1 }, { docId: 'ref', page: 2 }, { docId: 'emp', page: 3 }] },
        calculation: '26.1% + 21.5% = 47.6% of collections',
        interpretation: 'Above the 35% threshold. Valley Sports Medicine lost 18% of collections when one senior physician retired in month 7.',
        recommendation: 'Make retention agreements with both physicians an LOI condition; tie part of consideration to their retention.',
        thesisLink: { assumptionId: 'top2PhysicianPct', expected: '< 35%', actual: '47.6%' },
        implications: [
          { area: 'People', text: 'Physician retention terms before signing.' },
          { area: 'Valuation', text: 'Contingent consideration tied to physician retention.' },
          { area: 'Integration', text: 'Physician engagement plan from Day 1.' },
        ],
      },
      chain: [
        { kind: 'risk', title: 'Loss of a top physician', summary: 'Either departure would remove ~21–26% of collections and redirect named referrals.', basis: 'Valley Sports Medicine outcome.', confidence: 'High', payload: { risk: { title: 'Loss of Dr. Marsh or Dr. Reid', description: 'Each generates over 20% of collections and receives named referrals.', severity: 'Critical', probability: 'Possible', ownerId: 'p-h-reyes', mitigation: '5-year retention agreements signed at closing; equity rollover; referral transition plan.' } } },
        { kind: 'action', title: 'Negotiate retention terms with Drs. Marsh and Reid before LOI', summary: 'Owner: Dr. Michael Reyes · due Oct 16', basis: 'Playbook gate: physician leadership aligned before LOI.', confidence: 'High', payload: { action: { title: 'Negotiate retention terms with Drs. Marsh and Reid (LOI condition)', ownerId: 'p-h-reyes', workstream: 'physicians', due: '2026-10-16', kind: 'Task' } } },
      ],
    },
    {
      key: 'payer',
      afterDoc: 'payer',
      finding: {
        title: 'Commercial payer mix has slipped to 48%',
        workstream: 'rcm',
        severity: 'Medium',
        ownerId: 'p-h-grace',
        fact: { text: 'Commercial payers were 48.2% of FY2025 collections, down from 53.0% in FY2023, while Medicare/MA rose to 31.5%.', citations: [{ docId: 'payer', page: 1 }] },
        interpretation: 'Below the 55% playbook threshold and trending down, which pressures revenue per procedure.',
        recommendation: 'Model reimbursement at the FY2025 mix, not the three-year average.',
        thesisLink: { assumptionId: 'commercialPayerPct', expected: '≥ 55%', actual: '48.2%' },
        implications: [{ area: 'Financial', text: 'Lower blended reimbursement in the forecast.' }],
      },
      chain: [],
    },
    {
      key: 'chow',
      afterDoc: 'lic',
      finding: {
        title: 'ASC ownership change requires Medicare enrollment updates',
        workstream: 'regulatory',
        severity: 'High',
        ownerId: 'p-h-dana',
        fact: { text: 'The ASC is a separately enrolled, Medicare-certified entity; an ownership change requires CMS notification and enrollment updates. A clinic facility license renewal has been pending since August.', citations: [{ docId: 'lic', page: 1 }] },
        interpretation: 'At Crestview, change-of-ownership processing caused a 94-day Medicare billing hold and deferred $2.3M of collections.',
        recommendation: 'File change-of-ownership updates 90 days before close and plan bridge working capital.',
        implications: [
          { area: 'Financial', text: 'Working capital for a possible billing hold.' },
          { area: 'Integration', text: 'Billing continuity plan before Day 1.' },
        ],
      },
      chain: [{ kind: 'action', title: 'Map change-of-ownership filings and billing continuity plan', summary: 'Owner: Dana Whitfield · due Oct 23', basis: 'Crestview lesson (in playbook).', confidence: 'High', payload: { action: { title: 'Map Medicare change-of-ownership filings and billing continuity plan', ownerId: 'p-h-dana', workstream: 'regulatory', due: '2026-10-23', kind: 'Task' } } }],
    },
    {
      key: 'retention',
      afterDoc: 'roster',
      finding: {
        title: 'Three-year physician retention is 79%, not “strong”',
        workstream: 'physicians',
        severity: 'Medium',
        ownerId: 'p-h-reyes',
        fact: { text: '3 of 14 physicians left between 2023 and 2026, 2 of them to a hospital-employed group. Three-year retention is 78.6%.', citations: [{ docId: 'roster', page: 1 }] },
        interpretation: 'Below the 85% playbook threshold, and the departures went to a competing hospital group.',
        thesisLink: { assumptionId: 'providerRetentionPct', expected: '≥ 85%', actual: '78.6%' },
        implications: [{ area: 'People', text: 'Exit interviews and compensation benchmarking.' }],
      },
      chain: [],
    },
    {
      key: 'payk',
      afterDoc: 'payk',
      finding: {
        title: 'Largest commercial payer contract requires consent to change of control',
        workstream: 'payer',
        severity: 'High',
        ownerId: 'p-h-grace',
        fact: { text: 'Heartland Health Plan (22% of collections) requires prior written consent to assignment, including by change of control. Rates expire March 31, 2027.', citations: [{ docId: 'payk', page: 27, locator: '§12.1' }] },
        interpretation: 'Consent timing and a rate renegotiation fall within the first six months after close.',
        recommendation: 'Plan payer consent outreach; model a rate scenario for the 2027 renewal.',
        implications: [{ area: 'Financial', text: 'Rate renewal risk in 2027.' }],
      },
      chain: [],
    },
    {
      key: 'accr',
      afterDoc: 'accr',
      finding: {
        title: 'ASC accreditation has two open deficiencies',
        workstream: 'clinical',
        severity: 'Medium',
        ownerId: 'p-h-reyes',
        fact: { text: 'June 2026 survey: incomplete sterilization load logs (Q1 2026) and two credentialing files missing peer references. Plan of correction required within 60 days.', citations: [{ docId: 'accr', page: 4 }] },
        interpretation: 'Likely remediable, but the CIM states “fully accredited” without mentioning the plan of correction.',
        recommendation: 'Request the plan of correction and evidence of closure.',
        implications: [{ area: 'Integration', text: 'Align to Halcyon sterilization and credentialing standards.' }],
      },
      chain: [],
    },
    {
      key: 'it',
      afterDoc: 'it',
      finding: {
        title: 'Security risk assessment overdue; no MFA on billing system',
        workstream: 'ehr',
        severity: 'Medium',
        ownerId: 'p-h-dana',
        fact: { text: 'The last HIPAA security risk assessment was in 2023 and the billing system does not enforce multi-factor authentication. The EHR version reaches end of support in December 2027.', citations: [{ docId: 'it', page: 2 }] },
        interpretation: 'A cyber incident before or after close would land on Halcyon; EHR migration is unavoidable within about 14 months.',
        recommendation: 'Require MFA before close; plan EHR migration after the first full quarter.',
        implications: [{ area: 'Integration', text: 'EHR migration timeline and cost.' }],
      },
      chain: [],
    },
  ],
  gaps: [
    { title: 'Compliance program documents and recent audits', why: 'Required to assess billing and coding risk.', workstream: 'regulatory' },
    { title: 'Top-10 payer contracts', why: 'Only 1 of the top 10 contracts was provided.', workstream: 'payer' },
    { title: 'Denials and AR aging by payer', why: 'Needed to test revenue cycle quality.', workstream: 'rcm' },
    { title: 'Medical directorships, leases and other arrangements with referral sources', why: 'Stark / anti-kickback review of referral relationships.', workstream: 'legal' },
    { title: 'Physician credentialing files', why: 'Accreditation deficiency mentions credentialing gaps.', workstream: 'clinical' },
  ],
  research: [
    { topic: 'Competition', headline: 'Top referral source is in affiliation talks with a regional hospital system', detail: 'Local reporting says Tri-County Primary Care Network (31% of Riverbend referrals) is exploring an affiliation with a hospital system that employs its own orthopedic surgeons.', source: 'Local business news (synthetic)', sourceType: 'News', relevance: 'Material', asOf: '2026-09-18' },
    { topic: 'Market', headline: 'Louisville orthopedic demand growing with an aging population', detail: 'Population over 65 is growing faster than the state average, supporting joint replacement and spine volumes and a rising Medicare share.', source: 'Census and health-planning data (synthetic summary)', sourceType: 'Government', relevance: 'Context', asOf: '2026-08-01' },
    { topic: 'Regulatory', headline: 'Ownership changes for Medicare-certified ASCs require CMS notification', detail: 'Medicare enrollment must be updated when ownership changes; processing time varies and can delay billing.', source: 'Medicare enrollment guidance (summarized)', sourceType: 'Government', relevance: 'Material', asOf: '2026-09-01' },
    { topic: 'Company records', headline: 'No exclusions found for listed physicians', detail: 'All 14 physicians were checked against federal and state exclusion lists. No matches.', source: 'Exclusion list screening (synthetic)', sourceType: 'Public record', relevance: 'Context', asOf: '2026-09-20' },
    { topic: 'Reputation', headline: '4.5★ average; Dr. Marsh named in 22% of reviews', detail: 'Patients frequently mention individual surgeons by name, reinforcing physician dependency.', source: 'Public review sites (synthetic)', sourceType: 'Reviews', relevance: 'Material', asOf: '2026-09-25' },
    { topic: 'People', headline: 'Dr. Reid is medical director at the top referral source', detail: 'Public filings list Dr. Thomas Reid as part-time medical director for Tri-County Primary Care Network. The arrangement needs a fair-market-value and Stark review.', source: 'State filings and website (synthetic)', sourceType: 'Public record', relevance: 'Material', asOf: '2026-09-22' },
  ],
  claims: [
    { claim: 'A diversified referral base across primary care, urgent care and sports performance partners.', claimSource: { docId: 'cim', page: 5 }, verdict: 'Contradicted', evidence: 'Top 3 sources are 61.0% of new-patient referrals.', evidenceSources: [{ docId: 'ref', page: 1 }] },
    { claim: 'Strong physician retention, with a stable partner group.', claimSource: { docId: 'cim', page: 5 }, verdict: 'Partly true', evidence: 'Partners are stable, but 3 of 14 physicians left since 2023 (78.6% retention), 2 to a hospital group.', evidenceSources: [{ docId: 'roster', page: 1 }] },
    { claim: 'Medicare-certified, fully accredited ambulatory surgery center.', claimSource: { docId: 'cim', page: 5 }, verdict: 'Partly true', evidence: 'Accredited, with two open deficiencies and a plan of correction due.', evidenceSources: [{ docId: 'accr', page: 4 }] },
    { claim: 'Adjusted EBITDA of $6.1M.', claimSource: { docId: 'cim', page: 21 }, verdict: 'Unverified', evidence: 'Includes $410K of physician compensation normalization that depends on new post-close compensation terms. QoE not yet started.', evidenceSources: [{ docId: 'cim', page: 21 }] },
  ],
};
