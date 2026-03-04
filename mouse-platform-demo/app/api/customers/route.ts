export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return NextResponse.json({ customers: data });
      }
    } catch {}
  }
  // Fallback: empty list
  return NextResponse.json({ customers: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, phone, plan = 'Starter' } = body;

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const newCustomer = {
      id: `cust-${Date.now()}`,
      company_name: company,
      business_name: company,
      plan,
      mrr: plan === 'Enterprise' ? 7500 : plan === 'Growth' ? 2997 : 997,
      employee_count: 0,
      health: 'green',
      contact_name: name,
      email,
      phone: phone || '',
    };

    const supabase = getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.from('customers').insert([newCustomer]);
      if (error) {
        console.error('[customers] insert error:', error.message);
      }
    }

    // Send onboarding email (fire and forget)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/customers/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          customerName: name,
          company,
          resellerName: 'Your Account Manager',
          resellerCompany: 'Automio',
        }),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: 'Customer created successfully.',
    });

  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Customer deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
