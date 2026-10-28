'use client';

/** Eventos de GA4: solo salen si la persona aceptó analítica (el banner de cookies define window.gtag). */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof g === 'function') g('event', name, params);
  } catch {
    /* sin analítica: no pasa nada */
  }
}

const KEY = 'yt_attribution';

/** Guarda de dónde llegó la visita (UTM / referrer) la primera vez que entra, para saber qué anuncio o red trae solicitudes. */
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const q = new URLSearchParams(location.search);
    const a = {
      source: q.get('utm_source') || undefined,
      medium: q.get('utm_medium') || undefined,
      campaign: q.get('utm_campaign') || undefined,
      referrer: document.referrer ? new URL(document.referrer).hostname : undefined,
      landing: location.pathname,
    };
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* ignorar */
  }
}

export function getAttribution() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : undefined;
  } catch {
    return undefined;
  }
}
