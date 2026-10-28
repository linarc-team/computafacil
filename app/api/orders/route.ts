import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';
import { listOrdersForUser } from '@/lib/db';
import { products } from '@/lib/catalog';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { data: session } = await getAuth().getSession();
    if (!session?.user) return NextResponse.json({ error: 'Entre na sua conta para ver suas entregas.' }, { status: 401 });

    const rows = await listOrdersForUser(session.user.id);
    const orders = rows.map((row) => ({
      reference: row.external_ref,
      transactionId: row.transaction_id,
      items: row.items,
      amountCents: row.amount_cents,
      status: row.tracking_code ? 'IN_TRANSIT' : row.payment_status,
      trackingCode: row.tracking_code,
      createdAt: row.created_at,
      demo: false,
    }));

    if (session.user.email.trim().toLowerCase() === 'testando2@gmail.com') {
      const demoProducts = products.filter((product) => product.category === 'Periféricos');
      const product = demoProducts[Math.floor(Math.random() * demoProducts.length)];
      if (product) orders.unshift({
        reference: 'CF-DEMO-10428',
        transactionId: null,
        items: [{ title: product.name, quantity: 1, unitPrice: Math.round(product.price * 100) }],
        amountCents: Math.round(product.price * 100),
        status: 'DELIVERED',
        trackingCode: null,
        createdAt: new Date().toISOString(),
        demo: true,
      });
    }

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Não foi possível carregar suas entregas agora.' }, { status: 503 });
  }
}
