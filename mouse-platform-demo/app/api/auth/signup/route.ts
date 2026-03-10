export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, company, firstName, lastName, role, industry, needs, customInstructions } = body;

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
        account_type: role === 'reseller' ? 'reseller' : 'customer',
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

    // Create customer record (always — used for billing/portal for own usage)
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    const coreRecord: Record<string, any> = {
      id: customerId,
      user_id: userId,
      email,
      company_name: company || 'My Business',
      status: 'pending_payment',
      work_hours_balance: 2,
      work_hours_purchased: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try with optional columns first, fall back to core-only if columns don't exist
    const extendedRecord = { ...coreRecord };
    if (fullName) extendedRecord.name = fullName;
    if (industry) extendedRecord.industry = industry;
    if (needs?.length) extendedRecord.needs = needs;
    if (customInstructions) extendedRecord.custom_instructions = customInstructions;

    let { error: customerError } = await supabase.from('customers').insert(extendedRecord);

    if (customerError) {
      console.error('Customer insert with extended fields failed, retrying core-only:', JSON.stringify(customerError));
      const retryResult = await supabase.from('customers').insert(coreRecord);
      customerError = retryResult.error;
      if (customerError) {
        console.error('Customer record creation error:', JSON.stringify(customerError));
      }
    }

    // If reseller, create resellers record (existing table has id UUID, name, email, etc.)
    if (role === 'reseller') {
      const { error: resellerError } = await supabase.from('resellers').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        name: company || 'My Agency',
        company_name: company || '',
        email,
        status: 'active',
      });
      if (resellerError) {
        console.error('Reseller record creation error:', JSON.stringify(resellerError));
      }
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
