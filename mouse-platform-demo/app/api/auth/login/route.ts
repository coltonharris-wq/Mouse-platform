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

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    let role = data.user?.user_metadata?.account_type || 'customer';
    let customerId: string | null = null;
    let accountType = role;

    // 1. Check resellers by user_id
    const { data: reseller } = await adminSupabase
      .from('resellers')
      .select('id')
      .eq('user_id', data.user?.id)
      .single();

    if (reseller) {
      role = 'reseller';
      accountType = 'reseller';
      // Resellers also have a customer record (for billing)
      const { data: cust } = await adminSupabase
        .from('customers')
        .select('id')
        .eq('user_id', data.user?.id)
        .single();
      customerId = cust?.id || null;
    } else {
      // 2. Check customers by user_id first, then by email (legacy)
      let customer: { id: string; account_type?: string } | null = null;
      const { data: byUserId } = await adminSupabase
        .from('customers')
        .select('id, account_type')
        .eq('user_id', data.user?.id)
        .single();
      if (byUserId) {
        customer = byUserId;
      } else {
        const { data: byEmail } = await adminSupabase
          .from('customers')
          .select('id, account_type')
          .eq('email', email)
          .single();
        customer = byEmail;
      }
      if (customer) {
        customerId = customer.id;
        if (customer.account_type) {
          role = customer.account_type === 'admin' ? 'platform_owner' : customer.account_type;
          accountType = role;
        }
      }
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
      email: data.user?.email || email,
      token: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      role,
      accountType,
      customerId,
      portal: accountType === 'admin' ? 'admin' : accountType === 'reseller' ? 'reseller' : 'customer',
      redirectTo: role === 'platform_owner' || role === 'admin' ? '/admin' : role === 'reseller' ? '/dashboard' : '/portal',
      canSwitchPortals: role === 'platform_owner' || role === 'admin',
      availablePortals: role === 'platform_owner' || role === 'admin' ? ['admin', 'customer', 'reseller'] : [accountType],
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
