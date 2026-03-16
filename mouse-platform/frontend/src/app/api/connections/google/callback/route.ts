/**
 * GET /api/connections/google/callback
 * Handles Google OAuth callback — exchanges code for tokens, stores in DB, pushes config to VM.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { bashExec } from '@/lib/orgo';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mouse.is';
  const code = request.nextUrl.searchParams.get('code');
  const stateParam = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=oauth_denied`);
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=missing_params`);
  }

  let state: { customer_id: string; service: string };
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=invalid_state`);
  }

  const { customer_id, service } = state;

  try {
    // Exchange code for tokens
    const redirectUri = `${appUrl}/api/connections/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[GOOGLE_CALLBACK] Token exchange failed:', errText);
      return NextResponse.redirect(`${appUrl}/dashboard/connections?error=token_failed`);
    }

    const tokens = await tokenRes.json();

    // Get user email from Google userinfo
    let email = '';
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const user = await userRes.json();
      email = user.email || '';
    } catch {
      // Non-critical
    }

    const now = new Date().toISOString();
    const config = {
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
    };

    // Upsert connection in DB
    const saveToDB = async (svc: string) => {
      try {
        const existing = await supabaseQuery('customer_connections', 'GET', undefined,
          `customer_id=eq.${customer_id}&service=eq.${svc}&select=id`
        );
        if (existing && existing.length > 0) {
          await supabaseQuery('customer_connections', 'PATCH',
            { status: 'connected', config, connected_at: now },
            `id=eq.${existing[0].id}`
          );
        } else {
          await supabaseQuery('customer_connections', 'POST', {
            customer_id,
            service: svc,
            status: 'connected',
            config,
            connected_at: now,
          });
        }
      } catch (err) {
        console.error(`[GOOGLE_CALLBACK] DB save failed for ${svc}:`, err);
      }
    };

    await saveToDB(service);

    // Gmail token also grants Calendar access — connect both
    if (service === 'gmail') {
      await saveToDB('google_calendar');
    }

    // Push config to customer's VM so OpenClaw can use it
    try {
      const customers = await supabaseQuery('customers', 'GET', undefined,
        `id=eq.${customer_id}&select=vm_computer_id,vm_status`
      );
      if (customers?.[0]?.vm_computer_id) {
        const vmConfig = JSON.stringify({
          email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          scopes: service === 'gmail' ? ['gmail', 'calendar'] : ['calendar'],
        });
        const escaped = vmConfig.replace(/'/g, "'\\''");
        await bashExec(
          customers[0].vm_computer_id,
          `mkdir -p /opt/king-mouse/config && echo '${escaped}' > /opt/king-mouse/config/google.json && chmod 600 /opt/king-mouse/config/google.json`,
          15
        );
      }
    } catch (vmErr) {
      console.error('[GOOGLE_CALLBACK] VM config push failed:', vmErr);
    }

    return NextResponse.redirect(`${appUrl}/dashboard/connections?connected=${service}`);
  } catch (err: unknown) {
    console.error('[GOOGLE_CALLBACK]', err);
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=internal`);
  }
}
