import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Shell from '@/components/Shell';
import { Contact, PlanCard } from '@/components/Sections';
import { getContent } from '@/lib/content';
import { absUrl, waLink } from '@/lib/utils';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const c = await getContent();
  return c.categories.items.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getContent();
  const k = c.categories.items.find((x) => x.slug === slug);
  if (!k) return {};
  return {
    title: k.seoTitle || `${k.name} | ${c.settings.name}`,
    description: k.seoDescription || k.intro,
    alternates: { canonical: `/planes/${k.slug}` },
    openGraph: { title: k.seoTitle || k.name, description: k.seoDescription || k.intro, url: `/planes/${k.slug}`, images: k.image ? [{ url: k.image }] : undefined },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getContent();
  const k = c.categories.items.find((x) => x.slug === slug);
  if (!k) notFound();
  const s = c.settings;
  const plans = k.plans.filter((p) => p.active).sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: absUrl(s.siteUrl, '/') },
      { '@type': 'ListItem', position: 2, name: k.name, item: absUrl(s.siteUrl, `/planes/${k.slug}`) },
    ],
  };

  return (
    <Shell c={c}>
      <JsonLd data={crumbs} />
      <section className="page-hero" style={k.image ? { backgroundImage: `linear-gradient(180deg,rgba(4,53,55,.86),rgba(5,114,114,.62)),url("${encodeURI(k.image)}")` } : undefined}>
        <div className="container">
          <nav className="crumbs" aria-label="Migas de pan">
            <Link href="/">Inicio</Link> <span aria-hidden="true">/</span> <span aria-current="page">{k.name}</span>
          </nav>
          <h1>{k.name}</h1>
          <p className="lead">{k.intro}</p>
          <a className="btn btn-accent" href={waLink(s, `¡Hola! Quiero información de ${k.name}.`)} target="_blank" rel="noopener noreferrer">
            Cotizar por WhatsApp
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {plans.length > 0 ? (
            <div className="grid grid-plans">
              {plans.map((p, i) => (
                <PlanCard key={i} p={p} s={s} catSlug={k.slug} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h2>Estamos armando los próximos planes</h2>
              <p>Escríbenos por WhatsApp y te contamos las opciones disponibles para {k.name.toLowerCase()}.</p>
              <a className="btn btn-primary" href={waLink(s, `¡Hola! Quiero información de ${k.name}.`)} target="_blank" rel="noopener noreferrer">
                Preguntar por WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>
      <Contact s={s} interests={[...c.categories.items.map((x) => x.name), 'Tiquetes', 'Hoteles', 'Seguro de viaje', 'Otro']} />
    </Shell>
  );
}
