import { NextRequest, NextResponse } from 'next/server';

/**
 * Domain-based routing middleware
 *
 * mice.ink → reseller portal (rewrites to /reseller, /signup/reseller, etc.)
 * mouse.is → customer portal (no changes, serves as-is)
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const isResellerDomain = hostname.includes('mice.ink');

  if (!isResellerDomain) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const response = getResellerRewrite(request, pathname);

  // Set domain cookie so client components can detect which domain they're on
  response.cookies.set('mouse-domain', 'reseller', {
    path: '/',
    sameSite: 'lax',
    secure: true,
  });

  return response;
}

function getResellerRewrite(request: NextRequest, pathname: string): NextResponse {
  // mice.ink/ → rewrite to /reseller (landing page)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/reseller';
    return NextResponse.rewrite(url);
  }

  // mice.ink/signup → rewrite to /signup/reseller
  if (pathname === '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/signup/reseller';
    return NextResponse.rewrite(url);
  }

  // mice.ink/login, mice.ink/dashboard/*, mice.ink/portal/* → serve as-is
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/signup', '/login', '/dashboard/:path*', '/portal/:path*'],
};
