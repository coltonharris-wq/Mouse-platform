import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const funnels = await supabaseQuery(
      'lead_funnels', 'GET', undefined,
      `reseller_id=eq.${resellerId}&order=created_at.desc&select=*`
    );

    return NextResponse.json({ funnels: funnels || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reseller_id, business_id, business_name, industry_template,
      headline, subheadline, cta_text, services, testimonial,
      capture_fields, follow_up_config, ad_copy, lead_plan,
      monthly_target, reseller_price_cents, brand_color,
      landing_page_html,
    } = body;

    if (!reseller_id || !business_name || !headline || !industry_template) {
      return NextResponse.json(
        { error: 'reseller_id, business_name, headline, and industry_template are required' },
        { status: 400 }
      );
    }

    const baseCosts: Record<string, number> = {
      starter: 19700,
      growth: 39700,
      scale: 79700,
    };

    const rows = await supabaseQuery('lead_funnels', 'POST', {
      reseller_id,
      business_id: business_id || null,
      business_name,
      industry_template,
      headline,
      subheadline: subheadline || null,
      cta_text: cta_text || 'Get Your Free Quote',
      services: JSON.stringify(services || []),
      testimonial: testimonial || null,
      capture_fields: JSON.stringify(capture_fields || ['name', 'phone', 'email']),
      follow_up_config: JSON.stringify(follow_up_config || { auto_text: true, auto_email: true, auto_call: false }),
      ad_copy: ad_copy ? JSON.stringify(ad_copy) : null,
      lead_plan: lead_plan || 'starter',
      monthly_target: monthly_target || 10,
      base_cost_cents: baseCosts[lead_plan || 'starter'] || 19700,
      reseller_price_cents: reseller_price_cents || 49700,
      brand_color: brand_color || '#0D9488',
      landing_page_html: landing_page_html || null,
      status: 'draft',
    });

    return NextResponse.json(rows?.[0] || { success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
