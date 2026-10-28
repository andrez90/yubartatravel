'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

type Consent = { analytics: boolean; marketing: boolean; v: number };
const KEY = 'yt_consent_v1';
const GA = process.env.NEXT_PUBLIC_GA_ID;

function read(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function anonId() {
  try {
    let id = localStorage.getItem('yt_anon');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('yt_anon', id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

/** Banner de cookies: 3 botones con el mismo peso, nada premarcado y Analytics solo tras aceptar. */
export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const c = read();
    setConsent(c);
    setShow(!c);
    const open = () => {
      setShow(true);
      setConfig(true);
    };
    window.addEventListener('yt:cookies', open);
    return () => window.removeEventListener('yt:cookies', open);
  }, []);

  const save = useCallback((a: boolean, m: boolean) => {
    const c: Consent = { analytics: a, marketing: m, v: 1 };
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {}
    setConsent(c);
    setShow(false);
    setConfig(false);
    // registro de la decisión (tabla consent_logs, solo inserción)
    fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'cookies', decision: a || m ? 'acepto' : 'rechazo', holder: anonId(), page: location.pathname, text: `analytics=${a};marketing=${m}` }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return (
    <>
      {GA && consent?.analytics && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="lazyOnload" />
          <Script id="ga-init" strategy="lazyOnload">{`
            window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
            gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
            gtag('js',new Date());gtag('consent','update',{analytics_storage:'granted'});
            gtag('config','${GA}',{anonymize_ip:true});
            document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*="wa.me"],a[href^="tel:"],a[href^="mailto:"]');if(!a)return;var h=a.getAttribute('href');gtag('event',h.indexOf('wa.me')>-1?'click_whatsapp':h.indexOf('tel:')===0?'click_telefono':'click_correo',{link_url:h});});
          `}</Script>
        </>
      )}

      {show && (
        <div className="cookie" role="dialog" aria-modal="false" aria-labelledby="ck-t">
          <p id="ck-t" className="cookie-t">Cookies</p>
          <p>
            Usamos cookies necesarias y, si nos lo permites, de analítica para mejorar el sitio. Puedes cambiar tu decisión cuando quieras.{' '}
            <a href="/legal/politica-de-cookies">Política de cookies</a>
          </p>
          {config && (
            <div className="cookie-opts">
              <label><input type="checkbox" checked disabled /> Necesarias (siempre activas)</label>
              <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analítica</label>
              <label><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Marketing</label>
            </div>
          )}
          <div className="cookie-btns">
            <button type="button" onClick={() => save(true, true)}>Aceptar todas</button>
            <button type="button" onClick={() => save(false, false)}>Rechazar no esenciales</button>
            {config ? (
              <button type="button" onClick={() => save(analytics, marketing)}>Guardar selección</button>
            ) : (
              <button type="button" onClick={() => setConfig(true)}>Configurar</button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function CookiePrefsButton() {
  return (
    <button type="button" className="linklike" onClick={() => window.dispatchEvent(new Event('yt:cookies'))}>
      Preferencias de cookies
    </button>
  );
}
