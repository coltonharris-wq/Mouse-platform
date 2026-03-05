export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Use anon key for sign-in (respects RLS)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: 401 }
      );
    }

    // Get user metadata for role
    const accountType = data.user?.user_metadata?.account_type || 'customer';
    let role = accountType;
    if (accountType === 'admin') role = 'platform_owner';

    // Try to get customer data
    let customerData = null;
    try {
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      const { data: customer } = await adminSupabase
        .from('customers')
        .select('*')
        .eq('id', data.user?.id)
        .single();
      customerData = customer;
      if (customer?.account_type) {
        role = customer.account_type;
        if (role === 'admin') role = 'platform_owner';
      }
    } catch (e) {
      // Non-fatal - continue with auth metadata
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
      email: data.user?.email || email,
      token: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      role,
      accountType,
      portal: accountType,
      redirectTo: accountType === 'admin' ? '/admin' : '/portal',
      canSwitchPortals: accountType === 'admin',
      availablePortals: accountType === 'admin' ? ['admin', 'customer', 'reseller'] : [accountType],
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
