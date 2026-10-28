import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource-variable/inter/wght.css';
import './globals.css';
import { getContent } from '@/lib/content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getContent();
  return {
    metadataBase: new URL(s.siteUrl),
    title: { default: s.seoTitle, template: `%s` },
    description: s.seoDescription,
    applicationName: s.name,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'es_CO',
      siteName: s.name,
      title: s.seoTitle,
      description: s.seoDescription,
      url: '/',
      images: s.ogImage ? [{ url: s.ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: s.seoTitle, description: s.seoDescription, images: s.ogImage ? [s.ogImage] : undefined },
    icons: s.logo ? { icon: s.logo } : undefined,
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: '#04494b', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { settings: s } = await getContent();
  return (
    <html lang="es-CO" style={{ '--primary': s.primary, '--accent': s.accent } as CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
