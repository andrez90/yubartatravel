'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { calcQuote, formatCOP, planId, quoteToText, type Catalog } from '@/lib/pricing';
import { trackEvent } from '@/lib/tracking';
import type { Settings } from '@/lib/types';
import { waLink } from '@/lib/utils';
import { Stepper } from './FormBits';
import Icon from './Icons';

/** Cotizador de viajes: el valor se suma solo; lo que aún no tiene precio lo confirma un asesor. */
export default function QuoteCalculator({ catalog, settings }: { catalog: Catalog; settings: Settings }) {
  const cats = catalog.categories.items;
  const [slug, setSlug] = useState(cats[0]?.slug || '');
  const [plan, setPlan] = useState('');
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [extras, setExtras] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [dest, setDest] = useState('');

  const input = useMemo(() => ({ categorySlug: slug, planId: plan || undefined, adults, kids, extras }), [slug, plan, adults, kids, extras]);
  const q = useMemo(() => calcQuote(catalog, input), [catalog, input]);
  const cat = cats.find((k) => k.slug === slug);
  const summary = quoteToText(q, { date, destination: dest });
  const chosenPlan = plan ? cat?.plans.find((p) => planId(p) === plan) : undefined;
  const extrasOn = catalog.quote.extras.filter((e) => e.active);

  const pick = (s: string) => {
    setSlug(s);
    setPlan('');
    trackEvent('quote_category', { category: s });
  };
  const toggle = (id: string) => setExtras((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));

  const request = () => {
    trackEvent('quote_request', { category: slug, total: q.total });
    window.dispatchEvent(
      new CustomEvent('yt:prefill', { detail: { interest: cat?.name, message: summary, destination: dest, date, adults, kids, quote: input } }),
    );
  };

  if (!cats.length) return null;
  return (
    <section className="section tint" id="cotizador" aria-labelledby="cotizador-h">
      <div className="container">
        <header className="sec-head">
          <h2 id="cotizador-h">{catalog.quote.title}</h2>
          <p>{catalog.quote.intro}</p>
        </header>

        <div className="qc">
          <div className="qc-form">
            <fieldset className="qc-block">
              <legend>¿Qué tipo de plan buscas?</legend>
              <div className="qc-types">
                {cats.map((k) => (
                  <label key={k.slug} className={'qc-type' + (k.slug === slug ? ' on' : '')} data-fx>
                    <input type="radio" name="qc-cat" className="sr-only" checked={k.slug === slug} onChange={() => pick(k.slug)} />
                    <b>{k.name}</b>
                    <small>{k.fromAmount && k.fromAmount > 0 ? `Desde ${formatCOP(k.fromAmount)}` : k.plans.length ? `${k.plans.length} planes` : 'A tu medida'}</small>
                  </label>
                ))}
              </div>
              {cat && cat.plans.length > 0 && (
                <label className="qc-field">
                  <span>¿Ya tienes un plan en mente? (opcional)</span>
                  <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                    <option value="">Aún no, quiero ver opciones</option>
                    {cat.plans.map((p) => (
                      <option key={planId(p)} value={planId(p)}>
                        {p.title}
                        {p.amount ? ` · ${formatCOP(p.amount)}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </fieldset>

            <fieldset className="qc-block">
              <legend>¿Quiénes viajan?</legend>
              <div className="qc-people">
                <Stepper label="Adultos" value={adults} min={0} onChange={setAdults} />
                <Stepper label="Niños" value={kids} min={0} onChange={setKids} hint={catalog.quote.kidsPercent < 100 ? `Pagan el ${catalog.quote.kidsPercent} %` : undefined} />
              </div>
              <div className="qc-row">
                <label className="qc-field">
                  <span>Destino o idea (opcional)</span>
                  <input type="text" value={dest} maxLength={120} onChange={(e) => setDest(e.target.value)} placeholder="Ej. San Andrés, Cartagena…" />
                </label>
                <label className="qc-field">
                  <span>Fecha aproximada (opcional)</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
              </div>
            </fieldset>

            {extrasOn.length > 0 && (
              <fieldset className="qc-block">
                <legend>¿Quieres sumar algo? (opcional)</legend>
                <div className="qc-extras">
                  {extrasOn.map((e) => {
                    const on = extras.includes(e.id);
                    return (
                      <label key={e.id} className={'qc-extra' + (on ? ' on' : '')} data-fx>
                        <input type="checkbox" checked={on} onChange={() => toggle(e.id)} />
                        <span>
                          <b>{e.label}</b>
                          <small>{e.help}</small>
                        </span>
                        <em>{e.price > 0 ? `${formatCOP(e.price)}${e.mode === 'persona' ? ' c/u' : ''}` : 'A cotizar'}</em>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </div>

          <aside className="qc-sum" aria-label="Resumen de tu cotización">
            <h3>Tu cotización</h3>
            {q.lines.length === 0 ? (
              <p className="qc-empty">Agrega al menos un viajero para ver el resumen.</p>
            ) : (
              <ul>
                {q.lines.map((l) => (
                  <li key={l.id}>
                    <span>
                      {l.label}
                      {l.qty > 1 ? ` x${l.qty}` : ''}
                    </span>
                    <span>{l.pending ? 'por confirmar' : formatCOP(l.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="qc-total">
              <small>{q.hasPending && q.total > 0 ? 'Total parcial' : 'Total estimado'}</small>
              <strong aria-live="polite">{q.total > 0 ? formatCOP(q.total) : 'Por confirmar'}</strong>
              {q.hasPending && <small>Lo que está «por confirmar» lo define tu asesor antes de que pagues.</small>}
              {q.deposit > 0 && <small>Abono para separar tu cupo: {formatCOP(q.deposit)}</small>}
              <small>{catalog.quote.note}</small>
            </div>
            <div className="qc-actions">
              <button type="button" className="btn btn-accent" onClick={request} disabled={q.travelers === 0}>
                Pedir esta cotización
              </button>
              {cat && chosenPlan && (
                <Link className="btn btn-ghost" href={`/reservar/${cat.slug}/${plan}`}>
                  Reservar este plan
                </Link>
              )}
              <a className="btn btn-ghost" href={waLink(settings, `¡Hola! Armé esta cotización en el sitio:\n${summary}`)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp_quote_click', { category: slug })}>
                Hablar por WhatsApp
              </a>
            </div>
            <p className="qc-lock">
              <Icon name="lock" size={14} /> No pedimos pagos en este paso.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
