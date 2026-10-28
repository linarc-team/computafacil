import { neon } from '@neondatabase/serverless';

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL ainda não foi configurada.');
  return neon(databaseUrl);
}

export async function ensureOrdersTable() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS computafacil_orders (
    id text PRIMARY KEY,
    external_ref text UNIQUE NOT NULL,
    transaction_id text UNIQUE,
    user_id text NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    shipping jsonb NOT NULL,
    items jsonb NOT NULL,
    amount_cents integer NOT NULL CHECK (amount_cents > 0),
    payment_method text NOT NULL,
    payment_status text NOT NULL DEFAULT 'PENDING',
    invoice_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS computafacil_orders_user_created_idx ON computafacil_orders (user_id, created_at DESC)`;
  return sql;
}

export async function createOrderRecord(order: {
  id: string; externalRef: string; userId: string; customerName: string; email: string; phone: string;
  shipping: Record<string, string>; items: Array<{ id: string; title: string; quantity: number; unitPrice: number }>;
  amountCents: number; paymentMethod: string;
}) {
  const sql = await ensureOrdersTable();
  await sql`INSERT INTO computafacil_orders
    (id, external_ref, user_id, customer_name, customer_email, customer_phone, shipping, items, amount_cents, payment_method)
    VALUES (${order.id}, ${order.externalRef}, ${order.userId}, ${order.customerName}, ${order.email}, ${order.phone},
      ${JSON.stringify(order.shipping)}::jsonb, ${JSON.stringify(order.items)}::jsonb, ${order.amountCents}, ${order.paymentMethod})`;
}

export async function attachPaymentToOrder(externalRef: string, transactionId: string, status: string, invoiceUrl?: string) {
  const sql = await ensureOrdersTable();
  await sql`UPDATE computafacil_orders SET transaction_id=${transactionId}, payment_status=${status}, invoice_url=${invoiceUrl || null}, updated_at=now() WHERE external_ref=${externalRef}`;
}

export async function failOrder(externalRef: string) {
  const sql = await ensureOrdersTable();
  await sql`UPDATE computafacil_orders SET payment_status='FAILED', updated_at=now() WHERE external_ref=${externalRef} AND transaction_id IS NULL`;
}

export async function updateOrderFromGateway(transactionId: string, status: string) {
  const sql = await ensureOrdersTable();
  await sql`UPDATE computafacil_orders SET payment_status=${status}, updated_at=now() WHERE transaction_id=${transactionId} AND payment_status <> ${status}`;
}

export async function orderBelongsToUser(transactionId: string, userId: string) {
  const sql = await ensureOrdersTable();
  const rows = await sql`SELECT transaction_id FROM computafacil_orders WHERE transaction_id=${transactionId} AND user_id=${userId} LIMIT 1`;
  return rows.length > 0;
}
