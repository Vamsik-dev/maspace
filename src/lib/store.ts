'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Acquisition,
  Activity,
  AutomationRule,
  Comment,
  DealDocument,
  Decision,
  Deliverable,
  FeedbackNote,
  Finding,
  Milestone,
  PhaseKey,
  Risk,
  WorkItem,
} from './types';
import { ABC, ABC_ACTIVITY, ABC_DECISIONS, ABC_DELIVERABLES, ABC_FINDINGS, ABC_MILESTONES, ABC_RISKS, ABC_WORK } from '@/data/abc';
import { ABC_DOCUMENTS } from '@/data/abc-documents';
import {
  COASTAL,
  DELTA,
  SECONDARY_ACTIVITY,
  SECONDARY_DECISIONS,
  SECONDARY_DOCS,
  SECONDARY_FINDINGS,
  SECONDARY_MILESTONES,
  SECONDARY_RISKS,
  SECONDARY_WORK,
} from '@/data/portfolio';
import { DEMO_TODAY } from './meta';
import { UPLOAD_CATALOG } from '@/data/uploads';

// The store stands in for the future API. Every action here maps to an
// endpoint + server-side workflow rule; screens never mutate data directly.

export const AUTOMATION_RULES: AutomationRule[] = [
  { id: 'rule-loi', when: 'LOI is signed', then: 'Create the 9 standard diligence workstreams and the initial request list from the playbook', enabled: true },
  { id: 'rule-finding', when: 'A High or Critical finding is created', then: 'Create a review work item for the workstream reviewer and notify the risk owner', enabled: true },
  { id: 'rule-decision', when: 'A decision is approved', then: 'Create follow-up actions for each downstream impact and update linked risks to Mitigating', enabled: true },
  { id: 'rule-doc', when: 'A document finishes processing', then: 'Ask Atlas to check it against open findings and thesis assumptions; propose findings for human review', enabled: true },
  { id: 'rule-ic', when: 'IC approves the deal', then: 'Create the closing checklist and Day-1 readiness workstream', enabled: true },
];

interface State {
  currentUserId: string;
  acquisitions: Acquisition[];
  work: WorkItem[];
  findings: Finding[];
  risks: Risk[];
  decisions: Decision[];
  documents: DealDocument[];
  deliverables: Deliverable[];
  activity: Activity[];
  milestones: Milestone[];
  rules: AutomationRule[];
  feedback: FeedbackNote[];
  adoptedLessons: string[];
  seq: number;
}

interface Actions {
  setCurrentUser: (id: string) => void;
  addAcquisition: (a: { name: string; industry: string; hq: string; revenue: number; ebitda: number; strategy: string; thesis: string }) => string;
  updateWork: (id: string, patch: Partial<WorkItem>) => void;
  addWork: (w: Omit<WorkItem, 'id' | 'comments'>) => string;
  addComment: (type: 'work' | 'finding' | 'risk' | 'decision', id: string, body: string) => void;
  updateFinding: (id: string, patch: Partial<Finding>) => void;
  addFinding: (f: Omit<Finding, 'id' | 'createdAt' | 'comments' | 'riskIds' | 'decisionIds' | 'workItemIds'> & Partial<Pick<Finding, 'riskIds' | 'decisionIds' | 'workItemIds'>>) => string;
  acceptFinding: (id: string) => void;
  dismissFinding: (id: string) => void;
  addRiskFromFinding: (findingId: string, r: Pick<Risk, 'title' | 'description' | 'severity' | 'probability' | 'ownerId' | 'mitigation'>) => string;
  updateRisk: (id: string, patch: Partial<Risk>) => void;
  addDecision: (d: Omit<Decision, 'id' | 'proposedAt' | 'comments' | 'status' | 'reviewers'> & { reviewerIds: string[] }) => string;
  reviewDecision: (id: string, verdict: 'Concur' | 'Concerns', note?: string) => void;
  decide: (id: string, status: 'Approved' | 'Rejected' | 'Deferred', optionId: string | undefined, rationale: string) => void;
  uploadDocument: (acqId: string, catalogId: string | null, fileName?: string) => string;
  setPhaseStatus: (acqId: string, phase: PhaseKey, status: 'complete' | 'active' | 'upcoming') => void;
  saveDeliverable: (id: string, content: unknown) => void;
  updateDeliverable: (id: string, patch: Partial<Deliverable>) => void;
  addDeliverable: (d: Omit<Deliverable, 'id'>) => string;
  toggleRule: (id: string) => void;
  adoptLesson: (id: string) => void;
  addFeedback: (f: Omit<FeedbackNote, 'id' | 'at'>) => void;
  removeFeedback: (id: string) => void;
  log: (a: Omit<Activity, 'id' | 'at'>) => void;
  reset: () => void;
}

const seed = (): State => ({
  currentUserId: 'p-marcus',
  acquisitions: [ABC, COASTAL, DELTA],
  work: [...ABC_WORK, ...SECONDARY_WORK],
  findings: [...ABC_FINDINGS, ...SECONDARY_FINDINGS],
  risks: [...ABC_RISKS, ...SECONDARY_RISKS],
  decisions: [...ABC_DECISIONS, ...SECONDARY_DECISIONS],
  documents: [...ABC_DOCUMENTS, ...SECONDARY_DOCS],
  deliverables: ABC_DELIVERABLES,
  activity: [...ABC_ACTIVITY, ...SECONDARY_ACTIVITY],
  milestones: [...ABC_MILESTONES, ...SECONDARY_MILESTONES],
  rules: AUTOMATION_RULES,
  feedback: [],
  adoptedLessons: [],
  seq: 1,
});

/** Timestamps use the fixed demo date so the story stays coherent. */
export const nowIso = () => {
  const d = new Date();
  return `${DEMO_TODAY}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const ruleOn = (s: State, id: string) => s.rules.find((r) => r.id === id)?.enabled;

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => {
      const nextId = (prefix: string) => {
        const n = get().seq;
        set({ seq: n + 1 });
        return `${prefix}-u${n}`;
      };
      const log: Actions['log'] = (a) =>
        set((s) => ({ activity: [{ ...a, id: `act-${s.seq}-${Math.random().toString(36).slice(2, 6)}`, at: nowIso() }, ...s.activity] }));

      const withComment = <T extends { id: string; comments: Comment[] }>(list: T[], id: string, c: Comment) =>
        list.map((x) => (x.id === id ? { ...x, comments: [...x.comments, c] } : x));

      return {
        ...seed(),
        log,
        setCurrentUser: (id) => set({ currentUserId: id }),

        addAcquisition: (x) => {
          const id = nextId('acq');
          const me = get().currentUserId;
          const empty = { status: 'upcoming' as const, progress: 0, summary: '' };
          const acq: Acquisition = {
            id,
            codename: `Project ${x.name.split(' ')[0]}`,
            name: x.name,
            status: 'Active',
            currentPhase: 'strategy',
            stageLabel: 'Strategy & Target Screening',
            dealLeadId: me,
            target: { legalName: x.name, industry: x.industry, hq: x.hq, founded: 0, revenue: x.revenue, ebitda: x.ebitda, ebitdaBasis: 'Seller estimate (unverified)', employees: 0, branches: [], ownership: '—', description: '' },
            strategy: x.strategy,
            ev: Math.round(x.ebitda * 6 * 10) / 10,
            evBasis: 'Placeholder: 6.0x seller EBITDA until valuation is built',
            thesis: {
              summary: x.thesis,
              pillars: [],
              assumptions: [
                { id: 'a1', label: 'Top-5 customer concentration', expected: '< 25% of revenue', status: 'Untested' },
                { id: 'a2', label: 'Recurring service revenue', expected: '≥ 25% of revenue', status: 'Untested' },
                { id: 'a3', label: 'Owner transition', expected: 'Within 12 months', status: 'Untested' },
              ],
            },
            phases: {
              strategy: { status: 'active', progress: 5, summary: 'Screening started.' },
              valuation: empty, loi: empty, diligence: empty, agreement: empty, financing: empty, closing: empty, integration: empty,
            },
            team: [{ personId: me, dealRole: 'Owner', workstreams: ['commercial', 'financial'] }],
          };
          set((s) => ({ acquisitions: [...s.acquisitions, acq] }));
          log({ acqId: id, actor: me, kind: 'phase', text: `created the acquisition and started Strategy & Target Screening` });
          // Playbook: standard screening checklist.
          [
            ['Screen target against playbook thresholds', 'commercial'],
            ['Request CIM / teaser and 3-year financials', 'financial'],
            ['Intro call with owner', 'commercial'],
            ['Draft target brief', 'commercial'],
          ].forEach(([title, ws]) =>
            get().addWork({ acqId: id, title, kind: 'Task', workstream: ws as WorkItem['workstream'], phase: 'strategy', status: 'Not Started', priority: 'Normal', ownerId: me, due: '2026-10-16', createdBy: 'automation' }),
          );
          return id;
        },

        updateWork: (id, patch) => {
          const before = get().work.find((w) => w.id === id);
          set((s) => ({ work: s.work.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
          if (before && patch.status && patch.status !== before.status) {
            log({ acqId: before.acqId, actor: get().currentUserId, kind: 'work', text: `moved "${before.title}" to ${patch.status}`, ref: { type: 'work', id } });
          }
        },

        addWork: (w) => {
          const id = nextId('w');
          set((s) => ({ work: [{ ...w, id, comments: [] }, ...s.work] }));
          log({ acqId: w.acqId, actor: w.createdBy ?? get().currentUserId, kind: w.createdBy === 'automation' ? 'automation' : 'work', text: `created "${w.title}"`, ref: { type: 'work', id } });
          return id;
        },

        addComment: (type, id, body) => {
          const c: Comment = { id: `c-${get().seq}`, authorId: get().currentUserId, at: nowIso(), body };
          set((s) => {
            switch (type) {
              case 'work':
                return { work: withComment(s.work, id, c), seq: s.seq + 1 };
              case 'finding':
                return { findings: withComment(s.findings, id, c), seq: s.seq + 1 };
              case 'risk':
                return { risks: withComment(s.risks, id, c), seq: s.seq + 1 };
              case 'decision':
                return { decisions: withComment(s.decisions, id, c), seq: s.seq + 1 };
            }
          });
          const s = get();
          const all = [...s.work, ...s.findings, ...s.risks, ...s.decisions] as { id: string; acqId: string }[];
          const target = all.find((x) => x.id === id);
          if (target) log({ acqId: target.acqId, actor: s.currentUserId, kind: 'comment', text: `commented: "${body.slice(0, 80)}${body.length > 80 ? '…' : ''}"`, ref: { type, id } });
        },

        updateFinding: (id, patch) => {
          const before = get().findings.find((f) => f.id === id);
          set((s) => ({ findings: s.findings.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
          if (before && patch.status && patch.status !== before.status) {
            log({ acqId: before.acqId, actor: get().currentUserId, kind: 'finding', text: `set finding "${before.title}" to ${patch.status}`, ref: { type: 'finding', id } });
          }
        },

        addFinding: (f) => {
          const id = nextId('f');
          const finding: Finding = { riskIds: [], decisionIds: [], workItemIds: [], ...f, id, createdAt: DEMO_TODAY, comments: [] };
          set((s) => ({ findings: [finding, ...s.findings] }));
          log({
            acqId: f.acqId,
            actor: f.identifiedBy,
            kind: 'finding',
            text: f.status === 'Proposed' ? `proposed a finding for review: "${f.title}"` : `raised a finding: "${f.title}"`,
            ref: { type: 'finding', id },
          });
          if (f.status !== 'Proposed') get().acceptFinding(id);
          return id;
        },

        // Workflow rule: High/Critical finding → review work item.
        acceptFinding: (id) => {
          const f = get().findings.find((x) => x.id === id);
          if (!f) return;
          const wasProposed = f.status === 'Proposed';
          set((s) => ({ findings: s.findings.map((x) => (x.id === id ? { ...x, status: 'Open' } : x)) }));
          if (wasProposed) log({ acqId: f.acqId, actor: get().currentUserId, kind: 'finding', text: `accepted Atlas’s proposed finding "${f.title}"`, ref: { type: 'finding', id } });
          if ((f.severity === 'High' || f.severity === 'Critical') && ruleOn(get(), 'rule-finding')) {
            const acq = get().acquisitions.find((a) => a.id === f.acqId);
            const reviewer = acq?.team.find((m) => m.dealRole === 'Reviewer' && m.workstreams.includes(f.workstream))?.personId ?? 'p-priya';
            const wid = get().addWork({
              acqId: f.acqId,
              title: `Review ${f.severity.toLowerCase()} finding: ${f.title}`,
              kind: 'Review',
              workstream: f.workstream,
              phase: 'diligence',
              status: 'Not Started',
              priority: f.severity === 'Critical' ? 'Urgent' : 'High',
              ownerId: f.ownerId,
              reviewerId: reviewer,
              due: '2026-10-07',
              findingIds: [id],
              createdBy: 'automation',
            });
            set((s) => ({ findings: s.findings.map((x) => (x.id === id ? { ...x, workItemIds: [...x.workItemIds, wid] } : x)) }));
          }
        },

        dismissFinding: (id) => {
          const f = get().findings.find((x) => x.id === id);
          set((s) => ({ findings: s.findings.map((x) => (x.id === id ? { ...x, status: 'Dismissed' } : x)) }));
          if (f) log({ acqId: f.acqId, actor: get().currentUserId, kind: 'finding', text: `dismissed "${f.title}"`, ref: { type: 'finding', id } });
        },

        addRiskFromFinding: (findingId, r) => {
          const f = get().findings.find((x) => x.id === findingId)!;
          const id = nextId('r');
          const risk: Risk = { ...r, id, acqId: f.acqId, workstream: f.workstream, status: 'Open', findingIds: [findingId], decisionIds: [], comments: [] };
          set((s) => ({
            risks: [risk, ...s.risks],
            findings: s.findings.map((x) => (x.id === findingId ? { ...x, riskIds: [...x.riskIds, id] } : x)),
          }));
          log({ acqId: f.acqId, actor: get().currentUserId, kind: 'risk', text: `added risk "${r.title}" from finding`, ref: { type: 'risk', id } });
          return id;
        },

        updateRisk: (id, patch) => {
          const before = get().risks.find((r) => r.id === id);
          set((s) => ({ risks: s.risks.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
          if (before && patch.status && patch.status !== before.status) {
            log({ acqId: before.acqId, actor: get().currentUserId, kind: 'risk', text: `set risk "${before.title}" to ${patch.status}`, ref: { type: 'risk', id } });
          }
        },

        addDecision: ({ reviewerIds, ...d }) => {
          const id = nextId('dec');
          const decision: Decision = {
            ...d,
            id,
            status: reviewerIds.length ? 'Under Review' : 'Open',
            proposedAt: DEMO_TODAY,
            reviewers: reviewerIds.map((personId) => ({ personId, verdict: 'Pending' })),
            comments: [],
          };
          set((s) => ({
            decisions: [decision, ...s.decisions],
            findings: s.findings.map((f) => (d.findingIds.includes(f.id) ? { ...f, decisionIds: [...f.decisionIds, id] } : f)),
            risks: s.risks.map((r) => (d.riskIds.includes(r.id) ? { ...r, decisionIds: [...r.decisionIds, id] } : r)),
          }));
          log({ acqId: d.acqId, actor: get().currentUserId, kind: 'decision', text: `opened decision: "${d.question}"`, ref: { type: 'decision', id } });
          return id;
        },

        reviewDecision: (id, verdict, note) => {
          const me = get().currentUserId;
          const d = get().decisions.find((x) => x.id === id);
          if (!d) return;
          const has = d.reviewers.some((r) => r.personId === me);
          const reviewers = has ? d.reviewers.map((r) => (r.personId === me ? { ...r, verdict, note } : r)) : [...d.reviewers, { personId: me, verdict, note }];
          set((s) => ({ decisions: s.decisions.map((x) => (x.id === id ? { ...x, reviewers, status: x.status === 'Open' ? 'Under Review' : x.status } : x)) }));
          log({ acqId: d.acqId, actor: me, kind: 'decision', text: `${verdict === 'Concur' ? 'concurred with' : 'raised concerns on'} "${d.question}"`, ref: { type: 'decision', id } });
        },

        // Workflow rule: approved decision → downstream actions, risks → Mitigating.
        decide: (id, status, optionId, rationale) => {
          const me = get().currentUserId;
          const d = get().decisions.find((x) => x.id === id);
          if (!d) return;
          set((s) => ({
            decisions: s.decisions.map((x) =>
              x.id === id ? { ...x, status, outcome: { optionId: optionId ?? '', rationale, decidedAt: nowIso(), decidedBy: me } } : x,
            ),
          }));
          const opt = d.options.find((o) => o.id === optionId);
          log({ acqId: d.acqId, actor: me, kind: 'decision', text: `${status.toLowerCase()} "${d.question}"${opt && status === 'Approved' ? ` — ${opt.label}` : ''}`, ref: { type: 'decision', id } });
          if (status !== 'Approved' || !ruleOn(get(), 'rule-decision')) return;

          set((s) => ({ risks: s.risks.map((r) => (d.riskIds.includes(r.id) && r.status === 'Open' ? { ...r, status: 'Mitigating' } : r)) }));
          const acq = get().acquisitions.find((a) => a.id === d.acqId)!;
          d.downstream.forEach((title) =>
            get().addWork({
              acqId: d.acqId,
              title,
              kind: 'Task',
              workstream: get().findings.find((f) => d.findingIds.includes(f.id))?.workstream ?? 'financial',
              phase: d.phase,
              status: 'Not Started',
              priority: 'High',
              ownerId: acq.dealLeadId,
              due: '2026-10-16',
              decisionIds: [id],
              createdBy: 'automation',
            }),
          );
          // Domain-specific effect for the demo story: approving the price revision updates valuation.
          if (id === 'dec-price' && optionId === 'o3') {
            set((s) => ({
              acquisitions: s.acquisitions.map((a) =>
                a.id === d.acqId ? { ...a, ev: 20.0, evBasis: '$20.0M at close (6.25x QoE EBITDA) + up to $1.5M earn-out on top-5 retention' } : a,
              ),
              findings: s.findings.map((f) => (f.id === 'f-qoe' ? { ...f, status: 'Resolved' } : f.id === 'f-conc' ? { ...f, status: 'Confirmed' } : f)),
            }));
            set((s) => ({ acquisitions: s.acquisitions.map((a) => (a.id === d.acqId ? { ...a, thesis: { ...a.thesis, assumptions: a.thesis.assumptions.map((x) => (x.id === 'a3' ? { ...x, status: 'Supported' as const, current: '$3.20M — price reset to QoE' } : x)) } } : a)) }));
            log({ acqId: d.acqId, actor: 'automation', kind: 'automation', text: 'updated working enterprise value to $20.0M + $1.5M earn-out resolved the QoE finding and confirmed the concentration finding (now mitigated by earn-out)' });
          }
        },

        uploadDocument: (acqId, catalogId, fileName) => {
          const id = nextId('d');
          const cat = catalogId ? UPLOAD_CATALOG.find((c) => c.id === catalogId) : undefined;
          const ext = (fileName?.split('.').pop() ?? 'pdf').toUpperCase();
          const doc: DealDocument = cat
            ? { ...cat.doc, id, acqId, uploadedBy: get().currentUserId, uploadedAt: DEMO_TODAY, status: 'Queued' }
            : {
                id,
                acqId,
                name: fileName ?? 'Untitled.pdf',
                type: (['PDF', 'XLSX', 'DOCX', 'PPTX', 'CSV'].includes(ext) ? ext : 'PDF') as DealDocument['type'],
                category: 'Uncategorized',
                workstream: 'financial',
                uploadedBy: get().currentUserId,
                uploadedAt: DEMO_TODAY,
                version: 1,
                pageCount: 1,
                sizeKb: 120,
                status: 'Queued',
                tags: [],
                source: 'Internal',
                summary: 'Prototype: your file stays in your browser and its contents are not read. In the product, text, tables and page references would be extracted here.',
                pages: [{ n: 1, heading: 'Content not extracted in prototype', body: ['Document processing is simulated in this prototype.'] }],
              };
          set((s) => ({ documents: [doc, ...s.documents] }));
          log({ acqId, actor: get().currentUserId, kind: 'document', text: `uploaded ${doc.name}`, ref: { type: 'document', id } });
          const setStatus = (status: DealDocument['status']) => set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, status } : d)) }));
          setTimeout(() => setStatus('Processing'), 900);
          setTimeout(() => {
            setStatus('Processed');
            if (cat?.proposes && ruleOn(get(), 'rule-doc')) {
              const p = cat.proposes;
              get().addFinding({
                ...p,
                acqId,
                status: 'Proposed',
                identifiedBy: 'atlas',
                fact: { ...p.fact, citations: p.fact.citations.map((c) => ({ ...c, docId: id })) },
              });
            }
          }, 3600);
          return id;
        },

        setPhaseStatus: (acqId, phase, status) => {
          set((s) => ({
            acquisitions: s.acquisitions.map((a) =>
              a.id === acqId
                ? {
                    ...a,
                    currentPhase: status === 'active' ? phase : a.currentPhase,
                    phases: { ...a.phases, [phase]: { ...a.phases[phase], status, progress: status === 'complete' ? 100 : a.phases[phase].progress, completedOn: status === 'complete' ? DEMO_TODAY : undefined } },
                  }
                : a,
            ),
          }));
          log({ acqId, actor: get().currentUserId, kind: 'phase', text: `marked ${phase} phase as ${status}` });
          // Workflow rule: LOI signed → create diligence workstreams + initial request list.
          const acq = get().acquisitions.find((a) => a.id === acqId);
          if (phase === 'loi' && status === 'complete' && ruleOn(get(), 'rule-loi') && acq && !acq.requestList) {
            const template: Record<string, [number, string[]]> = {
              financial: [24, ['Monthly P&L and balance sheet, last 36 months', 'AR / AP agings', 'Quality of earnings engagement']],
              tax: [12, ['Income and sales tax returns, 3 years']],
              legal: [22, ['Top-20 customer contracts', 'Corporate records and cap table']],
              commercial: [14, ['Revenue by customer, 3 years', 'Maintenance agreement roster']],
              operations: [16, ['Branch P&Ls', 'Fleet schedule']],
              it: [8, ['Systems inventory']],
              hr: [12, ['Employee census', 'Key employee list']],
              insurance: [6, ['5-year loss runs']],
              environmental: [5, ['License and permit register']],
            };
            set((s) => ({
              acquisitions: s.acquisitions.map((a) =>
                a.id === acqId
                  ? {
                      ...a,
                      currentPhase: 'diligence',
                      stageLabel: 'LOI signed · Due Diligence',
                      requestList: Object.fromEntries(Object.entries(template).map(([k, [n]]) => [k, { done: 0, total: n }])),
                      phases: { ...a.phases, diligence: { status: 'active', progress: 2, summary: 'Workstreams created from Playbook v4.' } },
                    }
                  : a,
              ),
            }));
            Object.entries(template).forEach(([ws, [, reqs]]) =>
              reqs.forEach((title) =>
                get().addWork({ acqId, title, kind: 'Request', workstream: ws as WorkItem['workstream'], phase: 'diligence', status: 'Not Started', priority: 'Normal', ownerId: acq.dealLeadId, due: '2026-10-23', createdBy: 'automation' }),
              ),
            );
            log({ acqId, actor: 'automation', kind: 'automation', text: 'created 9 diligence workstreams and the initial request list from Playbook v4' });
          }
        },

        saveDeliverable: (id, content) => set((s) => ({ deliverables: s.deliverables.map((d) => (d.id === id ? { ...d, content } : d)) })),
        updateDeliverable: (id, patch) => {
          const before = get().deliverables.find((d) => d.id === id);
          set((s) => ({ deliverables: s.deliverables.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
          if (before && patch.status && patch.status !== before.status)
            log({ acqId: before.acqId, actor: get().currentUserId, kind: 'deliverable', text: `moved "${before.title}" to ${patch.status}`, ref: { type: 'deliverable', id } });
        },
        addDeliverable: (d) => {
          const id = nextId('dl');
          set((s) => ({ deliverables: [{ ...d, id }, ...s.deliverables] }));
          log({ acqId: d.acqId, actor: 'atlas', kind: 'deliverable', text: `generated "${d.title}" from structured deal data`, ref: { type: 'deliverable', id } });
          return id;
        },

        adoptLesson: (id) => set((s) => ({ adoptedLessons: s.adoptedLessons.includes(id) ? s.adoptedLessons.filter((x) => x !== id) : [...s.adoptedLessons, id] })),
        toggleRule: (id) => set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),
        addFeedback: (f) => set((s) => ({ feedback: [{ ...f, id: `fb-${s.seq}`, at: new Date().toISOString() }, ...s.feedback], seq: s.seq + 1 })),
        removeFeedback: (id) => set((s) => ({ feedback: s.feedback.filter((f) => f.id !== id) })),
        reset: () => set((s) => ({ ...seed(), feedback: s.feedback })),
      };
    },
    {
      name: 'maspace-prototype-v1',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

// ---------- selectors ----------
export const useAcq = (id: string) => useStore((s) => s.acquisitions.find((a) => a.id === id));
