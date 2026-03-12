/**
 * POST /api/stripe/connect/onboard — Create Stripe Connect account for reseller
 * GET /api/stripe/connect/status — Check reseller's Stripe Connect status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl } from '@/lib/urls';

export async function POST(request: NextRequest) {
  try {
    const { reseller_id } = await request.json();

    if (!reseller_id) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    // Look up reseller
    const resellers = await supabaseQuery(
      'resellers',
      'GET',
      undefined,
      `id=eq.${reseller_id}&select=id,email,name,stripe_account_id`
    );

    if (!resellers || resellers.length === 0) {
      return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });
    }

    const reseller = resellers[0];

    // Create or reuse Stripe Connect account
    let accountId = reseller.stripe_account_id;

    if (!accountId) {
      const account = await getStripe().accounts.create({
        type: 'express',
        email: reseller.email,
        metadata: { reseller_id },
      });
      accountId = account.id;

      // Save account ID
      await supabaseQuery('resellers', 'PATCH',
        { stripe_account_id: accountId, stripe_onboarding_status: 'pending' },
        `id=eq.${reseller_id}`
      );
    }

    // Create account onboarding link
    const accountLink = await getStripe().accountLinks.create({
      account: accountId,
      refresh_url: getCustomerUrl('/admin/resellers?refresh=true'),
      return_url: getCustomerUrl('/admin/resellers?connected=true'),
      type: 'account_onboarding',
    });

    return NextResponse.json({
      onboarding_url: accountLink.url,
      account_id: accountId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[STRIPE_CONNECT_ONBOARD]', message);
    return NextResponse.json({ error: 'Failed to create Connect account' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');

    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const resellers = await supabaseQuery(
      'resellers',
      'GET',
      undefined,
      `id=eq.${resellerId}&select=stripe_account_id,stripe_onboarding_status,stripe_charges_enabled,stripe_payouts_enabled`
    );

    if (!resellers || resellers.length === 0) {
      return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });
    }

    const reseller = resellers[0];

    // Check actual Stripe status if account exists
    if (reseller.stripe_account_id) {
      const account = await getStripe().accounts.retrieve(reseller.stripe_account_id);

      const chargesEnabled = account.charges_enabled || false;
      const payoutsEnabled = account.payouts_enabled || false;
      const status = chargesEnabled && payoutsEnabled ? 'active' : 'pending';

      // Update DB with current status
      await supabaseQuery('resellers', 'PATCH', {
        stripe_charges_enabled: chargesEnabled,
        stripe_payouts_enabled: payoutsEnabled,
        stripe_onboarding_status: status,
      }, `id=eq.${resellerId}`);

      return NextResponse.json({
        account_id: reseller.stripe_account_id,
        status,
        charges_enabled: chargesEnabled,
        payouts_enabled: payoutsEnabled,
      });
    }

    return NextResponse.json({
      account_id: null,
      status: 'not_connected',
      charges_enabled: false,
      payouts_enabled: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[STRIPE_CONNECT_STATUS]', message);
    return NextResponse.json({ error: 'Failed to check Connect status' }, { status: 500 });
  }
}
