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
  Proposal,
  ResearchItem,
  SellerClaim,
  Citation,
  Playbook,
  PriorAcquisition,
  CriterionTest,
  PipelineTarget,
  PipelineStage,
  QAItem,
  LoiTerms,
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
import { ABC_CLAIMS, ABC_PROPOSALS, ABC_RESEARCH } from '@/data/abc-intel';
import { SAMPLES } from '@/data/samples';
import { ORGS, PLAYBOOKS } from '@/data/playbooks';
import { BROOKFIELD, HALCYON_PRIOR } from '@/data/healthcare';
import { ARCHIVES } from '@/data/archive';
import { ABC_QA, PIPELINE } from '@/data/pipeline';
import { PEOPLE } from '@/data/people';
import { assumptionsFrom, evaluate, similarDeals, statusFor } from './playbook';
import { PRIOR } from '@/data/portfolio';

// The store stands in for the future API. Every action here maps to an
// endpoint + server-side workflow rule; screens never mutate data directly.

export const AUTOMATION_RULES: AutomationRule[] = [
  { id: 'rule-loi', when: 'LOI is signed', then: 'Create the 9 standard diligence workstreams and the initial request list from the playbook', enabled: true },
  { id: 'rule-finding', when: 'A High or Critical finding is created', then: 'Create a review work item for the workstream reviewer and notify the risk owner', enabled: true },
  { id: 'rule-decision', when: 'A decision is approved', then: 'Create follow-up actions for each downstream impact and update linked risks to Mitigating', enabled: true },
  { id: 'rule-doc', when: 'A document finishes processing', then: 'Ask Atlas to check it against open findings and thesis assumptions; propose findings for human review', enabled: true },
  { id: 'rule-ic', when: 'IC approves the deal', then: 'Create the closing checklist and Day 1 readiness workstream', enabled: true },
];

interface State {
  currentUserId: string;
  /** Prototype sign-in: the marketing site is shown until a demo persona signs in. */
  signedIn: boolean;
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
  proposals: Proposal[];
  research: ResearchItem[];
  claims: SellerClaim[];
  /** Atlas-drafted follow-ups that are released when a finding is accepted. */
  chains: Record<string, ChainTpl[]>;
  runs: Record<string, AnalysisRun>;
  currentOrgId: string;
  playbooks: Playbook[];
  priors: PriorAcquisition[];
  archive: Record<string, { status: 'idle' | 'running' | 'review'; log: string[]; pending: string[]; confirmed: string[] }>;
  pipeline: PipelineTarget[];
  qa: QAItem[];
  seq: number;
}

type ChainTpl = Omit<Proposal, 'id' | 'acqId' | 'createdAt' | 'status' | 'parentFindingId'>;

export interface AnalysisRun {
  status: 'running' | 'done';
  total: number;
  done: number;
  current?: string;
  log: { t: string; text: string; kind: 'doc' | 'finding' | 'check' | 'memory' | 'gap' | 'research' | 'done' }[];
}

interface Actions {
  setCurrentUser: (id: string) => void;
  signIn: (orgId: string, userId: string) => void;
  signOut: () => void;
  addAcquisition: (a: { name: string; industry: string; hq: string; revenue: number; ebitda: number; strategy: string; thesis: string; rationale?: string }) => string;
  runAnalysis: (acqId: string) => void;
  setOrg: (orgId: string) => void;
  updateCriterion: (playbookId: string, key: string, test: CriterionTest) => void;
  importArchive: (orgId: string) => void;
  confirmArchived: (dealId: string, accept: boolean) => void;
  movePipeline: (id: string, stage: PipelineStage, passReason?: string) => void;
  linkPipeline: (id: string, acqId: string) => void;
  addQA: (q: Omit<QAItem, 'id' | 'askedAt' | 'askedBy'>) => void;
  updateQA: (id: string, patch: Partial<QAItem>) => void;
  draftQAFromFindings: (acqId: string) => number;
  setLoiTerms: (acqId: string, terms: LoiTerms) => void;
  acceptProposal: (id: string) => void;
  dismissProposal: (id: string) => void;
  acceptChain: (findingId: string) => void;
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
  signedIn: false,
  acquisitions: [ABC, COASTAL, DELTA, BROOKFIELD],
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
  proposals: ABC_PROPOSALS,
  research: ABC_RESEARCH,
  claims: ABC_CLAIMS,
  chains: {},
  runs: {},
  currentOrgId: 'org-meridian',
  playbooks: PLAYBOOKS,
  priors: [...PRIOR, ...HALCYON_PRIOR],
  archive: {},
  pipeline: PIPELINE,
  qa: ABC_QA,
  seq: 1,
});

/** Timestamps use the fixed demo date so the story stays coherent. */
export const nowIso = () => {
  const d = new Date();
  return `${DEMO_TODAY}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const ruleOn = (s: State, id: string) => s.rules.find((r) => r.id === id)?.enabled;

/** Default chain Atlas drafts for a finding that has no specific template. */
function genericChain(f: Finding): ChainTpl[] {
  if (!f || f.positive) return [];
  const out: ChainTpl[] = [];
  const high = f.severity === 'High' || f.severity === 'Critical';
  if (high && !f.riskIds.length)
    out.push({ kind: 'risk', title: `Risk: ${f.title}`, summary: f.interpretation ?? f.fact.text, basis: 'High-severity finding without a linked risk.', confidence: 'Medium', payload: { risk: { title: f.title, description: f.interpretation ?? f.fact.text, severity: f.severity, probability: 'Possible', ownerId: f.ownerId, mitigation: f.recommendation ?? 'To be defined.' } } });
  if (high && !f.decisionIds.length)
    out.push({ kind: 'decision', title: `How should we respond to: ${f.title.toLowerCase()}?`, summary: 'Options drafted from the finding and the playbook.', basis: 'Playbook v4: material findings need a recorded response.', confidence: 'Medium', payload: { decision: { question: `How should we respond to: ${f.title.toLowerCase()}?`, context: f.fact.text, options: [{ label: 'Accept and monitor', description: '' }, { label: 'Mitigate in price or structure', description: '' }, { label: 'Mitigate in the purchase agreement', description: '' }], recommended: 1, approverId: 'p-priya', phase: 'diligence' } } });
  (f.possibleActions ?? []).filter((a) => !/valuation|earn-out|decision|escalate/i.test(a)).slice(0, 1).forEach((a) =>
    out.push({ kind: 'action', title: a, summary: `Owner: ${f.ownerId === 'p-marcus' ? 'Marcus Hale' : 'finding owner'}`, basis: 'Suggested next step for this finding.', confidence: 'Medium', payload: { action: { title: a, ownerId: f.ownerId, workstream: f.workstream, due: '2026-10-09', kind: 'Task' } } }),
  );
  return out;
}

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
        signIn: (orgId, userId) => set({ currentOrgId: orgId, currentUserId: userId, signedIn: true }),
        signOut: () => set({ signedIn: false }),

        addAcquisition: (x) => {
          const id = nextId('acq');
          const me = get().currentUserId;
          const org = ORGS.find((o) => o.id === get().currentOrgId)!;
          const pb = get().playbooks.find((p) => p.id === org.playbookId)!;
          const empty = { status: 'upcoming' as const, progress: 0, summary: '' };
          const [ws1, ws2] = pb.workstreams.map((w) => w.key);
          const acq: Acquisition = {
            id,
            orgId: org.id,
            playbookId: pb.id,
            codename: `Project ${x.name.split(' ')[0]}`,
            name: x.name,
            status: 'Active',
            currentPhase: 'strategy',
            stageLabel: 'Strategy & Target Screening',
            dealLeadId: me,
            target: { legalName: x.name, industry: x.industry, hq: x.hq, founded: 0, revenue: x.revenue, ebitda: x.ebitda, ebitdaBasis: 'Seller estimate (unverified)', employees: 0, branches: [], ownership: '—', description: '' },
            strategy: x.strategy,
            rationale: x.rationale,
            ev: Math.round(x.ebitda * 6 * 10) / 10,
            evBasis: 'Placeholder until valuation is built',
            thesis: { summary: x.thesis, pillars: [], assumptions: assumptionsFrom(pb) },
            phases: {
              strategy: { status: 'active', progress: 5, summary: 'Screening started.' },
              valuation: empty, loi: empty, diligence: empty, agreement: empty, financing: empty, closing: empty, integration: empty,
            },
            team: [{ personId: me, dealRole: 'Owner', workstreams: [ws1, ws2] }],
          };
          set((s) => ({ acquisitions: [...s.acquisitions, acq] }));
          log({ acqId: id, actor: me, kind: 'phase', text: `created the acquisition under ${pb.name} ${pb.version} and started Strategy & Target Screening` });
          [
            ['Screen target against playbook thresholds', ws1],
            ['Request CIM and 3-year financials', ws2],
            ['Intro call with owners', ws1],
          ].forEach(([title, ws]) =>
            get().addWork({ acqId: id, title, kind: 'Task', workstream: ws, phase: 'strategy', status: 'Not Started', priority: 'Normal', ownerId: me, due: '2026-10-16', createdBy: 'automation' }),
          );
          return id;
        },

        setOrg: (orgId) => {
          const first = PEOPLE.find((p) => p.orgId === orgId && p.org === 'Internal');
          set({ currentOrgId: orgId, currentUserId: first?.id ?? get().currentUserId });
        },

        updateCriterion: (playbookId, key, test) => {
          const pb = get().playbooks.find((p) => p.id === playbookId);
          set((s) => ({ playbooks: s.playbooks.map((p) => (p.id === playbookId ? { ...p, criteria: p.criteria.map((c) => (c.key === key ? { ...c, test } : c)) } : p)) }));
          const acq = get().acquisitions.find((a) => a.playbookId === playbookId);
          if (pb && acq) log({ acqId: acq.id, actor: get().currentUserId, kind: 'phase', text: `changed ${pb.name} threshold for "${pb.criteria.find((c) => c.key === key)?.label}"` });
        },

        importArchive: (orgId) => {
          const arc = ARCHIVES[orgId];
          if (!arc) return;
          const put = (patch: Partial<State['archive'][string]>) =>
            set((s) => ({ archive: { ...s.archive, [orgId]: { ...{ status: 'running' as const, log: [] as string[], pending: [] as string[], confirmed: [] as string[] }, ...s.archive[orgId], ...patch } } }));
          put({ status: 'running', log: [`Connected to ${arc.source}. Found ${arc.folders} deal folders, ${arc.documents} documents.`], pending: [] });
          arc.deals.forEach((d, i) => {
            setTimeout(() => {
              const cur = get().archive[orgId];
              put({ log: [...cur.log, `Reconstructed ${d.record.name} (${d.record.closed}) from ${d.fromDocs.length} documents — ${d.record.confidence?.toLowerCase()} confidence${d.missing.length ? `; missing: ${d.missing.join(', ').toLowerCase()}` : ''}.`], pending: [...cur.pending, d.record.id] });
            }, 900 * (i + 1));
          });
          setTimeout(() => {
            const cur = get().archive[orgId];
            put({ status: 'review', log: [...cur.log, `Done. ${arc.deals.length} acquisitions ready for your confirmation before they enter memory.`] });
          }, 900 * (arc.deals.length + 1));
        },

        movePipeline: (id, stage, passReason) => set((s) => ({ pipeline: s.pipeline.map((t) => (t.id === id ? { ...t, stage, passReason: passReason ?? t.passReason } : t)) })),
        linkPipeline: (id, acqId) => set((s) => ({ pipeline: s.pipeline.map((t) => (t.id === id ? { ...t, acquisitionId: acqId } : t)) })),
        addQA: (q) => {
          const id = nextId('qa');
          set((s) => ({ qa: [{ ...q, id, askedAt: DEMO_TODAY, askedBy: s.currentUserId }, ...s.qa] }));
          log({ acqId: q.acqId, actor: get().currentUserId, kind: 'work', text: `added a question for ${q.askedOf.toLowerCase()}: "${q.question.slice(0, 70)}${q.question.length > 70 ? '…' : ''}"` });
        },
        updateQA: (id, patch) => {
          const q = get().qa.find((x) => x.id === id);
          set((s) => ({ qa: s.qa.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
          if (q && patch.status && patch.status !== q.status) log({ acqId: q.acqId, actor: get().currentUserId, kind: 'work', text: `marked a Q&A item ${patch.status.toLowerCase()}: "${q.question.slice(0, 60)}…"` });
        },
        setLoiTerms: (acqId, terms) => {
          const before = get().acquisitions.find((a) => a.id === acqId)?.loiTerms;
          set((s) => ({ acquisitions: s.acquisitions.map((a) => (a.id === acqId ? { ...a, loiTerms: terms } : a)) }));
          if (!before) log({ acqId, actor: get().currentUserId, kind: 'phase', text: `drafted structured LOI terms ($${terms.ev.toFixed(1)}M EV)` });
          else if (before.status !== terms.status) log({ acqId, actor: get().currentUserId, kind: 'phase', text: `marked LOI terms ${terms.status.toLowerCase()}` });
        },
        draftQAFromFindings: (acqId) => {
          const asked = new Set(get().qa.filter((q) => q.acqId === acqId).map((q) => q.findingId));
          const open = get().findings.filter((f) => f.acqId === acqId && !f.positive && ['Open', 'Under Review', 'Proposed'].includes(f.status) && !asked.has(f.id));
          const items: QAItem[] = open.map((f, i) => ({
            id: `qa-${acqId}-${get().seq}-${i}`,
            acqId,
            question: `Please explain: ${f.title.charAt(0).toLowerCase() + f.title.slice(1)}. ${f.recommendation ? 'What supporting data can you provide?' : ''}`.trim(),
            workstream: f.workstream,
            askedOf: 'Management',
            askedBy: get().currentUserId,
            status: 'Draft',
            askedAt: DEMO_TODAY,
            findingId: f.id,
            draftedBy: 'atlas',
          }));
          set((s) => ({ qa: [...items, ...s.qa], seq: s.seq + 1 }));
          if (items.length) log({ acqId, actor: 'atlas', kind: 'work', text: `drafted ${items.length} questions for management from open findings` });
          return items.length;
        },

        confirmArchived: (dealId, accept) => {
          const org = get().currentOrgId;
          const d = ARCHIVES[org]?.deals.find((x) => x.record.id === dealId);
          if (!d) return;
          set((s) => ({
            priors: accept && !s.priors.some((p) => p.id === dealId) ? [...s.priors, d.record] : s.priors,
            archive: { ...s.archive, [org]: { ...s.archive[org], pending: s.archive[org].pending.filter((x) => x !== dealId), confirmed: accept ? [...s.archive[org].confirmed, dealId] : s.archive[org].confirmed } },
          }));
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
          // Atlas drafts the downstream chain (risk → decision → actions) for human review.
          const tpl = get().chains[id] ?? genericChain(get().findings.find((x) => x.id === id)!);
          if (tpl.length) {
            const made: Proposal[] = tpl.map((t, i) => ({ ...t, id: `pr-${id}-${i}-${get().seq}`, acqId: f.acqId, createdAt: DEMO_TODAY, status: 'Pending', parentFindingId: id }));
            set((s) => ({ proposals: [...made, ...s.proposals], seq: s.seq + 1 }));
            log({ acqId: f.acqId, actor: 'atlas', kind: 'finding', text: `drafted ${made.length} linked item${made.length > 1 ? 's' : ''} (${made.map((m) => m.kind).join(', ')}) for "${f.title}"`, ref: { type: 'finding', id } });
          }
        },

        acceptProposal: (pid) => {
          const p = get().proposals.find((x) => x.id === pid);
          if (!p || p.status !== 'Pending') return;
          const me = get().currentUserId;
          const pl = p.payload ?? {};
          const parent = p.parentFindingId ? get().findings.find((f) => f.id === p.parentFindingId) : undefined;
          if (pl.risk) {
            if (parent) get().addRiskFromFinding(parent.id, pl.risk);
            else {
              const rid = nextId('r');
              set((s) => ({ risks: [{ ...pl.risk!, id: rid, acqId: p.acqId, workstream: 'financial', status: 'Open', findingIds: [], decisionIds: [], comments: [] }, ...s.risks] }));
            }
          }
          if (pl.decision) {
            const d = pl.decision;
            const riskIds = parent ? get().risks.filter((r) => r.findingIds.includes(parent.id)).map((r) => r.id) : [];
            get().addDecision({
              acqId: p.acqId,
              question: d.question,
              context: d.context,
              phase: d.phase,
              options: d.options.map((o, i) => ({ id: `o${i + 1}`, label: o.label, description: o.description, pros: [], cons: [] })),
              recommendation: d.recommended !== undefined ? { optionId: `o${d.recommended + 1}`, by: 'atlas', rationale: p.basis } : undefined,
              proposedBy: 'atlas',
              approverId: d.approverId,
              reviewerIds: [],
              due: '2026-10-14',
              findingIds: parent ? [parent.id] : [],
              riskIds,
              documentIds: parent ? parent.fact.citations.map((c) => c.docId) : [],
              downstream: [],
            });
          }
          if (pl.action) {
            const acq = get().acquisitions.find((a) => a.id === p.acqId);
            get().addWork({ acqId: p.acqId, title: pl.action.title, kind: pl.action.kind, workstream: pl.action.workstream, phase: acq?.currentPhase ?? 'diligence', status: 'Not Started', priority: 'High', ownerId: pl.action.ownerId, due: pl.action.due, findingIds: parent ? [parent.id] : undefined, createdBy: 'atlas' });
          }
          if (pl.finding) get().addFinding({ ...pl.finding, acqId: p.acqId, status: 'Open', identifiedBy: 'atlas' });
          if (pl.deliverableId) {
            get().saveDeliverable(pl.deliverableId, undefined);
            set((s) => ({ deliverables: s.deliverables.map((d) => (d.id === pl.deliverableId ? { ...d, generatedAt: DEMO_TODAY } : d)) }));
          }
          if (p.kind === 'playbook') set((s) => ({ adoptedLessons: [...s.adoptedLessons, p.id] }));
          set((s) => ({ proposals: s.proposals.map((x) => (x.id === pid ? { ...x, status: 'Accepted' } : x)) }));
          log({ acqId: p.acqId, actor: me, kind: p.kind === 'risk' ? 'risk' : p.kind === 'decision' ? 'decision' : 'work', text: `accepted Atlas’s proposed ${p.kind}: "${p.title}"` });
        },

        dismissProposal: (pid) => {
          const p = get().proposals.find((x) => x.id === pid);
          set((s) => ({ proposals: s.proposals.map((x) => (x.id === pid ? { ...x, status: 'Dismissed' } : x)) }));
          if (p) log({ acqId: p.acqId, actor: get().currentUserId, kind: 'work', text: `dismissed Atlas’s proposed ${p.kind}: "${p.title}"` });
        },

        acceptChain: (findingId) => {
          const f = get().findings.find((x) => x.id === findingId);
          if (f?.status === 'Proposed') get().acceptFinding(findingId);
          // Risks first so decisions link to them.
          const order = { risk: 0, decision: 1, action: 2, request: 2, deliverable: 3, research: 3, playbook: 3 } as const;
          get()
            .proposals.filter((p) => p.parentFindingId === findingId && p.status === 'Pending')
            .sort((a, b) => order[a.kind] - order[b.kind])
            .forEach((p) => get().acceptProposal(p.id));
        },

        runAnalysis: (acqId) => {
          const me = get().currentUserId;
          const acq0 = get().acquisitions.find((a) => a.id === acqId)!;
          const SAMPLE = SAMPLES[acq0.orgId];
          if (!SAMPLE) return;
          const { docs: LS_DOCS, discoveries: LS_DISCOVERIES, metrics: LS_METRICS, gaps: LS_GAPS, research: LS_RESEARCH, claims: LS_CLAIMS } = SAMPLE;
          const docId = (key: string) => `${acqId}-${key}`;
          const remap = (cs: Citation[]) => cs.map((c) => ({ ...c, docId: docId(c.docId) }));
          const stamp = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const push = (text: string, kind: AnalysisRun['log'][number]['kind']) =>
            set((s) => ({ runs: { ...s.runs, [acqId]: { ...s.runs[acqId], log: [...s.runs[acqId].log, { t: stamp(), text, kind }] } } }));
          set((s) => ({ runs: { ...s.runs, [acqId]: { status: 'running', total: LS_DOCS.length, done: 0, log: [] } } }));
          // Documents arrive as one data-room batch.
          set((s) => ({
            documents: [
              ...LS_DOCS.map(({ key, ...d }) => ({ ...d, id: docId(key), acqId, uploadedBy: me, uploadedAt: DEMO_TODAY, status: 'Queued' as const })),
              ...s.documents,
            ],
          }));
          log({ acqId, actor: me, kind: 'document', text: `uploaded a data room batch of ${LS_DOCS.length} documents` });
          push(`Received ${LS_DOCS.length} documents from the seller data room. Security scan passed.`, 'doc');
          const STEP = 850;
          LS_DOCS.forEach((d, i) => {
            setTimeout(() => {
              set((s) => ({
                documents: s.documents.map((x) => (x.id === docId(d.key) ? { ...x, status: 'Processing' } : x)),
                runs: { ...s.runs, [acqId]: { ...s.runs[acqId], current: d.name } },
              }));
              push(`Reading ${d.name} — ${d.pageCount} ${d.type === 'XLSX' ? 'sheets' : d.type === 'PPTX' ? 'slides' : 'pages'}. Classified as ${d.category}.`, 'doc');
            }, i * STEP + 200);
            setTimeout(() => {
              set((s) => ({
                documents: s.documents.map((x) => (x.id === docId(d.key) ? { ...x, status: 'Processed' } : x)),
                runs: { ...s.runs, [acqId]: { ...s.runs[acqId], done: i + 1 } },
              }));
              LS_DISCOVERIES.filter((x) => x.afterDoc === d.key).forEach((disc) => {
                const fid = get().addFinding({ ...disc.finding, fact: { ...disc.finding.fact, citations: remap(disc.finding.fact.citations) }, acqId, status: 'Proposed', identifiedBy: 'atlas' });
                if (disc.chain.length) set((s) => ({ chains: { ...s.chains, [fid]: disc.chain } }));
                push(`${disc.finding.positive ? 'Noted' : 'Proposed finding'}: ${disc.finding.title}`, 'finding');
              });
            }, i * STEP + 700);
          });
          const end = LS_DOCS.length * STEP + 900;
          setTimeout(() => {
            const metrics = { ...LS_METRICS, sources: Object.fromEntries(Object.entries(LS_METRICS.sources ?? {}).map(([k, v]) => [k, remap(v as Citation[])])) };
            const pb = get().playbooks.find((p) => p.id === acq0.playbookId)!;
            set((s) => ({
              acquisitions: s.acquisitions.map((a) =>
                a.id === acqId
                  ? {
                      ...a,
                      ...SAMPLE.enrich,
                      target: { ...a.target, ...(SAMPLE.enrich.target ?? {}) },
                      metrics,
                      thesis: {
                        ...a.thesis,
                        assumptions: a.thesis.assumptions.map((x) => {
                          const c = pb.criteria.find((c) => c.key === x.id);
                          const v = metrics.values[x.id];
                          const r = c ? evaluate(c, v) : null;
                          return r && c ? { ...x, current: typeof v === 'number' ? (c.unit === '%' ? `${v.toFixed(1)}%` : String(v)) : String(v), status: statusFor(r) } : x;
                        }),
                      },
                      phases: { ...a.phases, strategy: { ...a.phases.strategy, progress: 60, summary: 'Data room analyzed by Atlas. Screening decision pending.' } },
                    }
                  : a,
              ),
            }));
            const results = pb.criteria.map((c) => evaluate(c, metrics.values[c.key])).filter(Boolean);
            const fails = results.filter((r) => r === 'Fail').length;
            const watch = results.filter((r) => r === 'Watch').length;
            push(`Scored against ${pb.name} ${pb.version}: ${results.length - fails - watch} pass, ${watch} watch, ${fails} fail.`, 'check');
            const acq = get().acquisitions.find((a) => a.id === acqId)!;
            const priors = get().priors.filter((p) => p.orgId === acq.orgId);
            const sim = similarDeals(acq, pb, priors);
            push(`Compared with ${priors.length} prior acquisitions: ${sim.length ? sim.map((x) => `${x.deal.name} (${x.reasons.join(', ')})`).join('; ') : 'no close matches'}.`, 'memory');
          }, end);
          setTimeout(() => {
            set((s) => ({
              proposals: [
                ...LS_GAPS.map((g, i) => ({
                  id: `pr-${acqId}-gap${i}`,
                  acqId,
                  kind: 'request' as const,
                  title: `Request: ${g.title}`,
                  summary: g.why,
                  basis: 'Expected for this stage by the playbook request list; not found in the data room.',
                  confidence: 'High' as const,
                  createdAt: DEMO_TODAY,
                  status: 'Pending' as const,
                  payload: { action: { title: `Request from seller: ${g.title}`, ownerId: me, workstream: g.workstream, due: '2026-10-09', kind: 'Request' as const } },
                })),
                ...s.proposals,
              ],
            }));
            push(`Found ${LS_GAPS.length} information gaps and drafted information requests.`, 'gap');
          }, end + 700);
          setTimeout(() => {
            set((s) => ({
              research: [...LS_RESEARCH.map((r, i) => ({ ...r, id: `${acqId}-rs${i}`, acqId })), ...s.research],
              claims: [...LS_CLAIMS.map((c, i) => ({ ...c, id: `${acqId}-cl${i}`, acqId, claimSource: { ...c.claimSource, docId: docId(c.claimSource.docId) }, evidenceSources: remap(c.evidenceSources) })), ...s.claims],
            }));
            push(`Researched ${LS_RESEARCH.length} external sources and checked ${LS_CLAIMS.length} seller claims (${LS_CLAIMS.filter((c) => c.verdict === 'Contradicted').length} contradicted).`, 'research');
          }, end + 1400);
          setTimeout(() => {
            const n = get().findings.filter((f) => f.acqId === acqId && f.status === 'Proposed').length;
            set((s) => ({ runs: { ...s.runs, [acqId]: { ...s.runs[acqId], status: 'done', current: undefined } } }));
            push(`Done. ${n} findings and ${LS_GAPS.length} requests are waiting for your review. Nothing is final until a person accepts it.`, 'done');
            log({ acqId, actor: 'atlas', kind: 'finding', text: `analyzed ${LS_DOCS.length} documents: ${n} proposed findings, ${LS_GAPS.length} information gaps, ${LS_RESEARCH.length} research items` });
          }, end + 2000);
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
                a.id === d.acqId ? { ...a, ev: 20.0, evBasis: '$20.0M at close (6.25x QoE EBITDA) + up to $1.5M earn-out on top-5 retention', metrics: a.metrics ? { ...a.metrics, values: { ...a.metrics.values, askMultiple: 6.25 } } : a.metrics } : a,
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
        reset: () => set((s) => ({ ...seed(), feedback: s.feedback, signedIn: s.signedIn })),
      };
    },
    {
      name: 'maspace-prototype-v4',
      storage: createJSONStorage(() => localStorage),
      // Analysis runs are timer-driven; never restore one mid-flight.
      partialize: (s) => {
        const { runs, ...rest } = s;
        void runs;
        return rest as typeof s;
      },
      skipHydration: true,
    },
  ),
);

// ---------- selectors ----------
export const useAcq = (id: string) => useStore((s) => s.acquisitions.find((a) => a.id === id));
