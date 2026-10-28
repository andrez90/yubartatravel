import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SiteContent } from '@/lib/types';
import { waLink } from '@/lib/utils';
import CardFx from './CardFx';
import CookieBanner, { CookiePrefsButton } from './CookieBanner';
import Header from './Header';

export default function Shell({ c, overlay, children }: { c: SiteContent; overlay?: boolean; children: ReactNode }) {
  const s = c.settings;
  const links = [
    ...c.categories.items.map((k) => ({ href: `/planes/${k.slug}`, label: k.name })),
    { href: '/#cotizador', label: 'Cotizador' },
    { href: '/#nosotros', label: 'Nosotros' },
    { href: '/#contacto', label: 'Contacto' },
  ];
  const wa = waLink(s);
  return (
    <>
      <a className="skip" href="#main">
        Saltar al contenido
      </a>
      <Header settings={s} links={links} overlay={overlay} />
      <main id="main">{children}</main>

      <footer className="site-footer">
        <div className="container foot-grid">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.logo && <img className="foot-logo" src={s.logo} alt={s.name} width={168} height={55} loading="lazy" />}
            <p className="muted-inv">{s.slogan}. {s.tagline} desde {s.city}.</p>
            <p className="social">
              {s.instagram && (
                <a href={s.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              )}
              {s.facebook && (
                <a href={s.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              )}
              {s.tiktok && (
                <a href={s.tiktok} target="_blank" rel="noopener noreferrer">
                  TikTok
                </a>
              )}
            </p>
          </div>
          <div>
            <h2 className="foot-h">Planes</h2>
            <ul>
              {c.categories.items.map((k) => (
                <li key={k.slug}>
                  <Link href={`/planes/${k.slug}`}>{k.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="foot-h">Contacto</h2>
            <ul>
              <li>{s.address}</li>
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  WhatsApp {s.phoneDisplay}
                </a>
              </li>
              {s.email && (
                <li>
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </li>
              )}
              {s.rnt && <li>RNT: {s.rnt}</li>}
            </ul>
          </div>
          <div>
            <h2 className="foot-h">Legal</h2>
            <ul>
              {c.legal.items.map((d) => (
                <li key={d.slug}>
                  <Link href={`/legal/${d.slug}`}>{d.title.split(' y ')[0]}</Link>
                </li>
              ))}
              <li>
                <CookiePrefsButton />
              </li>
            </ul>
          </div>
        </div>
        <div className="container foot-end">
          <span>
            © {new Date().getFullYear()} {s.name}. Todos los derechos reservados.
          </span>
          <span>
            Sitio web por{' '}
            <a href="https://baltiumtech.com" target="_blank" rel="noopener">
              Baltium Tech
            </a>
          </span>
        </div>
      </footer>

      <a className="wa-float" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
          <path
            fill="#fff"
            d="M16 3C9.4 3 4 8.3 4 14.9c0 2.3.7 4.5 1.9 6.3L4 28l7-1.8c1.7.9 3.6 1.4 5.6 1.4 6.6 0 12-5.3 12-11.9S22.600 3 16 3zm0 21.700c-1.800 0-3.500-.5-5-1.400l-.4-.2-4.100 1.100 1.100-4-.3-.4a9.700 9.700 0 0 1-1.500-5.200c0-5.400 4.400-9.700 9.900-9.700s9.900 4.300 9.900 9.700-4.400 10.100-9.600 10.100zm5.400-7.300c-.3-.1-1.800-.9-2-.9-.3-.1-.5-.1-.7.100-.2.300-.8.900-.9 1.100-.2.200-.3.200-.6.100-1.800-.9-3-1.600-4.100-3.600-.3-.5.300-.5.900-1.600.1-.2.100-.4 0-.5l-.9-2.100c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1 1-1 2.500s1.100 2.900 1.200 3.100c.2.200 2.100 3.300 5.200 4.500 1.900.8 2.700.9 3.600.7.600-.1 1.800-.7 2-1.400.3-.7.300-1.300.2-1.400-.1-.1-.3-.2-.6-.4z"
          />
        </svg>
      </a>
      <CardFx />
      <CookieBanner />
    </>
  );
}
