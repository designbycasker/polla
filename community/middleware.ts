import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const middleware = auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  const publicPaths = ['/login', '/api/auth', '/preview'];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/feed', req.url));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.svg).*)'],
};
