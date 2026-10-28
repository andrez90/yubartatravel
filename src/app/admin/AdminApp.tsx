'use client';

import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import { mergeSection } from '@/lib/content';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import type { SectionKey, SiteContent } from '@/lib/types';
import { FieldsEditor } from './Editor';
import Leads from './Leads';
import { SECTIONS } from './schema';

type Tab = SectionKey | 'leads' | 'help';
type Toast = { kind: 'ok' | 'err'; text: string } | null;

const snap = (v: unknown) => JSON.stringify(v);

/** Reduce la imagen (máx. 1600 px) y la convierte a WebP antes de subirla: sitio más rápido. */
async function compress(file: File): Promise<Blob> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  const bmp = await createImageBitmap(file);
  const max = 1600;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/webp', 0.82));
  return blob || file;
}

export default function AdminApp() {
  const sb = useMemo<SupabaseClient | null>(() => getBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sb) {
      setBooting(false);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBooting(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  useEffect(() => {
    if (!sb || !session) {
      setIsAdmin(null);
      return;
    }
    sb.from('admins')
      .select('email')
      .then(({ data, error }) => setIsAdmin(!error && Boolean(data && data.length)));
  }, [sb, session]);

  if (!sb) return <SetupHelp />;
  if (booting) return <div className="ad-center">Cargando…</div>;
  if (!session) return <Login sb={sb} />;
  if (isAdmin === null) return <div className="ad-center">Verificando acceso…</div>;
  if (!isAdmin)
    return (
      <div className="ad-center">
        <div className="ad-card">
          <h1>Sin permiso</h1>
          <p>
            El correo <b>{session.user.email}</b> no está en la lista de administradores. Agrégalo en Supabase (tabla <code>admins</code>) y vuelve a entrar.
          </p>
          <button className="ad-btn" onClick={() => sb.auth.signOut()}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  return <Panel sb={sb} session={session} />;
}

/* ---------------------------------------------------------------- */

function SetupHelp() {
  return (
    <div className="ad-center">
      <div className="ad-card wide">
        <h1>Conecta el panel a Supabase</h1>
        <p>El sitio funciona con el contenido inicial, pero para editarlo desde aquí falta conectar Supabase (gratis):</p>
        <ol>
          <li>Crea un proyecto en <b>supabase.com</b>.</li>
          <li>En <b>SQL Editor</b> pega y ejecuta el archivo <code>supabase/schema.sql</code> (antes cambia el correo del administrador).</li>
          <li>En <b>Authentication → Users</b> crea tu usuario con ese correo y una contraseña. En <b>Settings → Authentication</b> desactiva «Allow new users to sign up».</li>
          <li>Copia la URL y las claves a <code>.env.local</code> (hay un ejemplo en <code>.env.example</code>) y en las variables de entorno del hosting.</li>
          <li>Reinicia el sitio y entra de nuevo a <code>/admin</code>.</li>
        </ol>
      </div>
    </div>
  );
}

function Login({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (error) setErr('Correo o contraseña incorrectos.');
    setBusy(false);
  }
  async function reset() {
    if (!email) return setErr('Escribe tu correo primero.');
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/admin` });
    if (error) setErr('No se pudo enviar el correo.');
    else setInfo('Te enviamos un enlace para cambiar la contraseña.');
  }
  return (
    <div className="ad-center">
      <form className="ad-card" onSubmit={submit}>
        <h1>Panel de administración</h1>
        <p className="ad-muted">Entra para editar tu página web sin tocar código.</p>
        <label className="ad-field">
          <span className="ad-label">Correo</span>
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="ad-field">
          <span className="ad-label">Contraseña</span>
          <input type="password" required autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        {err && <p className="ad-err">{err}</p>}
        {info && <p className="ad-ok">{info}</p>}
        <button className="ad-btn primary" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <button type="button" className="ad-link" onClick={reset}>
          Olvidé mi contraseña
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Panel({ sb, session }: { sb: SupabaseClient; session: Session }) {
  const [data, setData] = useState<SiteContent>(DEFAULT_CONTENT);
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>('leads');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [menu, setMenu] = useState(false);

  const notify = useCallback((kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: rows, error } = await sb.from('content').select('key,value');
      if (error) notify('err', 'No se pudo leer el contenido: ' + error.message);
      const next = { ...DEFAULT_CONTENT } as Record<string, unknown>;
      for (const r of rows || []) if (r.key in DEFAULT_CONTENT) next[r.key] = mergeSection(r.key as SectionKey, r.value);
      const snaps: Record<string, string> = {};
      for (const k of Object.keys(next)) snaps[k] = snap(next[k]);
      setData(next as SiteContent);
      setSaved(snaps);
      setLoading(false);
    })();
  }, [sb, notify]);

  const dirtyKeys = useMemo(() => (Object.keys(data) as SectionKey[]).filter((k) => saved[k] !== snap(data[k])), [data, saved]);
  const dirty = dirtyKeys.length > 0;

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const upload = useCallback(
    async (file: File) => {
      if (file.size > 15 * 1024 * 1024) throw new Error('La imagen pesa más de 15 MB.');
      const blob = await compress(file);
      const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
      const name = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'imagen';
      const path = `${new Date().getFullYear()}/${Date.now()}-${name}.${ext}`;
      const { error } = await sb.storage.from('media').upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
      if (error) throw new Error('No se pudo subir: ' + error.message);
      return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    },
    [sb],
  );

  async function saveAll(keys: SectionKey[]) {
    setSaving(true);
    try {
      const rows = keys.map((k) => ({ key: k, value: data[k], updated_at: new Date().toISOString(), updated_by: session.user.email }));
      const { error } = await sb.from('content').upsert(rows);
      if (error) throw new Error(error.message);
      const token = (await sb.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      setSaved((p) => ({ ...p, ...Object.fromEntries(keys.map((k) => [k, snap(data[k])])) }));
      notify('ok', res.ok ? '¡Listo! Los cambios ya están publicados.' : 'Guardado. El sitio se actualizará en máximo 1 minuto.');
    } catch (e) {
      notify('err', 'No se pudo guardar: ' + (e instanceof Error ? e.message : 'error desconocido'));
    } finally {
      setSaving(false);
    }
  }

  function restore(k: SectionKey) {
    if (window.confirm('¿Volver esta sección a los textos originales? (Se aplica al guardar)')) setData({ ...data, [k]: DEFAULT_CONTENT[k] });
  }
  function exportAll() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `yubarta-contenido-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const sec = SECTIONS.find((s) => s.key === tab);

  return (
    <div className="ad">
      <header className="ad-top">
        <button className="ad-burger" aria-label="Menú" onClick={() => setMenu(!menu)}>☰</button>
        <strong>Panel · {data.settings.name}</strong>
        <span className="ad-sp" />
        {dirty && <span className="ad-dirty">● Cambios sin guardar</span>}
        <a className="ad-btn ghost" href="/" target="_blank" rel="noopener">Ver sitio</a>
        <button className="ad-btn ghost" onClick={exportAll}>Respaldo</button>
        <button className="ad-btn ghost" onClick={() => sb.auth.signOut()}>Salir</button>
      </header>

      <div className="ad-body">
        <nav className={'ad-side' + (menu ? ' open' : '')} aria-label="Secciones">
          <button className={tab === 'leads' ? 'act' : ''} onClick={() => { setTab('leads'); setMenu(false); }}>
            <span>📥</span> Solicitudes y reservas
          </button>
          <hr />
          {SECTIONS.map((s) => (
            <button key={s.key} className={tab === s.key ? 'act' : ''} onClick={() => { setTab(s.key); setMenu(false); }}>
              <span>{s.icon}</span> {s.title}
              {dirtyKeys.includes(s.key) && <i className="ad-dot" />}
            </button>
          ))}
          <hr />
          <button className={tab === 'help' ? 'act' : ''} onClick={() => { setTab('help'); setMenu(false); }}>
            <span>💡</span> Ayuda rápida
          </button>
        </nav>

        <main className="ad-main">
          {loading ? (
            <p>Cargando contenido…</p>
          ) : tab === 'leads' ? (
            <Leads sb={sb} notify={notify} wa={data.settings.whatsapp} />
          ) : tab === 'help' ? (
            <Help />
          ) : sec ? (
            <>
              <div className="ad-head">
                <div>
                  <h1>{sec.title}</h1>
                  <p className="ad-muted">{sec.desc}</p>
                </div>
                <div className="ad-head-btns">
                  <button className="ad-btn ghost" onClick={() => restore(sec.key)}>Restaurar originales</button>
                  <button className="ad-btn primary" disabled={saving || !dirtyKeys.includes(sec.key)} onClick={() => saveAll([sec.key])}>
                    {saving ? 'Guardando…' : 'Guardar y publicar'}
                  </button>
                </div>
              </div>
              <FieldsEditor
                fields={sec.fields}
                value={data[sec.key] as unknown as Record<string, unknown>}
                upload={upload}
                onChange={(v) => setData({ ...data, [sec.key]: v } as SiteContent)}
              />
              <div className="ad-foot">
                <button className="ad-btn primary" disabled={saving || !dirtyKeys.includes(sec.key)} onClick={() => saveAll([sec.key])}>
                  {saving ? 'Guardando…' : 'Guardar y publicar'}
                </button>
                {dirtyKeys.length > 1 && (
                  <button className="ad-btn" disabled={saving} onClick={() => saveAll(dirtyKeys)}>
                    Guardar todas las secciones modificadas ({dirtyKeys.length})
                  </button>
                )}
              </div>
            </>
          ) : null}
        </main>
      </div>

      {toast && (
        <div className={'ad-toast ' + toast.kind} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Help() {
  return (
    <div className="ad-help-page">
      <h1>Ayuda rápida</h1>
      <h2>¿Dónde veo a los clientes que escriben?</h2>
      <p>«Solicitudes y reservas»: ahí llegan los contactos, las cotizaciones del cotizador y las reservas. Cambia el estado (nuevo, contactado, cotizado, reservado, pagado), anota seguimiento, responde por WhatsApp y descarga todo en Excel.</p>
      <h2>¿Cómo activo los pagos?</h2>
      <p>«Pagos» → activa solo los medios que ya tengas: enlace de pago (pega el enlace de Mercado Pago, PayU, Bold…), transferencia (escribe los datos de la cuenta) o Wompi (necesita las claves en el servidor, ver README). Los medios sin activar no se muestran al cliente.</p>
      <h2>¿Cómo funciona el cotizador?</h2>
      <p>El precio base sale del campo «Precio por persona» de cada plan (o el precio base de la categoría). En «Cotizador» defines los extras (seguro, tiquetes, hotel). Lo que tenga precio 0 aparece como «por confirmar» y lo cierra tu asesor.</p>
      <h2>¿Cómo agrego un plan nuevo?</h2>
      <p>«Planes y precios» → abre la categoría (por ejemplo Pasadías) → «Agregar plan» → llena nombre, foto, precio por persona (solo números), duración y fechas → «Guardar y publicar».</p>
      <h2>¿Cómo cambio el logo o una foto?</h2>
      <p>Pulsa «Subir imagen» junto al campo. La foto se reduce sola para que la página cargue rápido.</p>
      <h2>¿Cómo oculto un plan sin borrarlo?</h2>
      <p>Abre el plan y desmarca «Visible en la página». Se queda guardado para cuando lo necesites.</p>
      <h2>¿Cómo cambio el orden?</h2>
      <p>Usa las flechas ↑ ↓ de cada elemento. El primero de la lista aparece primero en la página.</p>
      <h2>¿Cuánto tardan en verse los cambios?</h2>
      <p>Al guardar se publican al instante; si no, máximo en 1 minuto.</p>
      <h2>Consejos</h2>
      <ul>
        <li>Pon precio solo si es real y vigente; si lo dejas vacío, el cliente cotiza por WhatsApp.</li>
        <li>Agrega solo testimonios reales y con permiso de la persona.</li>
        <li>Completa el RNT (Registro Nacional de Turismo) en «Datos del negocio».</li>
        <li>Haz un «Respaldo» (botón de arriba) de vez en cuando.</li>
      </ul>
    </div>
  );
}
