'use client';

import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrain,
  IconCheck,
  IconChecklist,
  IconFileText,
  IconGavel,
  IconInbox,
  IconLayoutDashboard,
  IconLock,
  IconSearch,
  IconShieldExclamation,
  IconSparkles,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ORGS, PLAYBOOKS } from '@/data/playbooks';
import { PEOPLE } from '@/data/people';
import { PHASES } from '@/lib/meta';
import { ruleText } from '@/lib/playbook';
import { useStore } from '@/lib/store';
import s from './landing.module.css';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');
const AVATAR: Record<string, string> = { teal: '#0ca678', indigo: '#4c6ef5', dark: '#495057', cyan: '#1098ad', grape: '#ae3ec9', orange: '#f76707', pink: '#d6336c', lime: '#74b816', red: '#e03131', blue: '#1c7ed6', violet: '#7048e8', yellow: '#f59f00' };

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setR(!!m?.matches);
  }, []);
  return r;
}

/** Fires once when the element scrolls into view. */
function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, set] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      set(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          set(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function Reveal({ children, delay = 0, className, as: Tag = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);
  return (
    <Tag ref={ref} className={cx(s.reveal, inView && s.in, className)} style={{ '--d': `${delay}s` } as CSSProperties}>
      {children}
    </Tag>
  );
}

function Count({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1600);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  );
}

export function AtlasMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="am-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9b7bff" />
          <stop offset="0.55" stopColor="#5b84ff" />
          <stop offset="1" stopColor="#d9b45f" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#0d1428" stroke="url(#am-g)" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="url(#am-g)" strokeWidth="1.6" />
      <ellipse cx="16" cy="16" rx="3.6" ry="8.5" fill="none" stroke="url(#am-g)" strokeWidth="1.3" />
      <path d="M7.8 13.2h16.4M7.8 18.8h16.4" stroke="url(#am-g)" strokeWidth="1.1" opacity="0.8" />
      <circle cx="23.6" cy="9" r="2" fill="#d9b45f" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Hero product preview: a looping, deterministic Atlas run            */
/* ------------------------------------------------------------------ */

const DOCS = ['QoE report — Halvorsen & Pike.pdf', 'Customer revenue by account.xlsx', 'Brazos Valley ISD service contract.pdf', 'Sales & use tax filings 2022–25.pdf'];
const FINDINGS: { t: string; sev: 'Critical' | 'High' | 'Medium'; cite: string }[] = [
  { t: 'Adjusted EBITDA $3.20M vs. $3.62M in the CIM', sev: 'Critical', cite: 'QoE p.11' },
  { t: 'Top-5 customers are 38.4% of revenue', sev: 'High', cite: 'Customers!B4' },
  { t: 'Change-of-control consent required (BVISD)', sev: 'High', cite: 'Contract §14.2' },
  { t: 'Sales tax unfiled in two counties', sev: 'Medium', cite: 'Tax p.3' },
];
const BRIEF = 'The QoE cuts adjusted EBITDA by $0.42M. Recommend re-pricing on the QoE figure, a $150K specific escrow for sales tax, and the BVISD consent as a closing condition.';
const CYCLE = 190;

function ProductPreview({ reduced }: { reduced: boolean }) {
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

function DocScan() {
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

function FitBars() {
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

function Constellation() {
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

function Provenance() {
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
function ReviewQueue({ reduced }: { reduced: boolean }) {
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

function LoiTerms() {
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
function Flow() {
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

const STEPS = ['Verifying identity', 'Applying tenant isolation', 'Loading playbook and deal memory', 'Preparing your Atlas briefing'];

function SignIn({ onClose, onDone }: { onClose: () => void; onDone: (orgId: string, userId: string) => void }) {
  const [orgId, setOrgId] = useState(ORGS[0].id);
  const ROLES = ['Corp Dev', 'CFO', 'Integration Lead', 'CEO'];
  const people = ROLES.map((r) => PEOPLE.find((p) => p.orgId === orgId && p.org === 'Internal' && p.function === r)).filter((p): p is (typeof PEOPLE)[number] => !!p);
  const [userId, setUserId] = useState(people[0].id);
  const me = PEOPLE.find((p) => p.id === userId) ?? people[0];
  const domain = orgId === 'org-halcyon' ? 'halcyonhealth.com' : 'meridianfs.com';
  const email = `${me.name.replace(/^Dr\. /, '').split(' ')[0].toLowerCase()}@${domain}`;
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && step < 0 && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose, step]);

  const go = () => {
    setStep(0);
    STEPS.forEach((_, i) => setTimeout(() => setStep(i + 1), 520 * (i + 1)));
    setTimeout(() => onDone(orgId, me.id), 520 * STEPS.length + 380);
  };

  return (
    <div className={s.overlay} onMouseDown={(e) => e.target === e.currentTarget && step < 0 && onClose()} role="dialog" aria-modal aria-label="Sign in">
      <div className={s.modal}>
        <div className={s.modalGlow} />
        {step < 0 && (
          <button className={s.close} onClick={onClose} aria-label="Close">
            <IconX size={16} />
          </button>
        )}
        <AtlasMark size={36} />
        {step < 0 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
          >
            <div className={s.modalTitle}>Sign in to Atlas</div>
            <div className={s.modalSub}>Demo environment with synthetic data. Pick a workspace and a persona; no password needed.</div>

            <span className={s.fieldLabel}>Workspace</span>
            <div className={s.orgs}>
              {ORGS.map((o) => (
                <button
                  type="button"
                  key={o.id}
                  className={cx(s.orgBtn, o.id === orgId && s.orgOn)}
                  onClick={() => {
                    setOrgId(o.id);
                    setUserId(PEOPLE.find((p) => p.orgId === o.id && p.org === 'Internal')!.id);
                  }}
                >
                  <div className={s.orgName}>{o.name}</div>
                  <div className={s.orgVert}>{o.vertical}</div>
                </button>
              ))}
            </div>

            <span className={s.fieldLabel}>Sign in as</span>
            <div className={s.personas}>
              {people.map((p) => (
                <button type="button" key={p.id} className={cx(s.persona, p.id === me.id && s.personaOn)} onClick={() => setUserId(p.id)}>
                  <span className={s.avatar} style={{ background: AVATAR[p.color] ?? '#4c6ef5' }}>
                    {p.initials}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <div className={s.personaName}>{p.name}</div>
                    <div className={s.personaRole}>{p.title}</div>
                  </span>
                  {p.id === me.id && <IconCheck size={16} color="#8fb0ff" />}
                </button>
              ))}
            </div>

            <label className={s.fieldLabel} htmlFor="atlas-email">
              Work email
            </label>
            <input id="atlas-email" className={s.input} value={email} readOnly />

            <button type="submit" className={cx(s.btn, s.btnPrimary, s.btnLg, s.full)} style={{ marginTop: 20 }}>
              Continue <IconArrowRight size={16} className={s.btnArrow} />
            </button>
            <div className={s.divider}>or</div>
            <button type="submit" className={cx(s.btn, s.btnGhost, s.full)}>
              <IconLock size={15} /> Continue with SSO
            </button>
            <div className={s.fine}>Prototype for expert validation. Nothing you do here leaves your browser.</div>
          </form>
        ) : (
          <div>
            <div className={s.modalTitle}>Welcome, {me.name.replace(/^Dr\. /, '').split(' ')[0]}</div>
            <div className={s.modalSub}>Opening the {ORGS.find((o) => o.id === orgId)?.name} workspace.</div>
            <div className={s.steps}>
              {STEPS.map((label, i) => {
                const done = step > i;
                const active = step === i;
                return (
                  <div key={label} className={cx(s.stepRow, (done || active) && s.stepOn)}>
                    <span className={s.stepIcon} style={done ? { background: '#34d3b4', borderColor: '#34d3b4' } : undefined}>
                      {done ? <IconCheck size={14} color="#04261f" /> : active ? <span className={s.spinner} /> : null}
                    </span>
                    {label}
                  </div>
                );
              })}
            </div>
            <div className={s.progress}>
              <i style={{ width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const TICKER = [
  ['Atlas read', 'QoE report · 64 pages', '11 facts cited'],
  ['Flagged', 'change-of-control clause', 'Contract §14.2'],
  ['Matched', '3 similar past deals', 'from 40 in memory'],
  ['Drafted', 'IC memo', 'every number linked to a source'],
  ['Checked', 'seller claim “Adj. EBITDA $3.62M”', 'contradicted by the QoE'],
  ['Proposed', 'NWC peg $2.05–2.20M', 'from the QoE'],
  ['Mapped', 'finding → SPA protection', 'specific indemnity + escrow'],
  ['Generated', '100-day plan', 'KPIs from the playbook'],
];

const HEADLINE = ['Every', 'acquisition', 'makes', 'the', 'next', 'one'];

export function Landing() {
  const reduced = useReducedMotion();
  const signedIn = useStore((x) => x.signedIn);
  const signIn = useStore((x) => x.signIn);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pb, setPb] = useState(PLAYBOOKS[0].id);
  const windowRef = useRef<HTMLDivElement>(null);
  const tilt = useRef({ rx: 14, ry: 0 });

  const applyTilt = useCallback(() => {
    const el = windowRef.current;
    if (!el) return;
    el.style.setProperty('--rx', `${tilt.current.rx}deg`);
    el.style.setProperty('--ry', `${tilt.current.ry}deg`);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      // The preview flattens as you scroll into it.
      tilt.current.rx = Math.max(0, 14 - window.scrollY / 28);
      applyTilt();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [applyTilt]);

  const enter = () => {
    if (signedIn) router.push('/');
    else setOpen(true);
  };
  const done = (orgId: string, userId: string) => {
    signIn(orgId, userId);
    if (pathname === '/welcome') router.push('/');
    window.scrollTo(0, 0);
  };
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };
  const playbook = PLAYBOOKS.find((p) => p.id === pb)!;

  return (
    <div className={s.root}>
      <div className={s.aurora} aria-hidden>
        <div className={s.blob} />
        <div className={s.blob} />
        <div className={s.blob} />
      </div>
      <div className={s.grid} aria-hidden />
      <div className={s.noise} aria-hidden />

      {/* Nav */}
      <header className={cx(s.nav, scrolled && s.navScrolled)}>
        <div className={cx(s.container, s.navInner)}>
          <button className={s.brand} onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}>
            <AtlasMark />
            Atlas
            <span className={s.brandSub}>Acquisition intelligence</span>
          </button>
          <nav className={s.navLinks}>
            <a href="#how" onClick={scrollTo('how')}>
              How it works
            </a>
            <a href="#product" onClick={scrollTo('product')}>
              Product
            </a>
            <a href="#process" onClick={scrollTo('process')}>
              Process
            </a>
            <a href="#playbooks" onClick={scrollTo('playbooks')}>
              Playbooks
            </a>
          </nav>
          <div className={s.navCtas}>
            <button className={cx(s.btn, s.btnGhost, s.hideSm)} onClick={enter}>
              {signedIn ? 'Open workspace' : 'Sign in'}
            </button>
            <button className={cx(s.btn, s.btnPrimary)} onClick={enter}>
              Enter demo <IconArrowRight size={15} className={s.btnArrow} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className={s.hero}
        onMouseMove={(e) => {
          if (reduced) return;
          const r = e.currentTarget.getBoundingClientRect();
          tilt.current.ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
          applyTilt();
        }}
        onMouseLeave={() => {
          tilt.current.ry = 0;
          applyTilt();
        }}
      >
        <div className={s.container}>
          <button className={cx(s.announce, s.fadeUp)} onClick={enter}>
            <span className={s.announceTag}>New</span>
            Structured LOI terms and deal protections, drafted by Atlas
            <IconArrowUpRight size={14} />
          </button>
          <h1 className={s.h1}>
            {HEADLINE.map((w, i) => (
              <Fragment key={i}>
                <span className={cx(s.word, s.grad)} style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                  {w}
                </span>{' '}
              </Fragment>
            ))}
            <span className={s.word} style={{ animationDelay: `${0.1 + HEADLINE.length * 0.07}s` }}>
              <span className={s.serif}>smarter.</span>
            </span>
          </h1>
          <p className={cx(s.lede, s.fadeUp)} style={{ animationDelay: '0.7s' }}>
            Atlas is the AI deal workspace for serial acquirers. It reads the data room, scores the target against your playbook, recalls what happened in your past deals, and drafts the risks, decisions and documents. Your team reviews and decides.
          </p>
          <div className={cx(s.heroCtas, s.fadeUp)} style={{ animationDelay: '0.85s' }}>
            <button className={cx(s.btn, s.btnPrimary, s.btnLg, s.sheen)} onClick={enter}>
              Enter the live demo <IconArrowRight size={17} className={s.btnArrow} />
            </button>
            <a className={cx(s.btn, s.btnGhost, s.btnLg)} href="#how" onClick={scrollTo('how')}>
              See how it works
            </a>
          </div>
          <div className={cx(s.heroNote, s.fadeUp)} style={{ animationDelay: '1s' }}>
            Clickable prototype · synthetic data · no setup
          </div>

          <div className={s.stage}>
            <div className={s.stageGlow} />
            <div className={cx(s.float, s.floatA)}>
              <span className={s.pulseDot} /> Atlas proposed 5 items for review
            </div>
            <div className={cx(s.float, s.floatB)}>
              <span className={cx(s.label, s.lMem)}>Memory</span> Seen in 2 past deals
            </div>
            <div className={s.window} ref={windowRef}>
              <div className={s.windowBar}>
                <div className={s.dots}>
                  <i />
                  <i />
                  <i />
                </div>
                <div className={s.url}>
                  <IconLock size={11} /> atlas.app/acquisitions/abc-mechanical
                </div>
                <div style={{ width: 46 }} />
              </div>
              <ProductPreview reduced={reduced} />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className={s.marquee} aria-hidden>
        <div className={s.marqueeTrack}>
          {[...TICKER, ...TICKER].map(([a, b, c], i) => (
            <div key={i} className={s.marqueeItem}>
              <IconSparkles size={14} color="#9b7bff" />
              {a} <b>{b}</b> · {c}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className={s.section} id="how">
        <div className={cx(s.container, s.center)}>
          <Reveal>
            <span className={s.eyebrow}>How it works</span>
            <h2 className={s.h2}>
              From the data room to a <span className={s.serif}>decision</span>, with every step cited.
            </h2>
            <p className={s.sub}>Language models read; code computes. Every statement is labelled as a fact, an AI interpretation, a recommendation or a human decision, and links back to the page it came from.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <Flow />
          </Reveal>
        </div>
      </section>

      {/* Bento */}
      <section className={s.section} id="product">
        <div className={s.container}>
          <Reveal>
            <span className={s.eyebrow}>The product</span>
            <h2 className={s.h2}>
              A deal team that never forgets, <span className={s.serif}>and never gets tired.</span>
            </h2>
          </Reveal>
          <div
            className={s.bento}
            onMouseMove={(e) => {
              const card = (e.target as HTMLElement).closest<HTMLElement>(`.${s.card}`);
              if (!card) return;
              const r = card.getBoundingClientRect();
              card.style.setProperty('--mx', `${e.clientX - r.left}px`);
              card.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
          >
            <Reveal className={cx(s.card, s.span2)}>
              <DocScan />
              <div className={s.cardTitle}>Reads the data room, so your team doesn’t have to</div>
              <div className={s.cardText}>CIMs, QoE reports, contracts and customer files become findings with page-level citations, checked against seller claims and your past deals.</div>
            </Reveal>
            <Reveal className={s.card} delay={0.08}>
              <FitBars />
              <div className={s.cardTitle}>Scored against your playbook</div>
              <div className={s.cardText}>Your criteria, your guardrails. Deterministic scoring, not a black-box “deal score”.</div>
            </Reveal>
            <Reveal className={s.card}>
              <Constellation />
              <div className={s.cardTitle}>Institutional memory</div>
              <div className={s.cardText}>Backfill your past deals once. Atlas surfaces the ones that resemble today’s target and what went wrong.</div>
            </Reveal>
            <Reveal className={cx(s.card, s.span2)} delay={0.08}>
              <ReviewQueue reduced={reduced} />
              <div className={s.cardTitle}>Atlas proposes. Your team decides.</div>
              <div className={s.cardText}>Risks, decisions, information requests and actions arrive as proposals with their reasoning. Accept, edit or dismiss; nothing becomes a record without a person.</div>
            </Reveal>
            <Reveal className={s.card}>
              <Provenance />
              <div className={s.cardTitle}>Verified vs. seller-stated</div>
              <div className={s.cardText}>Every metric shows whether an advisor or source system backs it, or only the seller does.</div>
            </Reveal>
            <Reveal className={cx(s.card, s.span2)} delay={0.08}>
              <LoiTerms />
              <div className={s.cardTitle}>Structured terms, drafted from evidence</div>
              <div className={s.cardText}>LOI terms, deal protections and the funds flow are drafted from the findings and your playbook, with the reasoning behind every number. One click generates the letter.</div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className={s.section} id="process">
        <div className={cx(s.container, s.center)}>
          <Reveal>
            <span className={s.eyebrow}>The whole deal</span>
            <h2 className={s.h2}>
              Eight phases, <span className={s.serif}>one workspace.</span>
            </h2>
            <p className={s.sub}>From the target list to the 100-day plan. Each phase has its key deliverables, live status and an obvious next step. Phases can overlap, as they do in real deals.</p>
          </Reveal>
          <Reveal>
            <div className={s.phases}>
              <div className={s.phaseLine}>
                <i />
              </div>
              {PHASES.map((p, i) => (
                <div key={p.key} className={s.phase} style={{ '--i': i } as CSSProperties}>
                  <div className={s.phaseNum}>{String(p.n).padStart(2, '0')}</div>
                  <div className={s.phaseName}>{p.short === 'Integration' ? 'Integration (PMI)' : p.label}</div>
                  <div className={s.phaseDel}>{p.deliverables.slice(0, 2).map((d) => d.label).join(' · ')}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Boundary */}
      <section className={s.section}>
        <div className={s.container}>
          <Reveal>
            <span className={s.eyebrow}>The boundary</span>
            <h2 className={s.h2}>
              AI does the reading. <span className={s.serif}>People do the judging.</span>
            </h2>
          </Reveal>
          <div className={s.split}>
            <Reveal className={cx(s.col, s.colAtlas)}>
              <div className={s.colHead}>
                <span className={s.colIcon} style={{ background: 'rgba(155,123,255,.18)' }}>
                  <IconBrain size={20} color="#cfc1ff" />
                </span>
                Atlas
              </div>
              <ul className={s.colList}>
                {['Reads every document and extracts metrics with citations', 'Checks seller claims against the evidence', 'Scores the target against your playbook', 'Finds similar past deals and their lessons', 'Drafts risks, decisions, requests, Q&A and deliverables', 'Keeps the deal record, audit trail and memory current'].map((x) => (
                  <li key={x}>
                    <IconSparkles size={15} color="#b9a4ff" />
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className={s.col} delay={0.1}>
              <div className={s.colHead}>
                <span className={s.colIcon} style={{ background: 'rgba(52,211,180,.14)' }}>
                  <IconUserCheck size={20} color="#8eeeda" />
                </span>
                Your deal team
              </div>
              <ul className={s.colList}>
                {['Sets the thesis and the playbook guardrails', 'Accepts, edits or dismisses every proposal', 'Owns the price, the structure and the walk-away', 'Approves decisions at each gate', 'Negotiates with the seller, advisors and lenders', 'Decides what the next deal should learn'].map((x) => (
                  <li key={x}>
                    <IconCheck size={15} color="#34d3b4" />
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal>
            <div className={s.stats}>
              {[
                [8, '', 'deal phases, from target screening to post-merger integration'],
                [40, '', 'past acquisitions backfilled into the demo memory'],
                [PLAYBOOKS.length, '', 'industry playbooks: field services, healthcare, software'],
                [100, '%', 'of AI statements labelled and linked to a source'],
              ].map(([n, suf, l]) => (
                <div key={l as string} className={s.stat}>
                  <div className={s.statNum}>
                    <Count to={n as number} suffix={suf as string} />
                  </div>
                  <div className={s.statLabel}>{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Playbooks */}
      <section className={s.section} id="playbooks">
        <div className={s.container}>
          <Reveal>
            <span className={s.eyebrow}>Playbooks</span>
            <h2 className={s.h2}>
              One engine. <span className={s.serif}>Your playbook.</span>
            </h2>
            <p className={s.sub}>The same intelligence runs an HVAC roll-up, a specialty-healthcare platform or a software buy-and-build. Criteria, workstreams, request lists and decision gates come from the playbook.</p>
          </Reveal>
          <Reveal>
            <div className={s.tabs} role="tablist">
              {PLAYBOOKS.map((p) => (
                <button key={p.id} role="tab" aria-selected={p.id === pb} className={cx(s.tab, p.id === pb && s.tabOn)} onClick={() => setPb(p.id)}>
                  {p.name}
                </button>
              ))}
            </div>
            <div className={s.pb} key={pb}>
              <div className={s.col}>
                <div className={s.railTitle}>
                  Screening criteria · {playbook.version} · {playbook.status}
                </div>
                <ul className={s.pbList} style={{ marginTop: 10 }}>
                  {playbook.criteria.slice(0, 6).map((c) => (
                    <li key={c.key}>
                      <span>{c.label}</span>
                      <span>{ruleText(c)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={s.col}>
                <div className={s.railTitle}>Diligence workstreams</div>
                <div className={s.chips}>
                  {playbook.workstreams.map((w) => (
                    <span key={w.key} className={s.chip}>
                      {w.label}
                    </span>
                  ))}
                </div>
                <div className={s.railTitle} style={{ marginTop: 24 }}>
                  Decision gates
                </div>
                <div className={s.chips}>
                  {playbook.decisionGates.slice(0, 5).map((g) => (
                    <span key={g} className={s.chip}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Final CTA */}
          <Reveal>
            <div className={s.cta}>
              <div className={s.orb} aria-hidden />
              <div style={{ position: 'relative' }}>
                <span className={s.eyebrow}>Try it</span>
                <h2 className={s.h2} style={{ margin: '18px auto 0' }}>
                  Walk a live deal <span className={s.serif}>end to end.</span>
                </h2>
                <p className={s.sub} style={{ margin: '18px auto 0' }}>
                  Sign in as the VP Corp Dev, the CFO or the integration lead. Review Atlas’s proposals on ABC Mechanical, or start a new acquisition and watch Atlas analyse it.
                </p>
                <div className={s.heroCtas}>
                  <button className={cx(s.btn, s.btnPrimary, s.btnLg, s.sheen)} onClick={enter}>
                    Enter the live demo <IconArrowRight size={17} className={s.btnArrow} />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={cx(s.container, s.footerInner)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AtlasMark size={22} /> Atlas · Acquisition intelligence for serial acquirers
          </span>
          <span>Prototype for expert validation. All companies, people and figures are synthetic.</span>
        </div>
      </footer>

      {open && <SignIn onClose={() => setOpen(false)} onDone={done} />}
    </div>
  );
}
