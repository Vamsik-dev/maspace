'use client';

import '@fontsource-variable/mona-sans/standard.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/dm-mono/latin-400.css';
import '@fontsource/dm-mono/latin-500.css';
import { IconArrowRight, IconArrowUpRight, IconBrain, IconCheck, IconLock, IconMinus, IconPlus, IconSparkles, IconUserCheck } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { PLAYBOOKS } from '@/data/playbooks';
import { PHASES } from '@/lib/meta';
import { ruleText } from '@/lib/playbook';
import { useStore } from '@/lib/store';
import { BENCHMARKS, COMPARE, COMPARE_COLS, FAQ, PILLARS, PROBLEM, SEGMENTS, SOURCES, TIERS, TRUST, type Mark } from './data';
import { AtlasMark, Count, cx, Reveal, useReducedMotion } from './kit';
import { SignIn } from './SignIn';
import { Constellation, DocScan, FitBars, Flow, IntegrationViz, LoiTerms, PipelineViz, ProductPreview, Provenance, ReviewQueue } from './visuals';
import s from './landing.module.css';

export { AtlasMark };

const TICKER = [
  ['Pre-screened', '14 new targets', 'against Mechanical v3'],
  ['Read', 'QoE report · 64 pages', '11 facts cited'],
  ['Checked', 'seller claim “Adj. EBITDA $3.62M”', 'contradicted by the QoE'],
  ['Matched', '2 similar past deals', 'and what went wrong'],
  ['Proposed', 'NWC peg $2.05–2.20M', 'from the QoE'],
  ['Mapped', 'sales-tax finding', 'to a specific indemnity and escrow'],
  ['Drafted', 'IC memo', 'every number linked to a source'],
  ['Tracked', 'cost synergies at day 46', '81% of plan'],
];

const HEADLINE = ['Every', 'acquisition', 'makes', 'the', 'next', 'one'];

function Ref({ n }: { n: number }) {
  return (
    <a href={`#src-${n}`} className={s.ref} onClick={(e) => {
      e.preventDefault();
      document.getElementById(`src-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }}>
      {n}
    </a>
  );
}

function SectionHead({ n, eyebrow, title, accent, sub, center }: { n: string; eyebrow: string; title: ReactNode; accent?: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <Reveal className={center ? s.center : undefined}>
      <span className={s.eyebrow}>
        <span className={s.eyebrowNum}>{n}</span>
        {eyebrow}
      </span>
      <h2 className={s.h2}>
        {title} {accent && <span className={s.serif}>{accent}</span>}
      </h2>
      {sub && <p className={s.sub}>{sub}</p>}
    </Reveal>
  );
}

/* ---------------- ROI estimator ---------------- */

function Slider({ label, value, min, max, step, onChange, fmt, hint }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt: (v: number) => string; hint?: ReactNode }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className={s.slider}>
      <span className={s.sliderTop}>
        <span>{label}</span>
        <b className="tnum">{fmt(value)}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ '--p': `${pct}%` } as CSSProperties} />
      {hint && <span className={s.sliderHint}>{hint}</span>}
    </label>
  );
}

const usd = (v: number) => '$' + Math.round(v).toLocaleString('en-US');

function Estimator() {
  const [deals, setDeals] = useState(4);
  const [hours, setHours] = useState(600);
  const [rate, setRate] = useState(150);
  const [pct, setPct] = useState(20);
  const [tier, setTier] = useState<'Deal' | 'Platform'>('Platform');
  const saved = deals * hours * (pct / 100);
  const value = saved * rate;
  const t = TIERS.find((x) => x.name === tier)!;
  const cost = (t.annual ?? 0) * 12;
  const net = value - cost;
  const payback = value > 0 ? cost / (value / 12) : Infinity;
  return (
    <div className={s.estimator}>
      <div className={s.estInputs}>
        <div className={s.estTitle}>Your numbers</div>
        <Slider label="Acquisitions taken through diligence per year" value={deals} min={1} max={20} step={1} onChange={setDeals} fmt={(v) => String(v)} />
        <Slider label="Internal hours per acquisition (deal team, finance, legal, ops)" value={hours} min={100} max={2000} step={50} onChange={setHours} fmt={(v) => v.toLocaleString('en-US')} />
        <Slider label="Fully loaded cost per hour" value={rate} min={50} max={400} step={10} onChange={setRate} fmt={usd} />
        <Slider
          label="Share of that time Atlas returns"
          value={pct}
          min={0}
          max={50}
          step={1}
          onChange={setPct}
          fmt={(v) => `${v}%`}
          hint={
            <>
              Default 20%: the average M&A cost reduction reported by gen-AI users<Ref n={4} />. Set your own.
            </>
          }
        />
        <div className={s.estTiers}>
          {(['Deal', 'Platform'] as const).map((n) => (
            <button key={n} className={cx(s.estTier, tier === n && s.estTierOn)} onClick={() => setTier(n)}>
              {n} plan
            </button>
          ))}
        </div>
      </div>
      <div className={s.estOut}>
        <div className={s.estBig}>
          <div className={s.estK}>Team hours returned per year</div>
          <div className={cx(s.estV, 'tnum')}>{Math.round(saved).toLocaleString('en-US')}</div>
        </div>
        <div className={s.estRow}>
          <span>Value of that time</span>
          <b className="tnum">{usd(value)}</b>
        </div>
        <div className={s.estRow}>
          <span>Atlas {tier} plan, billed annually</span>
          <b className="tnum">−{usd(cost)}</b>
        </div>
        <div className={cx(s.estRow, s.estNet)}>
          <span>Net, before any deal-value upside</span>
          <b className="tnum" style={{ color: net >= 0 ? '#5ee0c2' : '#ff9b9b' }}>
            {net < 0 ? '−' : ''}
            {usd(Math.abs(net))}
          </b>
        </div>
        <div className={s.estRow}>
          <span>Payback</span>
          <b className="tnum">{Number.isFinite(payback) ? `${payback.toFixed(1)} months` : '—'}</b>
        </div>
        <p className={s.estNote}>
          Formula: acquisitions × hours × share returned × hourly cost, minus the plan price. It deliberately leaves out the upside that usually matters more: a better price from findings caught before signing, deals you walk away from, and synergies captured sooner.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Pricing ---------------- */

function Pricing({ onStart }: { onStart: () => void }) {
  const [annual, setAnnual] = useState(true);
  return (
    <>
      <Reveal className={s.center}>
        <div className={s.billing} role="radiogroup" aria-label="Billing period">
          <button role="radio" aria-checked={!annual} className={cx(s.billOpt, !annual && s.billOn)} onClick={() => setAnnual(false)}>
            Monthly
          </button>
          <button role="radio" aria-checked={annual} className={cx(s.billOpt, annual && s.billOn)} onClick={() => setAnnual(true)}>
            Annual <span className={s.save}>save up to 20%</span>
          </button>
        </div>
      </Reveal>
      <div className={s.tiers}>
        {TIERS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08} className={cx(s.tier, t.popular && s.tierPopular)}>
            {t.popular && <span className={s.popular}>Built for serial acquirers</span>}
            <div className={s.tierName}>{t.name}</div>
            <div className={s.tierFor}>{t.for}</div>
            <div className={s.price}>
              {t.monthly ? (
                <>
                  <span className={cx(s.priceV, 'tnum')}>${(annual ? t.annual! : t.monthly).toLocaleString('en-US')}</span>
                  <span className={s.priceU}>
                    per month
                    <br />
                    {annual ? 'billed annually' : 'billed monthly'}
                  </span>
                </>
              ) : (
                <>
                  <span className={s.priceV}>Custom</span>
                  <span className={s.priceU}>
                    annual agreement
                    <br />
                    paid pilot available
                  </span>
                </>
              )}
            </div>
            <button className={cx(s.btn, t.popular ? s.btnPrimary : s.btnGhost, s.full)} onClick={onStart}>
              {t.cta} <IconArrowRight size={15} className={s.btnArrow} />
            </button>
            <ul className={s.tierList}>
              {t.features.map((f) => (
                <li key={f}>
                  <IconCheck size={15} />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className={s.pricingNote}>
          <span>No success fees</span>
          <span>No per-page or per-document fees</span>
          <span>Advisors and sellers join as free guests</span>
          <span>Indicative pricing, shared for validation</span>
        </div>
      </Reveal>
    </>
  );
}

/* ---------------- Compare ---------------- */

function MarkIcon({ m, ours }: { m: Mark; ours?: boolean }) {
  if (m === 2) return <span className={cx(s.mFull, ours && s.mOurs)} aria-label="Yes" />;
  if (m === 1) return <span className={s.mHalf} aria-label="Partly" />;
  return <span className={s.mNone} aria-label="No" />;
}

function Compare() {
  return (
    <Reveal>
      <div className={s.compareWrap}>
        <table className={s.compare}>
          <thead>
            <tr>
              <th />
              {COMPARE_COLS.map((c, i) => (
                <th key={c} className={i === COMPARE_COLS.length - 1 ? s.cOurs : undefined}>
                  {i === COMPARE_COLS.length - 1 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <AtlasMark size={18} /> {c}
                    </span>
                  ) : (
                    c
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr key={r.row}>
                <td>{r.row}</td>
                {r.v.map((m, i) => (
                  <td key={i} className={i === r.v.length - 1 ? s.cOurs : undefined}>
                    <MarkIcon m={m} ours={i === r.v.length - 1} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.legend}>
        <span>
          <span className={s.mFull} /> Built in
        </span>
        <span>
          <span className={s.mHalf} /> Partly or with effort
        </span>
        <span>
          <span className={s.mNone} /> Not designed for it
        </span>
        <span className={s.legendNote}>Typical capabilities by category; individual products vary. Atlas works alongside your data room, not instead of it.</span>
      </div>
    </Reveal>
  );
}

/* ---------------- FAQ ---------------- */

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={s.faq}>
      {FAQ.map((f, i) => (
        <div key={f.q} className={cx(s.faqItem, open === i && s.faqOpen)}>
          <button className={s.faqQ} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            {f.q}
            {open === i ? <IconMinus size={16} /> : <IconPlus size={16} />}
          </button>
          <div className={s.faqA}>
            <div>
              <p>{f.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Page ---------------- */

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

      <header className={cx(s.nav, scrolled && s.navScrolled)}>
        <div className={cx(s.container, s.navInner)}>
          <button className={s.brand} onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}>
            <AtlasMark />
            Atlas
            <span className={s.brandSub}>Acquisition intelligence</span>
          </button>
          <nav className={s.navLinks}>
            {[
              ['outcomes', 'Outcomes'],
              ['product', 'Product'],
              ['why', 'Why Atlas'],
              ['pricing', 'Pricing'],
              ['faq', 'FAQ'],
            ].map(([id, l]) => (
              <a key={id} href={`#${id}`} onClick={scrollTo(id)}>
                {l}
              </a>
            ))}
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
            Structured LOI terms and deal protections, drafted from evidence
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
            Atlas is the deal intelligence platform for companies that buy companies. From target screening to the 100-day plan, it does the reading, remembers every past deal and drafts the analysis, so your team spends its time on judgement, price and people.
          </p>
          <div className={cx(s.heroCtas, s.fadeUp)} style={{ animationDelay: '0.85s' }}>
            <button className={cx(s.btn, s.btnPrimary, s.btnLg, s.sheen)} onClick={enter}>
              Enter the live demo <IconArrowRight size={17} className={s.btnArrow} />
            </button>
            <a className={cx(s.btn, s.btnGhost, s.btnLg)} href="#outcomes" onClick={scrollTo('outcomes')}>
              See the outcomes
            </a>
          </div>
          <div className={cx(s.heroNote, s.fadeUp)} style={{ animationDelay: '1s' }}>
            For first-time acquirers, serial acquirers and enterprise corporate development
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

      <div className={s.marquee} aria-hidden>
        <div className={s.marqueeTrack}>
          {[...TICKER, ...TICKER].map(([a, b, c], i) => (
            <div key={i} className={s.marqueeItem}>
              <span className={s.tickDot} />
              {a} <b>{b}</b> · {c}
            </div>
          ))}
        </div>
      </div>

      {/* 01 The case */}
      <section className={s.section} id="case">
        <div className={s.container}>
          <SectionHead
            n="01"
            eyebrow="The case"
            title="Serial acquirers outperform."
            accent="When they actually learn."
            sub="Programmatic M&A is the most reliable way to create value through acquisitions. But most deal knowledge lives in inboxes, advisors’ files and people’s heads, and it leaves with them."
          />
          <div className={s.problem}>
            {PROBLEM.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.08} className={s.problemItem}>
                <div className={s.problemN}>{p.n}</div>
                <div className={s.problemT}>
                  {p.t}
                  <Ref n={p.src} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 02 Outcomes */}
      <section className={s.section} id="outcomes">
        <div className={s.container}>
          <SectionHead
            n="02"
            eyebrow="Outcomes"
            title="Faster, more accurate deals,"
            accent="from thesis to Day 100."
            sub="Atlas is not a document reader. It connects every phase of the deal, so what you learn in diligence changes the price, the terms and the integration plan, and what you learn after closing changes the next deal."
          />
          <div className={s.pillars}>
            {PILLARS.map((p, i) => (
              <Reveal key={p.k} delay={i * 0.08} className={s.pillar}>
                <div className={s.pillarK}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {p.k}
                </div>
                <div className={s.pillarT}>{p.t}</div>
                <p className={s.pillarD}>{p.d}</p>
                <ul className={s.pillarM}>
                  {p.m.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className={s.benchHead}>
              <span className={s.benchTitle}>What AI is already delivering in M&A</span>
              <span className={s.benchNote}>Published industry research, not Atlas results. We will publish measured pilot results when we have them.</span>
            </div>
          </Reveal>
          <div className={s.bench}>
            {BENCHMARKS.map((b, i) => (
              <Reveal key={b.t} delay={i * 0.06} className={s.benchItem}>
                <div className={s.benchN}>{b.n}</div>
                <div className={s.benchT}>
                  {b.t}
                  <Ref n={b.src} />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className={s.benchHead} style={{ marginTop: 72 }}>
              <span className={s.benchTitle}>Estimate it for your team</span>
              <span className={s.benchNote}>Your inputs, a transparent formula, nothing hidden.</span>
            </div>
            <Estimator />
          </Reveal>
        </div>
      </section>

      {/* 03 Product */}
      <section className={s.section} id="product">
        <div className={s.container}>
          <SectionHead n="03" eyebrow="The product" title="One workspace for the whole deal," accent="and every deal after it." />
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
            <Reveal className={s.card}>
              <PipelineViz reduced={reduced} />
              <div className={s.cardK}>Strategy</div>
              <div className={s.cardTitle}>A pipeline that screens itself</div>
              <div className={s.cardText}>New targets are pre-screened against your playbook. Pass reasons are kept, so nobody re-does the work.</div>
            </Reveal>
            <Reveal className={cx(s.card, s.span2)} delay={0.08}>
              <DocScan />
              <div className={s.cardK}>Diligence</div>
              <div className={s.cardTitle}>Every finding linked to its page</div>
              <div className={s.cardText}>CIMs, QoE reports, contracts and customer files become labelled findings, checked against seller claims and your past deals.</div>
            </Reveal>
            <Reveal className={cx(s.card, s.span2)}>
              <ReviewQueue reduced={reduced} />
              <div className={s.cardK}>Decisions</div>
              <div className={s.cardTitle}>Atlas proposes. Your team decides.</div>
              <div className={s.cardText}>Risks, decisions, requests and actions arrive with their reasoning. Accept, edit or dismiss; nothing becomes a record without a person.</div>
            </Reveal>
            <Reveal className={s.card} delay={0.08}>
              <FitBars />
              <div className={s.cardK}>Playbook</div>
              <div className={s.cardTitle}>Scored against your criteria</div>
              <div className={s.cardText}>Your guardrails, computed in code. Not a black-box “deal score”.</div>
            </Reveal>
            <Reveal className={s.card}>
              <Constellation />
              <div className={s.cardK}>Memory</div>
              <div className={s.cardTitle}>Institutional memory</div>
              <div className={s.cardText}>Backfill past deals once. Atlas surfaces the ones that resemble today’s target, and what went wrong.</div>
            </Reveal>
            <Reveal className={s.card} delay={0.06}>
              <Provenance />
              <div className={s.cardK}>Accuracy</div>
              <div className={s.cardTitle}>Verified vs. seller-stated</div>
              <div className={s.cardText}>Every metric shows whether an advisor or source system backs it, or only the seller does.</div>
            </Reveal>
            <Reveal className={s.card} delay={0.12}>
              <IntegrationViz />
              <div className={s.cardK}>Integration</div>
              <div className={s.cardTitle}>Value tracked to the thesis</div>
              <div className={s.cardText}>100-day KPIs for synergies, retention and systems, measured against what you paid for.</div>
            </Reveal>
            <Reveal className={cx(s.card, s.span3)}>
              <div className={s.wide}>
                <div>
                  <div className={s.cardK}>Terms</div>
                  <div className={s.cardTitle}>Evidence becomes price and protection</div>
                  <div className={s.cardText}>LOI terms, deal protections and the funds flow are drafted from the findings and your playbook, with the reasoning behind every number. One click generates the letter.</div>
                </div>
                <LoiTerms />
              </div>
            </Reveal>
          </div>
          <Reveal>
            <Flow />
          </Reveal>
        </div>
      </section>

      {/* 04 Process */}
      <section className={s.section} id="process">
        <div className={cx(s.container, s.center)}>
          <SectionHead center n="04" eyebrow="The whole deal" title="Eight phases," accent="one workspace." sub="Each phase has its key deliverables, live status and an obvious next step. Phases overlap, as they do in real deals." />
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

      {/* 05 Why Atlas */}
      <section className={s.section} id="why">
        <div className={s.container}>
          <SectionHead
            n="05"
            eyebrow="Why Atlas"
            title="Not another data room."
            accent="Not another chatbot."
            sub="Data rooms store documents, CRMs track deals and AI assistants answer questions. Atlas is the layer that connects them to your strategy, your playbook and your history, and keeps the decisions."
          />
          <Compare />

          <div className={s.trust}>
            {TRUST.map((t, i) => (
              <Reveal key={t.t} delay={(i % 3) * 0.08} className={s.trustItem}>
                <div className={s.trustT}>{t.t}</div>
                <p className={s.trustD}>{t.d}</p>
              </Reveal>
            ))}
          </div>

          <div className={s.split}>
            <Reveal className={cx(s.col, s.colAtlas)}>
              <div className={s.colHead}>
                <span className={s.colIcon} style={{ background: 'rgba(155,123,255,.16)' }}>
                  <IconBrain size={19} color="#cfc1ff" />
                </span>
                Atlas does the reading
              </div>
              <ul className={s.colList}>
                {['Reads every document and extracts metrics with citations', 'Checks seller claims against the evidence', 'Scores the target against your playbook', 'Finds similar past deals and their lessons', 'Drafts risks, decisions, Q&A and deliverables'].map((x) => (
                  <li key={x}>
                    <IconSparkles size={15} color="#b9a4ff" />
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className={s.col} delay={0.1}>
              <div className={s.colHead}>
                <span className={s.colIcon} style={{ background: 'rgba(52,211,180,.12)' }}>
                  <IconUserCheck size={19} color="#8eeeda" />
                </span>
                Your team does the judging
              </div>
              <ul className={s.colList}>
                {['Sets the thesis and the playbook guardrails', 'Accepts, edits or dismisses every proposal', 'Owns the price, the structure and the walk-away', 'Approves decisions at each gate', 'Decides what the next deal should learn'].map((x) => (
                  <li key={x}>
                    <IconCheck size={15} color="#34d3b4" />
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 06 Who it's for */}
      <section className={s.section} id="who">
        <div className={s.container}>
          <SectionHead n="06" eyebrow="Who it’s for" title="From your first acquisition" accent="to your fiftieth." />
          <div className={s.segments}>
            {SEGMENTS.map((g, i) => (
              <Reveal key={g.k} delay={i * 0.08} className={s.segment}>
                <div className={s.segK}>{g.k}</div>
                <div className={s.segT}>{g.t}</div>
                <p className={s.segD}>{g.d}</p>
                <a href="#pricing" onClick={scrollTo('pricing')} className={s.segPlan}>
                  {g.plan} plan <IconArrowRight size={14} />
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className={s.benchHead} style={{ marginTop: 80 }}>
              <span className={s.benchTitle}>One engine, your playbook</span>
              <span className={s.benchNote}>Criteria, workstreams and decision gates come from the playbook. Switch industries to see.</span>
            </div>
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
        </div>
      </section>

      {/* 07 Pricing */}
      <section className={s.section} id="pricing">
        <div className={s.container}>
          <SectionHead center n="07" eyebrow="Pricing" title="Priced per program," accent="never per deal value." sub="Start with one acquisition. Scale to a program. No success fees, ever." />
          <Pricing onStart={enter} />
        </div>
      </section>

      {/* 08 FAQ */}
      <section className={s.section} id="faq">
        <div className={cx(s.container, s.faqGrid)}>
          <SectionHead n="08" eyebrow="Questions" title="What dealmakers" accent="ask us first." />
          <Reveal>
            <Faq />
          </Reveal>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <Reveal>
            <div className={s.cta}>
              <div className={s.orb} aria-hidden />
              <div style={{ position: 'relative' }}>
                <h2 className={s.h2} style={{ margin: '0 auto' }}>
                  Walk a live deal <span className={s.serif}>end to end.</span>
                </h2>
                <p className={s.sub} style={{ margin: '18px auto 0' }}>
                  Sign in as the head of corp dev, the CFO or the integration lead. Review Atlas’s proposals on ABC Mechanical, or start a new acquisition and watch Atlas analyse it.
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
        <div className={s.container}>
          <div className={s.sources} id="sources">
            <div className={s.railTitle}>Sources</div>
            <ol>
              {SOURCES.map((x) => (
                <li key={x.id} id={`src-${x.id}`}>
                  <a href={x.url} target="_blank" rel="noreferrer">
                    {x.label} <IconArrowUpRight size={12} />
                  </a>
                </li>
              ))}
            </ol>
          </div>
          <div className={s.footerInner}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AtlasMark size={22} /> Atlas · Acquisition intelligence
            </span>
            <span>Prototype for expert validation. Companies, people and deal figures in the product are synthetic.</span>
          </div>
        </div>
      </footer>

      {open && <SignIn onClose={() => setOpen(false)} onDone={done} />}
    </div>
  );
}
