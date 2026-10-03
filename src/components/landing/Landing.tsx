'use client';

import '@fontsource-variable/mona-sans/standard.css';
import { IconArrowRight, IconCheck, IconLock, IconMinus, IconPlus } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { PLAYBOOKS } from '@/data/playbooks';
import { PHASES } from '@/lib/meta';
import { ruleText } from '@/lib/playbook';
import { useStore } from '@/lib/store';
import { COMPARE, COMPARE_COLS, FAQ, PILLARS, SEGMENTS, SYSTEM, THESIS, TIERS, TRUST, type Mark } from './data';
import { AtlasMark, cx, Reveal, useReducedMotion } from './kit';
import { SignIn } from './SignIn';
import { AcquisitionLoop, ClaimsViz, DecisionViz, MemoryViz, PlaybookViz, ProductPreview, ReviewQueue, SerialViz } from './visuals';
import s from './landing.module.css';

export { AtlasMark };

function SectionHead({ n, eyebrow, title, muted, sub, center }: { n: string; eyebrow: string; title: ReactNode; muted?: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <Reveal className={center ? s.center : undefined}>
      <span className={s.eyebrow}>
        <span className={s.eyebrowNum}>{n}</span>
        {eyebrow}
      </span>
      <h2 className={s.h2}>
        {title} {muted && <span className={s.mutedHead}>{muted}</span>}
      </h2>
      {sub && <p className={s.sub}>{sub}</p>}
    </Reveal>
  );
}

/* ---------------- Time estimator ---------------- */

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
  const [pct, setPct] = useState(15);
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
        <div className={s.estTitle}>Your assumptions</div>
        <Slider label="Acquisitions taken through diligence per year" value={deals} min={1} max={20} step={1} onChange={setDeals} fmt={(v) => String(v)} />
        <Slider label="Internal hours per acquisition (deal team, finance, legal, operations)" value={hours} min={100} max={2000} step={50} onChange={setHours} fmt={(v) => v.toLocaleString('en-US')} />
        <Slider label="Fully loaded cost per hour" value={rate} min={50} max={400} step={10} onChange={setRate} fmt={usd} />
        <Slider label="Share of that time Atlas returns" value={pct} min={0} max={50} step={1} onChange={setPct} fmt={(v) => `${v}%`} hint="Your assumption. We measure the real figure on your own acquisitions during a pilot." />
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
          <div className={s.estK}>Deal team hours returned per year</div>
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
          <span>Net, before any deal-value impact</span>
          <b className="tnum" style={{ color: net >= 0 ? 'var(--teal)' : 'var(--red)' }}>
            {net < 0 ? '−' : ''}
            {usd(Math.abs(net))}
          </b>
        </div>
        <div className={s.estRow}>
          <span>Payback</span>
          <b className="tnum">{Number.isFinite(payback) ? `${payback.toFixed(1)} months` : '—'}</b>
        </div>
        <p className={s.estNote}>Acquisitions × hours × share returned × hourly cost, minus the plan price. Excludes the effect of findings on price and terms, acquisitions not pursued, and earlier synergy capture.</p>
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
          <Reveal key={t.name} delay={i * 0.06} className={cx(s.tier, t.popular && s.tierPopular)}>
            <div className={s.tierTop}>
              <div className={s.tierName}>{t.name}</div>
              {t.popular && <span className={s.popular}>Built for serial acquirers</span>}
            </div>
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
                  {c}
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
          <span className={s.mHalf} /> Partly, or with manual effort
        </span>
        <span>
          <span className={s.mNone} /> Not designed for it
        </span>
        <span className={s.legendNote}>Typical capabilities by category; individual products vary.</span>
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

const SYSTEM_VIZ = [PlaybookViz, DecisionViz, MemoryViz, ClaimsViz, null, SerialViz];

export function Landing() {
  const reduced = useReducedMotion();
  const signedIn = useStore((x) => x.signedIn);
  const signIn = useStore((x) => x.signIn);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pb, setPb] = useState(PLAYBOOKS[0].id);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <div className={s.backdrop} aria-hidden />

      <header className={cx(s.nav, scrolled && s.navScrolled)}>
        <div className={cx(s.container, s.navInner)}>
          <button className={s.brand} onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}>
            <AtlasMark />
            Atlas
          </button>
          <nav className={s.navLinks}>
            {[
              ['loop', 'Acquisition loop'],
              ['system', 'Platform'],
              ['fit', 'Why Atlas'],
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
      <section className={s.hero}>
        <div className={s.container}>
          <h1 className={cx(s.h1, s.fadeUp)} style={{ animationDelay: '0.08s' }}>
            Every acquisition makes the next one <span className={s.accentWord}>smarter.</span>
          </h1>
          <p className={cx(s.ledeLead, s.fadeUp)} style={{ animationDelay: '0.16s' }}>
            Atlas is the acquisition intelligence platform for companies that buy companies.
          </p>
          <p className={cx(s.lede, s.fadeUp)} style={{ animationDelay: '0.2s' }}>
            Atlas reads the evidence, applies your acquisition playbook, learns from past outcomes, and helps your team focus on the decisions that matter.
          </p>
          <div className={cx(s.heroCtas, s.fadeUp)} style={{ animationDelay: '0.24s' }}>
            <button className={cx(s.btn, s.btnPrimary, s.btnLg)} onClick={enter}>
              Enter the live demo <IconArrowRight size={17} className={s.btnArrow} />
            </button>
            <a className={cx(s.btn, s.btnGhost, s.btnLg)} href="#loop" onClick={scrollTo('loop')}>
              How it works
            </a>
          </div>

          <div className={cx(s.stage, s.fadeUp)} style={{ animationDelay: '0.36s' }}>
            <div className={s.window}>
              <div className={s.windowBar}>
                <div className={s.dots}>
                  <i />
                  <i />
                  <i />
                </div>
                <div className={s.url}>
                  <IconLock size={11} /> atlas.app/acquisitions/abc-mechanical/review
                </div>
                <div style={{ width: 46 }} />
              </div>
              <ProductPreview reduced={reduced} />
            </div>
            <div className={s.stageNote}>Demo acquisition with synthetic data</div>
          </div>
        </div>
      </section>

      {/* 01 The acquisition loop */}
      <section className={s.section} id="loop">
        <div className={s.container}>
          <SectionHead
            n="01"
            eyebrow="The acquisition loop"
            title="Every deal creates knowledge."
            muted="Few teams turn it into institutional memory."
            sub="Deal knowledge is often scattered across documents, spreadsheets, advisors and individual experience. Atlas turns what the team learns from each acquisition into a persistent acquisition playbook for the next one."
          />
          <div className={s.thesis}>
            {THESIS.map((t, i) => (
              <Reveal key={t.k} delay={i * 0.08} className={s.thesisItem}>
                <div className={s.thesisK}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {t.k}
                </div>
                <div className={s.thesisT}>{t.t}</div>
                <p className={s.thesisD}>{t.d}</p>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <AcquisitionLoop reduced={reduced} />
          </Reveal>
        </div>
      </section>

      {/* 02 The system */}
      <section className={s.section} id="system">
        <div className={s.container}>
          <SectionHead
            n="02"
            eyebrow="The platform"
            title="One acquisition intelligence system."
            muted="Six connected parts."
            sub="Each part feeds the others: the playbook scores the evidence, decisions are traced to findings, and outcomes return to the playbook through Acquisition Memory."
          />
          <div className={s.system}>
            {SYSTEM.map((x, i) => {
              const Viz = SYSTEM_VIZ[i];
              return (
                <Reveal key={x.k} delay={(i % 3) * 0.06} className={s.part}>
                  <div className={s.partHead}>
                    <span className={s.partNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={s.partK}>{x.k}</span>
                  </div>
                  <p className={s.partD}>{x.d}</p>
                  <div className={s.partViz}>{Viz ? <Viz /> : <ReviewQueue reduced={reduced} />}</div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 03 Across the deal */}
      <section className={s.section} id="process">
        <div className={s.container}>
          <SectionHead n="03" eyebrow="Across the deal" title="From thesis to value realization." muted="Eight phases, one record." sub="Each phase has its key deliverables, live status and a clear next step. Phases overlap, as they do in real acquisitions." />
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
          <div className={s.pillars}>
            {PILLARS.map((p, i) => (
              <Reveal key={p.k} delay={i * 0.06} className={s.pillar}>
                <div className={s.pillarK}>{p.k}</div>
                <div className={s.pillarT}>{p.t}</div>
                <p className={s.pillarD}>{p.d}</p>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className={s.blockHead}>
              <span className={s.blockTitle}>Estimate the time your deal team gets back</span>
              <span className={s.blockNote}>Your inputs and a visible formula. No benchmark claims.</span>
            </div>
            <Estimator />
          </Reveal>
        </div>
      </section>

      {/* 04 Why Atlas */}
      <section className={s.section} id="fit">
        <div className={s.container}>
          <SectionHead
            n="04"
            eyebrow="Why Atlas"
            title="Your data room stores documents. Your CRM tracks deals."
            muted="Atlas keeps what the team learns."
            sub="Atlas works alongside the tools you already use. It adds the layer they don't keep: your playbook, the evidence behind each decision, and the outcomes of past acquisitions."
          />
          <Compare />
          <div className={s.trust}>
            {TRUST.map((t, i) => (
              <Reveal key={t.t} delay={(i % 3) * 0.06} className={s.trustItem}>
                <div className={s.trustT}>{t.t}</div>
                <p className={s.trustD}>{t.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 05 Who it's for */}
      <section className={s.section} id="who">
        <div className={s.container}>
          <SectionHead n="05" eyebrow="Who it’s for" title="Built for serial acquirers," muted="from lean deal teams to enterprise M&A." />
          <div className={s.segments}>
            {SEGMENTS.map((g, i) => (
              <Reveal key={g.k} delay={i * 0.06} className={s.segment}>
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
            <div className={s.blockHead}>
              <span className={s.blockTitle}>One engine, your acquisition playbook</span>
              <span className={s.blockNote}>Criteria, workstreams and decision gates come from the playbook. Select a sector.</span>
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
                <ul className={s.pbList}>
                  {playbook.criteria.slice(0, 6).map((c) => (
                    <li key={c.key}>
                      <span>{c.label}</span>
                      <span className="tnum">{ruleText(c)}</span>
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

      {/* 06 Pricing */}
      <section className={s.section} id="pricing">
        <div className={s.container}>
          <SectionHead center n="06" eyebrow="Pricing" title="Priced per program." muted="Never on deal value." sub="Start with one acquisition and grow into a program. No success fees." />
          <Pricing onStart={enter} />
        </div>
      </section>

      {/* 07 FAQ */}
      <section className={s.section} id="faq">
        <div className={cx(s.container, s.faqGrid)}>
          <SectionHead n="07" eyebrow="Questions" title="What deal teams" muted="ask first." />
          <Reveal>
            <Faq />
          </Reveal>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <Reveal>
            <div className={s.cta}>
              <h2 className={s.h2} style={{ margin: '0 auto' }}>
                Walk through a live acquisition.
              </h2>
              <p className={s.sub} style={{ margin: '16px auto 0' }}>
                Sign in as the head of corporate development, the CFO or the integration lead. Review Atlas’s proposals on ABC Mechanical, or start a new acquisition and watch the playbook apply.
              </p>
              <div className={s.heroCtas}>
                <button className={cx(s.btn, s.btnPrimary, s.btnLg)} onClick={enter}>
                  Enter the live demo <IconArrowRight size={17} className={s.btnArrow} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={cx(s.container, s.footerInner)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AtlasMark size={20} /> Atlas · Acquisition intelligence
          </span>
          <span>Prototype for expert validation. Companies, people and figures in the product are synthetic.</span>
        </div>
      </footer>

      {open && <SignIn onClose={() => setOpen(false)} onDone={done} />}
    </div>
  );
}
