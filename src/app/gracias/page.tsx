import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import GraciasRef from '@/components/GraciasRef';
import Shell from '@/components/Shell';
import { getContent } from '@/lib/content';

export const metadata: Metadata = { title: 'Gracias | Yubarta Travels', robots: { index: false, follow: false } };

export default async function Gracias() {
  const c = await getContent();
  return (
    <Shell c={c}>
      <section className="section">
        <div className="container narrow center gracias">
          <Suspense fallback={<h1>¡Gracias!</h1>}>
            <GraciasRef settings={c.settings} />
          </Suspense>
          <p>
            <Link className="btn btn-primary" href="/">
              Volver al inicio
            </Link>
          </p>
        </div>
      </section>
    </Shell>
  );
}
