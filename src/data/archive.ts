import type { PriorAcquisition } from '@/lib/types';

// SYNTHETIC DEMO DATA. Archived deal folders that Atlas reconstructs into
// structured acquisition memory: the enterprise "40 deals in SharePoint" case.

export interface ArchivedDeal {
  record: PriorAcquisition;
  fromDocs: string[];
  missing: string[];
}

export interface Archive {
  source: string;
  folders: number;
  documents: number;
  deals: ArchivedDeal[];
}

export const ARCHIVES: Record<string, Archive> = {
  'org-meridian': {
    source: 'SharePoint · Corporate Development / Closed Deals 2017–2021',
    folders: 3,
    documents: 214,
    deals: [
      {
        record: {
          id: 'pa-hillcountry',
          orgId: 'org-meridian',
          origin: 'Reconstructed',
          confidence: 'High',
          name: 'Hill Country Air',
          industry: 'HVAC',
          location: 'Austin, TX',
          closed: '2018-09',
          ev: 6.5,
          revenueAtClose: 6.1,
          thesis: 'First Austin acquisition: residential HVAC with a small maintenance base.',
          outcomes: [
            { metric: 'Year-2 revenue', predicted: '$7.0M', actual: '$7.4M', verdict: 'Exceeded' },
            { metric: 'Maintenance agreements (Y2)', predicted: '900', actual: '640', verdict: 'Missed' },
          ],
          issues: ['Maintenance agreement count was overstated; 30% were lapsed agreements still listed as active'],
          lessons: [{ id: 'al1', text: 'Verify maintenance agreements against 12 months of billing, not the roster.', category: 'Commercial', inPlaybook: false }],
          tags: ['recurring revenue', 'data quality'],
          atDiligence: { top5Pct: 11, recurringPct: 21, askMultiple: 5.2 },
        },
        fromDocs: ['IC memo (Aug 2018)', '12-month integration review', 'Board update Q3 2019'],
        missing: ['Technician retention at diligence not recorded'],
      },
      {
        record: {
          id: 'pa-pecos',
          orgId: 'org-meridian',
          origin: 'Reconstructed',
          confidence: 'Medium',
          name: 'Pecos Mechanical',
          industry: 'Commercial mechanical',
          location: 'Midland, TX',
          closed: '2019-11',
          ev: 12.0,
          revenueAtClose: 10.8,
          thesis: 'West Texas commercial mechanical with oilfield-adjacent customers.',
          outcomes: [
            { metric: 'Year-1 revenue', predicted: '$11.5M', actual: '$8.9M', verdict: 'Missed' },
            { metric: 'Top customer retained', predicted: 'Yes', actual: 'Lost in month 6', verdict: 'Missed' },
          ],
          issues: ['Largest customer (19%) cut maintenance spend during the 2020 oil downturn; no protection in the deal'],
          lessons: [{ id: 'al2', text: 'Stress-test concentration against the customer’s own industry cycle.', category: 'Valuation', inPlaybook: false }],
          tags: ['customer concentration', 'cyclicality'],
          atDiligence: { top5Pct: 41, recurringPct: 18, techRetentionPct: 77, askMultiple: 5.9 },
        },
        fromDocs: ['IC memo (Oct 2019)', 'Lender model', 'Post-close review (Jan 2021)'],
        missing: ['No outcome data after month 18'],
      },
      {
        record: {
          id: 'pa-gulfbend',
          orgId: 'org-meridian',
          origin: 'Reconstructed',
          confidence: 'Low',
          name: 'Gulf Bend Electric',
          industry: 'Electrical',
          location: 'Victoria, TX',
          closed: '2021-03',
          ev: 7.8,
          revenueAtClose: 7.0,
          thesis: 'Add commercial electrical capability on the Gulf Coast.',
          outcomes: [{ metric: 'Master electrician continuity', predicted: 'Founder stays 2 years', actual: 'Founder left month 10', verdict: 'Missed' }],
          issues: ['Founder held the master electrician license and left in month 10; two crews idled for 6 weeks'],
          lessons: [{ id: 'al3', text: 'Founder-held licenses need a named successor before close.', category: 'Legal / Regulatory', inPlaybook: true }],
          tags: ['licensing', 'owner dependency'],
          atDiligence: { top5Pct: 23, techRetentionPct: 81 },
        },
        fromDocs: ['Email thread export (partial)', 'Integration tracker (Excel)'],
        missing: ['IC memo not found', 'Price multiple not found', 'Recurring revenue share not found'],
      },
    ],
  },
  'org-halcyon': {
    source: 'Box · Corp Dev / Archive 2019–2022',
    folders: 2,
    documents: 132,
    deals: [
      {
        record: {
          id: 'pa-northgate',
          orgId: 'org-halcyon',
          origin: 'Reconstructed',
          confidence: 'Medium',
          name: 'Northgate Joint & Spine',
          industry: 'Orthopedics',
          location: 'Toledo, OH',
          closed: '2020-06',
          ev: 31.0,
          revenueAtClose: 19.5,
          thesis: 'Northern Ohio orthopedic platform.',
          outcomes: [{ metric: 'Physician retention (Y2)', predicted: '100%', actual: '78%', verdict: 'Missed' }],
          issues: ['Two surgeons left for a hospital-employed group after compensation was standardized'],
          lessons: [{ id: 'ah1', text: 'Do not standardize physician compensation in year 1.', category: 'Physicians', inPlaybook: false }],
          tags: ['physician dependency', 'compensation'],
          atDiligence: { top3ReferralPct: 44, top2PhysicianPct: 39, providerRetentionPct: 84, askMultiple: 8.1 },
        },
        fromDocs: ['IC memo (May 2020)', 'Physician compensation model', '24-month review'],
        missing: ['Payer mix at diligence not found'],
      },
      {
        record: {
          id: 'pa-maumee',
          orgId: 'org-halcyon',
          origin: 'Reconstructed',
          confidence: 'High',
          name: 'Maumee Valley Surgery Center',
          industry: 'ASC',
          location: 'Toledo, OH',
          closed: '2022-02',
          ev: 18.0,
          revenueAtClose: 9.2,
          thesis: 'Own surgical capacity for the Toledo network.',
          outcomes: [{ metric: 'ASC utilization (Y1)', predicted: '75%', actual: '81%', verdict: 'Exceeded' }],
          issues: ['Accreditation deficiencies found at diligence were closed within 60 days with no impact'],
          lessons: [{ id: 'ah2', text: 'Open accreditation deficiencies with a plan of correction are usually remediable; verify closure, do not reprice.', category: 'Clinical', inPlaybook: false }],
          tags: ['accreditation', 'ASC'],
          atDiligence: { commercialPayerPct: 63, askMultiple: 8.8 },
        },
        fromDocs: ['IC memo (Jan 2022)', 'Accreditation correspondence', '12-month review'],
        missing: [],
      },
    ],
  },
};
