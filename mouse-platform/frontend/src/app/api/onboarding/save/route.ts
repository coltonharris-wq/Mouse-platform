/**
 * POST /api/onboarding/save
 * Persist onboarding form data to DB so it survives the Stripe redirect.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_key,
      business_name,
      owner_name,
      email,
      location,
      business_type,
      pro_slug,
      plan_slug,
      needs_goals,
      onboarding_answers,
      reseller_brand_slug,
      attribution_source,
    } = body;

    // Generate session_key if not provided
    const key = session_key || crypto.randomUUID();

    // Upsert — update if session_key exists, insert otherwise
    const existing = await supabaseQuery(
      'onboarding_sessions',
      'GET',
      undefined,
      `session_key=eq.${key}&select=id`
    );

    if (existing && existing.length > 0) {
      // Update existing session
      await supabaseQuery('onboarding_sessions', 'PATCH', {
        business_name,
        owner_name,
        email,
        location,
        business_type,
        pro_slug,
        plan_slug,
        needs_goals: needs_goals || [],
        onboarding_answers: onboarding_answers || {},
        reseller_brand_slug: reseller_brand_slug || null,
        attribution_source: attribution_source || 'direct',
        updated_at: new Date().toISOString(),
      }, `session_key=eq.${key}`);
    } else {
      // Insert new session
      await supabaseQuery('onboarding_sessions', 'POST', {
        session_key: key,
        business_name,
        owner_name,
        email,
        location,
        business_type,
        pro_slug,
        plan_slug,
        needs_goals: needs_goals || [],
        onboarding_answers: onboarding_answers || {},
        reseller_brand_slug: reseller_brand_slug || null,
        attribution_source: attribution_source || 'direct',
      });
    }

    return NextResponse.json({ success: true, session_key: key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ONBOARDING_SAVE]', message);
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
