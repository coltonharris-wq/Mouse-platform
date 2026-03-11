/**
 * Auth helpers for API route protection
 */

import { NextRequest, NextResponse } from 'next/server';

interface AuthResult {
  authenticated: boolean;
  userId?: string;
  role?: string;
  customerId?: string;
  error?: NextResponse;
}

/**
 * Verify Supabase auth from request headers
 * Returns user info or an error response
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return {
      authenticated: false,
      error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      authenticated: false,
      error: NextResponse.json({ error: 'Server configuration error' }, { status: 500 }),
    };
  }

  try {
    // Verify token with Supabase
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
      },
    });

    if (!res.ok) {
      return {
        authenticated: false,
        error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
      };
    }

    const user = await res.json();

    // Get profile with role
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role,customer_id,reseller_id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const profiles = await profileRes.json();
    const profile = profiles?.[0];

    return {
      authenticated: true,
      userId: user.id,
      role: profile?.role || 'customer',
      customerId: profile?.customer_id,
    };
  } catch {
    return {
      authenticated: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }),
    };
  }
}

/**
 * Check if user is platform owner
 */
export function requirePlatformOwner(auth: AuthResult): NextResponse | null {
  if (!auth.authenticated) return auth.error!;
  if (auth.role !== 'platform_owner') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return null;
}

/**
 * Check if user owns the customer_id
 */
export function requireCustomerAccess(auth: AuthResult, customerId: string): NextResponse | null {
  if (!auth.authenticated) return auth.error!;
  if (auth.role === 'platform_owner') return null; // Admins can access everything
  if (auth.customerId !== customerId) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  return null;
}
