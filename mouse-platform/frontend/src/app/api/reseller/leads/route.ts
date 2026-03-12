import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reseller_id, company_name, industry, location, phone, email, website, employee_count, notes, source } = body;

    if (!reseller_id || !company_name) {
      return NextResponse.json({ error: 'reseller_id and company_name required' }, { status: 400 });
    }

    const rows = await supabaseQuery('saved_leads', 'POST', {
      reseller_id,
      company_name,
      industry: industry || null,
      location: location || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      employee_count: employee_count || null,
      notes: notes || null,
      source: source || 'manual',
      status: 'new',
    });

    return NextResponse.json(rows?.[0] || { success: true });
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

    const leads = await supabaseQuery(
      'saved_leads', 'GET', undefined,
      `reseller_id=eq.${resellerId}&order=created_at.desc&select=*`
    );

    return NextResponse.json({ leads: leads || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
