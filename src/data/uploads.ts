import type { DealDocument, Finding } from '@/lib/types';

// SYNTHETIC DEMO DATA. Documents the reviewer can "upload" to watch the
// processing → Atlas proposal → human review loop.

type ProposedFinding = Omit<Finding, 'id' | 'acqId' | 'createdAt' | 'comments' | 'riskIds' | 'decisionIds' | 'workItemIds' | 'status' | 'identifiedBy'>;

export interface UploadCatalogItem {
  id: string;
  label: string;
  from: string;
  doc: Omit<DealDocument, 'id' | 'acqId' | 'uploadedBy' | 'uploadedAt' | 'status'>;
  proposes?: ProposedFinding;
}

export const UPLOAD_CATALOG: UploadCatalogItem[] = [
  {
    id: 'up-fleet',
    label: 'Fleet Schedule & Maintenance Log.xlsx',
    from: 'Seller data room response to request "Fleet condition and replacement schedule"',
    doc: {
      name: 'Fleet Schedule & Maintenance Log.xlsx',
      type: 'XLSX',
      category: 'Operations',
      workstream: 'operations',
      version: 1,
      pageCount: 1,
      sizeKb: 156,
      tags: ['fleet', 'capex'],
      source: 'Seller',
      summary: '46 service vehicles with model year, mileage, lease/own status and FY2025 maintenance cost.',
      pages: [
        {
          n: 1,
          heading: 'Sheet: Fleet',
          body: ['46 vehicles. 38 owned, 8 leased. Meridian replacement policy: 7 years or 150,000 miles.'],
          table: {
            columns: ['Age band', 'Vehicles', 'Avg miles', 'FY2025 maint. ($K)', 'Replacement due'],
            rows: [
              ['0–3 yrs', '11', '41,200', '28', 'No'],
              ['4–6 yrs', '14', '96,800', '61', 'No'],
              ['7–9 yrs', '15', '148,300', '112', 'Yes'],
              ['10+ yrs', '6', '191,000', '57', 'Yes'],
            ],
            highlightRows: [2, 3],
          },
        },
      ],
    },
    proposes: {
      title: 'Fleet replacement backlog of ~$1.1M',
      workstream: 'operations',
      severity: 'Medium',
      ownerId: 'p-rachel',
      fact: {
        text: '21 of 46 vehicles (46%) are 7+ years old and meet Meridian’s replacement policy. Average age of those vehicles is 8.6 years.',
        citations: [{ docId: '', page: 1, locator: 'Sheet "Fleet", rows 3–4' }],
      },
      calculation: '21 vehicles × ~$52K replacement cost (Meridian FY2026 average) ≈ $1.09M',
      interpretation: 'Capex has been deferred relative to Meridian policy. This is a debt-like item or a price consideration, and will lift maintenance costs if not addressed.',
      recommendation: 'Raise with QoE as a capex normalization / debt-like item before price is finalized.',
      implications: [
        { area: 'Valuation', text: 'Possible debt-like adjustment of ~$0.5–1.1M depending on phasing.' },
        { area: 'Integration', text: 'Add fleet replacement to 100-day capex plan.' },
      ],
      possibleActions: ['Raise with QoE provider', 'Adjust valuation'],
    },
  },
  {
    id: 'up-retention',
    label: 'Customer Retention FY2021–FY2025.xlsx',
    from: 'Seller response to request "Customer retention analysis FY2021–FY2025"',
    doc: {
      name: 'Customer Retention FY2021–FY2025.xlsx',
      type: 'XLSX',
      category: 'Financials',
      workstream: 'commercial',
      version: 1,
      pageCount: 1,
      sizeKb: 640,
      tags: ['customers', 'retention'],
      source: 'Seller',
      summary: 'Five-year revenue by customer for the top 25 customers, with first-invoice date.',
      pages: [
        {
          n: 1,
          heading: 'Sheet: Top-5 history ($K)',
          body: ['All five current top-5 customers have been billed every year since FY2021.'],
          table: {
            columns: ['Customer', 'FY2021', 'FY2023', 'FY2025', 'Since'],
            rows: [
              ['Brazos Valley ISD', '1,120', '1,610', '2,040', '2014'],
              ['Lakeline Property Partners', '1,480', '1,560', '1,621', '2011'],
              ['St. Gabriel Health System', '910', '1,180', '1,384', '2016'],
              ['Hill Country Commercial REIT', '1,040', '1,090', '1,111', '2012'],
              ['Cedar Ridge Senior Living', '410', '620', '838', '2019'],
            ],
            highlightRows: [0, 4],
          },
        },
      ],
    },
    proposes: {
      title: 'Top-5 customers have 100% five-year retention; concentration driven by growth',
      workstream: 'commercial',
      severity: 'Low',
      positive: true,
      ownerId: 'p-marcus',
      fact: {
        text: 'All current top-5 customers were billed in every year FY2021–FY2025. Brazos Valley ISD revenue grew 82% over the period ($1.12M → $2.04M).',
        citations: [{ docId: '', page: 1, locator: 'Sheet "Top-5 history"' }],
      },
      calculation: '2,040 ÷ 1,120 − 1 = 82%',
      interpretation: 'Concentration has risen because the largest relationships are growing, not because the rest of the base is shrinking. This partly mitigates the concentration finding but does not remove change-of-control exposure.',
      recommendation: 'Link to the concentration finding; use as supporting evidence for the earn-out structure rather than a price reduction alone.',
      implications: [{ area: 'Commercial', text: 'Strong relationship durability under current ownership.' }],
    },
  },
];
