/**
 * GET /api/pro-profiles
 * Returns active pro templates grouped by industry for landing page selection.
 * Also supports legacy pro_profiles for marketplace compatibility.
 */

import { NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

interface ProTemplate {
  industry: string;
  industry_display: string;
  icon: string | null;
  niche: string;
  display_name: string;
  capabilities: string | null;
  sort_order: number;
}

interface NicheItem {
  niche: string;
  display_name: string;
}

interface IndustryGroup {
  industry: string;
  industry_display: string;
  icon: string | null;
  niches: NicheItem[];
}

export async function GET() {
  try {
    // Fetch active pro templates grouped for landing page
    const templates: ProTemplate[] = await supabaseQuery(
      'pro_templates',
      'GET',
      undefined,
      'active=eq.true&order=sort_order.asc,display_name.asc&select=industry,industry_display,icon,niche,display_name,capabilities,sort_order'
    );

    // Group by industry
    const industryMap = new Map<string, IndustryGroup>();

    for (const t of templates || []) {
      if (!industryMap.has(t.industry)) {
        industryMap.set(t.industry, {
          industry: t.industry,
          industry_display: t.industry_display,
          icon: t.icon,
          niches: [],
        });
      }
      industryMap.get(t.industry)!.niches.push({
        niche: t.niche,
        display_name: t.display_name,
      });
    }

    const industries = Array.from(industryMap.values());

    // Also fetch legacy pro_profiles for marketplace compatibility
    let profiles: unknown[] = [];
    try {
      profiles = await supabaseQuery(
        'pro_profiles',
        'GET',
        undefined,
        'is_active=eq.true&order=sort_order.asc&select=slug,name,description,icon_url,category,onboarding_questions,dashboard_modules,tools,workflows'
      ) || [];
    } catch {
      // pro_profiles table may not exist yet — that's fine
    }

    return NextResponse.json({ industries, profiles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PRO_PROFILES]', message);
    return NextResponse.json(
      { error: 'Failed to fetch pro profiles' },
      { status: 500 }
    );
  }
}
