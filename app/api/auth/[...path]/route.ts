import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';

type AuthMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type AuthContext = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: AuthContext, method: AuthMethod) {
  try {
    const handlers = getAuth().handler();
    return await handlers[method](request, context);
  } catch (error) {
    console.error('Neon Auth request failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'O sistema de contas ainda não está configurado. Tente novamente mais tarde.' }, { status: 503 });
  }
}
export const GET = (request: Request, context: AuthContext) => handle(request, context, 'GET');
export const POST = (request: Request, context: AuthContext) => handle(request, context, 'POST');
export const PUT = (request: Request, context: AuthContext) => handle(request, context, 'PUT');
export const DELETE = (request: Request, context: AuthContext) => handle(request, context, 'DELETE');
export const PATCH = (request: Request, context: AuthContext) => handle(request, context, 'PATCH');
