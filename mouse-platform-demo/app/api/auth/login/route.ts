export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || 'Login failed' },
        { status: response.status }
      );
    }

    // Determine role from account_type
    const accountType = data.user?.account_type || 'customer';
    let role = accountType;
    if (accountType === 'admin') role = 'platform_owner';

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
      email: data.user?.email || email,
      token: data.access_token,
      refreshToken: data.refresh_token,
      role,
      accountType,
      portal: accountType,
      redirectTo: data.redirect_to || '/portal',
      canSwitchPortals: data.can_switch_portals || false,
      availablePortals: data.available_portals || [accountType],
    });
  } catch (error: any) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
