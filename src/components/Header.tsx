'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Settings } from '@/lib/types';

export default function Header({
  settings,
  links,
  overlay,
}: {
  settings: Settings;
  links: { href: string; label: string }[];
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={'site-header' + (overlay && !scrolled && !open ? ' overlay' : ' solid')}>
      <div className="container header-in">
        <Link href="/" className="brand" aria-label={`${settings.name}, inicio`} onClick={() => setOpen(false)}>
          {settings.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo} alt="" width={140} height={46} />
          ) : null}
          <span className={settings.logo ? 'sr-only' : 'brand-name'}>{settings.name}</span>
        </Link>

        <nav id="menu" className={'nav' + (open ? ' open' : '')} aria-label="Principal">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link className="btn btn-accent nav-cta" href="/#cotizador" onClick={() => setOpen(false)}>
            Cotizar
          </Link>
        </nav>

        <button
          type="button"
          className="burger"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
