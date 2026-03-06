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
    const customerId = `cst_${userId?.substring(0, 8)}`;

    // Create customer record — only use columns that exist in the table
    const { error: customerError } = await supabase.from('customers').insert({
      id: customerId,
      email,
      company_name: company || 'My Business',
      status: 'active',
      work_hours_balance: 2,
      work_hours_purchased: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (customerError) {
      console.error('Customer record creation error:', JSON.stringify(customerError));
    }

    // Sign in to get tokens
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return NextResponse.json({
      success: true,
      userId,
      customerId,
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
