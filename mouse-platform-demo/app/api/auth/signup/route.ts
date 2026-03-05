export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, company, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        company_name: company || '',
        account_type: 'customer',
      },
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Signup failed' },
        { status: 400 }
      );
    }

    const userId = authData.user?.id;

    // Create customer record in customers table
    try {
      await supabase.from('customers').insert({
        id: userId,
        email,
        company_name: company || null,
        first_name: firstName || null,
        last_name: lastName || null,
        account_type: 'customer',
        status: 'active',
        created_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Customer record creation error (non-fatal):', dbError);
      // Don't fail signup if customer table insert fails - auth account exists
    }

    // Sign in to get tokens
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return NextResponse.json({
      success: true,
      userId,
      email,
      token: signInData?.session?.access_token || null,
      refreshToken: signInData?.session?.refresh_token || null,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
