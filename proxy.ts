import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';

export default function proxy(request: NextRequest) {
  if (!process.env.NEON_AUTH_COOKIE_SECRET) {
    return NextResponse.json({ error: 'A área da conta está temporariamente indisponível.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return getAuth().middleware({ loginUrl: '/?login=required' })(request);
}

export const config = { matcher: ['/minha-conta/:path*'] };
