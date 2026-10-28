export type Settings = {
  name: string;
  slogan: string;
  tagline: string;
  logo: string;
  whatsapp: string; // solo dígitos con indicativo, ej. 573216189634
  phoneDisplay: string;
  email: string;
  address: string;
  city: string;
  mapQuery: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  rnt: string; // Registro Nacional de Turismo
  primary: string;
  accent: string;
  siteUrl: string;
  seoTitle: string;
  seoDescription: string;
  whatsappMessage: string;
  ogImage: string;
  years: string;
  flights: string;
};

export type Slide = {
  active: boolean;
  region: string;
  title: string;
  text: string;
  image: string;
  link: string;
  linkLabel: string;
  cardRegion: string;
  cardTitle: string;
};

export type Service = { title: string; text: string; image: string; link: string };

export type Plan = {
  active: boolean;
  title: string;
  tagline: string;
  price: string;
  image: string;
  description: string;
  includes: string; // una por línea
  itinerary: string; // texto libre
  whatsappText: string;
  amount?: number; // precio por persona en COP (0 o vacío = «Cotiza por WhatsApp»)
  duration?: string; // ej. «1 día», «2 días / 1 noche»
  dates?: string; // ej. «Salidas todos los sábados»
  badge?: string; // ej. «Más vendido»
  featured?: boolean;
};

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
  fromAmount?: number; // precio base por persona del cotizador cuando no se elige un plan concreto
  plans: Plan[];
};

export type GalleryItem = { image: string; alt: string };
export type Testimonial = { name: string; trip: string; text: string; stars: number };
export type Faq = { q: string; a: string };
export type LegalDoc = { slug: string; title: string; version: string; updated: string; body: string };
export type Feature = { icon: string; title: string; text: string };
export type QuoteExtra = { id: string; active: boolean; label: string; help: string; price: number; mode: 'persona' | 'fijo' };
export type PayMethod = { id: string; enabled: boolean; kind: 'wompi' | 'link' | 'transfer' | 'whatsapp'; label: string; help: string; link: string; details: string };
export type Step = { title: string; text: string };
export type Stat = { value: string; label: string };

export type SiteContent = {
  settings: Settings;
  hero: { slides: Slide[] };
  features: { items: Feature[] };
  quote: { title: string; intro: string; note: string; kidsPercent: number; extras: QuoteExtra[] };
  payments: { title: string; intro: string; depositPercent: number; terms: string; methods: PayMethod[] };
  process: { title: string; intro: string; steps: Step[] };
  cta: { title: string; text: string; image: string; label: string };
  services: { title: string; intro: string; items: Service[] };
  categories: { title: string; intro: string; items: Category[] };
  gallery: { title: string; items: GalleryItem[] };
  about: { title: string; text: string; image: string; stats: Stat[] };
  testimonials: { title: string; intro: string; items: Testimonial[] };
  faq: { title: string; items: Faq[] };
  legal: { items: LegalDoc[] };
};

export type SectionKey = keyof SiteContent;
