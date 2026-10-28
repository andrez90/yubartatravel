'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { calcQuote, formatCOP, type Catalog } from '@/lib/pricing';
import { captureAttribution, getAttribution, trackEvent } from '@/lib/tracking';
import type { Settings } from '@/lib/types';
import { waLink } from '@/lib/utils';
import { Consents, NO_CONSENT, Stepper, type ConsentState } from './FormBits';
import Icon from './Icons';

export type PublicMethod = { id: string; kind: string; label: string; help: string };
type Booked = { reference: string; total: number; deposit: number; hasPending: boolean };

const KIND_ICON: Record<string, string> = { wompi: 'card', link: 'link', transfer: 'bank', whatsapp: 'chat' };

/** Reserva en 2 pasos: datos del viajero → elegir cómo pagar el abono. El valor lo calcula el servidor con el precio del panel. */
export default function BookingFlow({
  catalog,
  categorySlug,
  planId,
  planTitle,
  methods,
  terms,
  settings,
}: {
  catalog: Catalog;
  categorySlug: string;
  planId: string;
  planTitle: string;
  methods: PublicMethod[];
  terms: string;
  settings: Settings;
}) {
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState<ConsentState>(NO_CONSENT);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [details, setDetails] = useState<{ text: string; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(Date.now());
  const hp = useRef<HTMLInputElement>(null);

  useEffect(() => captureAttribution(), []);
  const est = useMemo(() => calcQuote(catalog, { categorySlug, planId, adults, kids, extras: [] }), [catalog, categorySlug, planId, adults, kids]);

  async function reserve(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (name.trim().length < 2 || whatsapp.replace(/\D/g, '').length < 7 || !/^\S+@\S+\.\S+$/.test(email) || adults < 1) return setErr('Completa tu nombre, WhatsApp y correo, y al menos 1 adulto.');
    if (!(consent.privacy && consent.terms && consent.adult)) return setErr('Marca las tres autorizaciones obligatorias.');
    setBusy(true);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug,
          planId,
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          adults,
          kids,
          travelDate: date,
          message,
          terms: consent.terms,
          privacy: consent.privacy,
          adult: consent.adult,
          marketing: consent.marketing,
          attribution: getAttribution(),
          website: hp.current?.value || '',
          elapsed: Date.now() - started.current,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'No pudimos crear tu reserva.');
      trackEvent('begin_checkout', { plan: planTitle, value: j.total || 0, currency: 'COP' });
      setBooked(j);
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'No pudimos crear tu reserva. Escríbenos por WhatsApp.');
    } finally {
      setBusy(false);
    }
  }

  async function pay(m: PublicMethod) {
    if (!booked) return;
    setErr('');
    setBusy(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: booked.reference, method: m.id }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'No pudimos abrir el pago.');
      trackEvent('add_payment_info', { method: m.kind });
      if (j.kind === 'redirect') window.location.href = j.url;
      else setDetails({ text: j.details, amount: j.amount });
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'No pudimos abrir el pago.');
    } finally {
      setBusy(false);
    }
  }

  const proof = booked ? waLink(settings, `¡Hola! Te envío mi comprobante. Reserva ${booked.reference} (${planTitle}).`) : '#';

  if (booked) {
    const due = booked.deposit > 0 ? booked.deposit : booked.total;
    return (
      <div className="book-card" role="region" aria-label="Pago de la reserva">
        <p className="book-ok">
          <Icon name="check" size={20} /> Reserva creada
        </p>
        <h2>Tu código es {booked.reference}</h2>
        <p className="muted">Guárdalo: lo usamos para identificar tu pago. Lo confirmamos por WhatsApp y por correo.</p>
        <dl className="book-sum">
          <div><dt>Plan</dt><dd>{planTitle}</dd></div>
          <div><dt>Viajeros</dt><dd>{adults} adulto(s){kids ? ` + ${kids} niño(s)` : ''}</dd></div>
          <div><dt>Total</dt><dd>{booked.total > 0 ? formatCOP(booked.total) : 'Por confirmar con un asesor'}</dd></div>
          {due > 0 && <div><dt>Abono para separar tu cupo</dt><dd>{formatCOP(due)}</dd></div>}
        </dl>

        <h3>¿Cómo quieres pagar?</h3>
        <div className="pay-list">
          {methods.map((m) => (
            <button key={m.id} type="button" className="pay-btn" onClick={() => pay(m)} disabled={busy} data-fx>
              <span className="pay-ic">
                <Icon name={KIND_ICON[m.kind] || 'card'} />
              </span>
              <span>
                <b>{m.label}</b>
                <small>{m.help}</small>
              </span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>

        {details && (
          <div className="pay-details" role="status">
            <h4>Datos para tu transferencia</h4>
            <pre>{details.text}</pre>
            {details.amount > 0 && <p>Valor a transferir: <b>{formatCOP(details.amount)}</b></p>}
            <p>Pon <b>{booked.reference}</b> en la descripción del pago.</p>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost-light" onClick={() => navigator.clipboard?.writeText(details.text).then(() => setCopied(true))}>
                <Icon name="copy" size={16} /> {copied ? 'Copiado' : 'Copiar datos'}
              </button>
              <a className="btn btn-wa" href={proof} target="_blank" rel="noopener noreferrer">
                Enviar comprobante por WhatsApp
              </a>
            </div>
          </div>
        )}
        {err && <p role="alert" className="form-err">{err}</p>}
        <p className="book-terms">
          <Icon name="lock" size={14} /> {terms}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={reserve} className="form book-form" noValidate>
      <h2>Tus datos</h2>
      <div className="row">
        <label>
          Nombre y apellido *
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
        </label>
        <label>
          WhatsApp *
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" inputMode="tel" maxLength={25} autoComplete="tel" />
        </label>
      </div>
      <label>
        Correo electrónico *
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={160} autoComplete="email" />
      </label>
      <div className="row">
        <Stepper label="Adultos" value={adults} min={1} onChange={setAdults} />
        <Stepper label="Niños" value={kids} onChange={setKids} />
      </div>
      <label>
        Fecha en que quieres viajar
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label>
        Algo que debamos saber (opcional)
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={1500} />
      </label>
      <div className="hp" aria-hidden="true">
        <label>
          No llenar
          <input ref={hp} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="book-est">
        {est.total > 0 ? (
          <>
            Total estimado: <b>{formatCOP(est.total)}</b>
            {est.deposit > 0 && <> · abono {formatCOP(est.deposit)}</>}
          </>
        ) : (
          <>El valor de este plan lo confirma un asesor antes de que pagues.</>
        )}
      </p>
      <Consents v={consent} onChange={setConsent} />
      {err && <p role="alert" className="form-err">{err}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? 'Creando reserva…' : 'Continuar al pago'}
      </button>
      <p className="form-trust"><Icon name="lock" size={14} /> Aún no se cobra nada. En el siguiente paso eliges cómo pagar.</p>
    </form>
  );
}
