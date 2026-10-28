import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getContent();
  const base = c.settings.siteUrl.replace(/\/$/, '');
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...c.categories.items.map((k) => ({ url: `${base}/planes/${k.slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...c.legal.items.map((d) => ({ url: `${base}/legal/${d.slug}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.2 })),
  ];
}
