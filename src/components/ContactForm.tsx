'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { captureAttribution, getAttribution, trackEvent } from '@/lib/tracking';
import type { QuoteInput } from '@/lib/pricing';
import type { Settings } from '@/lib/types';
import { waLink } from '@/lib/utils';
import { Consents, NO_CONSENT, Stepper, type ConsentState } from './FormBits';

const DRAFT = 'yt_form_draft';
type Prefill = { interest?: string; message?: string; destination?: string; date?: string; adults?: number; kids?: number; quote?: QuoteInput };
type Errors = Partial<Record<'name' | 'whatsapp' | 'email' | 'message' | 'consents', string>>;

/** Formulario en 2 pasos: primero lo mínimo para poder escribirte, luego los detalles del viaje. Guarda borrador y recibe lo que arma el cotizador. */
export default function ContactForm({ settings, interests }: { settings: Settings; interests: string[] }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [interest, setInterest] = useState('');
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState<ConsentState>(NO_CONSENT);
  const [quote, setQuote] = useState<QuoteInput | undefined>();
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [err, setErr] = useState('');
  const started = useRef(Date.now());
  const tracked = useRef(false);
  const hp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    captureAttribution();
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      if (d) {
        setName(d.name || '');
        setWhatsapp(d.whatsapp || '');
        setInterest(d.interest || '');
        setEmail(d.email || '');
        setMessage(d.message || '');
      }
    } catch {
      /* sin storage */
    }
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<Prefill>).detail || {};
      if (d.interest) setInterest(d.interest);
      if (d.message) setMessage(d.message);
      if (d.destination) setDestination(d.destination);
      if (d.date) setDate(d.date);
      if (typeof d.adults === 'number') setAdults(d.adults);
      if (typeof d.kids === 'number') setKids(d.kids);
      setQuote(d.quote);
      setState('idle');
      setStep(1);
      document.querySelector('#contacto')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    };
    window.addEventListener('yt:prefill', onPrefill);
    return () => window.removeEventListener('yt:prefill', onPrefill);
  }, []);

  // Borrador: solo datos de contacto básicos; nunca las autorizaciones.
  useEffect(() => {
    if (!(name || whatsapp || email || message)) return;
    if (!tracked.current) {
      tracked.current = true;
      trackEvent('form_start');
    }
    try {
      localStorage.setItem(DRAFT, JSON.stringify({ name, whatsapp, interest, email, message }));
    } catch {
      /* ignorar */
    }
  }, [name, whatsapp, interest, email, message]);

  function next() {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Escribe tu nombre.';
    if (whatsapp.replace(/\D/g, '').length < 7) e.whatsapp = 'Escribe tu número de WhatsApp.';
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep(2);
      trackEvent('form_step_2');
    }
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Errors = {};
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Revisa el correo.';
    if (message.trim().length < 5) e.message = 'Cuéntanos un poco más.';
    if (!(consent.privacy && consent.terms && consent.adult)) e.consents = 'Marca las tres autorizaciones obligatorias.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setState('sending');
    setErr('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          interest,
          destination,
          travelDate: date,
          adults,
          kids,
          budget,
          message: message.trim(),
          quote,
          terms: consent.terms,
          privacy: consent.privacy,
          adult: consent.adult,
          marketing: consent.marketing,
          attribution: getAttribution(),
          page: location.pathname,
          website: hp.current?.value || '',
          elapsed: Date.now() - started.current,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        trackEvent('generate_lead', { interest, with_quote: Boolean(quote) });
        try {
          localStorage.removeItem(DRAFT);
        } catch {
          /* ignorar */
        }
        router.push(`/gracias?o=formulario&ref=${encodeURIComponent(j.reference || '')}`);
        return;
      }
      setErr(j.error || 'No pudimos enviar tu solicitud. Escríbenos por WhatsApp.');
      setState('error');
    } catch {
      setErr('No pudimos enviar tu solicitud. Escríbenos por WhatsApp.');
      setState('error');
    }
  }

  function viaWhatsApp() {
    const text = `¡Hola! Soy ${name || ''}. ${interest ? `Me interesa: ${interest}. ` : ''}${message}`.trim();
    window.open(waLink(settings, text), '_blank', 'noopener,noreferrer');
  }

  return (
    <form onSubmit={onSubmit} className="form" noValidate>
      <ol className="form-steps" aria-label="Pasos del formulario">
        <li className={step === 1 ? 'on' : 'done'}>1 · Tus datos</li>
        <li className={step === 2 ? 'on' : ''}>2 · Tu viaje</li>
      </ol>

      {step === 1 && (
        <div className="form-step" key="s1">
          <div className="row">
            <label>
              Nombre y apellido *
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" aria-invalid={Boolean(errors.name)} />
              {errors.name && <span className="field-err">{errors.name}</span>}
            </label>
            <label>
              WhatsApp *
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" inputMode="tel" maxLength={25} autoComplete="tel" placeholder="321 000 0000" aria-invalid={Boolean(errors.whatsapp)} />
              {errors.whatsapp && <span className="field-err">{errors.whatsapp}</span>}
            </label>
          </div>
          <label>
            ¿Qué te interesa?
            <select value={interest} onChange={(e) => setInterest(e.target.value)}>
              <option value="">Elige una opción…</option>
              {interests.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="button" onClick={next}>
              Continuar
            </button>
            <button className="btn btn-wa" type="button" onClick={viaWhatsApp}>
              Escribir por WhatsApp
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-step" key="s2">
          {quote && <p className="form-note">Incluimos la cotización que armaste. Puedes editar el mensaje si quieres.</p>}
          <label>
            Correo electrónico (opcional)
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={160} autoComplete="email" aria-invalid={Boolean(errors.email)} />
            {errors.email && <span className="field-err">{errors.email}</span>}
          </label>
          <div className="row">
            <label>
              Destino o idea
              <input value={destination} onChange={(e) => setDestination(e.target.value)} maxLength={120} placeholder="Ej. Cartagena" />
            </label>
            <label>
              Fecha aproximada
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          </div>
          <div className="row">
            <Stepper label="Adultos" value={adults} onChange={setAdults} />
            <Stepper label="Niños" value={kids} onChange={setKids} />
          </div>
          <label>
            Presupuesto aproximado
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Prefiero decirlo después</option>
              <option value="hasta-500000">Hasta $500.000 COP por persona</option>
              <option value="500000-1500000">$500.000 – $1.500.000 COP por persona</option>
              <option value="1500000-5000000">$1.500.000 – $5.000.000 COP por persona</option>
              <option value="mas-5000000">Más de $5.000.000 COP por persona</option>
            </select>
          </label>
          <label>
            Mensaje *
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={2000} placeholder="Cuéntanos a dónde quieres viajar, fechas aproximadas y cuántas personas son." aria-invalid={Boolean(errors.message)} />
            {errors.message && <span className="field-err">{errors.message}</span>}
          </label>

          {/* campo trampa para bots: las personas no lo ven */}
          <div className="hp" aria-hidden="true">
            <label>
              No llenar
              <input ref={hp} name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <Consents v={consent} onChange={setConsent} error={Boolean(errors.consents)} />
          {errors.consents && <p className="field-err">{errors.consents}</p>}

          <div className="form-actions">
            <button className="btn btn-ghost-light" type="button" onClick={() => setStep(1)}>
              Atrás
            </button>
            <button className="btn btn-primary" type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </div>
          <p className="form-trust">Te respondemos lo antes posible en horario de atención. No compartimos tus datos.</p>
          {err && (
            <p role="alert" className="form-err">
              {err}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
