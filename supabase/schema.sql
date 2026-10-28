-- ============================================================
-- Yubarta Travels · esquema de Supabase (panel administrativo)
-- Pégalo completo en Supabase > SQL Editor > Run. Se puede ejecutar varias veces.
-- ============================================================

-- 1) Administradores (solo estos correos pueden editar el sitio)
create table if not exists public.admins (
  email text primary key
);
-- ⚠️ Cambia por tu correo real ANTES de ejecutar (el mismo con el que crearás el usuario en Authentication):
insert into public.admins (email) values ('CAMBIA-ESTO@tucorreo.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

alter table public.admins enable row level security;
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 2) Contenido del sitio (una fila por sección: settings, hero, services, categories, ...)
create table if not exists public.content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.content enable row level security;
drop policy if exists content_read on public.content;
drop policy if exists content_write on public.content;
create policy content_read on public.content for select to anon, authenticated using (true);
create policy content_write on public.content for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3) (Antiguo) Mensajes del formulario simple. Se conserva por compatibilidad; las solicitudes nuevas van a `leads` (sección 3b).
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  ip text,
  status text not null default 'nuevo'
);
alter table public.messages enable row level security;
drop policy if exists messages_admin on public.messages;
create policy messages_admin on public.messages for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3b) Solicitudes: contacto, cotizaciones del cotizador y reservas (se insertan desde el servidor con la clave de servicio)
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null default 'contacto' check (kind in ('contacto','cotizacion','reserva')),
  reference text unique,                       -- código corto que ve el cliente (ej. YT-7K3QXP)
  status text not null default 'nuevo' check (status in ('nuevo','contactado','cotizado','reservado','pagado','cancelado')),
  name text not null,
  whatsapp text,
  email text,
  interest text,                               -- categoría o servicio de interés
  plan_title text,
  destination text,
  travel_date text,
  adults int,
  kids int,
  budget text,
  message text,
  quote jsonb,                                 -- detalle del cotizador (líneas, total)
  total numeric,                               -- total estimado en COP (0 = por confirmar)
  deposit numeric,                             -- abono sugerido en COP
  payment_status text not null default 'pendiente' check (payment_status in ('pendiente','parcial','pagado','reembolsado')),
  payment_method text,
  notes text,                                  -- notas internas del equipo
  attribution jsonb,                           -- utm_source, utm_medium, campaign, referrer
  page text,
  ip text
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
alter table public.leads enable row level security;
drop policy if exists leads_admin on public.leads;
create policy leads_admin on public.leads for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- (sin políticas para anon: el público nunca lee ni escribe directo; solo el servidor con la clave de servicio inserta)

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();

-- 4) Registro de consentimientos (solo inserción; nadie edita ni borra filas)
create table if not exists public.consent_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default (now() at time zone 'utc'),
  doc_type text not null,
  doc_version text not null,
  doc_hash text not null,
  decision text not null,
  holder text,
  ip text,
  user_agent text,
  page text,
  checkbox_text text,
  revoked_at timestamptz
);
alter table public.consent_logs enable row level security;
drop policy if exists consent_admin_read on public.consent_logs;
create policy consent_admin_read on public.consent_logs for select to authenticated using (public.is_admin());
-- (sin políticas de insert/update/delete: solo la clave de servicio del servidor inserta)
revoke update, delete on public.consent_logs from anon, authenticated;

-- 5) Almacenamiento de imágenes (logo, fotos de planes, galería)
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists media_read on storage.objects;
drop policy if exists media_write on storage.objects;
drop policy if exists media_update on storage.objects;
drop policy if exists media_delete on storage.objects;
create policy media_read on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy media_write on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy media_update on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy media_delete on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
