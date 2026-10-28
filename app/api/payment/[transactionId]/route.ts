import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';
import { orderBelongsToUser, updateOrderFromGateway } from '@/lib/db';
export const runtime = 'nodejs';
export async function GET(_request: NextRequest, { params }: { params: Promise<{ transactionId: string }> }) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) return NextResponse.json({ error: 'Autenticação não configurada.' }, { status: 503 });
  let userId: string;
  try { const { data: session } = await getAuth().getSession(); if (!session?.user) return NextResponse.json({ error: 'Entre na sua conta para consultar o pedido.' }, { status: 401 }); userId = session.user.id; }
  catch { return NextResponse.json({ error: 'Não foi possível validar sua conta.' }, { status: 401 }); }
  const apiKey = process.env.BLACKCAT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Gateway não configurado.' }, { status: 503 });
  const { transactionId } = await params;
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(transactionId)) return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 });
  try { if (!(await orderBelongsToUser(transactionId, userId))) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 }); }
  catch { return NextResponse.json({ error: 'Não foi possível consultar seu pedido.' }, { status: 503 }); }
  const response = await fetch(`https://api.blackcatoficial.com/api/sales/${encodeURIComponent(transactionId)}/status`, { headers: { 'X-API-Key': apiKey }, cache: 'no-store' });
  const data = await response.json();
  if (response.ok && data?.data?.status) await updateOrderFromGateway(transactionId, String(data.data.status)).catch(() => {});
  return NextResponse.json(data, { status: response.ok ? 200 : 502 });
}
