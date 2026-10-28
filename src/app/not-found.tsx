import Link from 'next/link';
import Shell from '@/components/Shell';
import { getContent } from '@/lib/content';
import { waLink } from '@/lib/utils';

export default async function NotFound() {
  const c = await getContent();
  return (
    <Shell c={c}>
      <section className="section">
        <div className="container narrow center">
          <h1>Esta página no existe</h1>
          <p>Puede que el enlace haya cambiado. Mira nuestros planes o escríbenos y te ayudamos.</p>
          <ul className="inline-links">
            {c.categories.items.map((k) => (
              <li key={k.slug}>
                <Link href={`/planes/${k.slug}`}>{k.name}</Link>
              </li>
            ))}
          </ul>
          <p>
            <a className="btn btn-wa" href={waLink(c.settings)} target="_blank" rel="noopener noreferrer">
              Escribir por WhatsApp
            </a>
          </p>
        </div>
      </section>
    </Shell>
  );
}
