import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';
import { getOrderTracking } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ transactionId: string }> }) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) return NextResponse.json({ error: 'Conta indisponível.' }, { status: 503 });
  let userId: string;
  try {
    const { data } = await getAuth().getSession();
    if (!data?.user) return NextResponse.json({ error: 'Entre para consultar seu pedido.' }, { status: 401 });
    userId = data.user.id;
  } catch { return NextResponse.json({ error: 'Não foi possível validar sua conta.' }, { status: 401 }); }
  const { transactionId } = await params;
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(transactionId)) return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  try {
    const tracking = await getOrderTracking(transactionId, userId);
    return tracking ? NextResponse.json(tracking, { headers: { 'Cache-Control': 'private, no-store' } }) : NextResponse.json({ error: 'Pedido pago não encontrado.' }, { status: 404 });
  } catch { return NextResponse.json({ error: 'Não foi possível consultar o rastreio.' }, { status: 503 }); }
}
