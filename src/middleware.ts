import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const getSecret = () =>
  new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);

// Rate limiter en mémoire — max 5 tentatives par IP par fenêtre de 15 minutes
// Note: en multi-instance (prod Vercel), utiliser Upstash Redis pour partager l'état
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting sur les POST vers /admin/login
  if (pathname === '/admin/login' && request.method === 'POST') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1';

    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900',
          },
        }
      );
    }
  }

  // Laisser passer la page de login
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // Protéger toutes les routes /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token, getSecret());
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
