'use client';

import { IconCheck, IconChecklist, IconFileText, IconGavel, IconInbox, IconLayoutDashboard, IconSearch, IconShieldExclamation, IconSparkles } from '@tabler/icons-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { PHASES } from '@/lib/meta';
import { Count, cx, useInView } from './kit';
import s from './landing.module.css';

const DOCS = ['QoE report — Halvorsen & Pike.pdf', 'Customer revenue by account.xlsx', 'Brazos Valley ISD service contract.pdf', 'Sales & use tax filings 2022–25.pdf'];
const FINDINGS: { t: string; sev: 'Critical' | 'High' | 'Medium'; cite: string }[] = [
  { t: 'Adjusted EBITDA $3.20M vs. $3.62M in the CIM', sev: 'Critical', cite: 'QoE p.11' },
  { t: 'Top-5 customers are 38.4% of revenue', sev: 'High', cite: 'Customers!B4' },
  { t: 'Change-of-control consent required (BVISD)', sev: 'High', cite: 'Contract §14.2' },
  { t: 'Sales tax unfiled in two counties', sev: 'Medium', cite: 'Tax p.3' },
];
const BRIEF = 'The QoE cuts adjusted EBITDA by $0.42M. Recommend re-pricing on the QoE figure, a $150K specific escrow for sales tax, and the BVISD consent as a closing condition.';
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
  return (
    <div className={s.windowBody}>
      <aside className={s.side}>
        {[
          [IconLayoutDashboard, 'Overview', false, 0],
          [IconInbox, 'Review queue', true, Math.min(5, FINDINGS.filter((_, i) => t >= 22 + i * 13).length + (t >= 72 ? 1 : 0))],
          [IconSearch, 'Target intelligence', false, 0],
          [IconChecklist, 'Workstreams', false, 0],
          [IconShieldExclamation, 'Risk register', false, 0],
          [IconGavel, 'Decisions', false, 0],
          [IconFileText, 'Documents', false, 0],
        ].map(([Icon, label, active, n]) => {
          const I = Icon as typeof IconInbox;
          return (
            <div key={label as string} className={cx(s.sideItem, !!active && s.sideActive)}>
              <I size={15} stroke={1.6} />
              {label as string}
              {(n as number) > 0 && <span className={s.sideCount}>{n as number}</span>}
            </div>
          );
        })}
      </aside>
      <div className={s.main}>
        <div className={s.dealHead}>
          <div>
            <div className={s.dealName}>ABC Mechanical</div>
            <div className={s.dealMeta}>Project Bluebird · HVAC services · Austin, TX · Phase 4 of 8</div>
          </div>
          <span className={s.cite}>EV $22.0M</span>
        </div>
        <div className={s.phaseRail}>
          {PHASES.map((p, i) => (
            <span key={p.key} className={i < 3 ? s.done : i === 3 ? s.live : undefined} />
          ))}
        </div>
        <div className={s.briefing}>
          <div className={s.briefLabel}>
            <IconSparkles size={13} /> Atlas · recommendation
          </div>
          <div className={s.briefText}>
            {typed > 0 ? BRIEF.slice(0, typed) : <span style={{ color: '#5d6a85' }}>Reading the data room…</span>}
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
          <div className={s.railTitle}>Data room · Atlas reading</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {DOCS.map((d, i) => {
              const st = docState(i);
              return (
                <div key={d} className={cx(s.doc, st === 'reading' && s.docReading)}>
                  <IconFileText size={14} stroke={1.6} color="#8d9bb7" />
                  <span className={s.docName}>{d}</span>
                  <span className={cx(s.docState, st === 'done' && s.docDone)}>{st === 'done' ? <IconCheck size={13} /> : st === 'reading' ? 'reading' : 'queued'}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className={s.railTitle}>Playbook fit · Mechanical v3</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {[
              ['Customer concentration', 'Fail', '#ff7a7a', 92],
              ['Adj. EBITDA margin', 'Pass', '#34d3b4', 64],
              ['Recurring revenue', 'Watch', '#ffc457', 48],
              ['Licensed technicians', 'Pass', '#34d3b4', 78],
            ].map(([l, r, c, w]) => (
              <div key={l as string} className={s.fitRow}>
                <span>{l}</span>
                <span style={{ color: c as string, fontFamily: 'var(--mono)', fontSize: 10.5 }}>{r}</span>
                <div className={s.bar}>
                  <i style={{ width: fitOn ? `${w}%` : 0, background: c as string }} />
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
/* Bento visuals                                                       */
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

export function FitBars() {
  const [ref, on] = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className={cx(s.cardVisual, s.fitList)}>
      {[
        ['Customer concentration (top 5)', '38.4% · max 25%', '#ff7a7a', 90],
        ['Adj. EBITDA margin', '17.6% · min 12%', '#34d3b4', 70],
        ['Recurring maintenance revenue', '31% · target 35%', '#ffc457', 56],
        ['Founder dependency', 'High · watch', '#ffc457', 60],
      ].map(([l, v, c, w], i) => (
        <div key={l as string} className={s.fitRow}>
          <span>{l}</span>
          <span style={{ color: '#8d9bb7', fontFamily: 'var(--mono)', fontSize: 11 }}>{v}</span>
          <div className={s.bar}>
            <i style={{ width: on ? `${w}%` : 0, background: c as string, transitionDelay: `${i * 0.12}s` }} />
          </div>
        </div>
      ))}
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

export function Provenance() {
  return (
    <div className={s.cardVisual} style={{ minHeight: 0 }}>
      {[
        ['TTM revenue', '$18.2M', true],
        ['Adj. EBITDA (QoE)', '$3.20M', true],
        ['Maintenance renewal rate', '92%', false],
        ['Tenure of top accounts', '9 yrs', false],
      ].map(([k, v, ok]) => (
        <div key={k as string} className={s.metricRow}>
          <span style={{ color: '#c9d2e4' }}>{k}</span>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={s.metricVal}>{v}</span>
            <span className={ok ? s.badgeOk : s.badgeWarn}>{ok ? 'Verified' : 'Seller-stated'}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const QUEUE = [
  { k: 'Risk', t: 'Customer concentration above playbook limit', m: 'From 2 findings · Medium confidence' },
  { k: 'Decision', t: 'Re-price, or hold the price with an earn-out?', m: '3 options · approver: CEO' },
  { k: 'Request', t: 'Ask seller for 2022–25 county tax filings', m: 'Tax workstream · due in 5 days' },
  { k: 'Action', t: 'Make BVISD consent a closing condition', m: 'Legal · drafted for counsel' },
];
export function ReviewQueue({ reduced }: { reduced: boolean }) {
  const [k, setK] = useState(0);
  const [accepting, setAccepting] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setAccepting(true);
      setTimeout(() => {
        setAccepting(false);
        setK((x) => (x + 1) % QUEUE.length);
      }, 900);
    }, 3000);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <div className={cx(s.cardVisual, s.queue)}>
      {QUEUE.map((q, i) => {
        const pos = (i - k + QUEUE.length) % QUEUE.length;
        const leaving = pos === 0 && accepting;
        const style: CSSProperties = {
          top: pos * 14,
          transform: leaving ? 'translateX(110%) rotate(4deg)' : `scale(${1 - pos * 0.04})`,
          opacity: pos > 2 ? 0 : leaving ? 0 : 1 - pos * 0.28,
          zIndex: 10 - pos,
        };
        return (
          <div key={q.t} className={s.qCard} style={style}>
            <span className={cx(s.label, q.k === 'Risk' ? s.lAI : q.k === 'Decision' ? s.lMem : q.k === 'Request' ? s.lRec : s.lFact)}>{q.k}</span>
            <div className={s.qBody}>
              <div className={s.qTitle}>{q.t}</div>
              <div className={s.qMeta}>{q.m}</div>
            </div>
            <div className={s.qBtns}>
              <span className={s.qBtn}>Edit</span>
              <span className={s.qBtn}>Dismiss</span>
              <span className={cx(s.qBtn, s.qAccept, pos === 0 && accepting && s.qAcceptOn)}>Accept</span>
            </div>
          </div>
        );
      })}
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
