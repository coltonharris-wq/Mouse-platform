export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: reseller } = await supabase
      .from('resellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!reseller) {
      return NextResponse.json({ error: 'Reseller account required' }, { status: 403 });
    }

    const resellerId = reseller.id;

    // Try Python backend first if configured
    if (API_URL && !API_URL.includes('localhost')) {
      try {
        const response = await fetch(`${API_URL}/reseller/my-customers/${resellerId}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall through to Supabase
      }
    }

    // Fetch from Supabase — only this reseller's customers
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('reseller_id', resellerId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return NextResponse.json({ customers: data });
    }

    return NextResponse.json({ customers: [] });
  } catch (error: any) {
    console.error('Reseller customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getResellerFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { error: 'Unauthorized', status: 401 as const };

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return { error: 'Invalid token', status: 401 as const };

  const { data: reseller } = await supabase
    .from('resellers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!reseller) return { error: 'Reseller account required', status: 403 as const };
  return { resellerId: reseller.id };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getResellerFromToken(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data: body, error: bodyError } = await import('@/lib/safe-json').then(m => m.safeParseJson<{ businessName?: string; ownerName?: string; email?: string; phone?: string }>(request));
    if (bodyError) {
      return NextResponse.json({ error: bodyError }, { status: 400 });
    }
    const { businessName, ownerName, email, phone } = body;
    if (!businessName || !ownerName || !email) {
      return NextResponse.json(
        { error: 'businessName, ownerName, and email are required' },
        { status: 400 }
      );
    }
    const emailStr = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const { resellerCustomerManager } = await import('@/lib/reseller-customer-manager');
    const result = await resellerCustomerManager.addCustomer({
      businessName: String(businessName).trim().slice(0, 200),
      ownerName: String(ownerName).trim().slice(0, 200),
      email: emailStr,
      phone: String(phone || '').trim().slice(0, 50),
      resellerId: auth.resellerId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to add customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: result.customer,
      paymentLink: result.paymentLink,
    });
  } catch (error: any) {
    console.error('Reseller add customer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
