import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/catalog';
import { getAuth } from '@/lib/auth/server';
import { attachPaymentToOrder, createOrderRecord, failOrder } from '@/lib/db';

export const runtime = 'nodejs';
const digits = (value: unknown) => String(value ?? '').replace(/\D/g, '');
const text = (value: unknown) => String(value ?? '').trim();

export async function POST(request: NextRequest) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
    return NextResponse.json({ error: 'Para comprar, primeiro entre ou crie uma conta. O cadastro está temporariamente indisponível enquanto a autenticação não é configurada.' }, { status: 503 });
  }
  let userId: string;
  try {
    const { data: session } = await getAuth().getSession();
    if (!session?.user) return NextResponse.json({ error: 'Entre ou crie sua conta antes de finalizar a compra.' }, { status: 401 });
    userId = session.user.id;
  } catch {
    return NextResponse.json({ error: 'Não foi possível validar sua sessão. Entre novamente.' }, { status: 401 });
  }
  const apiKey = process.env.BLACKCAT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'O gateway de pagamento ainda não foi ativado. Configure BLACKCAT_API_KEY na Vercel.' }, { status: 503 });
  try {
    const body = await request.json();
    const { customer = {}, address = {}, paymentMethod, cart = [], card = {} } = body;
    if (!text(customer.name) || !/^\S+@\S+\.\S+$/.test(text(customer.email)) || digits(customer.phone).length < 10 || digits(customer.cpf).length !== 11)
      return NextResponse.json({ error: 'Confira nome, e-mail, telefone e CPF.' }, { status: 400 });
    if (!text(address.street) || !text(address.number) || !text(address.neighborhood) || !text(address.city) || text(address.state).length !== 2 || digits(address.zipCode).length !== 8)
      return NextResponse.json({ error: 'Preencha um endereço de entrega completo.' }, { status: 400 });
    if (!Array.isArray(cart) || !cart.length || cart.length > 50) return NextResponse.json({ error: 'Carrinho inválido.' }, { status: 400 });
    const items = cart.map((entry: { id?: string; quantity?: number; variantSize?: string }) => {
      const item = products.find((product) => product.id === entry.id);
      const quantity = Number(entry.quantity);
      if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('Produto ou quantidade inválida.');
      const variant = entry.variantSize ? item.variants?.find((option) => option.size === entry.variantSize) : undefined;
      if (entry.variantSize && !variant) throw new Error('Capacidade de armazenamento inválida.');
      if (item.variants?.length && !variant) throw new Error('Selecione a capacidade do produto.');
      return { id: variant ? `${item.id}-${variant.size.toLowerCase().replace(/\s+/g, '')}` : item.id, title: variant ? `${item.name} ${variant.size}` : item.name, unitPrice: (variant?.price ?? item.price) * 100, quantity, tangible: true };
    });
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const method = paymentMethod === 'credit_card' ? 'credit_card' : paymentMethod === 'pix' ? 'pix' : null;
    if (!method) return NextResponse.json({ error: 'Forma de pagamento inválida.' }, { status: 400 });
    const externalRef = `CF-${crypto.randomUUID()}`;
    const customerData = { name: text(customer.name), email: text(customer.email), phone: digits(customer.phone), document: { number: digits(customer.cpf), type: 'cpf' } };
    const shippingData = { name: text(customer.name), street: text(address.street), number: text(address.number), complement: text(address.complement), neighborhood: text(address.neighborhood), city: text(address.city), state: text(address.state).toUpperCase(), zipCode: digits(address.zipCode) };
    const payload: Record<string, unknown> = {
      amount: total, currency: 'BRL', paymentMethod: method, items,
      customer: customerData,
      shipping: shippingData,
      externalRef,
      postbackUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, '')}/api/webhook/blackcat`,
    };
    if (method === 'pix') payload.pix = { expiresInDays: 1 };
    else {
      const installments = Number(card.installments || 1);
      if (digits(card.number).length < 13 || digits(card.cvv).length < 3 || !text(card.holderName) || !text(card.expiryMonth) || !text(card.expiryYear) || !Number.isInteger(installments) || installments < 1 || installments > 10)
        return NextResponse.json({ error: 'Confira os dados do cartão.' }, { status: 400 });
      payload.card = { number: digits(card.number), holderName: text(card.holderName).toUpperCase(), expiryMonth: text(card.expiryMonth), expiryYear: text(card.expiryYear), cvv: digits(card.cvv), installments };
      payload.device = { http_browser_language: 'pt-BR', http_browser_color_depth: 24, http_browser_screen_height: Number(request.headers.get('x-screen-height')) || 900, http_browser_screen_width: Number(request.headers.get('x-screen-width')) || 1440, http_browser_time_difference: 180, http_browser_javascript_enabled: true, user_agent: request.headers.get('user-agent') || '' };
    }
    try {
      await createOrderRecord({ id: crypto.randomUUID(), externalRef, userId, customerName: customerData.name, email: customerData.email, phone: customerData.phone, shipping: shippingData, items, amountCents: total, paymentMethod: method });
    } catch {
      return NextResponse.json({ error: 'Não foi possível registrar seu pedido com segurança. Tente novamente.' }, { status: 503 });
    }
    let response: Response;
    try {
      response = await fetch('https://api.blackcatoficial.com/api/sales/create-sale', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey }, body: JSON.stringify(payload), cache: 'no-store' });
    } catch {
      await failOrder(externalRef).catch(() => {});
      return NextResponse.json({ error: 'A Blackcat está indisponível no momento. Seu pedido não foi cobrado; tente novamente.' }, { status: 502 });
    }
    const result = await response.json();
    if (!response.ok || !result?.success) {
      await failOrder(externalRef).catch(() => {});
      return NextResponse.json({ error: result?.message || result?.error || 'Não foi possível iniciar o pagamento.' }, { status: response.status >= 400 && response.status < 500 ? response.status : 502 });
    }
    await attachPaymentToOrder(externalRef, String(result.data.transactionId), String(result.data.status || 'PENDING'), result.data.invoiceUrl);
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível concluir a solicitação.' }, { status: 400 });
  }
}
