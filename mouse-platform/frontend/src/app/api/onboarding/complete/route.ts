/**
 * POST /api/onboarding/complete
 * BACKUP trigger for post-payment setup (PRIMARY is webhook).
 * Reads onboarding data from onboarding_sessions table (not client).
 * Idempotent: if webhook already created customer + VM, returns existing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseQuery } from '@/lib/supabase-server';
import { provisionVM } from '@/lib/vm-provision';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stripe_session_id, session_key } = body;

    if (!stripe_session_id) {
      return NextResponse.json(
        { error: 'stripe_session_id required' },
        { status: 400 }
      );
    }

    // Verify Stripe session completed
    const session = await getStripe().checkout.sessions.retrieve(stripe_session_id);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 }
      );
    }

    // Idempotency — check if customer already exists for this subscription
    const existing = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `stripe_subscription_id=eq.${session.subscription}&select=id,vm_status`
    );

    if (existing && existing.length > 0) {
      // Already created (by webhook) — return existing
      const customer = existing[0];

      // If VM is still pending, try to trigger provisioning as backup
      if (customer.vm_status === 'pending') {
        await triggerProvisioningFromSession(customer.id, session_key || session.metadata?.session_key, session);
      }

      return NextResponse.json({
        success: true,
        customer_id: customer.id,
        vm_status: customer.vm_status,
        message: 'Customer exists. Checking VM status.',
      });
    }

    // Customer doesn't exist yet (webhook hasn't fired) — create now
    const sk = session_key || session.metadata?.session_key;
    const resolvedPlanSlug = session.metadata?.plan_slug || 'pro';
    const resolvedProSlug = session.metadata?.pro_slug || '';

    // Retrieve onboarding data from DB
    let onboardingData: Record<string, unknown> = {};
    if (sk) {
      try {
        const sessions = await supabaseQuery(
          'onboarding_sessions',
          'GET',
          undefined,
          `session_key=eq.${sk}&select=*`
        );
        if (sessions && sessions.length > 0) {
          onboardingData = sessions[0];
        }
      } catch {
        // Continue with defaults
      }
    }

    const businessName = (onboardingData.business_name as string) || session.customer_email?.split('@')[0] || 'New Customer';
    const ownerName = (onboardingData.owner_name as string) || '';
    const email = (onboardingData.email as string) || session.customer_email || '';
    const location = (onboardingData.location as string) || '';

    // Get plan details
    const plans = await supabaseQuery(
      'subscription_plans',
      'GET',
      undefined,
      `slug=eq.${resolvedPlanSlug}`
    );
    const plan = plans?.[0];
    const hoursIncluded = plan?.hours_included || 0;

    // Resolve reseller attribution from onboarding session or Stripe metadata
    const resellerBrandSlug = (onboardingData.reseller_brand_slug as string) || session.metadata?.reseller_brand_slug || null;
    const attributionSource = (onboardingData.attribution_source as string) || (resellerBrandSlug ? 'reseller_link' : 'direct');

    // Look up reseller_id from brand_slug if present
    let resellerId: string | null = null;
    if (resellerBrandSlug) {
      try {
        const resellers = await supabaseQuery(
          'resellers', 'GET', undefined,
          `brand_slug=eq.${resellerBrandSlug}&select=id`
        );
        if (resellers && resellers.length > 0) {
          resellerId = resellers[0].id;
        }
      } catch {
        // Continue without reseller_id
      }
    }

    // Create customer
    const customerId = `cust_${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    await supabaseQuery('customers', 'POST', {
      id: customerId,
      company_name: businessName,
      email,
      owner_name: ownerName,
      location,
      pro_slug: resolvedProSlug,
      subscription_plan: resolvedPlanSlug,
      hours_included: hoursIncluded,
      hours_used: 0,
      trial_hours_remaining: 2.0,
      onboarding_answers: (onboardingData.onboarding_answers as Record<string, unknown>) || {},
      onboarding_session_key: sk || null,
      vm_status: 'pending',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      stripe_subscription_status: 'active',
      status: 'active',
      reseller_id: resellerId,
      reseller_brand_slug: resellerBrandSlug,
      attribution_source: attributionSource,
      attributed_at: resellerId ? now : null,
      created_at: now,
    });

    // Log attribution if reseller present
    if (resellerId) {
      try {
        await supabaseQuery('attribution_log', 'POST', {
          customer_id: customerId,
          old_reseller_id: null,
          new_reseller_id: resellerId,
          changed_by: 'system',
          reason: `Initial attribution via ${attributionSource}`,
          created_at: now,
        });
      } catch {
        // Non-critical — don't block onboarding
      }
    }

    // Mark onboarding session completed
    if (sk) {
      try {
        await supabaseQuery('onboarding_sessions', 'PATCH', {
          stripe_session_id: session.id,
          status: 'completed',
          updated_at: new Date().toISOString(),
        }, `session_key=eq.${sk}`);
      } catch {
        // Non-critical
      }
    }

    // Trigger VM provisioning (async)
    provisionVM({
      customer_id: customerId,
      pro_slug: resolvedProSlug,
      business_name: businessName,
      owner_name: ownerName,
      email,
      location,
      plan_slug: resolvedPlanSlug,
      onboarding_answers: (onboardingData.onboarding_answers as Record<string, unknown>) || {},
    }).catch((err) => {
      console.error('[ONBOARDING_COMPLETE] VM provisioning error:', err);
    });

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      vm_status: 'provisioning',
      message: 'Your AI employee is being set up. Ready in ~2 minutes.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ONBOARDING_COMPLETE]', message);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

async function triggerProvisioningFromSession(
  customerId: string,
  sessionKey: string | undefined,
  stripeSession: { metadata?: Record<string, string> | null; customer_email?: string | null }
) {
  let onboardingData: Record<string, unknown> = {};
  if (sessionKey) {
    try {
      const sessions = await supabaseQuery(
        'onboarding_sessions',
        'GET',
        undefined,
        `session_key=eq.${sessionKey}&select=*`
      );
      if (sessions && sessions.length > 0) {
        onboardingData = sessions[0];
      }
    } catch {
      // Continue with defaults
    }
  }

  const email = (onboardingData.email as string) || stripeSession.customer_email || '';
  const proSlug = stripeSession.metadata?.pro_slug || (onboardingData.pro_slug as string) || '';
  const planSlug = stripeSession.metadata?.plan_slug || (onboardingData.plan_slug as string) || 'pro';

  provisionVM({
    customer_id: customerId,
    pro_slug: proSlug,
    business_name: (onboardingData.business_name as string) || email.split('@')[0],
    owner_name: (onboardingData.owner_name as string) || '',
    email,
    location: (onboardingData.location as string) || '',
    plan_slug: planSlug,
    onboarding_answers: (onboardingData.onboarding_answers as Record<string, unknown>) || {},
  }).catch((err) => {
    console.error(`[ONBOARDING_COMPLETE] Backup provisioning error for ${customerId}:`, err);
  });
}
