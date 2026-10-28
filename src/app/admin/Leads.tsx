'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCOP } from '@/lib/pricing';

type Line = { label: string; qty: number; amount: number; pending: boolean };
type Lead = {
  id: number;
  created_at: string;
  kind: 'contacto' | 'cotizacion' | 'reserva';
  reference: string | null;
  status: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  interest: string | null;
  plan_title: string | null;
  destination: string | null;
  travel_date: string | null;
  adults: number | null;
  kids: number | null;
  budget: string | null;
  message: string | null;
  quote: { lines?: Line[]; hasPending?: boolean } | null;
  total: number | null;
  deposit: number | null;
  payment_status: string;
  payment_method: string | null;
  notes: string | null;
  attribution: Record<string, string> | null;
};

const KIND = { contacto: 'Contacto', cotizacion: 'Cotización', reserva: 'Reserva' } as const;
const STATUS = ['nuevo', 'contactado', 'cotizado', 'reservado', 'pagado', 'cancelado'];
const PAY = [
  ['pendiente', 'Pago pendiente'],
  ['parcial', 'Abono recibido'],
  ['pagado', 'Pagado'],
  ['reembolsado', 'Reembolsado'],
];
const digits = (s: string | null) => (s || '').replace(/\D/g, '');

export default function Leads({ sb, notify, wa }: { sb: SupabaseClient; notify: (k: 'ok' | 'err', t: string) => void; wa: string }) {
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [kind, setKind] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await sb.from('leads').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) notify('err', error.message.includes('leads') ? 'Falta crear la tabla «leads»: ejecuta de nuevo supabase/schema.sql.' : error.message);
    setRows((data as Lead[]) || []);
  }, [sb, notify]);
  useEffect(() => {
    load();
  }, [load]);

  async function patch(id: number, values: Partial<Lead>) {
    const { error } = await sb.from('leads').update(values).eq('id', id);
    if (error) notify('err', error.message);
    else setRows((r) => (r ? r.map((x) => (x.id === id ? { ...x, ...values } : x)) : r));
  }
  async function remove(id: number) {
    if (!window.confirm('¿Eliminar esta solicitud? No se puede deshacer.')) return;
    await sb.from('leads').delete().eq('id', id);
    load();
  }

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (rows || []).filter(
      (r) =>
        (kind === 'todos' || r.kind === kind) &&
        (status === 'todos' || r.status === status) &&
        (!t || [r.name, r.email, r.whatsapp, r.reference, r.plan_title, r.destination, r.message].some((v) => (v || '').toLowerCase().includes(t))),
    );
  }, [rows, kind, status, q]);

  const count = (f: (r: Lead) => boolean) => (rows || []).filter(f).length;

  function csv() {
    const head = ['fecha', 'tipo', 'referencia', 'estado', 'pago', 'nombre', 'whatsapp', 'correo', 'interes', 'plan', 'destino', 'fecha_viaje', 'adultos', 'ninos', 'total', 'abono', 'mensaje', 'origen'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const body = list.map((r) =>
      [r.created_at, r.kind, r.reference, r.status, r.payment_status, r.name, r.whatsapp, r.email, r.interest, r.plan_title, r.destination, r.travel_date, r.adults, r.kids, r.total, r.deposit, r.message, r.attribution?.source || r.attribution?.referrer || ''].map(esc).join(','),
    );
    const blob = new Blob(['﻿' + [head.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `solicitudes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Solicitudes</h1>
          <p className="ad-muted">Contactos, cotizaciones del cotizador y reservas. Cambia el estado, anota seguimiento y responde por WhatsApp.</p>
        </div>
        <div className="ad-head-btns">
          <button className="ad-btn ghost" onClick={load}>Actualizar</button>
          <button className="ad-btn" onClick={csv} disabled={!list.length}>Descargar Excel (CSV)</button>
        </div>
      </div>

      <div className="ad-kpis">
        <button className={'ad-kpi' + (status === 'nuevo' ? ' on' : '')} onClick={() => setStatus(status === 'nuevo' ? 'todos' : 'nuevo')}>
          <b>{count((r) => r.status === 'nuevo')}</b> nuevas
        </button>
        <div className="ad-kpi"><b>{count((r) => r.kind === 'reserva' && r.payment_status === 'pendiente' && r.status !== 'cancelado')}</b> reservas sin pagar</div>
        <div className="ad-kpi"><b>{count((r) => r.payment_status === 'pagado')}</b> pagadas</div>
        <div className="ad-kpi"><b>{count(() => true)}</b> en total</div>
      </div>

      <div className="ad-filters">
        <input type="search" placeholder="Buscar nombre, teléfono, referencia…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Tipo">
          <option value="todos">Todos los tipos</option>
          <option value="contacto">Contacto</option>
          <option value="cotizacion">Cotización</option>
          <option value="reserva">Reserva</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Estado">
          <option value="todos">Todos los estados</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {rows === null && <p>Cargando…</p>}
      {rows && list.length === 0 && <p className="ad-empty">No hay solicitudes con ese filtro.</p>}
      {list.map((m) => {
        const phone = digits(m.whatsapp);
        const hello = `Hola ${m.name.split(' ')[0]}, te escribimos de Yubarta Travels${m.reference ? ` por tu solicitud ${m.reference}` : ''}.`;
        return (
          <article key={m.id} className={'ad-msg lead-' + m.status}>
            <header>
              <span className={'ad-tag k-' + m.kind}>{KIND[m.kind]}</span>
              <b>{m.name}</b>
              {m.reference && <code>{m.reference}</code>}
              <span className="ad-sp" />
              <time>{new Date(m.created_at).toLocaleString('es-CO')}</time>
            </header>
            <p className="ad-meta">
              {[m.whatsapp, m.email, m.interest, m.plan_title, m.destination && `Destino: ${m.destination}`, m.travel_date && `Fecha: ${m.travel_date}`, m.adults != null && `${m.adults} adultos${m.kids ? ` + ${m.kids} niños` : ''}`, m.budget && `Presupuesto: ${m.budget}`]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {m.quote?.lines && m.quote.lines.length > 0 && (
              <ul className="ad-quote">
                {m.quote.lines.map((l, i) => (
                  <li key={i}>
                    <span>{l.label}{l.qty > 1 ? ` x${l.qty}` : ''}</span>
                    <span>{l.pending ? 'por confirmar' : formatCOP(l.amount)}</span>
                  </li>
                ))}
                <li className="tot">
                  <span>Total estimado{m.quote.hasPending ? ' (parcial)' : ''}</span>
                  <span>{m.total ? formatCOP(m.total) : 'por confirmar'}{m.deposit ? ` · abono ${formatCOP(m.deposit)}` : ''}</span>
                </li>
              </ul>
            )}
            {m.message && !m.message.startsWith('Cotización armada') && <p>{m.message}</p>}
            {m.attribution && (m.attribution.source || m.attribution.referrer) && <p className="ad-help">Llegó desde: {[m.attribution.source, m.attribution.medium, m.attribution.campaign, m.attribution.referrer].filter(Boolean).join(' / ')}</p>}
            <footer>
              <select value={m.status} onChange={(e) => patch(m.id, { status: e.target.value })} aria-label="Estado">
                {STATUS.map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {m.kind === 'reserva' && (
                <select value={m.payment_status} onChange={(e) => patch(m.id, { payment_status: e.target.value, ...(e.target.value === 'pagado' ? { status: 'pagado' } : {}) })} aria-label="Estado del pago">
                  {PAY.map(([v, t]) => (
                    <option key={v} value={v}>{t}</option>
                  ))}
                </select>
              )}
              {phone && (
                <a className="ad-btn ghost" href={`https://wa.me/${phone}?text=${encodeURIComponent(hello)}`} target="_blank" rel="noopener noreferrer">
                  Responder por WhatsApp
                </a>
              )}
              {m.email && <a className="ad-btn ghost" href={`mailto:${m.email}?subject=${encodeURIComponent('Yubarta Travels · ' + (m.reference || 'tu solicitud'))}`}>Correo</a>}
              <button className="ad-btn ghost danger" onClick={() => remove(m.id)}>Eliminar</button>
            </footer>
            <label className="ad-notes">
              <span className="ad-help">Notas internas (se guardan al salir del cuadro)</span>
              <textarea rows={2} defaultValue={m.notes || ''} onBlur={(e) => e.target.value !== (m.notes || '') && patch(m.id, { notes: e.target.value })} />
            </label>
          </article>
        );
      })}
      <span hidden>{wa}</span>
    </>
  );
}
