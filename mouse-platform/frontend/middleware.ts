/**
 * NEXT.JS MIDDLEWARE
 * Applies anti-clone guardrails to all API routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyRequestGuardrails, applyOutputFiltering } from './src/lib/guardrail-middleware';

// Routes that should skip guardrails (e.g., auth, webhooks)
const SKIP_GUARDRAILS = [
  '/api/auth/',
  '/api/webhooks/',
  '/api/health',
  '/api/admin/guardrails/' // Don't guardrail the guardrail admin APIs
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this route should skip guardrails
  if (SKIP_GUARDRAILS.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Apply guardrails
  const { allowed, response, context } = await applyRequestGuardrails(request);

  if (!allowed && response) {
    return response;
  }

  // Continue to handler with guardrail context in headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-kingmouse-customer-id', context.customerId);
  requestHeaders.set('x-kingmouse-request-id', context.requestId);
  requestHeaders.set('x-kingmouse-risk-score', context.riskScore.toString());

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure matcher
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
