import { NextResponse } from 'next/server';
import { z } from 'zod';
import { clientIp, rateLimit } from '@/lib/utils';
import { sbInsert, sha256 } from '@/lib/server';

export const runtime = 'nodejs';

const schema = z.object({
  type: z.enum(['cookies']),
  decision: z.enum(['acepto', 'rechazo', 'revoco']),
  holder: z.string().max(80),
  page: z.string().max(200),
  text: z.string().max(200),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`consent:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  const raw = await req.text();
  if (raw.length > 2000) return NextResponse.json({ error: 'Muy largo' }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }
  const p = schema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  const d = p.data;
  await sbInsert('consent_logs', {
    doc_type: 'cookies',
    doc_version: '0.1-borrador',
    doc_hash: sha256(d.text),
    decision: d.decision,
    holder: d.holder,
    ip,
    user_agent: (req.headers.get('user-agent') || '').slice(0, 300),
    page: d.page,
    checkbox_text: d.text,
  }).catch(() => null);
  return NextResponse.json({ ok: true });
}
