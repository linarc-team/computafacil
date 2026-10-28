import { NextRequest, NextResponse } from 'next/server';
import { updateOrderFromGateway } from '@/lib/db';
export async function POST(request: NextRequest) {
  const event = await request.json().catch(() => null);
  if (!event || typeof event.transactionId !== 'string' || !['transaction.created', 'transaction.paid', 'transaction.failed'].includes(event.event))
    return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
  const apiKey = process.env.BLACKCAT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Gateway não configurado.' }, { status: 503 });
  const gatewayResponse = await fetch(`https://api.blackcatoficial.com/api/sales/${encodeURIComponent(event.transactionId)}/status`, { headers: { 'X-API-Key': apiKey }, cache: 'no-store' });
  if (!gatewayResponse.ok) return NextResponse.json({ error: 'Não foi possível confirmar o evento na Blackcat.' }, { status: 502 });
  const gatewayResult = await gatewayResponse.json();
  const confirmedStatus = String(gatewayResult?.data?.status || '').toUpperCase();
  if (!['PENDING', 'PENDING_3DS', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(confirmedStatus)) return NextResponse.json({ error: 'Status de pagamento desconhecido.' }, { status: 400 });
  try { await updateOrderFromGateway(event.transactionId, confirmedStatus); }
  catch { return NextResponse.json({ error: 'O pedido ainda não pôde ser sincronizado.' }, { status: 503 }); }
  return NextResponse.json({ received: true });
}
