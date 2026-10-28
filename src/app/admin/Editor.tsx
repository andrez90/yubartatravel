'use client';

import { useRef, useState } from 'react';
import { blankFor, type Field } from './schema';

/* eslint-disable @next/next/no-img-element */

type Obj = Record<string, unknown>;
type Uploader = (file: File) => Promise<string>;

export function FieldsEditor({ fields, value, onChange, upload }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void; upload: Uploader }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="ad-fields">
      {fields.map((f) => (
        <FieldInput key={f.key} f={f} v={value[f.key]} set={(v) => set(f.key, v)} upload={upload} />
      ))}
    </div>
  );
}

function FieldInput({ f, v, set, upload }: { f: Field; v: unknown; set: (v: unknown) => void; upload: Uploader }) {
  if (f.type === 'heading') return <h3 className="ad-heading">{f.label}</h3>;

  if (f.type === 'list') return <ListEditor f={f} items={(v as Obj[]) || []} onChange={set} upload={upload} />;

  if (f.type === 'bool')
    return (
      <label className="ad-check">
        <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} />
        <span>{f.label}</span>
      </label>
    );

  if (f.type === 'image') return <ImageField f={f} v={(v as string) || ''} set={set} upload={upload} />;

  return (
    <label className="ad-field">
      <span className="ad-label">{f.label}</span>
      {f.type === 'textarea' ? (
        <textarea rows={f.rows || 3} value={(v as string) ?? ''} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />
      ) : f.type === 'color' ? (
        <span className="ad-color">
          <input type="color" value={(v as string) || '#000000'} onChange={(e) => set(e.target.value)} />
          <input type="text" value={(v as string) ?? ''} onChange={(e) => set(e.target.value)} />
        </span>
      ) : f.type === 'select' ? (
        <select value={(v as string) ?? ''} onChange={(e) => set(e.target.value)}>
          {(f.options || []).map(([val, txt]) => (
            <option key={val} value={val}>
              {txt}
            </option>
          ))}
        </select>
      ) : f.type === 'number' ? (
        <input type="number" min={0} max={f.max ?? 1_000_000_000} step={1} inputMode="numeric" value={Number(v ?? 0)} onChange={(e) => set(Number(e.target.value))} />
      ) : (
        <input type="text" value={(v as string) ?? ''} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />
      )}
      {f.help && <span className="ad-help">{f.help}</span>}
    </label>
  );
}

function ImageField({ f, v, set, upload }: { f: Field; v: string; set: (v: string) => void; upload: Uploader }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      set(await upload(file));
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'No se pudo subir la imagen');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }
  return (
    <div className="ad-field">
      <span className="ad-label">{f.label}</span>
      <div className="ad-img">
        {v ? <img src={v} alt="" /> : <div className="ad-img-empty">Sin imagen</div>}
        <div className="ad-img-ctl">
          <input type="text" value={v} placeholder="Pega un enlace o sube una imagen" onChange={(e) => set(e.target.value)} />
          <input ref={input} type="file" accept="image/*" hidden onChange={onFile} />
          <button type="button" className="ad-btn" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? 'Subiendo…' : 'Subir imagen'}
          </button>
          {v && (
            <button type="button" className="ad-btn ghost" onClick={() => set('')}>
              Quitar
            </button>
          )}
        </div>
      </div>
      {f.help && <span className="ad-help">{f.help}</span>}
      {err && <span className="ad-err">{err}</span>}
    </div>
  );
}

function ListEditor({ f, items, onChange, upload }: { f: Field; items: Obj[]; onChange: (v: Obj[]) => void; upload: Uploader }) {
  const sub = f.fields || [];
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const a = [...items];
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };
  const del = (i: number) => {
    if (window.confirm('¿Eliminar este elemento? No se puede deshacer hasta que recargues sin guardar.')) onChange(items.filter((_, k) => k !== i));
  };
  const dup = (i: number) => {
    const a = [...items];
    a.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i])));
    onChange(a);
  };
  return (
    <div className="ad-list">
      <div className="ad-list-head">
        <h3>
          {f.label} <span className="ad-count">{items.length}</span>
        </h3>
        <button type="button" className="ad-btn" onClick={() => onChange([...items, blankFor(sub)])}>
          + {f.addLabel || 'Agregar'}
        </button>
      </div>
      {items.length === 0 && <p className="ad-empty">Todavía no hay elementos. Usa el botón «Agregar».</p>}
      {items.map((it, i) => {
        const title = (f.itemTitle && (it[f.itemTitle] as string)) || '(sin título)';
        const hidden = it.active === false;
        return (
          <details key={i} className={'ad-item' + (hidden ? ' off' : '')}>
            <summary>
              <span className="ad-n">{i + 1}</span>
              <span className="ad-it">{title}</span>
              {hidden && <span className="ad-badge">oculto</span>}
              <span className="ad-actions" onClick={(e) => e.preventDefault()}>
                <button type="button" title="Subir" aria-label="Subir" onClick={() => move(i, -1)}>↑</button>
                <button type="button" title="Bajar" aria-label="Bajar" onClick={() => move(i, 1)}>↓</button>
                <button type="button" title="Duplicar" aria-label="Duplicar" onClick={() => dup(i)}>⧉</button>
                <button type="button" title="Eliminar" aria-label="Eliminar" className="danger" onClick={() => del(i)}>✕</button>
              </span>
            </summary>
            <div className="ad-item-body">
              <FieldsEditor fields={sub} value={it} upload={upload} onChange={(nv) => onChange(items.map((x, k) => (k === i ? nv : x)))} />
            </div>
          </details>
        );
      })}
    </div>
  );
}
