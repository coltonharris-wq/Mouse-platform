import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl, getBrandedUrl } from '@/lib/urls';

export async function POST(request: NextRequest) {
  try {
    const { reseller_id, code, label, pro_slug, plan_slug, discount_percent } = await request.json();
    if (!reseller_id || !code) {
      return NextResponse.json({ error: 'reseller_id and code required' }, { status: 400 });
    }

    // Prefer brand slug URL if reseller has one; fall back to /join/{code}
    let url: string;
    const resellers = await supabaseQuery('resellers', 'GET', undefined,
      `id=eq.${reseller_id}&select=brand_slug`
    );
    const brandSlug = resellers?.[0]?.brand_slug;
    if (brandSlug && !pro_slug && !plan_slug) {
      // Use branded landing page URL for generic links
      url = getBrandedUrl(brandSlug);
    } else {
      url = getCustomerUrl(`/join/${code}`);
    }

    const rows = await supabaseQuery('reseller_invite_links', 'POST', {
      reseller_id,
      code: code.toLowerCase(),
      url,
      label,
      pro_slug,
      plan_slug,
      discount_percent: discount_percent || 0,
    });

    return NextResponse.json(rows?.[0] || { success: true, url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });

    const links = await supabaseQuery('reseller_invite_links', 'GET', undefined,
      `reseller_id=eq.${resellerId}&order=created_at.desc&select=*`
    );
    return NextResponse.json({ links: links || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
