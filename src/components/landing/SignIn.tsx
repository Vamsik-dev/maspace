'use client';

import { IconArrowRight, IconCheck, IconLock, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ORGS } from '@/data/playbooks';
import { PEOPLE } from '@/data/people';
import { AtlasMark, cx } from './kit';
import s from './landing.module.css';

const AVATAR: Record<string, string> = { teal: '#0ca678', indigo: '#4c6ef5', dark: '#495057', cyan: '#1098ad', grape: '#ae3ec9', orange: '#f76707', pink: '#d6336c', lime: '#74b816', red: '#e03131', blue: '#1c7ed6', violet: '#7048e8', yellow: '#f59f00' };

const STEPS = ['Verifying identity', 'Applying tenant isolation', 'Loading playbook and deal memory', 'Preparing your Atlas briefing'];

export function SignIn({ onClose, onDone }: { onClose: () => void; onDone: (orgId: string, userId: string) => void }) {
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
