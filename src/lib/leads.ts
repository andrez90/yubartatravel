import { z } from 'zod';
import { getContent } from './content';
import { calcQuote } from './pricing';
import { CHECKBOX_TEXT, newReference, sbInsert, sha256 } from './server';

export const attributionSchema = z
  .object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
    referrer: z.string().max(300).optional(),
    landing: z.string().max(200).optional(),
  })
  .optional();

export const quoteInputSchema = z.object({
  categorySlug: z.string().max(80),
  planId: z.string().max(80).optional(),
  adults: z.number().int().min(0).max(50),
  kids: z.number().int().min(0).max(50),
  extras: z.array(z.string().max(60)).max(30),
});

export const consentsSchema = {
  terms: z.literal(true),
  privacy: z.literal(true),
  adult: z.literal(true),
  marketing: z.boolean().optional(),
};

export type NewLead = {
  kind: 'contacto' | 'cotizacion' | 'reserva';
  name: string;
  whatsapp?: string;
  email?: string;
  interest?: string;
  destination?: string;
  travelDate?: string;
  adults?: number;
  kids?: number;
  budget?: string;
  message?: string;
  quote?: z.infer<typeof quoteInputSchema>;
  marketing: boolean;
  attribution?: z.infer<typeof attributionSchema>;
  page?: string;
  ip: string;
  ua: string;
};

/** Guarda la solicitud (recalculando el valor en el servidor) y deja constancia de los consentimientos. */
export async function saveLead(l: NewLead) {
  const c = await getContent();
  const reference = newReference();
  let quote: unknown = null;
  let total = 0;
  let deposit = 0;
  let planTitle: string | undefined;
  let interest = l.interest;
  let adults = l.adults;
  let kids = l.kids;

  if (l.quote) {
    const r = calcQuote(c, l.quote);
    total = r.total;
    deposit = r.deposit;
    planTitle = r.plan?.title;
    interest = interest || r.category?.name;
    adults = l.quote.adults;
    kids = l.quote.kids;
    quote = { input: l.quote, lines: r.lines, total: r.total, hasPending: r.hasPending, deposit: r.deposit };
  }

  const res = await sbInsert('leads', {
    kind: l.kind,
    reference,
    name: l.name,
    whatsapp: l.whatsapp || null,
    email: l.email || null,
    interest: interest || null,
    plan_title: planTitle || null,
    destination: l.destination || null,
    travel_date: l.travelDate || null,
    adults: adults ?? null,
    kids: kids ?? null,
    budget: l.budget || null,
    message: l.message || null,
    quote,
    total,
    deposit,
    attribution: l.attribution || null,
    page: l.page || null,
    ip: l.ip,
  });
  if (!res.ok) return { ok: false as const };

  const holder = l.email || l.whatsapp || l.name;
  const mk = (type: string, key: keyof typeof CHECKBOX_TEXT, accepted: boolean) => ({
    doc_type: type,
    doc_version: '0.1-borrador',
    doc_hash: sha256(CHECKBOX_TEXT[key]),
    decision: accepted ? 'acepto' : 'rechazo',
    holder,
    ip: l.ip,
    user_agent: l.ua,
    page: l.page || '/',
    checkbox_text: CHECKBOX_TEXT[key],
  });
  await sbInsert('consent_logs', [mk('terminos', 'terms', true), mk('privacidad', 'privacy', true), mk('mayoria_de_edad', 'adult', true), mk('marketing', 'marketing', l.marketing)]).catch(() => null);

  return { ok: true as const, reference, total, deposit, hasPending: Boolean((quote as { hasPending?: boolean } | null)?.hasPending) };
}
