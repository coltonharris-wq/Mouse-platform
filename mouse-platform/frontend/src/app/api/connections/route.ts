/**
 * GET  /api/connections?customer_id=xxx — List connection statuses
 * POST /api/connections — Connect/disconnect a service
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';
import { verifyAuth, requireCustomerAccess } from '@/lib/auth';

const GOOGLE_SCOPES: Record<string, string> = {
  gmail: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar',
  google_calendar: 'https://www.googleapis.com/auth/calendar',
};

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  const auth = await verifyAuth(request);
  const accessError = requireCustomerAccess(auth, customerId);
  if (accessError) return accessError;

  try {
    const statuses: Record<string, { connected: boolean; email?: string; connected_at?: string }> = {};

    // Load saved connections from customer_connections table
    try {
      const rows = await supabaseQuery(
        'customer_connections', 'GET', undefined,
        `customer_id=eq.${customerId}&select=service,status,config,connected_at`
      );
      for (const r of rows || []) {
        statuses[r.service] = {
          connected: r.status === 'connected',
          email: r.config?.email,
          connected_at: r.connected_at,
        };
      }
    } catch {
      // Table may not exist yet — continue with empty statuses
    }

    // Check Twilio from receptionist phone numbers
    try {
      const phones = await supabaseQuery(
        'customer_phone_numbers', 'GET', undefined,
        `customer_id=eq.${customerId}&status=eq.active&select=phone_number&limit=1`
      );
      if (phones && phones.length > 0) {
        statuses['twilio'] = {
          connected: true,
          email: phones[0].phone_number,
          connected_at: phones[0].created_at,
        };
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ connections: statuses });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CONNECTIONS_GET]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customer_id, service, action } = await request.json();

    if (!customer_id || !service || !action) {
      return NextResponse.json(
        { error: 'customer_id, service, and action required' },
        { status: 400 }
      );
    }

    const auth = await verifyAuth(request);
    const accessError = requireCustomerAccess(auth, customer_id);
    if (accessError) return accessError;

    // ── DISCONNECT ──
    if (action === 'disconnect') {
      try {
        await supabaseQuery('customer_connections', 'PATCH',
          { status: 'disconnected' },
          `customer_id=eq.${customer_id}&service=eq.${service}`
        );
      } catch {
        // Table may not exist
      }

      // Remove config from VM
      try {
        const customers = await supabaseQuery('customers', 'GET', undefined,
          `id=eq.${customer_id}&select=vm_computer_id`
        );
        if (customers?.[0]?.vm_computer_id) {
          await bashExec(
            customers[0].vm_computer_id,
            `rm -f /opt/king-mouse/config/${service}.json`,
            10
          );
        }
      } catch {
        // Non-fatal
      }

      // If disconnecting Gmail, also disconnect Google Calendar (shared token)
      if (service === 'gmail') {
        try {
          await supabaseQuery('customer_connections', 'PATCH',
            { status: 'disconnected' },
            `customer_id=eq.${customer_id}&service=eq.google_calendar`
          );
        } catch {
          // Non-fatal
        }
      }

      return NextResponse.json({ success: true });
    }

    // ── CONNECT ──
    if (action === 'connect') {
      // Google services — redirect to OAuth
      if (service === 'gmail' || service === 'google_calendar') {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
          return NextResponse.json({
            error: 'Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to environment variables.',
            setup_required: true,
          }, { status: 503 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mouse.is';
        const redirectUri = `${appUrl}/api/connections/google/callback`;
        const scopes = GOOGLE_SCOPES[service] || GOOGLE_SCOPES.gmail;

        const state = Buffer.from(JSON.stringify({ customer_id, service })).toString('base64url');

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scopes);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
        authUrl.searchParams.set('state', state);

        return NextResponse.json({ oauth_url: authUrl.toString() });
      }

      // Twilio — check if receptionist phone exists
      if (service === 'twilio') {
        try {
          const phones = await supabaseQuery(
            'customer_phone_numbers', 'GET', undefined,
            `customer_id=eq.${customer_id}&status=eq.active&select=phone_number&limit=1`
          );
          if (phones && phones.length > 0) {
            return NextResponse.json({ success: true, already_connected: true });
          }
        } catch {
          // Non-fatal
        }
        return NextResponse.json({
          error: 'Set up your AI Receptionist first to connect Twilio.',
          redirect: '/dashboard/receptionist',
        }, { status: 400 });
      }

      return NextResponse.json({ error: `Service "${service}" is not available yet.` }, { status: 400 });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CONNECTIONS_POST]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
