export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, company, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        account_type: 'customer',
        company_name: company || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || 'Signup failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      userId: data.user_id || data.userId,
      customerId: data.customer_id || data.customerId,
      email: data.email || email,
      token: data.token || data.access_token,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Signup proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
