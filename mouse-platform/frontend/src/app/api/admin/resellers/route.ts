/**
 * GET /api/admin/resellers — list all resellers
 * PATCH /api/admin/resellers — update reseller markup cap
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET() {
  try {
    const resellers = await supabaseQuery(
      'resellers',
      'GET',
      undefined,
      'select=id,name,slug,email,markup_cap_percent,commission_percent,custom_domain,status,created_at&order=created_at.desc'
    );

    return NextResponse.json({ resellers: resellers || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ADMIN_RESELLERS]', message);
    return NextResponse.json({ error: 'Failed to fetch resellers' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { reseller_id, markup_cap_percent, commission_percent } = await request.json();

    if (!reseller_id) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (markup_cap_percent !== undefined) updates.markup_cap_percent = markup_cap_percent;
    if (commission_percent !== undefined) updates.commission_percent = commission_percent;

    await supabaseQuery('resellers', 'PATCH', updates, `id=eq.${reseller_id}`);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ADMIN_RESELLERS_PATCH]', message);
    return NextResponse.json({ error: 'Failed to update reseller' }, { status: 500 });
  }
}
