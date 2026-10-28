import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://yubartatravels.com').replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/gracias'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
