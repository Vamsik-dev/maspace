import type { Citation, PhaseKey } from './types';
import { useStore } from './store';
import { PRIOR } from '@/data/portfolio';
import { personById } from '@/data/people';
import { DEMO_TODAY, phaseShort, wsLabel } from './meta';

// Atlas is simulated. Answers are composed deterministically from the
// acquisition's structured data, so they change as the deal changes, and
// every claim is typed as fact / inference / recommendation / decision.

export type ClaimKind = 'fact' | 'inference' | 'recommendation' | 'decision' | 'memory';

export interface AtlasClaim {
  kind: ClaimKind;
  text: string;
  citations?: Citation[];
  calculation?: string;
  comparedWith?: string;
  href?: string;
}

export type AtlasBlock =
  | { type: 'heading'; text: string }
  | { type: 'claim'; claim: AtlasClaim }
  | { type: 'list'; title?: string; items: { text: string; href?: string; meta?: string; kind?: ClaimKind; citations?: Citation[] }[] }
  | { type: 'note'; text: string };

export interface AtlasAnswer {
  question: string;
  intro: string;
  blocks: AtlasBlock[];
  actions: { label: string; href: string }[];
  followUps: string[];
  scope: string;
}

type S = ReturnType<typeof useStore.getState>;

const sevRank = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;
const who = (id: string) => (id === 'atlas' ? 'Atlas' : id === 'automation' ? 'Automation' : personById(id)?.name ?? id);

export const SUGGESTED: string[] = [
  'Prepare me for the management meeting',
  'Research this target: what do outside sources say?',
  'What are the unresolved risks?',
  "What's changed this week?",
  'What changed since the original thesis?',
  'Have we seen customer concentration like this before?',
  'What needs my attention?',
];

export function ask(question: string, acqId: string, s: S = useStore.getState()): AtlasAnswer {
  const q = question.toLowerCase();
  const acq = s.acquisitions.find((a) => a.id === acqId)!;
  const base = `/acquisitions/${acqId}`;
  const findings = s.findings.filter((f) => f.acqId === acqId && f.status !== 'Dismissed');
  const risks = s.risks.filter((r) => r.acqId === acqId);
  const decisions = s.decisions.filter((d) => d.acqId === acqId);
  const work = s.work.filter((w) => w.acqId === acqId);
  const docs = s.documents.filter((d) => d.acqId === acqId);
  const scope = `${acq.name} · ${docs.length} documents · ${findings.length} findings · ${decisions.length} decisions`;
  const isAbc = acqId === 'acq-abc';
  const ans = (a: Omit<AtlasAnswer, 'question' | 'scope'>): AtlasAnswer => ({ ...a, question, scope });

  const has = (...k: string[]) => k.some((x) => q.includes(x));

  // ---------- a specific document ----------
  const docMatch = q.startsWith('what does') ? docs.find((d) => q.includes(d.name.split(/[—.]/)[0].trim().toLowerCase())) : undefined;
  if (docMatch) {
    const cites = findings.filter((f) => f.fact.citations.some((c) => c.docId === docMatch.id));
    return ans({
      intro: `${docMatch.name} (${docMatch.category}, ${docMatch.source.toLowerCase()}-provided, ${docMatch.pageCount} ${docMatch.type === 'XLSX' ? 'sheets' : 'pages'}).`,
      blocks: [
        { type: 'claim', claim: { kind: 'inference', text: docMatch.summary } },
        ...docMatch.pages.slice(0, 3).map((p) => ({ type: 'claim' as const, claim: { kind: 'fact' as const, text: `${p.heading}: ${p.body[0]}`, citations: [{ docId: docMatch.id, page: p.n }] } })),
        cites.length
          ? { type: 'list' as const, title: 'Findings that cite it', items: cites.map((f) => ({ text: f.title, href: `${base}/findings/${f.id}`, meta: f.severity, kind: 'fact' as const })) }
          : { type: 'note' as const, text: 'No findings cite this document yet.' },
      ],
      actions: [{ label: 'Open document', href: `${base}/documents/${docMatch.id}` }],
      followUps: ['What are the unresolved risks?'],
    });
  }

  // ---------- external research ----------
  if (has('research', 'outside', 'external', 'public record', 'market')) {
    const items = s.research.filter((r) => r.acqId === acqId);
    const claims = s.claims.filter((c) => c.acqId === acqId && c.verdict !== 'Verified');
    return ans({
      intro: items.length ? `Here is what outside sources add, kept separate from seller-provided documents. ${items.filter((r) => r.relevance === 'Material').length} items look material.` : 'No external research has been run for this target yet.',
      blocks: [
        ...items.map((r) => ({ type: 'claim' as const, claim: { kind: (r.relevance === 'Material' ? 'inference' : 'fact') as 'inference' | 'fact', text: `${r.topic}: ${r.headline}. ${r.detail} [External · ${r.sourceType}]` } })),
        ...(claims.length
          ? [{ type: 'list' as const, title: 'Seller claims to verify before the meeting', items: claims.map((c) => ({ text: `“${c.claim}” — ${c.verdict.toLowerCase()}: ${c.evidence}`, kind: 'fact' as const, citations: c.evidenceSources })) }]
          : []),
        { type: 'note', text: 'Prototype: external sources are synthetic. In the product Atlas researches permitted public sources and cites each one.' },
      ],
      actions: [{ label: 'Open target intelligence', href: `${base}/research` }],
      followUps: ['Prepare me for the management meeting', 'Have we seen customer concentration like this before?'],
    });
  }

  // ---------- management meeting ----------
  if (has('management meeting', 'mgmt meeting', 'management questions', 'prepare me', 'questions for management')) {
    const open = findings.filter((f) => !f.positive && ['Open', 'Under Review', 'Proposed'].includes(f.status)).sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
    const mm = s.milestones.find((m) => m.acqId === acqId && /management meeting/i.test(m.title));
    const questions = isAbc
      ? [
          { text: 'Who would be licensed as the ACR qualifier for Austin and Round Rock if you step back, and how long would TDLR take?', meta: 'Founder dependency', href: `${base}/findings/f-owner` },
          { text: 'Walk us through the Brazos Valley ISD relationship: who are your contacts, and how did the 2023 MSA renewal go?', meta: 'Change of control', href: `${base}/findings/f-coc` },
          { text: 'Warranty claims recurred in each of the last 3 years. What drives them, and what has changed operationally?', meta: 'QoE adjustment', href: `${base}/findings/f-qoe` },
          { text: 'Technician turnover rose to 28%. Where are people going, and what would you change on pay or scheduling?', meta: 'Turnover', href: `${base}/findings/f-turnover` },
          { text: 'How would Lakeline react to a change of ownership? Should we approach them together before announcement?', meta: 'Change of control', href: `${base}/findings/f-coc` },
          { text: 'What is the plan to complete EPA 608 recovery logs at Waco?', meta: 'Regulatory', href: `${base}/findings/f-epa` },
        ]
      : open.map((f) => ({ text: `Can you help us understand: ${f.title.toLowerCase()}?`, meta: wsLabel(f.workstream), href: `${base}/findings/${f.id}` }));
    return ans({
      intro: mm ? `${mm.title} is on ${fmtDate(mm.date)}. Here is what I would focus on, based on ${open.length} unresolved findings.` : `Based on ${open.length} unresolved findings, here is a suggested focus.`,
      blocks: [
        { type: 'heading', text: 'Issues to clarify' },
        ...open.slice(0, 4).map((f) => ({ type: 'claim' as const, claim: { kind: 'fact' as const, text: f.fact.text, citations: f.fact.citations, calculation: f.calculation, href: `${base}/findings/${f.id}` } })),
        { type: 'list', title: 'Suggested questions', items: questions.map((x) => ({ ...x, kind: 'recommendation' as const })) },
        ...(isAbc
          ? [
              { type: 'claim' as const, claim: { kind: 'memory' as const, text: 'At Bluebonnet Plumbing (2023), the founder was the sole license holder and commercial bidding paused for 4 months after close. Ask about successor licensing directly.', href: '/memory' } },
              { type: 'claim' as const, claim: { kind: 'inference' as const, text: 'Gary is likely to resist the warranty reclassification, since it accounts for $140K of the $420K EBITDA gap. Bring the 3-year claim history (QoE p.11).', citations: [{ docId: 'd-qoe', page: 11 }] } },
            ]
          : []),
      ],
      actions: isAbc ? [{ label: 'Open Management Meeting Brief', href: `${base}/deliverables/dl-mgmt` }] : [],
      followUps: ['What are the unresolved risks?', 'What changed since the original thesis?'],
    });
  }

  // ---------- what changed this week ----------
  if (has('changed this week', "what's changed", 'whats changed', 'what changed this', 'this week', 'recent')) {
    const since = '2026-09-26';
    const recent = s.activity.filter((a) => a.acqId === acqId && a.at >= since);
    return ans({
      intro: `${recent.length} changes since ${fmtDate(since)}. The material ones:`,
      blocks: [
        {
          type: 'list',
          items: recent.slice(0, 10).map((a) => ({
            text: `${who(a.actor)} ${a.text}`,
            meta: fmtDate(a.at.slice(0, 10)),
            href: a.ref ? refHref(base, a.ref.type, a.ref.id) : undefined,
            kind: 'fact' as const,
          })),
        },
        ...(isAbc
          ? [
              { type: 'claim' as const, claim: { kind: 'inference' as const, text: 'The biggest change is the QoE: it moves the price conversation from "confirm" to "re-negotiate". Everything on the critical path to SPA signing now depends on the price decision.', href: `${base}/decisions/dec-price` } },
            ]
          : []),
      ],
      actions: isAbc ? [{ label: 'Open Weekly Deal Update', href: `${base}/deliverables/dl-weekly` }] : [],
      followUps: ['What needs my attention?', 'What are the unresolved risks?'],
    });
  }

  // ---------- thesis ----------
  if (has('thesis', 'assumption', 'unsupported', 'original')) {
    return ans({
      intro: `The thesis rests on ${acq.thesis.assumptions.length} testable assumptions. Diligence has tested ${acq.thesis.assumptions.filter((a) => a.status !== 'Untested').length}.`,
      blocks: acq.thesis.assumptions.map((a) => {
        const f = a.findingIds?.map((id) => findings.find((x) => x.id === id)).find(Boolean);
        return {
          type: 'claim' as const,
          claim: {
            kind: a.status === 'Untested' ? ('inference' as const) : ('fact' as const),
            text: `${a.label}: expected ${a.expected}${a.current ? `, now ${a.current}` : ''} — ${a.status}.`,
            citations: f?.fact.citations,
            comparedWith: `Thesis assumption: ${a.expected}`,
            href: f ? `${base}/findings/${f.id}` : undefined,
          },
        };
      }),
      actions: [{ label: 'View thesis', href: `${base}/phase/strategy` }],
      followUps: ['What are the unresolved risks?', 'Have we seen customer concentration like this before?'],
    });
  }

  // ---------- memory ----------
  if (has('before', 'prior', 'similar', 'history', 'previous', 'get wrong', 'lesson', 'learn')) {
    const topic = has('concentration', 'customer') ? 'customer concentration' : has('license', 'owner', 'founder') ? 'licensing' : has('system', 'erp', 'software') ? 'integration' : null;
    const matches = PRIOR.filter((p) => !topic || p.tags.some((t) => t.includes(topic.split(' ')[0])) || p.issues.join(' ').toLowerCase().includes(topic.split(' ')[1] ?? topic));
    const list = matches.length ? matches : PRIOR;
    return ans({
      intro: topic ? `Across Meridian's ${PRIOR.length} completed acquisitions, ${list.length} had a comparable ${topic} issue.` : `Lessons from Meridian's ${PRIOR.length} completed acquisitions that apply here:`,
      blocks: [
        ...list.map((p) => ({
          type: 'claim' as const,
          claim: { kind: 'memory' as const, text: `${p.name} (${p.closed.slice(0, 4)}): ${p.issues[0]}. Lesson: ${p.lessons[0].text}`, href: `/memory#${p.id}` },
        })),
        ...(isAbc && topic === 'customer concentration'
          ? [
              { type: 'claim' as const, claim: { kind: 'fact' as const, text: 'ABC top-5 concentration is 38.4%, higher than Red River at close (34%).', citations: [{ docId: 'd-cust', page: 1 }, { docId: 'd-qoe', page: 17 }], calculation: '(2,040 + 1,621 + 1,384 + 1,111 + 838) ÷ 18,215 = 38.4%' } },
              { type: 'claim' as const, claim: { kind: 'recommendation' as const, text: 'Apply the Red River lesson: tie contingent consideration to top-customer retention. This is option 3 in the open price decision.', href: `${base}/decisions/dec-price` } },
            ]
          : []),
      ],
      actions: [{ label: 'Open acquisition memory', href: '/memory' }],
      followUps: ['What changed since the original thesis?', 'What are the unresolved risks?'],
    });
  }

  // ---------- concentration ----------
  if (isAbc && has('concentration', 'customer', 'top 5', 'top-5')) {
    const f = findings.find((x) => x.id === 'f-conc')!;
    return ans({
      intro: 'Customer concentration is the main commercial issue on this deal.',
      blocks: [
        { type: 'claim', claim: { kind: 'fact', text: f.fact.text, citations: f.fact.citations, calculation: f.calculation, comparedWith: 'Thesis threshold: < 25%' } },
        { type: 'claim', claim: { kind: 'fact', text: 'The CIM describes the base as "diversified" with no customer above 12%. Both statements are technically true.', citations: [{ docId: 'd-cim', page: 14 }] } },
        { type: 'claim', claim: { kind: 'inference', text: f.interpretation! } },
        { type: 'claim', claim: { kind: 'inference', text: '20.1% of revenue (BVISD + Lakeline) also sits under change-of-control provisions, so concentration and consent risk compound.', citations: [{ docId: 'd-msa-bvisd', page: 9 }, { docId: 'd-lakeline', page: 6 }], href: `${base}/findings/f-coc` } },
        { type: 'claim', claim: { kind: 'recommendation', text: f.recommendation!, href: `${base}/decisions/dec-price` } },
      ],
      actions: [{ label: 'Open finding', href: `${base}/findings/f-conc` }],
      followUps: ['Have we seen customer concentration like this before?', 'Prepare me for the management meeting'],
    });
  }

  // ---------- EBITDA / QoE / valuation ----------
  if (isAbc && has('ebitda', 'qoe', 'quality of earnings', 'valuation', 'price', 'financial')) {
    const f = findings.find((x) => x.id === 'f-qoe')!;
    const d = decisions.find((x) => x.id === 'dec-price')!;
    return ans({
      intro: 'Financial diligence is 2 items from complete. The QoE is the driver of the price decision.',
      blocks: [
        { type: 'claim', claim: { kind: 'fact', text: f.fact.text, citations: f.fact.citations, calculation: f.calculation } },
        { type: 'claim', claim: { kind: 'fact', text: 'QoE recommends a net working capital peg of $2.05M–$2.20M.', citations: [{ docId: 'd-qoe', page: 22 }] } },
        { type: 'claim', claim: { kind: 'inference', text: f.interpretation! } },
        {
          type: 'claim',
          claim: {
            kind: 'decision',
            text: d.status === 'Approved' ? `Decision recorded: ${d.options.find((o) => o.id === d.outcome?.optionId)?.label} (approved by ${who(d.outcome!.decidedBy)}).` : `Decision pending: "${d.question}" — recommended option is ${d.options.find((o) => o.id === d.recommendation?.optionId)?.label}, awaiting ${who(d.approverId)}.`,
            href: `${base}/decisions/dec-price`,
          },
        },
      ],
      actions: [{ label: 'Open valuation', href: `${base}/phase/valuation` }, { label: 'Open price decision', href: `${base}/decisions/dec-price` }],
      followUps: ['What are the unresolved risks?', 'Prepare IC memo'],
    });
  }

  // ---------- change of control ----------
  if (isAbc && has('change of control', 'change-of-control', 'contract', 'consent', 'legal')) {
    const f = findings.find((x) => x.id === 'f-coc')!;
    return ans({
      intro: 'Two top-5 customer contracts have change-of-control mechanics.',
      blocks: [
        { type: 'claim', claim: { kind: 'fact', text: f.fact.text, citations: f.fact.citations, calculation: f.calculation } },
        { type: 'claim', claim: { kind: 'inference', text: f.interpretation! } },
        { type: 'claim', claim: { kind: 'recommendation', text: f.recommendation!, href: `${base}/decisions/dec-consent` } },
        { type: 'note', text: 'Atlas identifies and summarizes contract terms. Legal conclusions remain with counsel.' },
      ],
      actions: [{ label: 'Open finding', href: `${base}/findings/f-coc` }],
      followUps: ['Prepare me for the management meeting'],
    });
  }

  // ---------- founder ----------
  if (isAbc && has('owner', 'founder', 'gary', 'license', 'key person')) {
    const f = findings.find((x) => x.id === 'f-owner')!;
    return ans({
      intro: 'Founder dependency is both a licensing and a relationship issue.',
      blocks: [
        { type: 'claim', claim: { kind: 'fact', text: f.fact.text, citations: f.fact.citations } },
        { type: 'claim', claim: { kind: 'inference', text: f.interpretation! } },
        { type: 'claim', claim: { kind: 'recommendation', text: f.recommendation!, href: `${base}/decisions/dec-founder` } },
      ],
      actions: [{ label: 'Open finding', href: `${base}/findings/f-owner` }],
      followUps: ['Have we seen licensing issues before?'],
    });
  }

  // ---------- IC memo ----------
  if (has('ic memo', 'ic package', 'investment committee', 'memo')) {
    const pending = decisions.filter((d) => d.status === 'Open' || d.status === 'Under Review');
    return ans({
      intro: 'I can draft the IC memo from the structured deal data: target, thesis, valuation, findings, risks and open decisions. Every number links to its source.',
      blocks: [
        { type: 'claim', claim: { kind: 'fact', text: `${findings.filter((f) => f.severity === 'Critical' || f.severity === 'High').length} high/critical findings and ${risks.filter((r) => r.status !== 'Closed').length} open risks will be included.` } },
        { type: 'claim', claim: { kind: 'inference', text: pending.length ? `${pending.length} decisions are still open. The memo will list them under "Decisions required" rather than assume an outcome.` : 'All decisions are recorded.' } },
        { type: 'note', text: 'The draft is editable. Atlas will not mark the memo Final; a human must.' },
      ],
      actions: isAbc ? [{ label: 'Open IC memo draft', href: `${base}/deliverables/dl-ic` }] : [{ label: 'Go to deliverables', href: `${base}/deliverables` }],
      followUps: ['What are the unresolved risks?'],
    });
  }

  // ---------- risks ----------
  if (has('risk', 'worr', 'concern', 'biggest')) {
    const open = risks.filter((r) => r.status === 'Open' || r.status === 'Mitigating').sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
    return ans({
      intro: open.length ? `${open.length} risks are unresolved. In order of severity:` : 'No unresolved risks are recorded.',
      blocks: [
        {
          type: 'list',
          items: open.map((r) => {
            const f = findings.find((x) => r.findingIds.includes(x.id));
            return { text: `${r.title} — ${r.status.toLowerCase()}; owner ${who(r.ownerId)}`, meta: r.severity, href: `${base}/risks?risk=${r.id}`, kind: 'inference' as const, citations: f?.fact.citations };
          }),
        },
        ...(isAbc
          ? [
              { type: 'claim' as const, claim: { kind: 'inference' as const, text: 'Three of the high risks (concentration, change of control, founder) are connected through the same three customers: BVISD, Lakeline and St. Gabriel. A single customer-transition plan would address all three.' } },
              { type: 'claim' as const, claim: { kind: 'recommendation' as const, text: 'Resolve the price decision first; it determines whether concentration is mitigated through structure (earn-out) or price.', href: `${base}/decisions/dec-price` } },
            ]
          : []),
      ],
      actions: [{ label: 'Open risk register', href: `${base}/risks` }],
      followUps: ['Prepare me for the management meeting', 'What changed since the original thesis?'],
    });
  }

  // ---------- attention / next ----------
  if (has('attention', 'next', 'should i', 'my ', 'todo', 'to do', 'priority', 'priorities')) {
    const me = s.currentUserId;
    const mine = work.filter((w) => (w.ownerId === me || w.reviewerId === me) && w.status !== 'Complete');
    const overdue = mine.filter((w) => w.due && w.due < DEMO_TODAY);
    const toDecide = decisions.filter((d) => (d.status === 'Open' || d.status === 'Under Review') && (d.approverId === me || d.reviewers.some((r) => r.personId === me && r.verdict === 'Pending')));
    return ans({
      intro: `For ${who(me)}: ${mine.length} open work items (${overdue.length} overdue) and ${toDecide.length} decisions awaiting you.`,
      blocks: [
        { type: 'list', title: 'Decisions awaiting you', items: toDecide.map((d) => ({ text: d.question, href: `${base}/decisions/${d.id}`, meta: d.approverId === me ? 'Approve' : 'Review', kind: 'decision' as const })) },
        { type: 'list', title: 'Your work', items: mine.slice(0, 8).map((w) => ({ text: w.title, href: `${base}/work?item=${w.id}`, meta: w.due && w.due < DEMO_TODAY ? `Overdue · ${fmtDate(w.due)}` : w.status, kind: 'fact' as const })) },
      ],
      actions: [{ label: 'Open work', href: `${base}/work` }],
      followUps: ["What's changed this week?"],
    });
  }

  // ---------- fallback: honest search ----------
  const terms = q.split(/\W+/).filter((t) => t.length > 3);
  const hitsF = findings.filter((f) => terms.some((t) => (f.title + ' ' + f.fact.text).toLowerCase().includes(t)));
  const hitsD = docs.filter((d) => terms.some((t) => (d.name + ' ' + d.summary + ' ' + d.pages.map((p) => p.body.join(' ')).join(' ')).toLowerCase().includes(t)));
  return ans({
    intro: hitsF.length || hitsD.length ? 'I found related material in this acquisition:' : 'I don’t have a confident answer to that yet.',
    blocks: [
      ...(hitsF.length ? [{ type: 'list' as const, title: 'Findings', items: hitsF.map((f) => ({ text: f.title, href: `${base}/findings/${f.id}`, meta: f.severity, kind: 'fact' as const })) }] : []),
      ...(hitsD.length ? [{ type: 'list' as const, title: 'Documents', items: hitsD.slice(0, 6).map((d) => ({ text: d.name, href: `${base}/documents/${d.id}`, meta: d.category })) }] : []),
      { type: 'note', text: 'Prototype note: Atlas is simulated from structured demo data and answers a defined set of deal questions. In the product, it would retrieve from the deal’s documents and data with citations.' },
    ],
    actions: [],
    followUps: SUGGESTED.slice(0, 4),
  });
}

export function refHref(base: string, type: string, id: string) {
  switch (type) {
    case 'finding':
      return `${base}/findings/${id}`;
    case 'decision':
      return `${base}/decisions/${id}`;
    case 'document':
      return `${base}/documents/${id}`;
    case 'deliverable':
      return `${base}/deliverables/${id}`;
    case 'risk':
      return `${base}/risks?risk=${id}`;
    case 'work':
      return `${base}/work?item=${id}`;
    default:
      return base;
  }
}

export function fmtDate(d: string) {
  const dt = new Date(d.length === 10 ? d + 'T12:00' : d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const phaseName = (p: PhaseKey) => phaseShort(p);
