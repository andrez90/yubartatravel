import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingFlow from '@/components/BookingFlow';
import Shell from '@/components/Shell';
import { getContent } from '@/lib/content';
import { planId, planPriceText, toCatalog } from '@/lib/pricing';
import { lines } from '@/lib/utils';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const c = await getContent();
  return c.categories.items.flatMap((k) => k.plans.filter((p) => p.active).map((p) => ({ cat: k.slug, plan: planId(p) })));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string; plan: string }> }): Promise<Metadata> {
  const { cat, plan } = await params;
  const c = await getContent();
  const p = c.categories.items.find((k) => k.slug === cat)?.plans.find((x) => planId(x) === plan);
  return { title: p ? `Reservar ${p.title} | ${c.settings.name}` : 'Reservar', robots: { index: false, follow: true } };
}

export default async function Reservar({ params }: { params: Promise<{ cat: string; plan: string }> }) {
  const { cat, plan } = await params;
  const c = await getContent();
  const k = c.categories.items.find((x) => x.slug === cat);
  const p = k?.plans.find((x) => x.active && planId(x) === plan);
  if (!k || !p) notFound();
  const methods = c.payments.methods.filter((m) => m.enabled).map((m) => ({ id: m.id, kind: m.kind, label: m.label, help: m.help }));
  const inc = lines(p.includes);

  return (
    <Shell c={c}>
      <section className="page-hero slim">
        <div className="container">
          <nav className="crumbs" aria-label="Migas de pan">
            <Link href="/">Inicio</Link> <span aria-hidden="true">/</span> <Link href={`/planes/${k.slug}`}>{k.name}</Link> <span aria-hidden="true">/</span> <span aria-current="page">Reservar</span>
          </nav>
          <h1>Reservar: {p.title}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container book">
          <BookingFlow catalog={toCatalog(c)} categorySlug={k.slug} planId={planId(p)} planTitle={p.title} methods={methods} terms={c.payments.terms} settings={c.settings} />
          <aside className="book-plan">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={p.title} width={400} height={400} />
            <div>
              <h2>{p.title}</h2>
              <p className="plan-price">{planPriceText(p)}</p>
              {(p.duration || p.dates) && <p className="muted">{[p.duration, p.dates].filter(Boolean).join(' · ')}</p>}
              {p.description && <p>{p.description}</p>}
              {inc.length > 0 && (
                <ul className="tick">
                  {inc.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              )}
              <p className="muted small">
                Pagos: {c.payments.methods.filter((m) => m.enabled).map((m) => m.label).join(' · ') || 'a coordinar con un asesor'}.
                {c.settings.rnt && <> RNT {c.settings.rnt}.</>}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </Shell>
  );
}
