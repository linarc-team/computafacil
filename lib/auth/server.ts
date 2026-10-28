import { createNeonAuth } from '@neondatabase/auth/next/server';

const NEON_AUTH_BASE_URL = 'https://ep-solitary-poetry-b6tl1ewq.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth';

export function getAuth() {
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!cookieSecret) throw new Error('Neon Auth ainda não foi configurado.');
  return createNeonAuth({ baseUrl: NEON_AUTH_BASE_URL, cookies: { secret: cookieSecret } });
}
