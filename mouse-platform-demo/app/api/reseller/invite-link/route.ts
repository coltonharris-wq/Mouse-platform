export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/reseller/invite-link
 *
 * Returns the current reseller's invite code and URL. Requires Bearer token.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: reseller, error } = await supabase
      .from('resellers')
      .select('id, invite_code, company_name, name')
      .eq('user_id', user.id)
      .single();

    if (error || !reseller) {
      return NextResponse.json({ error: 'Reseller not found' }, { status: 403 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mouse.is';
    const inviteUrl = reseller.invite_code
      ? `${baseUrl}/signup?ref=${reseller.invite_code}`
      : null;

    return NextResponse.json({
      success: true,
      inviteCode: reseller.invite_code,
      inviteUrl,
      companyName: reseller.company_name || reseller.name || undefined,
      message: reseller.invite_code
        ? 'Share this link with customers to sign up under your reseller account.'
        : 'Ask an admin to generate an invite code for you.',
    });
  } catch (err: any) {
    console.error('Invite link error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
