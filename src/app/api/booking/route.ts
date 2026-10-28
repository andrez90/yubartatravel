import { NextResponse } from 'next/server';
import { z } from 'zod';
import { attributionSchema, consentsSchema, saveLead } from '@/lib/leads';
import { clientIp, rateLimit } from '@/lib/utils';
import { getContent } from '@/lib/content';
import { planId } from '@/lib/pricing';

export const runtime = 'nodejs';

const schema = z.object({
  categorySlug: z.string().max(80),
  planId: z.string().max(80),
  name: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(7).max(25),
  email: z.string().trim().email().max(160),
  adults: z.number().int().min(1).max(50),
  kids: z.number().int().min(0).max(50),
  travelDate: z.string().trim().max(60).optional(),
  message: z.string().trim().max(1500).optional(),
  attribution: attributionSchema,
  website: z.string().max(200).optional().nullable(),
  elapsed: z.number().optional(),
  ...consentsSchema,
});

const fail = (error: string, status: number, headers?: Record<string, string>) => NextResponse.json({ error }, { status, headers });

/** Crea una reserva pendiente de pago. El valor se calcula aquí con el precio que hay en el panel, nunca con lo que mande el navegador. */
export async function POST(req: Request) {
  if (process.env.CONTACT_PAUSED === '1') return fail('Las reservas están en mantenimiento. Escríbenos por WhatsApp.', 503);
  const ip = clientIp(req);
  const rl = rateLimit(`booking:${ip}`, 4, 60_000);
  if (!rl.ok) return fail('Demasiados intentos. Espera un minuto.', 429, { 'Retry-After': String(rl.retryAfter) });

  const raw = await req.text();
  if (raw.length > 10_000) return fail('Solicitud demasiado larga.', 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('Solicitud inválida.', 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Revisa los campos y acepta las autorizaciones obligatorias.', 400);
  const d = parsed.data;
  if (d.website || (d.elapsed ?? 99999) < 2500) return NextResponse.json({ ok: true, reference: 'YT-OK', total: 0, deposit: 0 });

  const c = await getContent();
  const cat = c.categories.items.find((k) => k.slug === d.categorySlug);
  const plan = cat?.plans.find((p) => p.active && planId(p) === d.planId);
  if (!cat || !plan) return fail('Ese plan ya no está disponible. Escríbenos por WhatsApp.', 404);

  const r = await saveLead({
    kind: 'reserva',
    name: d.name,
    whatsapp: d.whatsapp,
    email: d.email,
    interest: cat.name,
    travelDate: d.travelDate,
    adults: d.adults,
    kids: d.kids,
    message: d.message,
    quote: { categorySlug: d.categorySlug, planId: d.planId, adults: d.adults, kids: d.kids, extras: [] },
    marketing: Boolean(d.marketing),
    attribution: d.attribution,
    page: `/reservar/${d.categorySlug}/${d.planId}`,
    ip,
    ua: (req.headers.get('user-agent') || '').slice(0, 300),
  });
  if (!r.ok) return fail('No pudimos guardar tu reserva. Escríbenos por WhatsApp.', 503);
  return NextResponse.json({ ok: true, reference: r.reference, total: r.total, deposit: r.deposit, hasPending: r.hasPending });
}
