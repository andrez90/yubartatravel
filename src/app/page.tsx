import Hero from '@/components/Hero';
import JsonLd from '@/components/JsonLd';
import Shell from '@/components/Shell';
import QuoteCalculator from '@/components/QuoteCalculator';
import { About, Categories, Contact, FaqList, Features, Gallery, PaymentsStrip, Process, Services, Testimonials } from '@/components/Sections';
import { toCatalog } from '@/lib/pricing';
import { getContent } from '@/lib/content';
import { digits } from '@/lib/utils';

export const revalidate = 60;

export default async function Home() {
  const c = await getContent();
  const s = c.settings;
  const interests = [...c.categories.items.map((k) => k.name), 'Tiquetes', 'Hoteles', 'Seguro de viaje', 'Otro'];
  const slides = c.hero.slides.filter((x) => x.active);

  const org = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: s.name,
    description: s.seoDescription,
    url: s.siteUrl,
    logo: s.logo,
    image: s.ogImage || s.logo,
    telephone: `+${digits(s.whatsapp)}`,
    email: s.email || undefined,
    address: { '@type': 'PostalAddress', streetAddress: s.address.split(',')[0], addressLocality: 'Palmira', addressRegion: 'Valle del Cauca', addressCountry: 'CO' },
    areaServed: 'CO',
    sameAs: [s.facebook, s.instagram, s.tiktok].filter(Boolean),
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <Shell c={c} overlay>
      <JsonLd data={org} />
      {c.faq.items.length > 0 && <JsonLd data={faq} />}
      {slides.length > 0 && <Hero slides={slides} settings={s} />}
      <Features c={c.features} />
      <Categories c={c.categories} s={s} />
      <Process c={c.process} />
      <QuoteCalculator catalog={toCatalog(c)} settings={s} />
      <Services c={c.services} cta={c.cta} s={s} />
      <About c={c.about} />
      <Gallery c={c.gallery} />
      <Testimonials c={c.testimonials} />
      <PaymentsStrip c={c.payments} s={s} />
      <FaqList c={c.faq} s={s} />
      <Contact s={s} interests={interests} />
    </Shell>
  );
}
