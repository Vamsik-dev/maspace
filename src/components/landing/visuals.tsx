'use client';

import { IconArrowRight, IconCheck, IconChecklist, IconFileText, IconGavel, IconInbox, IconLayoutDashboard, IconSearch, IconShieldExclamation } from '@tabler/icons-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { PHASES } from '@/lib/meta';
import { Count, cx, useInView } from './kit';
import { LOOP } from './data';
import s from './landing.module.css';

/* ------------------------------------------------------------------ */
/* Hero: a looping, deterministic Atlas run on the demo acquisition    */
/* ------------------------------------------------------------------ */

const DOCS = ['QoE report — Halvorsen & Pike.pdf', 'Customer revenue by account.xlsx', 'Brazos Valley ISD service contract.pdf', 'Sales & use tax filings 2022–25.pdf'];
const FINDINGS: { t: string; sev: 'Critical' | 'High' | 'Medium'; cite: string }[] = [
  { t: 'Adjusted EBITDA $3.20M vs. $3.62M in the CIM', sev: 'Critical', cite: 'QoE p.11' },
  { t: 'Top-5 customers are 38.4% of revenue', sev: 'High', cite: 'Customers p.1' },
  { t: 'Change-of-control consent required (BVISD)', sev: 'High', cite: 'Contract §14.2' },
  { t: 'Sales tax unfiled in two counties', sev: 'Medium', cite: 'Tax p.3' },
];
const BRIEF = 'The QoE reduces adjusted EBITDA by $0.42M. Proposed: re-price on the QoE figure, a $150K specific escrow for sales tax, and the BVISD consent as a closing condition.';
const CYCLE = 190;

export function ProductPreview({ reduced }: { reduced: boolean }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) {
      setT(CYCLE - 1);
      return;
    }
    const id = setInterval(() => setT((x) => (x + 1) % CYCLE), 100);
    return () => clearInterval(id);
  }, [reduced]);
  const docState = (i: number) => (t >= i * 13 + 18 ? 'done' : t >= i * 13 + 5 ? 'reading' : 'queued');
  const typed = Math.max(0, Math.min(BRIEF.length, (t - 72) * 3));
  const fitOn = t >= 40;
  const inReview = Math.min(5, FINDINGS.filter((_, i) => t >= 22 + i * 13).length + (t >= 72 ? 1 : 0));
  const nav: [typeof IconInbox, string, number][] = [
    [IconLayoutDashboard, 'Overview', 0],
    [IconInbox, 'Review queue', inReview],
    [IconSearch, 'Target intelligence', 0],
    [IconChecklist, 'Workstreams', 0],
    [IconShieldExclamation, 'Risk register', 0],
    [IconGavel, 'Decisions', 0],
    [IconFileText, 'Deal documents', 0],
  ];
  return (
    <div className={s.windowBody}>
      <aside className={s.side}>
        {nav.map(([I, label, n], i) => (
          <div key={label} className={cx(s.sideItem, i === 1 && s.sideActive)}>
            <I size={15} stroke={1.6} />
            {label}
            {n > 0 && <span className={s.sideCount}>{n}</span>}
          </div>
        ))}
      </aside>
      <div className={s.main}>
        <div className={s.dealHead}>
          <div>
            <div className={s.dealName}>ABC Mechanical</div>
            <div className={s.dealMeta}>Project Bluebird · HVAC services · Austin, TX · Due diligence</div>
          </div>
          <span className={s.cite}>EV $22.0M</span>
        </div>
        <div className={s.phaseRail}>
          {PHASES.map((p, i) => (
            <span key={p.key} className={i < 3 ? s.done : i === 3 ? s.live : undefined} />
          ))}
        </div>
        <div className={s.briefing}>
          <div className={s.briefLabel}>Atlas · recommendation for review</div>
          <div className={s.briefText}>
            {typed > 0 ? BRIEF.slice(0, typed) : <span style={{ color: 'var(--dim)' }}>Reading deal documents…</span>}
            {typed < BRIEF.length && <span className={s.caret} />}
          </div>
        </div>
        {FINDINGS.map((f, i) => (
          <div key={f.t} className={cx(s.finding, t >= 22 + i * 13 && s.findingOn)}>
            <span className={cx(s.sev, f.sev === 'Critical' ? s.sevCritical : f.sev === 'High' ? s.sevHigh : s.sevMedium)}>{f.sev}</span>
            <span className={s.findingTitle}>{f.t}</span>
            <span className={s.cite}>{f.cite}</span>
          </div>
        ))}
      </div>
      <aside className={s.rail}>
        <div>
          <div className={s.railTitle}>Deal documents</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {DOCS.map((d, i) => {
              const st = docState(i);
              return (
                <div key={d} className={cx(s.doc, st === 'reading' && s.docReading)}>
                  <IconFileText size={14} stroke={1.6} color="var(--muted)" />
                  <span className={s.docName}>{d}</span>
                  <span className={cx(s.docState, st === 'done' && s.docDone)}>{st === 'done' ? <IconCheck size={13} /> : st === 'reading' ? 'reading' : 'queued'}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className={s.railTitle}>Playbook · Mechanical v4</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {(
              [
                ['Top-5 customer concentration', 'Fail', 'var(--red)', 92],
                ['Adj. EBITDA margin', 'Pass', 'var(--teal)', 64],
                ['Recurring revenue', 'Watch', 'var(--amber)', 48],
                ['Technician retention', 'Pass', 'var(--teal)', 78],
              ] as const
            ).map(([l, r, c, w]) => (
              <div key={l} className={s.fitRow}>
                <span>{l}</span>
                <span style={{ color: c, fontSize: 11, fontWeight: 600 }}>{r}</span>
                <div className={s.bar}>
                  <i style={{ width: fitOn ? `${w}%` : 0, background: c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The acquisition loop                                                */
/* ------------------------------------------------------------------ */

export function AcquisitionLoop({ reduced }: { reduced: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced || !inView || paused) return;
    const id = setInterval(() => setActive((x) => (x + 1) % LOOP.length), 2400);
    return () => clearInterval(id);
  }, [reduced, inView, paused]);
  const N = LOOP.length;
  const R = 150;
  const C = 200;
  const pos = (i: number) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
  };
  const circ = 2 * Math.PI * R;
  return (
    <div ref={ref} className={s.loop} onMouseLeave={() => setPaused(false)}>
      <div className={s.loopFigure}>
        <svg viewBox="0 0 400 400" className={s.loopSvg} role="img" aria-label="The acquisition loop: nine stages from Understand to Next acquisition">
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--line-2)" strokeWidth="1" />
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - (active + 1) / N)}
            transform={`rotate(-90 ${C} ${C})`}
            style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)' }}
          />
          <defs>
            <radialGradient id="loop-glow">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={C} cy={C} r={R - 34} fill="none" stroke="var(--line)" strokeDasharray="2 6" className={s.loopSpin} />
          <circle cx={C} cy={C} r={R + 22} fill="none" stroke="var(--line)" strokeDasharray="1 9" className={s.loopSpinRev} />
          {!reduced && (
            <circle r="3" fill="#fff" opacity="0.9">
              <animateMotion dur="9s" repeatCount="indefinite" path={`M ${C} ${C - R} a ${R} ${R} 0 1 1 -0.01 0`} />
            </circle>
          )}
          <circle cx={pos(active).x} cy={pos(active).y} r="26" fill="url(#loop-glow)" style={{ transition: 'cx .6s, cy .6s' }} />
          {LOOP.map((l, i) => {
            const p = pos(i);
            const on = i === active;
            const past = i < active;
            return (
              <g key={l.k} style={{ cursor: 'pointer' }} onMouseEnter={() => { setPaused(true); setActive(i); }} onClick={() => setActive(i)}>
                <circle cx={p.x} cy={p.y} r={on ? 8 : 5} fill={on ? 'var(--accent)' : past ? 'var(--accent-dim)' : 'var(--bg)'} stroke={on || past ? 'var(--accent)' : 'var(--line-3)'} strokeWidth="1.5" style={{ transition: 'all .4s' }} />
              </g>
            );
          })}
          <text x={C} y={C - 10} textAnchor="middle" className={s.loopCenterK}>
            {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </text>
          <text x={C} y={C + 16} textAnchor="middle" className={s.loopCenterT}>
            {LOOP[active].k}
          </text>
        </svg>
      </div>
      <ol className={s.loopList}>
        {LOOP.map((l, i) => (
          <li
            key={l.k}
            className={cx(s.loopItem, i === active && s.loopItemOn)}
            onMouseEnter={() => {
              setPaused(true);
              setActive(i);
            }}
          >
            <span className={s.loopNum}>{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className={s.loopK}>{l.k}</span>
              <span className={s.loopD}>{l.d}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The six parts of the system                                         */
/* ------------------------------------------------------------------ */

export function PlaybookViz() {
  const [ref, on] = useInView<HTMLDivElement>(0.4);
  const rows = [
    ['Top-5 customer concentration', '38.4%', '< 25%', 'Fail', 'var(--red)'],
    ['Adj. EBITDA margin', '17.6%', '≥ 12%', 'Pass', 'var(--teal)'],
    ['Recurring service revenue', '31%', '≥ 25%', 'Pass', 'var(--teal)'],
    ['Price vs. guardrail', '6.9x', '≤ 6.5x', 'Watch', 'var(--amber)'],
  ];
  return (
    <div ref={ref} className={s.viz}>
      <div className={s.vizHead}>
        <span>Criterion</span>
        <span>Target</span>
        <span>Playbook</span>
        <span />
      </div>
      {rows.map(([l, v, r, res, c], i) => (
        <div key={l} className={cx(s.vizRow, s.vizRow4, on && s.vizRowOn)} style={{ transitionDelay: `${i * 0.08}s` }}>
          <span className={s.vizLabel}>{l}</span>
          <span className="tnum">{v}</span>
          <span className={cx(s.vizDim, 'tnum')}>{r}</span>
          <span className={s.status} style={{ color: c }}>
            {res}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DecisionViz() {
  const chain = [
    ['Evidence', 'QoE report, p.11'],
    ['Finding', 'Adj. EBITDA $0.42M below the CIM'],
    ['Risk', 'Price set on unsupported add-backs'],
    ['Decision', 'Re-price on the QoE figure · approved by CEO'],
    ['Action', 'LOI amendment sent to seller’s counsel'],
  ];
  const [ref, on] = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className={cx(s.viz, s.chain)}>
      {chain.map(([k, v], i) => (
        <div key={k} className={cx(s.chainRow, on && s.vizRowOn)} style={{ transitionDelay: `${i * 0.1}s` }}>
          <span className={s.chainK}>{k}</span>
          <span className={s.chainV}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function MemoryViz() {
  const rows = [
    ['Year-2 revenue', '$11.5M', '$12.1M', 'Exceeded', 'var(--teal)'],
    ['Year-2 EBITDA margin', '17%', '16.2%', 'Missed', 'var(--amber)'],
    ['Technician retention, Y1', '85%', '81%', 'Missed', 'var(--amber)'],
  ];
  const [ref, on] = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className={s.viz}>
      <div className={s.vizCaption}>Pinecrest Air · closed 2022</div>
      <div className={s.vizHead}>
        <span>Metric</span>
        <span>Predicted</span>
        <span>Actual</span>
        <span />
      </div>
      {rows.map(([m, p, a, v, c], i) => (
        <div key={m} className={cx(s.vizRow, s.vizRow4, on && s.vizRowOn)} style={{ transitionDelay: `${i * 0.08}s` }}>
          <span className={s.vizLabel}>{m}</span>
          <span className={cx(s.vizDim, 'tnum')}>{p}</span>
          <span className="tnum">{a}</span>
          <span className={s.status} style={{ color: c }}>
            {v}
          </span>
        </div>
      ))}
      <div className={cx(s.lesson, on && s.vizRowOn)} style={{ transitionDelay: '.3s' }}>
        <span className={s.lessonK}>Lesson → playbook</span>
        Align technician pay bands before Day 1, not after.
      </div>
    </div>
  );
}

export function ClaimsViz() {
  const rows = [
    ['FY2025 adjusted EBITDA of $3.62M', 'Contradicted', 'QoE supports $3.20M', 'var(--red)'],
    ['No customer above 12% of revenue', 'Partly true', 'Top 5 are 38.4%', 'var(--amber)'],
    ['Maintenance agreements are 31% of revenue', 'Verified', 'Customer file, FY2025', 'var(--teal)'],
    ['92% renewal rate on agreements', 'Unverified', 'Churn data requested', 'var(--muted)'],
  ];
  const [ref, on] = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className={s.viz}>
      <div className={s.vizHead} style={{ gridTemplateColumns: '1fr auto' }}>
        <span>Seller claim</span>
        <span>Against the evidence</span>
      </div>
      {rows.map(([claim, verdict, ev, c], i) => (
        <div key={claim} className={cx(s.claimRow, on && s.vizRowOn)} style={{ transitionDelay: `${i * 0.08}s` }}>
          <span className={s.vizLabel}>{claim}</span>
          <span className={s.claimRight}>
            <span className={s.status} style={{ color: c }}>
              {verdict}
            </span>
            <span className={s.vizDim}>{ev}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const QUEUE = [
  { k: 'Finding', t: 'Sales tax unfiled in two counties', m: 'Tax · cited: filings p.3' },
  { k: 'Decision', t: 'Re-price, or hold price with an earn-out?', m: '3 options · approver: CEO' },
  { k: 'Research', t: 'Competitor opened a branch in Round Rock', m: 'Commercial · public source' },
  { k: 'Playbook change', t: 'Escrow when top-5 concentration is above 30%', m: 'From 3 past acquisitions' },
];
export function ReviewQueue({ reduced }: { reduced: boolean }) {
  const [k, setK] = useState(0);
  const [accepting, setAccepting] = useState(false);
  useEffect(() => {
    if (reduced) return;
    let inner: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setAccepting(true);
      inner = setTimeout(() => {
        setAccepting(false);
        setK((x) => (x + 1) % QUEUE.length);
      }, 900);
    }, 3200);
    return () => {
      clearInterval(id);
      clearTimeout(inner);
    };
  }, [reduced]);
  return (
    <div className={cx(s.viz, s.queue)}>
      {QUEUE.map((q, i) => {
        const pos = (i - k + QUEUE.length) % QUEUE.length;
        const leaving = pos === 0 && accepting;
        const style: CSSProperties = {
          top: pos * 12,
          transform: leaving ? 'translateY(-8px)' : `scale(${1 - pos * 0.03})`,
          opacity: pos > 2 ? 0 : leaving ? 0 : 1 - pos * 0.32,
          zIndex: 10 - pos,
        };
        return (
          <div key={q.t} className={s.qCard} style={style}>
            <div className={s.qBody}>
              <div className={s.qKind}>{q.k}</div>
              <div className={s.qTitle}>{q.t}</div>
              <div className={s.qMeta}>{q.m}</div>
            </div>
            <div className={s.qBtns}>
              <span className={s.qBtn}>Edit</span>
              <span className={cx(s.qBtn, s.qAccept, pos === 0 && accepting && s.qAcceptOn)}>{pos === 0 && accepting ? <IconCheck size={13} /> : 'Accept'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SerialViz() {
  const steps = [
    ['Acquisition 1', 'Playbook v1', 'Industry template'],
    ['Acquisition 4', 'Playbook v2', '3 past deals in memory'],
    ['Acquisition 12', 'Playbook v4', '11 past deals, 19 lessons'],
  ];
  const [ref, on] = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className={cx(s.viz, s.serial)}>
      {steps.map(([a, v, m], i) => (
        <div key={a} className={cx(s.serialRow, on && s.vizRowOn)} style={{ transitionDelay: `${i * 0.12}s` }}>
          <span className={s.serialA}>{a}</span>
          <span className={s.serialBar}>
            <i style={{ width: on ? `${34 + i * 33}%` : 0, transitionDelay: `${0.2 + i * 0.12}s` }} />
          </span>
          <span className={s.serialV}>
            {v}
            <span className={s.vizDim}>{m}</span>
          </span>
        </div>
      ))}
      <div className={s.vizCaption} style={{ marginTop: 6 }}>
        Illustrative <IconArrowRight size={11} style={{ verticalAlign: -1 }} /> each acquisition adds to the playbook used for the next
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Restored v2 graphics                                                */
/* ------------------------------------------------------------------ */

export function DocScan() {
  return (
    <div className={cx(s.cardVisual, s.docVisual)}>
      <div className={s.page} style={{ left: 6 }}>
        {[90, 70, 84, 0, 62, 88, 54].map((w, i) => (
          <i key={i} className={i === 3 ? s.hl : undefined} style={{ width: i === 3 ? '76%' : `${w}%` }} />
        ))}
        <div className={s.scanLine} />
      </div>
      <div className={s.extract} style={{ left: 250 }}>
        <div className={s.extractRow} style={{ '--d': '0s' } as CSSProperties}>
          <span className={cx(s.label, s.lFact)}>Fact</span> Adj. EBITDA $3.20M <span className={s.cite}>QoE p.11</span>
        </div>
        <div className={s.extractRow} style={{ '--d': '0.25s' } as CSSProperties}>
          <span className={cx(s.label, s.lAI)}>AI interpretation</span> $420K of add-backs not supported
        </div>
        <div className={s.extractRow} style={{ '--d': '0.5s' } as CSSProperties}>
          <span className={cx(s.label, s.lMem)}>From prior deals</span> Seen in 2 past deals
        </div>
        <div className={s.extractRow} style={{ '--d': '0.75s' } as CSSProperties}>
          <span className={cx(s.label, s.lRec)}>Recommendation</span> Re-price on the QoE figure
        </div>
      </div>
    </div>
  );
}

export function Constellation() {
  // Deterministic scatter of 40 past deals; three resemble the live deal.
  const pts = useMemo(() => {
    let seed = 7;
    const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 40 }, () => ({ x: 12 + r() * 376, y: 12 + r() * 146, z: 1 + r() * 1.6 }));
  }, []);
  const now = { x: 200, y: 85 };
  const hot = [4, 17, 29];
  return (
    <div className={s.cardVisual}>
      <svg viewBox="0 0 400 170" className={s.constellation} preserveAspectRatio="xMidYMid meet">
        {hot.map((h) => (
          <line key={h} x1={now.x} y1={now.y} x2={pts[h].x} y2={pts[h].y} className={s.link} />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hot.includes(i) ? 3.4 : p.z} className={hot.includes(i) ? s.starHot : s.star} style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
        <circle cx={now.x} cy={now.y} r={5} className={s.starNow} />
        <circle cx={now.x} cy={now.y} r={12} fill="none" stroke="rgba(120,150,255,.5)">
          <animate attributeName="r" values="6;20;6" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

export function LoiTerms() {
  return (
    <div className={cx(s.cardVisual, s.terms)}>
      {[
        ['Enterprise value', 22.0, 'M'],
        ['Cash at close', 20.0, 'M'],
        ['Seller note', 2.0, 'M'],
        ['Exclusivity', 75, ' days'],
      ].map(([k, v, u]) => (
        <div key={k as string} className={s.term}>
          <div className={s.termK}>{k}</div>
          <div className={s.termV}>
            {u === 'M' ? '$' : ''}
            <Count to={v as number} />
            {u === 'M' ? '.0M' : u}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Documents → decisions flow                                          */
/* ------------------------------------------------------------------ */

const FLOW = [
  { k: 'Documents', d: 'CIM, QoE, contracts, customer files, tax filings', c: '#8d9bb7', I: IconFileText },
  { k: 'Findings', d: 'Source-backed facts with page-level citations', c: '#34d3b4', I: IconSearch },
  { k: 'Risks', d: 'What could go wrong, scored against your playbook', c: '#ffc457', I: IconShieldExclamation },
  { k: 'Decisions', d: 'Options drafted with prior-deal precedent', c: '#9b7bff', I: IconGavel },
  { k: 'Actions', d: 'Requests, SPA protections, integration tasks', c: '#5b84ff', I: IconChecklist },
];
export function Flow() {
  const W = 900;
  const xs = FLOW.map((_, i) => 90 + i * ((W - 180) / 4));
  const y = 80;
  return (
    <div className={s.flowWrap}>
      <svg viewBox={`0 0 ${W} 160`} className={s.flowSvg}>
        <defs>
          <linearGradient id="fl-g" x1="0" x2="1">
            <stop offset="0" stopColor="#8d9bb7" />
            <stop offset="0.5" stopColor="#9b7bff" />
            <stop offset="1" stopColor="#5b84ff" />
          </linearGradient>
          <filter id="fl-glow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <path d={`M${xs[0]} ${y} L${xs[4]} ${y}`} stroke="rgba(255,255,255,.08)" strokeWidth="2" />
        <path d={`M${xs[0]} ${y} L${xs[4]} ${y}`} stroke="url(#fl-g)" strokeWidth="2" className={s.flowDash} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} r="4" fill="#fff" filter="url(#fl-glow)">
            <animateMotion dur="4s" begin={`${i}s`} repeatCount="indefinite" path={`M${xs[0]} ${y} L${xs[4]} ${y}`} />
          </circle>
        ))}
        {FLOW.map((f, i) => (
          <g key={f.k} transform={`translate(${xs[i]} ${y})`}>
            <circle r="34" fill="#0a1122" stroke={f.c} strokeOpacity="0.55" />
            <circle r="34" fill="none" stroke={f.c} strokeOpacity="0.35">
              <animate attributeName="r" values="34;46;34" dur="3s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="3s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
            </circle>
            <foreignObject x="-12" y="-12" width="24" height="24">
              <f.I size={24} stroke={1.5} color={f.c} />
            </foreignObject>
          </g>
        ))}
      </svg>
      <div className={s.flowLegend}>
        {FLOW.map((f) => (
          <div key={f.k} className={s.flowStep}>
            <b>{f.k}</b>
            {f.d}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sign-in                                                             */
/* ------------------------------------------------------------------ */

/* Strategy: pipeline pre-screened against the playbook */
const PIPE: { n: string; m: string; r: 'Pass' | 'Watch' | 'Fail' }[] = [
  { n: 'Delta Fire & Safety', m: '$8.7M rev · Houston', r: 'Pass' },
  { n: 'Lone Star Comfort', m: '$12.4M rev · Dallas', r: 'Watch' },
  { n: 'Gulfway Electric', m: '$5.1M rev · Corpus Christi', r: 'Fail' },
];
const PIPE_COLS = ['Long list', 'Short list', 'NDA signed'];
export function PipelineViz({ reduced }: { reduced: boolean }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setK((x) => (x + 1) % 6), 1600);
    return () => clearInterval(id);
  }, [reduced]);
  // Card 0 advances through the columns; the others stay put.
  const colOf = (i: number) => (i === 0 ? Math.min(2, Math.floor(k / 2)) : i === 1 ? 1 : 0);
  const color = { Pass: '#34d3b4', Watch: '#ffc457', Fail: '#ff7a7a' };
  return (
    <div className={cx(s.cardVisual, s.pipe)}>
      {PIPE_COLS.map((c, ci) => (
        <div key={c} className={s.pipeCol}>
          <div className={s.pipeHead}>{c}</div>
          {PIPE.map((p, i) =>
            colOf(i) === ci ? (
              <div key={p.n} className={s.pipeCard}>
                <div className={s.pipeName}>{p.n}</div>
                <div className={s.pipeMeta}>{p.m}</div>
                <span className={s.pipeFit} style={{ color: color[p.r], borderColor: color[p.r] + '55' }}>
                  Pre-screen · {p.r}
                </span>
              </div>
            ) : null,
          )}
        </div>
      ))}
    </div>
  );
}

/* Integration: 100-day plan KPIs tracked against the thesis */
export function IntegrationViz() {
  const [ref, on] = useInView<HTMLDivElement>(0.4);
  const rings: [string, number, string][] = [
    ['Cost synergies', 81, '#34d3b4'],
    ['Revenue synergies', 46, '#9b7bff'],
    ['Key people retained', 100, '#d9b45f'],
  ];
  const C = 2 * Math.PI * 26;
  return (
    <div ref={ref} className={cx(s.cardVisual, s.rings)}>
      {rings.map(([l, v, c], i) => (
        <div key={l} className={s.ring}>
          <svg viewBox="0 0 64 64" width="76" height="76">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke={c}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={on ? C * (1 - v / 100) : C}
              transform="rotate(-90 32 32)"
              style={{ transition: `stroke-dashoffset 1.6s cubic-bezier(.2,.7,.2,1) ${i * 0.15}s` }}
            />
            <text x="32" y="36" textAnchor="middle" fill="#e9eef8" fontSize="13" fontWeight="600">
              {v}%
            </text>
          </svg>
          <div className={s.ringLabel}>{l}</div>
        </div>
      ))}
      <div className={s.dayCounter}>Day 46 of 100 · vs. plan</div>
    </div>
  );
}
