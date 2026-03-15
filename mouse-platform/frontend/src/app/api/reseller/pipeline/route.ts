import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const deals = await supabaseQuery(
      'reseller_pipeline',
      'GET',
      undefined,
      `reseller_id=eq.${resellerId}&order=updated_at.desc`
    );

    return NextResponse.json({ deals: Array.isArray(deals) ? deals : [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reseller_id, lead_name, business_name, niche, industry, phone, email, estimated_monthly, notes, stage, source, lead_score, sales_angles, lead_intel, suggested_price } = body;

    if (!reseller_id || !lead_name) {
      return NextResponse.json({ error: 'reseller_id and lead_name required' }, { status: 400 });
    }

    const result = await supabaseQuery('reseller_pipeline', 'POST', {
      reseller_id,
      lead_name,
      business_name: business_name || '',
      niche: niche || '',
      industry: industry || '',
      phone: phone || '',
      email: email || '',
      estimated_monthly: estimated_monthly || 0,
      notes: notes || '',
      stage: stage || 'prospecting',
      source: source || 'manual',
      lead_score: lead_score || 0,
      sales_angles: sales_angles || [],
      lead_intel: lead_intel ? JSON.stringify(lead_intel) : null,
      suggested_price: suggested_price || null,
    });

    const deal = Array.isArray(result) ? result[0] : result;
    return NextResponse.json(deal, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const result = await supabaseQuery(
      'reseller_pipeline',
      'PATCH',
      updates,
      `id=eq.${id}`
    );

    const deal = Array.isArray(result) ? result[0] : result;
    return NextResponse.json(deal);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await supabaseQuery('reseller_pipeline', 'DELETE', undefined, `id=eq.${id}`);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
