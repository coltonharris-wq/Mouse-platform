import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const invites = await supabaseQuery(
      'reseller_invites',
      'GET',
      undefined,
      `reseller_id=eq.${resellerId}&order=sent_at.desc`
    );

    return NextResponse.json({ invites: Array.isArray(invites) ? invites : [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reseller_id, email, name, industry, niche, custom_rate } = body;

    if (!reseller_id || !email) {
      return NextResponse.json({ error: 'reseller_id and email required' }, { status: 400 });
    }

    const invite_code = generateInviteCode();

    const result = await supabaseQuery('reseller_invites', 'POST', {
      reseller_id,
      email,
      name: name || '',
      industry: industry || '',
      niche: niche || '',
      custom_rate: custom_rate || 7.48,
      invite_code,
      status: 'sent',
    });

    const invite = Array.isArray(result) ? result[0] : result;

    return NextResponse.json({
      ...invite,
      invite_url: `${request.nextUrl.origin}/signup?ref=${invite_code}`,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
