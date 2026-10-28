'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings, Slide } from '@/lib/types';
import { waLink } from '@/lib/utils';

type Card = { idx: number; el: HTMLDivElement; x: number };

const DURATION = 5600; // ms que tarda cada tarjeta en llegar al centro
const TRANS = 1100; // ms que tarda la tarjeta en agrandarse hasta ser el fondo

const bgUrl = (u: string) => `url("${encodeURI(u)}")`;

/**
 * Hero con tarjetas en movimiento continuo (derecha -> izquierda). Cuando la primera
 * llega al centro se agranda hasta cubrir el hero y pasa a ser el fondo del nuevo destino.
 * - El título, el texto y el botón están en el HTML inicial (no esperan a JavaScript).
 * - Solo se animan transform y opacity (las tarjetas) y el crecimiento de un clon.
 * - Respeta prefers-reduced-motion: sin movimiento continuo ni autoplay.
 */
export default function Hero({ slides, settings }: { slides: Slide[]; settings: Settings }) {
  const N = slides.length;
  const [cur, setCur] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  const root = useRef<HTMLElement>(null);
  const cardsEl = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const s = useRef({
    list: [] as Card[],
    growing: false,
    boost: 1,
    last: 0,
    paused: false,
    reduced: false,
    cur: 0,
    W: 0,
    H: 0,
    cw: 0,
    ch: 0,
    spacing: 0,
    raf: 0,
  });

  const nextOf = useCallback((i: number) => (i + 1) % N, [N]);

  const label = useCallback(
    (i: number) => {
      const sl = slides[i];
      return { region: sl.cardRegion || sl.region, title: sl.cardTitle || sl.title };
    },
    [slides],
  );

  const measure = useCallback(() => {
    const r = root.current;
    const c = cardsEl.current;
    if (!r || !c) return;
    const st = s.current;
    st.W = r.offsetWidth;
    st.H = r.offsetHeight;
    st.cw = st.W * (st.W < 700 ? 0.3 : st.W < 1100 ? 0.15 : 0.12);
    st.ch = c.offsetHeight;
    st.spacing = st.cw * 1.12;
    st.list.forEach((k) => (k.el.style.width = st.cw + 'px'));
  }, []);

  const makeCard = useCallback(
    (idx: number, x: number) => {
      const st = s.current;
      const l = label(idx);
      const el = document.createElement('div');
      el.className = 'hc';
      el.style.backgroundImage = bgUrl(slides[idx].image);
      el.style.width = st.cw + 'px';
      const t = document.createElement('div');
      t.className = 'hc-t';
      const small = document.createElement('small');
      small.textContent = l.region;
      const b = document.createElement('b');
      b.textContent = l.title;
      t.append(small, b);
      el.append(t);
      cardsEl.current?.appendChild(el);
      const c: Card = { idx, el, x };
      st.list.push(c);
      return c;
    },
    [label, slides],
  );

  /** Reconstruye la fila: la primera tarjeta llegará al centro justo después de DURATION. */
  const rebuild = useCallback(
    (i: number) => {
      const st = s.current;
      st.list.forEach((k) => k.el.remove());
      st.list = [];
      let idx = nextOf(i);
      for (let k = 0; k < 6; k++) {
        makeCard(idx, st.W / 2 + st.spacing * (k + 1) - st.cw / 2);
        idx = nextOf(idx);
      }
    },
    [makeCard, nextOf],
  );

  const scaleAt = (x: number) => {
    const st = s.current;
    const d = Math.abs(x + st.cw / 2 - st.W / 2);
    return 0.9 + 0.24 * Math.max(0, 1 - d / (st.W * 0.38));
  };

  const goTo = useCallback(
    (i: number) => {
      // Cambio simple (botones o movimiento reducido): texto sale, fondo se desvanece, texto entra
      const st = s.current;
      if (st.growing) return;
      st.growing = true;
      setPhase('out');
      window.setTimeout(() => {
        st.cur = i;
        setCur(i);
        rebuild(i);
        setPhase('in');
        st.growing = false;
      }, 420);
    },
    [rebuild],
  );

  const takeOver = useCallback(
    (lead: Card) => {
      const st = s.current;
      const r = root.current;
      const c = cardsEl.current;
      if (!r || !c) return;
      st.growing = true;
      st.boost = 1;
      const i = lead.idx;
      const sc = scaleAt(lead.x);
      const w = st.cw * sc;
      const h = st.ch * sc;
      const left = lead.x - (w - st.cw) / 2;
      const top = c.offsetTop - (h - st.ch) / 2 - (sc - 0.9) * 14;
      st.list.shift();
      lead.el.remove();

      const grow = document.createElement('div');
      grow.className = 'hgrow';
      grow.style.cssText = `background-image:${bgUrl(slides[i].image)};left:${left}px;top:${top}px;width:${w}px;height:${h}px;`;
      r.appendChild(grow);
      setPhase('out');
      if (bar.current) bar.current.style.width = '100%';

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          grow.classList.add('go');
          grow.style.left = '0px';
          grow.style.top = '0px';
          grow.style.width = st.W + 'px';
          grow.style.height = st.H + 'px';
        }),
      );
      window.setTimeout(() => {
        r.classList.add('swap'); // cambio de fondo sin fundido: la tarjeta ya lo tapa
        st.cur = i;
        setCur(i);
        setPhase('in');
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            grow.remove();
            r.classList.remove('swap');
            st.growing = false;
          }),
        );
      }, TRANS);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slides],
  );

  useEffect(() => {
    const st = s.current;
    st.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (st.reduced) {
      st.paused = true;
      setPaused(true);
    }
    setReady(true);
    measure();
    rebuild(0);

    const onResize = () => {
      measure();
      rebuild(st.cur);
    };
    window.addEventListener('resize', onResize);

    const tick = (now: number) => {
      const dt = Math.min(50, now - (st.last || now));
      st.last = now;
      const speed = st.spacing / DURATION;
      if (!st.paused) st.list.forEach((c) => (c.x -= speed * st.boost * dt));
      // mantiene la fila llena por la derecha
      while (st.list.length && st.list[st.list.length - 1].x < st.W + st.cw) {
        const prev = st.list[st.list.length - 1];
        const idx = (prev.idx + 1) % N;
        const c = {
          idx,
          x: prev.x + st.spacing,
        };
        makeCard(c.idx, c.x);
      }
      const t = now / 1000;
      st.list.forEach((c) => {
        const sc = scaleAt(c.x);
        const bob = st.reduced ? 0 : Math.sin(t * 1.6 + c.idx * 1.7) * 5;
        const tilt = st.reduced ? 0 : Math.sin(t * 1.1 + c.idx) * 0.8;
        c.el.style.transform = `translate3d(${c.x}px,${bob - (sc - 0.9) * 14}px,0) scale(${sc}) rotate(${tilt}deg)`;
        c.el.style.zIndex = String(Math.round(sc * 100));
        c.el.style.opacity = String(Math.min(1, Math.max(0, (st.W - c.x) / (st.cw * 0.8))));
      });
      const lead = st.list[0];
      if (lead && !st.growing && !st.paused) {
        const p = Math.min(1, Math.max(0, 1 - (lead.x + st.cw / 2 - st.W / 2) / st.spacing));
        if (bar.current) bar.current.style.width = p * 100 + '%';
        if (lead.x + st.cw / 2 <= st.W / 2) takeOver(lead);
      }
      st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePause = () => {
    const st = s.current;
    st.paused = !st.paused;
    setPaused(st.paused);
  };
  const next = () => {
    const st = s.current;
    if (st.growing) return;
    if (st.reduced) goTo(nextOf(st.cur));
    else {
      st.paused = false;
      setPaused(false);
      st.boost = 10; // acelera hasta que la siguiente tarjeta llegue al centro
    }
  };
  const prev = () => goTo((s.current.cur - 1 + N) % N);

  const sl = slides[cur];
  const isIntro = cur === 0;

  return (
    <section ref={root} className="hero" aria-roledescription="carrusel" aria-label="Destinos y planes">
      <h1 className="sr-only">
        {settings.name}: {settings.tagline.toLowerCase()} en {settings.city}
      </h1>

      <div className="hero-bg" aria-hidden="true">
        {slides.map((x, i) =>
          i === 0 || ready ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              className={'layer' + (i === cur ? ' on' : '')}
              src={x.image}
              alt=""
              width={1600}
              height={900}
              decoding="async"
              loading={i === 0 ? 'eager' : 'lazy'}
              {...(i === 0 ? { fetchPriority: 'high' as const } : {})}
            />
          ) : null,
        )}
      </div>
      <div className="hero-shade" aria-hidden="true" />

      <div className={'hero-copy ' + phase} aria-live="polite">
        {sl.region && (
          <span className="mask mask-region">
            <span className="hero-region">{sl.region}</span>
          </span>
        )}
        <span className="mask mask-title">
          <span className={'hero-title' + (isIntro ? ' intro' : '')} role="heading" aria-level={2}>
            {sl.title}
          </span>
        </span>
        <span className="mask mask-text">
          <p className="hero-text">{sl.text}</p>
        </span>
        <span className="mask mask-cta">
          <span className="hero-cta">
            <Link href={sl.link || '/#planes'} className="btn btn-primary">
              {sl.linkLabel || 'Ver más'}
            </Link>
            <a
              className="btn btn-ghost"
              href={waLink(settings, `¡Hola! Me interesa: ${sl.title}. ¿Me das información?`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Cotizar por WhatsApp
            </a>
          </span>
        </span>
      </div>

      <div className="hero-count" aria-hidden="true">
        {String(cur + 1).padStart(2, '0')}
      </div>
      <div className="hero-cards" ref={cardsEl} aria-hidden="true" />

      <div className="hero-ctrl">
        <button type="button" onClick={prev} aria-label="Destino anterior">
          ‹
        </button>
        <button type="button" onClick={togglePause} aria-pressed={paused} aria-label={paused ? 'Reanudar movimiento' : 'Pausar movimiento'}>
          {paused ? '▶' : '❚❚'}
        </button>
        <button type="button" onClick={next} aria-label="Siguiente destino">
          ›
        </button>
      </div>
      <div className="hero-progress" aria-hidden="true">
        <div ref={bar} />
      </div>
    </section>
  );
}
