import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { full_name, email, phone, password, company_name, markup_rate } = await request.json();

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if reseller already exists with this email
    const existing = await supabaseQuery(
      'resellers',
      'GET',
      undefined,
      `email=eq.${encodeURIComponent(email)}`
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: 'A reseller account with this email already exists' }, { status: 409 });
    }

    // Create reseller record
    const result = await supabaseQuery('resellers', 'POST', {
      full_name,
      email,
      phone: phone || '',
      company_name: company_name || '',
      markup_rate: markup_rate || 7.48,
      wholesale_rate: 4.98,
      status: 'active',
      total_earned: 0,
      total_customers: 0,
      onboarding_complete: false,
    });

    const reseller = Array.isArray(result) ? result[0] : result;

    return NextResponse.json({
      reseller_id: reseller.id,
      email: reseller.email,
      markup_rate: reseller.markup_rate,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
