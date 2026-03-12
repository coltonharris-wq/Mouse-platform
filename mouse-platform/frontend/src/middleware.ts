import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Normalize: strip port for local dev
  const host = hostname.split(':')[0];

  // mice.ink → Reseller portal
  if (host === 'mice.ink' || host === 'www.mice.ink') {
    // Allow API routes to pass through
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Allow /reseller/* paths to pass through
    if (pathname.startsWith('/reseller')) {
      return NextResponse.next();
    }

    // Root of mice.ink → reseller portal
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/reseller', request.url));
    }

    // Any other path on mice.ink → rewrite to /reseller/{path}
    const resellerPath = `/reseller${pathname}`;
    return NextResponse.rewrite(new URL(resellerPath, request.url));
  }

  // mouse.is → Customer portal (default behavior, no rewrite needed)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
