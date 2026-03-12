/**
 * GET /api/onboarding/[session_key]
 * Retrieve saved onboarding data (used after Stripe redirect).
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ session_key: string }> }
) {
  try {
    const { session_key } = await params;

    if (!session_key) {
      return NextResponse.json({ error: 'session_key required' }, { status: 400 });
    }

    const rows = await supabaseQuery(
      'onboarding_sessions',
      'GET',
      undefined,
      `session_key=eq.${session_key}&select=*`
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ONBOARDING_GET]', message);
    return NextResponse.json(
      { error: 'Failed to retrieve onboarding data' },
      { status: 500 }
    );
  }
}
