'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import s from './landing.module.css';

export const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setR(!!m?.matches);
  }, []);
  return r;
}

/** Fires once when the element scrolls into view. */
export function useInView<T extends Element>(threshold = 0.25) {
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

export function Reveal({ children, delay = 0, className, as: Tag = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);
  return (
    <Tag ref={ref} className={cx(s.reveal, inView && s.in, className)} style={{ '--d': `${delay}s` } as CSSProperties}>
      {children}
    </Tag>
  );
}

export function Count({ to, suffix = '', prefix = '', decimals = 0 }: { to: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1600);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tnum">
      {prefix}
      {v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function AtlasMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="#0f1830" stroke="#33415f" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#8ea6ff" strokeWidth="1.6" />
      <ellipse cx="16" cy="16" rx="3.6" ry="8.5" fill="none" stroke="#8ea6ff" strokeWidth="1.3" />
      <path d="M7.8 13.2h16.4M7.8 18.8h16.4" stroke="#8ea6ff" strokeWidth="1.1" opacity="0.7" />
    </svg>
  );
}
