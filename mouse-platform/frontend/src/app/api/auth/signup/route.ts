/**
 * POST /api/auth/signup
 * Create account with industry/niche/transcript from pre-auth demo chat.
 * Creates Supabase Auth user + customers row + links demo_session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      business_name,
      owner_name,
      phone,
      industry,
      niche,
      session_token,
      demo_chat_transcript,
    } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (!industry || !niche) {
      return NextResponse.json({ error: 'Industry and niche required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. Create Supabase Auth user
    const authRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          business_name: business_name || '',
          owner_name: owner_name || '',
          phone: phone || '',
        },
      }),
    });

    if (!authRes.ok) {
      const errData = await authRes.json().catch(() => ({}));
      const msg = errData.msg || errData.error_description || errData.message || 'Signup failed';
      return NextResponse.json({ error: msg }, { status: authRes.status });
    }

    const authUser = await authRes.json();
    const userId = authUser.id || authUser.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // 2. Look up pro_template_id
    let proTemplateId: string | null = null;
    try {
      const templates = await supabaseQuery(
        'pro_templates',
        'GET',
        undefined,
        `industry=eq.${encodeURIComponent(industry)}&niche=eq.${encodeURIComponent(niche)}&active=eq.true&select=id&limit=1`
      );
      if (templates && templates.length > 0) {
        proTemplateId = templates[0].id;
      }
    } catch {
      // Non-fatal — continue without template link
    }

    // 3. Create customers row
    const customerData: Record<string, unknown> = {
      user_id: userId,
      email,
      business_name: business_name || '',
      owner_name: owner_name || '',
      phone: phone || null,
      industry,
      niche,
      pro_template_id: proTemplateId,
      demo_chat_transcript: demo_chat_transcript || [],
      provisioning_status: 'pending',
      status: 'active',
    };

    const customers = await supabaseQuery('customers', 'POST', customerData);
    const customerId = customers?.[0]?.id;

    if (!customerId) {
      return NextResponse.json({ error: 'Failed to create customer record' }, { status: 500 });
    }

    // 4. Link demo_session if session_token provided
    if (session_token) {
      try {
        await supabaseQuery(
          'demo_sessions',
          'PATCH',
          {
            converted: true,
            customer_id: customerId,
          },
          `session_token=eq.${encodeURIComponent(session_token)}`
        );
      } catch {
        // Non-fatal
      }
    }

    // 5. Create profile row for auth
    try {
      await supabaseQuery('profiles', 'POST', {
        id: userId,
        role: 'customer',
        customer_id: customerId,
        email,
      });
    } catch {
      // Profile may already exist via trigger
    }

    return NextResponse.json({
      user_id: userId,
      customer_id: customerId,
      access_token: authUser.access_token || authUser.session?.access_token || null,
    });
  } catch (err: unknown) {
    console.error('[AUTH_SIGNUP]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
