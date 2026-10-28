import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import { getContent } from '@/lib/content';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const c = await getContent();
  return c.legal.items.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getContent();
  const d = c.legal.items.find((x) => x.slug === slug);
  return d ? { title: `${d.title} | ${c.settings.name}`, alternates: { canonical: `/legal/${d.slug}` } } : {};
}

/** Formato simple: "## Título" = subtítulo, "- " = viñeta, línea en blanco = párrafo nuevo. */
function Body({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const ls = b.split('\n');
        if (ls[0].startsWith('## ')) {
          const rest = ls.slice(1);
          return (
            <section key={i}>
              <h2>{ls[0].slice(3)}</h2>
              {rest.length > 0 && <Body text={rest.join('\n')} />}
            </section>
          );
        }
        if (ls.every((l) => l.startsWith('- '))) {
          return (
            <ul key={i}>
              {ls.map((l, j) => (
                <li key={j}>{l.slice(2)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{b}</p>;
      })}
    </>
  );
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getContent();
  const d = c.legal.items.find((x) => x.slug === slug);
  if (!d) notFound();
  return (
    <Shell c={c}>
      <section className="section">
        <div className="container narrow legal">
          <h1>{d.title}</h1>
          <p className="muted">
            Versión {d.version} · Actualizado el {d.updated}
          </p>
          {/* Se reparte por bloques, respetando los títulos "## " */}
          {d.body.split(/\n(?=## )/).map((part, i) => (
            <Body key={i} text={part} />
          ))}
        </div>
      </section>
    </Shell>
  );
}
