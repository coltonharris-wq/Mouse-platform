import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl, getBrandedUrl } from '@/lib/urls';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reseller_id, business_name, business_email, contact_name, phone, pro_slug, custom_price_cents } = body;

    if (!reseller_id || !business_name || !business_email) {
      return NextResponse.json({ error: 'reseller_id, business_name, and business_email required' }, { status: 400 });
    }

    // Generate invite code from business name
    const code = business_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30)
      + '-' + Math.random().toString(36).slice(2, 8);

    // Prefer brand slug URL if reseller has one
    let url: string;
    const resellerRows = await supabaseQuery('resellers', 'GET', undefined,
      `id=eq.${reseller_id}&select=brand_slug`
    );
    const brandSlug = resellerRows?.[0]?.brand_slug;
    if (brandSlug) {
      url = getBrandedUrl(brandSlug);
    } else {
      url = getCustomerUrl(`/join/${code}`);
    }

    // Create invite link
    const linkRows = await supabaseQuery('reseller_invite_links', 'POST', {
      reseller_id,
      code,
      url,
      label: business_name,
      pro_slug: pro_slug || null,
    });

    const inviteLinkId = linkRows?.[0]?.id || null;

    // Create business record
    const bizRows = await supabaseQuery('reseller_businesses', 'POST', {
      reseller_id,
      business_name,
      business_email,
      contact_name: contact_name || null,
      phone: phone || null,
      pro_slug: pro_slug || null,
      custom_price_cents: custom_price_cents || null,
      invite_link_id: inviteLinkId,
      status: 'invited',
    });

    return NextResponse.json({
      business_id: bizRows?.[0]?.id,
      invite_link: url,
      invite_code: code,
      status: 'invited',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const businesses = await supabaseQuery(
      'reseller_businesses', 'GET', undefined,
      `reseller_id=eq.${resellerId}&order=created_at.desc&select=*`
    );

    return NextResponse.json({ businesses: businesses || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
