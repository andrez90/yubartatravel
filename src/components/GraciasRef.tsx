'use client';

import { useSearchParams } from 'next/navigation';
import type { Settings } from '@/lib/types';
import { waLink } from '@/lib/utils';

export default function GraciasRef({ settings }: { settings: Settings }) {
  const q = useSearchParams();
  const ref = (q.get('ref') || '').toUpperCase();
  const pago = q.get('o') === 'pago';
  const ok = /^YT-[A-Z0-9]{6}$/.test(ref);
  return (
    <>
      <h1>{pago ? '¡Gracias! Estamos validando tu pago' : '¡Gracias! Recibimos tu solicitud'}</h1>
      {ok && (
        <p className="gracias-ref">
          Tu código: <b>{ref}</b>
        </p>
      )}
      <p>{pago ? 'Apenas lo confirmemos te escribimos por WhatsApp y correo.' : 'Te responderemos lo antes posible. Si es urgente, escríbenos directo por WhatsApp.'}</p>
      <p>
        <a className="btn btn-wa" href={waLink(settings, ok ? `¡Hola! Hice la solicitud ${ref}.` : undefined)} target="_blank" rel="noopener noreferrer">
          Abrir WhatsApp
        </a>
      </p>
    </>
  );
}
