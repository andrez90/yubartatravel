'use client';

import { useRef, type ReactNode } from 'react';
import Icon from './Icons';

/** Carrusel horizontal nativo (scroll-snap) con botones anterior/siguiente. */
export default function Scroller({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 420), behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <div className="scroller">
      <div className="scroller-ctl">
        <button type="button" onClick={() => go(-1)} aria-label={`${label}: anterior`}>
          <Icon name="left" size={20} />
        </button>
        <button type="button" onClick={() => go(1)} aria-label={`${label}: siguiente`}>
          <Icon name="right" size={20} />
        </button>
      </div>
      <div className="scroller-track" ref={ref} tabIndex={0} role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}
