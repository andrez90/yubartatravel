import { NextResponse } from 'next/server';
import { z } from 'zod';
import { attributionSchema, consentsSchema, quoteInputSchema, saveLead } from '@/lib/leads';
import { clientIp, rateLimit } from '@/lib/utils';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(7).max(25),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  interest: z.string().trim().max(80).optional(),
  destination: z.string().trim().max(120).optional(),
  travelDate: z.string().trim().max(60).optional(),
  adults: z.number().int().min(0).max(50).optional(),
  kids: z.number().int().min(0).max(50).optional(),
  budget: z.string().trim().max(60).optional(),
  message: z.string().trim().min(5).max(2000),
  quote: quoteInputSchema.optional(),
  attribution: attributionSchema,
  page: z.string().max(200).optional(),
  website: z.string().max(200).optional().nullable(), // honeypot
  elapsed: z.number().optional(),
  ...consentsSchema,
});

const fail = (error: string, status: number, headers?: Record<string, string>) => NextResponse.json({ error }, { status, headers });

export async function POST(req: Request) {
  if (process.env.CONTACT_PAUSED === '1') return fail('El formulario está en mantenimiento. Escríbenos por WhatsApp.', 503);

  const ip = clientIp(req);
  const rl = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.ok) return fail('Demasiados envíos. Intenta de nuevo en un minuto.', 429, { 'Retry-After': String(rl.retryAfter) });

  const raw = await req.text();
  if (raw.length > 12_000) return fail('Mensaje demasiado largo.', 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('Solicitud inválida.', 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Revisa los campos y acepta las autorizaciones obligatorias.', 400);
  const d = parsed.data;

  // Bots: campo trampa lleno o formulario enviado en menos de 2,5 segundos. Se responde "ok" sin guardar.
  if (d.website || (d.elapsed ?? 99999) < 2500) return NextResponse.json({ ok: true, reference: 'YT-OK' });

  const r = await saveLead({
    kind: d.quote ? 'cotizacion' : 'contacto',
    name: d.name,
    whatsapp: d.whatsapp,
    email: d.email || undefined,
    interest: d.interest,
    destination: d.destination,
    travelDate: d.travelDate,
    adults: d.adults,
    kids: d.kids,
    budget: d.budget,
    message: d.message,
    quote: d.quote,
    marketing: Boolean(d.marketing),
    attribution: d.attribution,
    page: d.page,
    ip,
    ua: (req.headers.get('user-agent') || '').slice(0, 300),
  });
  if (!r.ok) return fail('No pudimos guardar tu solicitud. Escríbenos por WhatsApp.', 503);
  return NextResponse.json({ ok: true, reference: r.reference });
}
