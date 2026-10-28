import { cache } from 'react';
import { DEFAULT_CONTENT } from './defaultContent';
import type { SiteContent, SectionKey } from './types';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(URL && KEY);

/** Une lo guardado en Supabase con los valores por defecto (secciones de objeto: mezcla; listas: reemplaza). */
export function mergeSection<K extends SectionKey>(key: K, value: unknown): SiteContent[K] {
  const base = DEFAULT_CONTENT[key];
  if (!value || typeof value !== 'object') return base;
  return { ...(base as object), ...(value as object) } as SiteContent[K];
}

/**
 * Lee el contenido público (tabla `content`). Es una petición con caché de 60 s y
 * etiqueta `content`, así el panel puede invalidarla al guardar. Si no hay Supabase
 * configurado o falla, se usa el contenido por defecto (el sitio nunca se cae).
 */
export const getContent = cache(async (): Promise<SiteContent> => {
  if (!URL || !KEY) return DEFAULT_CONTENT;
  try {
    const res = await fetch(`${URL}/rest/v1/content?select=key,value`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      next: { revalidate: 60, tags: ['content'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return DEFAULT_CONTENT;
    const rows = (await res.json()) as { key: SectionKey; value: unknown }[];
    const out = { ...DEFAULT_CONTENT } as Record<string, unknown>;
    for (const r of rows) {
      if (r.key in DEFAULT_CONTENT) out[r.key] = mergeSection(r.key, r.value);
    }
    return out as SiteContent;
  } catch {
    return DEFAULT_CONTENT;
  }
});
