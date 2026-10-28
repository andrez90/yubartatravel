'use client';

import { useEffect } from 'react';

/**
 * Efecto de las tarjetas con data-fx: se inclinan un poco hacia el puntero y un brillo las sigue.
 * Solo en dispositivos con mouse y si la persona no pidió menos movimiento. Se anima únicamente transform y opacity.
 */
export default function CardFx() {
  useEffect(() => {
    const ok = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ok) return;
    let el: HTMLElement | null = null;
    let raf = 0;
    let ev: PointerEvent | null = null;

    const apply = () => {
      raf = 0;
      if (!el || !ev) return;
      const r = el.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      const px = x / r.width - 0.5;
      const py = y / r.height - 0.5;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      el.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`);
    };
    const reset = (t: HTMLElement) => {
      t.style.setProperty('--rx', '0deg');
      t.style.setProperty('--ry', '0deg');
      t.removeAttribute('data-fx-on');
    };
    const move = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.('[data-fx]') as HTMLElement | null;
      if (t !== el) {
        if (el) reset(el);
        el = t;
        if (el) el.setAttribute('data-fx-on', '');
      }
      ev = e;
      if (el && !raf) raf = requestAnimationFrame(apply);
    };
    const leave = () => {
      if (el) reset(el);
      el = null;
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
