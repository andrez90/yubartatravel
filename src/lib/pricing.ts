import type { SiteContent } from './types';

/** Lo mínimo del catálogo que necesita el cálculo (así el navegador recibe datos livianos). */
export type CatalogPlan = { active: boolean; title: string; amount?: number };
export type CatalogCategory = { slug: string; name: string; fromAmount?: number; plans: CatalogPlan[] };
export type Catalog = {
  quote: SiteContent['quote'];
  payments: Pick<SiteContent['payments'], 'depositPercent'>;
  categories: { items: CatalogCategory[] };
};

export const formatCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO') + ' COP';

export const slugify = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

export const planId = (p: { title: string }) => slugify(p.title);

/** Texto de precio que ve el visitante. Nunca inventa un valor: sin dato dice «Cotiza por WhatsApp». */
export function planPriceText(p: { price?: string; amount?: number }) {
  if (p.price && p.price.trim()) return p.price.trim();
  if (p.amount && p.amount > 0) return `Desde ${formatCOP(p.amount)} por persona`;
  return 'Cotiza por WhatsApp';
}

export type QuoteInput = {
  categorySlug: string;
  planId?: string;
  adults: number;
  kids: number;
  extras: string[]; // ids de extras elegidos
};

export type QuoteLine = { id: string; label: string; qty: number; amount: number; pending: boolean };
export type QuoteResult = {
  lines: QuoteLine[];
  total: number; // suma de lo que ya tiene precio
  hasPending: boolean; // hay algo sin precio definido: lo confirma un asesor
  deposit: number;
  travelers: number;
  category?: CatalogCategory;
  plan?: CatalogPlan;
};

/** El cálculo vive en un solo lugar y lo usan el navegador (vista previa) y el servidor (valor que se guarda). */
export function calcQuote(c: Catalog, i: QuoteInput): QuoteResult {
  const category = c.categories.items.find((k) => k.slug === i.categorySlug);
  const plan = category?.plans.find((p) => p.active && planId(p) === i.planId);
  const adults = Math.max(0, Math.min(50, Math.floor(i.adults || 0)));
  const kids = Math.max(0, Math.min(50, Math.floor(i.kids || 0)));
  const travelers = adults + kids;
  const kidsK = Math.max(0, Math.min(100, c.quote.kidsPercent ?? 100)) / 100;

  const unit = plan?.amount && plan.amount > 0 ? plan.amount : category?.fromAmount && category.fromAmount > 0 ? category.fromAmount : 0;
  const lines: QuoteLine[] = [];
  const name = plan ? plan.title : category ? category.name : 'Plan';

  if (adults > 0) lines.push({ id: 'adultos', label: `${name} · adultos`, qty: adults, amount: unit * adults, pending: unit === 0 });
  if (kids > 0) lines.push({ id: 'ninos', label: `${name} · niños`, qty: kids, amount: unit * kids * kidsK, pending: unit === 0 });

  for (const id of i.extras) {
    const e = c.quote.extras.find((x) => x.id === id && x.active);
    if (!e) continue;
    const qty = e.mode === 'persona' ? Math.max(1, travelers) : 1;
    lines.push({ id: e.id, label: e.label, qty, amount: e.price > 0 ? e.price * qty : 0, pending: !(e.price > 0) });
  }

  const total = lines.reduce((a, l) => a + l.amount, 0);
  const hasPending = lines.some((l) => l.pending) || lines.length === 0;
  const pct = Math.max(0, Math.min(100, c.payments.depositPercent || 0)) / 100;
  return { lines, total, hasPending, deposit: Math.round(total * pct), travelers, category, plan };
}

export function quoteToText(r: QuoteResult, extra: { date?: string; destination?: string } = {}) {
  const out = ['Cotización armada en el sitio:'];
  for (const l of r.lines) out.push(`- ${l.label}${l.qty > 1 ? ` x${l.qty}` : ''}: ${l.pending ? 'por confirmar' : formatCOP(l.amount)}`);
  if (extra.destination) out.push(`Destino: ${extra.destination}`);
  if (extra.date) out.push(`Fecha aproximada: ${extra.date}`);
  out.push(r.total > 0 ? `Total estimado${r.hasPending ? ' (parcial)' : ''}: ${formatCOP(r.total)}` : 'Total: por confirmar con un asesor');
  return out.join('\n');
}

/** Versión liviana del catálogo para mandar al navegador. */
export function toCatalog(c: Pick<SiteContent, 'quote' | 'payments' | 'categories'>): Catalog {
  return {
    quote: c.quote,
    payments: { depositPercent: c.payments.depositPercent },
    categories: {
      items: c.categories.items.map((k) => ({
        slug: k.slug,
        name: k.name,
        fromAmount: k.fromAmount,
        plans: k.plans.filter((p) => p.active).map((p) => ({ active: true, title: p.title, amount: p.amount })),
      })),
    },
  };
}
