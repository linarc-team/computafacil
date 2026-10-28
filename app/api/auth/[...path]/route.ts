import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';

type AuthMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type AuthContext = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: AuthContext, method: AuthMethod) {
  const hasCookieSecret = Boolean(process.env.NEON_AUTH_COOKIE_SECRET);
  const headers = { 'Cache-Control': 'no-store, max-age=0' };
  if (!hasCookieSecret) {
    console.error('Auth is unavailable: missing cookie secret', { hasCookieSecret });
    return NextResponse.json({ error: 'O cadastro está temporariamente indisponível. Tente novamente mais tarde.' }, { status: 503, headers });
  }
  try {
    const handlers = getAuth().handler();
    return await handlers[method](request, context);
  } catch (error) {
    const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
    const name = error instanceof Error ? error.name : 'UnknownError';
    console.error('Auth handler failed', { name, upstreamStatus: Number.isInteger(status) ? status : 0 });
    return NextResponse.json({ error: 'O serviço de contas está indisponível. Tente novamente em instantes.' }, { status: 503, headers });
  }
}
export const GET = (request: Request, context: AuthContext) => handle(request, context, 'GET');
export const POST = (request: Request, context: AuthContext) => handle(request, context, 'POST');
export const PUT = (request: Request, context: AuthContext) => handle(request, context, 'PUT');
export const DELETE = (request: Request, context: AuthContext) => handle(request, context, 'DELETE');
export const PATCH = (request: Request, context: AuthContext) => handle(request, context, 'PATCH');
