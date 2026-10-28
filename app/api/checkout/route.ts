import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/catalog';
import { getAuth } from '@/lib/auth/server';
import { attachPaymentToOrder, createOrderRecord, failOrder } from '@/lib/db';

export const runtime = 'nodejs';
const digits = (value: unknown) => String(value ?? '').replace(/\D/g, '');
const text = (value: unknown, maxLength = 200) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const MAX_REQUEST_BYTES = 32_768;
async function readLimitedJson(request: NextRequest) {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_REQUEST_BYTES) throw new Error('REQUEST_TOO_LARGE');
  if (!request.body) throw new Error('INVALID_JSON');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new Error('REQUEST_TOO_LARGE');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new Error('INVALID_JSON'); }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin) {
    try { if (new URL(origin).origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Origem da solicitação inválida.' }, { status: 403 }); }
    catch { return NextResponse.json({ error: 'Origem da solicitação inválida.' }, { status: 403 }); }
  }
  if (!origin && request.headers.get('sec-fetch-site') === 'cross-site') return NextResponse.json({ error: 'Origem da solicitação inválida.' }, { status: 403 });
  if (!process.env.NEON_AUTH_COOKIE_SECRET) {
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
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'O banco de pedidos não está conectado. Configure DATABASE_URL na Vercel para habilitar o PIX.' }, { status: 503 });
  try {
    const body = await readLimitedJson(request);
    const { customer = {}, address = {}, paymentMethod, cart = [] } = body;
    const customerName = text(customer.name, 120);
    const customerEmail = text(customer.email, 254).toLowerCase();
    const customerPhone = digits(customer.phone);
    const customerCpf = digits(customer.cpf);
    const street = text(address.street, 120);
    const number = text(address.number, 20);
    const complement = text(address.complement, 100);
    const neighborhood = text(address.neighborhood, 80);
    const city = text(address.city, 80);
    const state = text(address.state, 2).toUpperCase();
    const zipCode = digits(address.zipCode);
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
    if (paymentMethod !== 'pix') return NextResponse.json({ error: 'No momento, aceitamos somente PIX.' }, { status: 400 });
    const method = 'pix';
    const externalRef = `CF-${crypto.randomUUID()}`;
    const customerData = { name: customerName, email: customerEmail, phone: customerPhone, document: { number: customerCpf, type: 'cpf' } };
    const shippingData = { name: customerName, street, number, complement, neighborhood, city, state, zipCode };
    const payload: Record<string, unknown> = {
      amount: total, currency: 'BRL', paymentMethod: method, items,
      customer: customerData,
      shipping: shippingData,
      externalRef,
      postbackUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, '')}/api/webhook/blackcat`,
    };
    payload.pix = { expiresInDays: 1 };
    try {
      await createOrderRecord({ id: crypto.randomUUID(), externalRef, userId, customerName: customerData.name, email: customerData.email, phone: customerData.phone, shipping: shippingData, items, amountCents: total, paymentMethod: method });
    } catch (error) {
      const dbError = error as { name?: string; code?: string };
      console.error('[checkout] order persistence failed', { name: dbError?.name, code: dbError?.code });
      return NextResponse.json({ error: 'Não foi possível registrar seu pedido com segurança. Tente novamente.' }, { status: 503 });
    }
    let response: Response;
    try {
      response = await fetch('https://api.blackcatoficial.com/api/sales/create-sale', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey }, body: JSON.stringify(payload), cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    } catch {
      await failOrder(externalRef).catch(() => {});
      return NextResponse.json({ error: 'A Blackcat está indisponível no momento. Seu pedido não foi cobrado; tente novamente.' }, { status: 502 });
    }
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      await failOrder(externalRef).catch(() => {});
      return NextResponse.json({ error: 'A operadora não conseguiu iniciar o pagamento. Confira os dados ou tente novamente.' }, { status: response.status >= 400 && response.status < 500 ? response.status : 502 });
    }
    if (typeof result.data?.transactionId !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(result.data.transactionId)) {
      await failOrder(externalRef).catch(() => {});
      return NextResponse.json({ error: 'A operadora retornou uma resposta inválida. Tente novamente.' }, { status: 502 });
    }
    await attachPaymentToOrder(externalRef, String(result.data.transactionId), String(result.data.status || 'PENDING'), result.data.invoiceUrl);
    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'REQUEST_TOO_LARGE') return NextResponse.json({ error: 'Solicitação muito grande.' }, { status: 413 });
    const isValidationError = error instanceof Error && ['Produto ou quantidade inválida.', 'Capacidade de armazenamento inválida.', 'Selecione a capacidade do produto.'].includes(error.message);
    return NextResponse.json({ error: isValidationError ? error.message : 'Não foi possível concluir a solicitação.' }, { status: isValidationError ? 400 : 500 });
  }
}
