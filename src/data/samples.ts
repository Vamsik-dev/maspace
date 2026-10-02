import type { Acquisition, DealDocument, Proposal, ResearchItem, SellerClaim, TargetMetrics } from '@/lib/types';
import { LS_CLAIMS, LS_DEFAULTS, LS_DISCOVERIES, LS_DOCS, LS_GAPS, LS_METRICS, LS_RESEARCH } from './lonestar';
import { RB_SAMPLE } from './healthcare';

// A sample data room per tenant, used to demonstrate intake on the same engine.

type FindingTpl = NonNullable<NonNullable<Proposal['payload']>['finding']>;
export type DocTpl = Omit<DealDocument, 'id' | 'acqId' | 'uploadedBy' | 'uploadedAt' | 'status'> & { key: string };
export interface Discovery {
  key: string;
  afterDoc: string;
  finding: FindingTpl;
  chain: Omit<Proposal, 'id' | 'acqId' | 'createdAt' | 'status' | 'parentFindingId'>[];
}

export interface Sample {
  defaults: { name: string; industry: string; hq: string; revenue: number; ebitda: number; rationale: string };
  enrich: Partial<Pick<Acquisition, 'target' | 'ev' | 'evBasis'>>;
  docs: DocTpl[];
  metrics: TargetMetrics;
  discoveries: Discovery[];
  gaps: { title: string; why: string; workstream: string }[];
  research: Omit<ResearchItem, 'id' | 'acqId'>[];
  claims: Omit<SellerClaim, 'id' | 'acqId'>[];
}

export const LS_SAMPLE: Sample = {
  defaults: LS_DEFAULTS,
  enrich: {
    target: { legalName: 'Lone Star Comfort Systems, Inc.', industry: 'HVAC services', hq: 'San Antonio, TX', founded: 2006, revenue: 14.6, ebitda: 2.4, ebitdaBasis: 'Seller adjusted FY2025 (unverified)', employees: 96, branches: ['San Antonio (HQ)', 'New Braunfels'], ownership: 'Founder-owned (Ray J. Morales)', description: 'Commercial HVAC service provider in San Antonio and New Braunfels with a preventive-maintenance program and a medical / hospitality customer mix.' },
    ev: 16.1,
    evBasis: 'Seller ask: 7.0x $2.30M adj. EBITDA (after excluding recurring callbacks)',
  },
  docs: LS_DOCS,
  metrics: LS_METRICS,
  discoveries: LS_DISCOVERIES,
  gaps: LS_GAPS,
  research: LS_RESEARCH,
  claims: LS_CLAIMS,
};

export const SAMPLES: Record<string, Sample> = {
  'org-meridian': LS_SAMPLE,
  'org-halcyon': RB_SAMPLE,
};
