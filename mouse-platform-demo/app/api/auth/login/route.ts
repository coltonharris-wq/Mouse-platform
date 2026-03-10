export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Must match lib/admin-auth.ts — only these emails get admin access
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'colton.harris@automioapp.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request: NextRequest) {
  try {
    const { data: body, error: bodyError } = await import('@/lib/safe-json').then(m => m.safeParseJson<{ email?: string; password?: string }>(request));
    if (bodyError) {
      return NextResponse.json({ error: bodyError }, { status: 400 });
    }
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
    let resellerId: string | null = null;
    let accountType = role;

    // 1. Check resellers by user_id
    const { data: reseller } = await adminSupabase
      .from('resellers')
      .select('id')
      .eq('user_id', data.user?.id)
      .single();

    const userEmail = (data.user?.email || email || '').toLowerCase();
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);

    if (reseller) {
      role = 'reseller';
      accountType = 'reseller';
      resellerId = reseller.id;
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
        // Admin access ONLY from ADMIN_EMAILS list (not account_type in DB)
        if (isAdminEmail) {
          role = 'platform_owner';
          accountType = 'admin';
        } else if (customer.account_type && customer.account_type !== 'admin') {
          role = customer.account_type;
          accountType = role;
        }
      }
    }

    // Admin access only for ADMIN_EMAILS (e.g. colton.harris@automioapp.com)
    const canAccessAdmin = isAdminEmail;
    const effectiveRole = canAccessAdmin && !reseller ? 'platform_owner' : role;
    const effectiveAccountType = canAccessAdmin && !reseller ? 'admin' : accountType;

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
      email: data.user?.email || email,
      token: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      role: effectiveRole,
      accountType: effectiveAccountType,
      customerId,
      resellerId,
      portal: effectiveAccountType === 'admin' ? 'admin' : accountType === 'reseller' ? 'reseller' : 'customer',
      redirectTo: canAccessAdmin && !reseller ? '/admin' : role === 'reseller' ? '/dashboard' : '/portal',
      canSwitchPortals: canAccessAdmin,
      availablePortals: canAccessAdmin ? ['admin', 'customer', 'reseller'] : [accountType],
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
