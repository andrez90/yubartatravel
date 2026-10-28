import type { Settings } from './types';

export const digits = (s: string) => (s || '').replace(/\D/g, '');

export function waLink(settings: Pick<Settings, 'whatsapp' | 'whatsappMessage'>, text?: string) {
  const msg = text || settings.whatsappMessage || '';
  return `https://wa.me/${digits(settings.whatsapp)}?text=${encodeURIComponent(msg)}`;
}

export const lines = (s: string) => (s || '').split('\n').map((l) => l.trim()).filter(Boolean);

export function absUrl(site: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Limitador de peticiones en memoria (sirve para empezar; en serverless usar Upstash si se necesita límite real). */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return { ok: arr.length <= max, retryAfter: Math.ceil(windowMs / 1000) };
}

export function clientIp(req: Request) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}
