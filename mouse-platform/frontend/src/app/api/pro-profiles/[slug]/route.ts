/**
 * GET /api/pro-profiles/[slug]
 * Get a single Pro profile by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const profiles = await supabaseQuery(
      'pro_profiles',
      'GET',
      undefined,
      `slug=eq.${slug}&is_active=eq.true&select=slug,name,description,icon_url,category,prompt_template,tools,workflows,onboarding_questions,dashboard_modules`
    );

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: 'Pro profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profiles[0]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PRO_PROFILES_SLUG]', message);
    return NextResponse.json(
      { error: 'Failed to fetch pro profile' },
      { status: 500 }
    );
  }
}
