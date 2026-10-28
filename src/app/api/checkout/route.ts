import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getContent } from '@/lib/content';
import { wompiCheckoutUrl } from '@/lib/payments';
import { sbPatch, sbSelect } from '@/lib/server';
import { clientIp, rateLimit, waLink } from '@/lib/utils';

export const runtime = 'nodejs';

const schema = z.object({ reference: z.string().regex(/^YT-[A-Z0-9]{6}$/), method: z.string().max(40) });
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

type Row = { reference: string; name: string; total: number; deposit: number; plan_title: string | null; payment_status: string };

/** Devuelve a dónde mandar al cliente para pagar según el medio elegido (los medios se activan en el panel). */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`checkout:${ip}`, 10, 60_000).ok) return fail('Demasiados intentos. Espera un minuto.', 429);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('Solicitud inválida.', 400);

  const c = await getContent();
  const m = c.payments.methods.find((x) => x.id === parsed.data.method && x.enabled);
  if (!m) return fail('Ese medio de pago no está disponible.', 400);

  const rows = await sbSelect<Row>('leads', `reference=eq.${parsed.data.reference}&select=reference,name,total,deposit,plan_title,payment_status&limit=1`);
  const lead = rows?.[0];
  if (!lead) return fail('No encontramos tu reserva. Escríbenos por WhatsApp.', 404);
  if (lead.payment_status === 'pagado') return fail('Esta reserva ya figura como pagada.', 409);

  const amount = lead.deposit > 0 ? lead.deposit : lead.total;
  const note = (u?: string) => sbPatch('leads', `reference=eq.${lead.reference}`, { payment_method: m.id, status: 'reservado' }).then(() => u);

  if (m.kind === 'whatsapp') {
    const url = waLink(c.settings, `¡Hola! Hice la reserva ${lead.reference}${lead.plan_title ? ` (${lead.plan_title})` : ''}. Quiero coordinar el pago.`);
    await note();
    return NextResponse.json({ kind: 'redirect', url });
  }
  if (m.kind === 'transfer') {
    await note();
    return NextResponse.json({ kind: 'details', details: m.details || 'Un asesor te enviará los datos de la cuenta por WhatsApp.', amount });
  }
  if (m.kind === 'link') {
    if (!m.link) return fail('Este medio aún no está configurado.', 503);
    await note();
    return NextResponse.json({ kind: 'redirect', url: m.link });
  }
  if (m.kind === 'wompi') {
    if (!(amount > 0)) return fail('El valor de esta reserva está por confirmar. Un asesor te lo informa por WhatsApp.', 409);
    const url = wompiCheckoutUrl({ reference: lead.reference, amountCop: amount, redirectUrl: `${c.settings.siteUrl.replace(/\/$/, '')}/gracias?ref=${lead.reference}&o=pago` });
    if (!url) return fail('El pago en línea aún no está configurado.', 503);
    await note();
    return NextResponse.json({ kind: 'redirect', url });
  }
  return fail('Medio de pago no soportado.', 400);
}
