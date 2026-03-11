/**
 * GET /api/dashboard/modules?customer_id=xxx
 * Returns dashboard module config for a customer based on their Pro
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { DASHBOARD_MODULES } from '@/config/dashboard-modules';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customer_id required' },
        { status: 400 }
      );
    }

    // Look up customer's pro_slug
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=pro_slug`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const proSlug = customers[0].pro_slug;

    if (!proSlug) {
      return NextResponse.json(
        { error: 'Customer has no Pro profile assigned' },
        { status: 404 }
      );
    }

    // Look up Pro profile's dashboard_modules
    const profiles = await supabaseQuery(
      'pro_profiles',
      'GET',
      undefined,
      `slug=eq.${proSlug}&select=name,dashboard_modules`
    );

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: 'Pro profile not found' },
        { status: 404 }
      );
    }

    const profile = profiles[0];
    const moduleSlugs: string[] = profile.dashboard_modules || [];

    // Map through module registry
    const modules = moduleSlugs
      .map((slug: string) => {
        const mod = DASHBOARD_MODULES[slug];
        if (!mod) return null;
        return {
          slug: mod.slug,
          name: mod.name,
          icon: mod.icon,
          route: mod.route,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      pro_slug: proSlug,
      pro_name: profile.name,
      modules,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[DASHBOARD_MODULES]', message);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard modules' },
      { status: 500 }
    );
  }
}
