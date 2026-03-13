import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reseller_id, company_name, industry, location, phone, email, website,
      employee_count, notes, source, intel, online_presence,
      estimated_monthly_value, place_id, status,
    } = body;

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
      status: status || 'new',
      intel: intel ? JSON.stringify(intel) : null,
      online_presence: online_presence ? JSON.stringify(online_presence) : null,
      estimated_monthly_value: estimated_monthly_value || 0,
      place_id: place_id || null,
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

    // Parse JSON fields
    const parsed = (leads || []).map((lead: Record<string, unknown>) => ({
      ...lead,
      intel: lead.intel ? (typeof lead.intel === 'string' ? JSON.parse(lead.intel as string) : lead.intel) : null,
      online_presence: lead.online_presence ? (typeof lead.online_presence === 'string' ? JSON.parse(lead.online_presence as string) : lead.online_presence) : null,
      products_sold: lead.products_sold || [],
      estimated_monthly_value: lead.estimated_monthly_value || 0,
      last_contacted: lead.last_contacted || null,
    }));

    return NextResponse.json({ leads: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
