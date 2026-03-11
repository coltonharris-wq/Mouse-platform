/**
 * GET /api/pro-profiles
 * List all active Pro profiles for marketplace/onboarding
 */

import { NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET() {
  try {
    const profiles = await supabaseQuery(
      'pro_profiles',
      'GET',
      undefined,
      'is_active=eq.true&order=sort_order.asc&select=slug,name,description,icon_url,category,onboarding_questions,dashboard_modules,tools,workflows'
    );

    return NextResponse.json({ profiles: profiles || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PRO_PROFILES]', message);
    return NextResponse.json(
      { error: 'Failed to fetch pro profiles' },
      { status: 500 }
    );
  }
}
