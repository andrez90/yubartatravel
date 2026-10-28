import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/utils';
import { SB_ANON, SB_URL } from '@/lib/server';

export const runtime = 'nodejs';

/** El panel llama aquí al guardar: se verifica que el usuario sea administrador y se refresca el sitio. */
export async function POST(req: Request) {
  const rl = rateLimit(`rev:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 });
  if (!SB_URL || !SB_ANON) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // ¿Es un usuario válido y está en la tabla admins? (la política RLS solo deja ver su propia fila)
  const res = await fetch(`${SB_URL}/rest/v1/admins?select=email`, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  const rows = res.ok ? ((await res.json()) as unknown[]) : [];
  if (!rows.length) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  revalidateTag('content');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
