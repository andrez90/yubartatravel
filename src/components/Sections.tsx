import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Category, Faq, GalleryItem, Plan, Settings, SiteContent, Testimonial } from '@/lib/types';
import { lines, waLink } from '@/lib/utils';
import { planId, planPriceText } from '@/lib/pricing';
import ContactForm from './ContactForm';
import Icon from './Icons';
import MapEmbed from './MapEmbed';
import Scroller from './Scroller';

/* eslint-disable @next/next/no-img-element */

const Glow = () => <span className="fx-glow" aria-hidden="true" />;

/** Índice para escalonar la entrada al hacer scroll (ver .rv en globals.css). */
const stagger = (i: number) => ({ '--i': i }) as CSSProperties;

export function Features({ c }: { c: SiteContent['features'] }) {
  if (!c.items.length) return null;
  return (
    <section className="feats-wrap" aria-label="Por qué viajar con nosotros">
      <div className="container">
        <ul className="feats">
          {c.items.map((f, i) => (
            <li key={i} className="feat rv" style={stagger(i)} data-fx>
              <Glow />
              <span className="feat-ic">
                <Icon name={f.icon} />
              </span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Categories({ c, s }: { c: SiteContent['categories']; s: Settings }) {
  return (
    <section className="section" id="planes" aria-labelledby="planes-h">
      <div className="container">
        <header className="sec-head">
          <h2 id="planes-h">{c.title}</h2>
          <p>{c.intro}</p>
        </header>
        <div className="bento">
          {c.items.map((k, i) => {
            const n = k.plans.filter((p) => p.active).length;
            return (
              <Link key={k.slug} href={`/planes/${k.slug}`} className={'cat rv' + (i < 2 ? ' big' : '')} style={stagger(i)} data-fx>
                <Glow />
                <span className="cat-img">
                  <img src={k.image} alt="" width={800} height={560} loading="lazy" decoding="async" />
                  <span className="badge">{n > 0 ? `${n} ${n === 1 ? 'plan' : 'planes'}` : 'Próximamente'}</span>
                </span>
                <span className="cat-b">
                  <span>
                    <h3>{k.name}</h3>
                    <span className="cat-t">{k.tagline}</span>
                  </span>
                  <span className="cat-go" aria-hidden="true">
                    <Icon name="arrow" size={20} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
        <p className="bento-note">
          ¿No ves lo que buscas?{' '}
          <a href={waLink(s, '¡Hola! Quiero un plan a la medida.')} target="_blank" rel="noopener noreferrer">
            Cuéntanos y lo armamos
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function PlanCard({ p, s, catSlug }: { p: Plan; s: Settings; catSlug: string }) {
  const inc = lines(p.includes);
  const hasMore = Boolean(p.description || inc.length || p.itinerary);
  const meta = [p.duration, p.dates].filter(Boolean).join(' · ');
  return (
    <article className="plan rv" data-fx>
      <Glow />
      <div className="plan-img">
        <img src={p.image} alt={p.title} width={300} height={300} loading="lazy" decoding="async" />
        {(p.badge || p.tagline) && <span className={'badge' + (p.badge ? ' hot' : '')}>{p.badge || p.tagline}</span>}
      </div>
      <div className="plan-b">
        <h3>{p.title}</h3>
        {meta && <p className="plan-meta">{meta}</p>}
        <p className="plan-price">{planPriceText(p)}</p>
        {hasMore && (
          <details className="plan-more">
            <summary>Ver detalles</summary>
            {p.description && <p>{p.description}</p>}
            {inc.length > 0 && (
              <>
                <h4>Incluye</h4>
                <ul>
                  {inc.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </>
            )}
            {p.itinerary && (
              <>
                <h4>Itinerario</h4>
                {lines(p.itinerary).map((x, i) => (
                  <p key={i}>{x}</p>
                ))}
              </>
            )}
          </details>
        )}
        <div className="plan-cta">
          <Link className="btn btn-primary" href={`/reservar/${catSlug}/${planId(p)}`}>
            Reservar
          </Link>
          <a className="btn btn-ghost-light" href={waLink(s, p.whatsappText || `¡Hola! Quiero cotizar: ${p.title}`)} target="_blank" rel="noopener noreferrer">
            Cotizar
          </a>
        </div>
      </div>
    </article>
  );
}

export function Process({ c }: { c: SiteContent['process'] }) {
  if (!c.steps.length) return null;
  return (
    <section className="section" id="como-funciona" aria-labelledby="proceso-h">
      <div className="container">
        <header className="sec-head">
          <h2 id="proceso-h">{c.title}</h2>
          <p>{c.intro}</p>
        </header>
        <ol className="steps">
          {c.steps.map((st, i) => (
            <li key={i} className="step rv" style={stagger(i)} data-fx>
              <Glow />
              <span className="step-n" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{st.title}</h3>
              <p>{st.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PaymentsStrip({ c, s }: { c: SiteContent['payments']; s: Settings }) {
  const on = c.methods.filter((m) => m.enabled);
  const icon: Record<string, string> = { wompi: 'card', link: 'link', transfer: 'bank', whatsapp: 'chat' };
  return (
    <section className="section tint" id="pagos" aria-labelledby="pagos-h">
      <div className="container paystrip">
        <div>
          <h2 id="pagos-h">{c.title}</h2>
          <p>{c.intro}</p>
          <p className="paystrip-terms">
            <Icon name="shield" size={18} /> <span>{c.terms}</span>
          </p>
          <p className="paystrip-links">
            <Link href="/legal/politica-de-reembolsos">Política de reembolsos</Link> · <Link href="/legal/terminos-y-condiciones">Términos</Link> · <Link href="/legal/politica-de-privacidad">Privacidad</Link>
            {s.rnt && <> · RNT {s.rnt}</>}
          </p>
        </div>
        <ul className="paychips">
          {on.map((m) => (
            <li key={m.id} className="rv" data-fx>
              <span className="pay-ic">
                <Icon name={icon[m.kind] || 'card'} />
              </span>
              <span>
                <b>{m.label}</b>
                <small>{m.help}</small>
              </span>
            </li>
          ))}
          <li className="paychips-dep">
            Abono para separar tu cupo: <b>{c.depositPercent} %</b>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function Services({ c, cta, s }: { c: SiteContent['services']; cta: SiteContent['cta']; s: Settings }) {
  return (
    <section className="section tint" id="servicios" aria-labelledby="servicios-h">
      <div className="container why">
        <div>
          <header className="sec-head stack">
            <h2 id="servicios-h">{c.title}</h2>
            <p>{c.intro}</p>
          </header>
          <ul className="svc-list">
            {c.items.map((it, i) => (
              <li key={i} className="rv" style={stagger(i)}>
                <Link href={it.link || '/#contacto'} className="svc" data-fx>
                  <img src={it.image} alt="" width={160} height={160} loading="lazy" decoding="async" />
                  <span className="svc-b">
                    <h3>{it.title}</h3>
                    <span>{it.text}</span>
                  </span>
                  <span className="svc-go" aria-hidden="true">
                    <Icon name="arrow" size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <aside className="cta-card" aria-label={cta.title}>
          <img src={cta.image} alt="" width={720} height={900} loading="lazy" decoding="async" />
          <div className="cta-in">
            <h3>{cta.title}</h3>
            <p>{cta.text}</p>
            <a className="btn btn-accent" href={waLink(s)} target="_blank" rel="noopener noreferrer">
              {cta.label}
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function About({ c }: { c: SiteContent['about'] }) {
  return (
    <section className="section" id="nosotros" aria-labelledby="nosotros-h">
      <div className="container about">
        <div className="about-img">
          <img src={c.image} alt="Equipo y viajeros de Yubarta Travels" width={800} height={587} loading="lazy" decoding="async" />
        </div>
        <div className="about-t">
          <h2 id="nosotros-h">{c.title}</h2>
          <p>{c.text}</p>
          <dl className="stats">
            {c.stats.map((st, i) => (
              <div key={i} className="rv" style={stagger(i)} data-fx>
                <dt>{st.value}</dt>
                <dd>{st.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Gallery({ c }: { c: SiteContent['gallery'] }) {
  if (!c.items.length) return null;
  return (
    <section className="section tint" id="galeria" aria-labelledby="galeria-h">
      <div className="container">
        <header className="sec-head">
          <h2 id="galeria-h">{c.title}</h2>
        </header>
        <div className="mosaic">
          {c.items.map((g: GalleryItem, i) => (
            <figure key={i} className="rv" style={stagger(i % 4)}>
              <img src={g.image} alt={g.alt || 'Foto de viajeros'} width={400} height={400} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ c }: { c: SiteContent['testimonials'] }) {
  if (!c.items.length) return null;
  return (
    <section className="section" id="testimonios" aria-labelledby="testi-h">
      <div className="container">
        <header className="sec-head">
          <h2 id="testi-h">{c.title}</h2>
          <p>{c.intro}</p>
        </header>
      </div>
      <div className="container">
        <Scroller label="Testimonios">
          {c.items.map((t: Testimonial, i) => (
            <figure key={i} className="testi" data-fx>
              <Glow />
              <div className="stars" role="img" aria-label={`${t.stars} de 5 estrellas`}>
                {'★'.repeat(Math.max(0, Math.min(5, t.stars)))}
              </div>
              <blockquote>{t.text}</blockquote>
              <figcaption>
                <span className="avatar" aria-hidden="true">
                  {t.name.trim().charAt(0).toUpperCase()}
                </span>
                <span>
                  <b>{t.name}</b>
                  {t.trip && <small>{t.trip}</small>}
                </span>
              </figcaption>
            </figure>
          ))}
        </Scroller>
      </div>
    </section>
  );
}

export function FaqList({ c, s }: { c: SiteContent['faq']; s: Settings }) {
  if (!c.items.length) return null;
  return (
    <section className="section tint" id="preguntas" aria-labelledby="faq-h">
      <div className="container faqs">
        <header className="sec-head stack">
          <h2 id="faq-h">{c.title}</h2>
          <p>¿Tienes otra duda? Escríbenos y te respondemos.</p>
          <a className="btn btn-primary" href={waLink(s)} target="_blank" rel="noopener noreferrer">
            Preguntar por WhatsApp
          </a>
        </header>
        <div>
          {c.items.map((f: Faq, i) => (
            <details key={i} className="faq">
              <summary>
                <span>{f.q}</span>
                <span className="faq-ic" aria-hidden="true">
                  <Icon name="plus" size={18} />
                </span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact({ s, interests }: { s: Settings; interests: string[] }) {
  return (
    <section className="section" id="contacto" aria-labelledby="contacto-h">
      <div className="container">
        <div className="contact">
          <div className="contact-info">
            <h2 id="contacto-h">Cuéntanos tu viaje</h2>
            <p>Son 2 pasos y menos de 2 minutos. Sin compromiso.</p>
            <h3 className="contact-h3">¿Qué pasa después de enviar?</h3>
            <ol className="contact-steps">
              <li><b>Revisamos tu caso</b> y lo que necesitas.</li>
              <li><b>Te escribimos</b> por WhatsApp para afinar detalles.</li>
              <li><b>Recibes tu propuesta</b> con precio y qué incluye.</li>
            </ol>
            <ul className="contact-list">
              <li>
                <Icon name="chat" size={20} />
                <a href={waLink(s)} target="_blank" rel="noopener noreferrer">
                  ¿Prefieres escribirnos? {s.phoneDisplay}
                </a>
              </li>
              {s.email && (
                <li>
                  <Icon name="ticket" size={20} />
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </li>
              )}
              <li>
                <Icon name="pin" size={20} />
                <span>{s.address}</span>
              </li>
            </ul>
            <MapEmbed query={s.mapQuery || s.address} />
          </div>
          <ContactForm settings={s} interests={interests} />
        </div>
      </div>
    </section>
  );
}

export function categoryCount(k: Category) {
  return k.plans.filter((p) => p.active).length;
}
