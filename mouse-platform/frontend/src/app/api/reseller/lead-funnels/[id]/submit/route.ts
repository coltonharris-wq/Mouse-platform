import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

// Public endpoint — form submissions from landing pages
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get funnel to find reseller_id
    const funnels = await supabaseQuery(
      'lead_funnels', 'GET', undefined,
      `id=eq.${id}&select=id,reseller_id,customer_id,follow_up_config,leads_this_month`
    );

    if (!funnels || funnels.length === 0) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const funnel = funnels[0];

    // Save the lead
    await supabaseQuery('funnel_leads', 'POST', {
      funnel_id: id,
      reseller_id: funnel.reseller_id,
      customer_id: funnel.customer_id || null,
      name: body.name || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      custom_fields: body.custom_fields ? JSON.stringify(body.custom_fields) : null,
      status: 'new',
      follow_up_status: 'pending',
      source: 'landing_page',
    });

    // Increment leads_this_month
    await supabaseQuery('lead_funnels', 'PATCH', {
      leads_this_month: (funnel.leads_this_month || 0) + 1,
      updated_at: new Date().toISOString(),
    }, `id=eq.${id}`);

    // CORS headers for cross-origin form submissions
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Handle preflight for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
