import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';
import { getOwnedOrder } from '@/lib/db';

export const runtime = 'nodejs';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ transactionId: string }> }) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) return NextResponse.json({ error: 'A conta está temporariamente indisponível.' }, { status: 503 });
  let userId: string;
  try {
    const { data } = await getAuth().getSession();
    if (!data?.user) return NextResponse.json({ error: 'Entre na sua conta para baixar o comprovante.' }, { status: 401 });
    userId = data.user.id;
  } catch { return NextResponse.json({ error: 'Não foi possível validar sua conta.' }, { status: 401 }); }

  const { transactionId } = await params;
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(transactionId)) return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  let order;
  try { order = await getOwnedOrder(transactionId, userId); }
  catch { return NextResponse.json({ error: 'Não foi possível consultar o pedido.' }, { status: 503 }); }
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  if (order.payment_status !== 'PAID') return NextResponse.json({ error: 'O pagamento ainda não foi confirmado.' }, { status: 409 });

  const shipping = order.shipping as Record<string, string>;
  const items = order.items as Array<{ title: string; quantity: number; unitPrice: number }>;
  const rows = items.map((item) => `<tr><td>${escapeHtml(item.title)}</td><td>${item.quantity}</td><td>${money(item.unitPrice)}</td><td>${money(item.unitPrice * item.quantity)}</td></tr>`).join('');
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Comprovante ${escapeHtml(order.external_ref)} · ComputaFacil</title><style>body{font:15px/1.6 Arial,sans-serif;color:#252326;margin:0;background:#f6f5f5}.sheet{max-width:760px;margin:36px auto;padding:40px;background:white;border:1px solid #e6e3e3;border-radius:12px}.brand{color:#cf2029;font-size:24px;font-weight:800;letter-spacing:-1px}.sub{color:#737078;font-size:13px}h1{font-size:22px;margin:30px 0 4px}.badge{display:inline-block;background:#e8f7ed;color:#176b32;padding:5px 10px;border-radius:20px;font-size:12px;font-weight:bold}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:25px 0}.box{background:#faf9f9;padding:15px;border-radius:8px}.box strong{display:block;margin-bottom:6px}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{text-align:left;padding:10px 6px;border-bottom:1px solid #e9e7e7;font-size:13px}th{color:#777}.total{text-align:right;font-size:19px;font-weight:bold;margin-top:18px}.notice{margin-top:28px;padding:12px;background:#fff7e9;color:#76511a;font-size:12px;border-radius:6px}.footer{margin-top:24px;color:#85828a;font-size:11px}@media(max-width:600px){.sheet{margin:0;padding:22px;border-radius:0}.grid{grid-template-columns:1fr}td,th{font-size:11px}}</style></head><body><main class="sheet"><div class="brand">ComputaFacil</div><div class="sub">Tecnologia com preço justo</div><h1>Comprovante do pedido</h1><span class="badge">Pagamento PIX confirmado</span><div class="grid"><div class="box"><strong>Pedido</strong>${escapeHtml(order.external_ref)}<br>Transação: ${escapeHtml(order.transaction_id)}<br>Data: ${new Date(order.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</div><div class="box"><strong>Cliente</strong>${escapeHtml(order.customer_name)}<br>${escapeHtml(order.customer_email)}<br>${escapeHtml(order.customer_phone)}</div><div class="box"><strong>Entrega</strong>${escapeHtml(shipping.street)}, ${escapeHtml(shipping.number)} ${escapeHtml(shipping.complement)}<br>${escapeHtml(shipping.neighborhood)} · ${escapeHtml(shipping.city)} / ${escapeHtml(shipping.state)}<br>CEP ${escapeHtml(shipping.zipCode)}</div></div><table><thead><tr><th>Produto</th><th>Qtd.</th><th>Unitário</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Total: ${money(order.amount_cents)}</div><div class="notice">Este arquivo é um comprovante do pedido e do pagamento. Não substitui a Nota Fiscal Eletrônica (NF-e) autorizada pela Secretaria da Fazenda.</div><div class="footer">ComputaFacil · Guarde este arquivo para consultar os dados do pedido.</div></main></body></html>`;
  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': `attachment; filename="computafacil-${order.external_ref}.html"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}
