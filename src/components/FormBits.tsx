'use client';

import Icon from './Icons';

export type ConsentState = { terms: boolean; privacy: boolean; adult: boolean; marketing: boolean };
export const NO_CONSENT: ConsentState = { terms: false, privacy: false, adult: false, marketing: false };

/** Autorizaciones separadas y sin premarcar (Ley 1581 y estatuto del consumidor); el texto exacto queda registrado en el servidor. */
export function Consents({ v, onChange, error }: { v: ConsentState; onChange: (v: ConsentState) => void; error?: boolean }) {
  const set = (k: keyof ConsentState) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...v, [k]: e.target.checked });
  return (
    <fieldset className={'checks' + (error ? ' has-err' : '')}>
      <legend className="sr-only">Autorizaciones</legend>
      <label className="check">
        <input type="checkbox" checked={v.privacy} onChange={set('privacy')} /> <span>Autorizo el tratamiento de mis datos personales para que me contacten con una cotización o reserva, según la <a href="/legal/politica-de-privacidad" target="_blank">política de privacidad</a>. *</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={v.terms} onChange={set('terms')} /> <span>Acepto los <a href="/legal/terminos-y-condiciones" target="_blank">términos y condiciones</a>. *</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={v.adult} onChange={set('adult')} /> <span>Confirmo que soy mayor de 18 años. *</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={v.marketing} onChange={set('marketing')} /> <span>(Opcional) Quiero recibir información y ofertas de viajes.</span>
      </label>
    </fieldset>
  );
}

export function Stepper({ label, value, min = 0, max = 50, onChange, hint }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void; hint?: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <div>
        <span className="stepper-l">{label}</span>
        {hint && <small>{hint}</small>}
      </div>
      <div className="stepper-c">
        <button type="button" aria-label={`Quitar uno: ${label}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
          <Icon name="minus" size={16} />
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`Agregar uno: ${label}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  );
}
