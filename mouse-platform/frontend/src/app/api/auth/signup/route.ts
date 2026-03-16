/**
 * POST /api/auth/signup
 * Create account with industry/niche/transcript from pre-auth demo chat.
 * Creates Supabase Auth user + customers row + links demo_session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      business_name,
      owner_name,
      phone,
      industry,
      niche,
      pro_template_id: clientProTemplateId,
      session_token,
      demo_chat_transcript,
      // Questionnaire fields (deployed signup flow)
      full_name,
      company_name,
      team_size,
      tools_used,
      biggest_pain,
      business_description,
      location,
    } = body;

    // Bridge naming: deployed sends full_name/company_name, local sends owner_name/business_name
    const resolvedOwnerName = owner_name || full_name || '';
    const resolvedBusinessName = business_name || company_name || '';

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
          business_name: resolvedBusinessName,
          owner_name: resolvedOwnerName,
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

    // 2. Use client-provided pro_template_id or look up from DB
    let proTemplateId: string | null = clientProTemplateId || null;
    if (!proTemplateId) {
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
    }

    // 3. Build onboarding_answers from questionnaire fields
    const onboardingAnswers: Record<string, unknown> = {};
    if (business_description) onboardingAnswers.business_description = business_description;
    if (biggest_pain) onboardingAnswers.biggest_pain = biggest_pain;
    if (tools_used) onboardingAnswers.tools_used = tools_used;
    if (team_size) onboardingAnswers.team_size = team_size;

    // 4. Create customers row
    const customerData: Record<string, unknown> = {
      user_id: userId,
      email,
      business_name: resolvedBusinessName,
      owner_name: resolvedOwnerName,
      company_name: resolvedBusinessName,
      phone: phone || null,
      industry,
      niche,
      location: location || null,
      pro_template_id: proTemplateId,
      demo_chat_transcript: demo_chat_transcript || [],
      onboarding_answers: onboardingAnswers,
      vm_status: 'pending',
      provisioning_status: 'pending',
      status: 'active',
    };

    const customers = await supabaseQuery('customers', 'POST', customerData);
    const customerId = customers?.[0]?.id;

    if (!customerId) {
      return NextResponse.json({ error: 'Failed to create customer record' }, { status: 500 });
    }

    // 5. Link demo_session if session_token provided
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

    // 6. Create profile row for auth (with full questionnaire data for backward compat)
    try {
      await supabaseQuery('profiles', 'POST', {
        id: userId,
        role: 'customer',
        customer_id: customerId,
        email,
        full_name: resolvedOwnerName,
        company_name: resolvedBusinessName,
        team_size: team_size || null,
        tools_used: tools_used || null,
        biggest_pain: biggest_pain || null,
        business_description: business_description || null,
        location: location || null,
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
