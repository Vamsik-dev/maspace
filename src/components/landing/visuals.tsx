'use client';

import { IconArrowRight, IconCheck, IconChecklist, IconFileText, IconGavel, IconInbox, IconLayoutDashboard, IconSearch, IconShieldExclamation } from '@tabler/icons-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { PHASES } from '@/lib/meta';
import { cx, useInView } from './kit';
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
