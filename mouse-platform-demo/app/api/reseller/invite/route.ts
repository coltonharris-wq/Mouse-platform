export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/reseller/invite?code=ABC123
 * 
 * Validate a reseller invite code and return reseller details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up reseller by invite code
    const { data: reseller, error } = await supabase
      .from('resellers')
      .select('id, company_name, pricing_config, stripe_account_id, status')
      .eq('invite_code', code)
      .single();

    if (error || !reseller) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    if (reseller.status !== 'active') {
      return NextResponse.json({ error: 'Reseller account inactive' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      reseller: {
        id: reseller.id,
        companyName: reseller.company_name,
        pricing: reseller.pricing_config,
        stripeAccountId: reseller.stripe_account_id,
      },
    });
  } catch (error: any) {
    console.error('Reseller invite validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/reseller/invite
 * 
 * Generate a new invite code for a reseller (admin/reseller only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resellerId, pricingConfig } = body;

    if (!resellerId) {
      return NextResponse.json({ error: 'Reseller ID required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique invite code
    const inviteCode = generateInviteCode();

    // Update reseller with new invite code and pricing config
    const { error } = await supabase
      .from('resellers')
      .update({
        invite_code: inviteCode,
        pricing_config: pricingConfig || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resellerId);

    if (error) {
      console.error('Failed to generate invite code:', error);
      return NextResponse.json({ error: 'Failed to generate invite code' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      inviteCode,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${inviteCode}`,
    });
  } catch (error: any) {
    console.error('Generate invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateInviteCode(): string {
  // Generate 8-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
