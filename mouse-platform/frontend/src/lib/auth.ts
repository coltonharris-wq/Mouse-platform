/**
 * Auth helpers for API route protection.
 *
 * Flow: verify JWT → get user_id → look up customer by user_id → verify
 * the client-supplied customer_id matches.
 */

import { NextRequest, NextResponse } from 'next/server';

interface AuthResult {
  authenticated: boolean;
  userId?: string;
  customerId?: string;
  error?: NextResponse;
}

/**
 * Verify Supabase auth from request headers.
 * Resolves the authenticated user's customer_id from the customers table.
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
    // Verify token with Supabase auth
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

    // Resolve customer_id from customers table via user_id
    let customerId: string | undefined;
    try {
      const custRes = await fetch(
        `${supabaseUrl}/rest/v1/customers?user_id=eq.${user.id}&select=id&limit=1`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      const customers = await custRes.json();
      if (Array.isArray(customers) && customers.length > 0) {
        customerId = customers[0].id;
      }
    } catch {
      // Customer lookup failed — user exists but no customer record
    }

    return {
      authenticated: true,
      userId: user.id,
      customerId,
    };
  } catch {
    return {
      authenticated: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }),
    };
  }
}

/**
 * Check if user owns the customer_id they're requesting.
 * The customer_id from the client must match the one resolved from their JWT.
 */
export function requireCustomerAccess(auth: AuthResult, requestedCustomerId: string): NextResponse | null {
  if (!auth.authenticated) return auth.error!;

  // Allow if customer_id matches the auth user's customer
  if (auth.customerId === requestedCustomerId) return null;

  // Also allow if the requestedCustomerId IS their auth user_id
  // (some routes pass user_id as customer_id)
  if (auth.userId === requestedCustomerId) return null;

  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
