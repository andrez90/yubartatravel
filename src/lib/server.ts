import { createHash } from 'node:crypto';

export const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

/** Inserta filas en una tabla de Supabase con la clave de servicio (solo en el servidor). */
export async function sbInsert(table: string, rows: unknown) {
  if (!SB_URL || !SB_SERVICE) return { ok: false, status: 503 };
  const res = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SB_SERVICE,
      Authorization: `Bearer ${SB_SERVICE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
    signal: AbortSignal.timeout(5000),
  });
  return { ok: res.ok, status: res.status };
}

export const CHECKBOX_TEXT = {
  terms: 'Acepto los términos y condiciones.',
  privacy: 'Autorizo el tratamiento de mis datos personales para que me contacten con una cotización o reserva, según la política de privacidad.',
  marketing: '(Opcional) Quiero recibir información y ofertas de viajes.',
  adult: 'Confirmo que soy mayor de 18 años.',
};

/** Lee filas con la clave de servicio (solo servidor). `query` es el filtro de PostgREST, ej. "reference=eq.YT-ABC". */
export async function sbSelect<T = Record<string, unknown>>(table: string, query: string): Promise<T[] | null> {
  if (!SB_URL || !SB_SERVICE) return null;
  const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  return res.ok ? ((await res.json()) as T[]) : null;
}

export async function sbPatch(table: string, query: string, values: unknown) {
  if (!SB_URL || !SB_SERVICE) return { ok: false, status: 503 };
  const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(values),
    signal: AbortSignal.timeout(5000),
  });
  return { ok: res.ok, status: res.status };
}

/** Código corto legible para que el cliente identifique su solicitud (sin 0/O/1/I para no confundir). */
export function newReference() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = '';
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  for (const x of b) r += abc[x % abc.length];
  return `YT-${r}`;
}
