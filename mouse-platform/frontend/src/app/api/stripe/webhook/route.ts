/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscriptions.
 * PRIMARY trigger for customer creation + VM provisioning.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseQuery } from '@/lib/supabase-server';
import { provisionVM } from '@/lib/vm-provision';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[STRIPE_WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      console.error('[STRIPE_WEBHOOK] Signature verification failed:', message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[STRIPE_WEBHOOK]', message);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const proSlug = session.metadata?.pro_slug;
  const planSlug = session.metadata?.plan_slug;
  const sessionKey = session.metadata?.session_key;
  const email = session.customer_email;

  if (!proSlug || !planSlug || !email) {
    console.error('[STRIPE_WEBHOOK] Missing metadata on checkout session');
    return;
  }

  // Idempotency — check if customer already exists
  const existing = await supabaseQuery(
    'customers',
    'GET',
    undefined,
    `email=eq.${email}&select=id,vm_status`
  );

  if (existing && existing.length > 0) {
    console.log('[STRIPE_WEBHOOK] Customer already exists, skipping creation');
    // If VM never provisioned, trigger it now
    if (existing[0].vm_status === 'pending') {
      await triggerProvisioning(existing[0].id, sessionKey, proSlug, planSlug, email);
    }
    return;
  }

  // Get plan details
  const plans = await supabaseQuery(
    'subscription_plans',
    'GET',
    undefined,
    `slug=eq.${planSlug}`
  );

  const plan = plans?.[0];
  const hoursIncluded = plan?.hours_included || 0;

  // Retrieve onboarding data from DB
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
    } catch (err) {
      console.error('[STRIPE_WEBHOOK] Failed to retrieve onboarding session:', err);
    }
  }

  const businessName = (onboardingData.business_name as string) || email.split('@')[0];
  const ownerName = (onboardingData.owner_name as string) || '';
  const location = (onboardingData.location as string) || '';

  // Resolve reseller attribution from onboarding session or Stripe metadata
  const resellerBrandSlug = (onboardingData.reseller_brand_slug as string) || session.metadata?.reseller_brand_slug || null;
  const attributionSource = (onboardingData.attribution_source as string) || (resellerBrandSlug ? 'reseller_link' : 'direct');

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

  // Create customer ID
  const customerId = `cust_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  // Create customer in Supabase
  await supabaseQuery('customers', 'POST', {
    id: customerId,
    company_name: businessName,
    email,
    owner_name: ownerName,
    location,
    pro_slug: proSlug,
    subscription_plan: planSlug,
    hours_included: hoursIncluded,
    hours_used: 0,
    trial_hours_remaining: 2.0,
    onboarding_answers: (onboardingData.onboarding_answers as Record<string, unknown>) || {},
    onboarding_session_key: sessionKey || null,
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
        reason: `Initial attribution via ${attributionSource} (webhook)`,
        created_at: now,
      });
    } catch {
      // Non-critical
    }
  }

  // Update onboarding_sessions with stripe info
  if (sessionKey) {
    try {
      await supabaseQuery('onboarding_sessions', 'PATCH', {
        stripe_session_id: session.id,
        status: 'payment_pending',
        updated_at: new Date().toISOString(),
      }, `session_key=eq.${sessionKey}`);
    } catch {
      // Non-critical
    }
  }

  console.log(`[STRIPE_WEBHOOK] Customer created: ${customerId} (${email}, ${proSlug}, ${planSlug})`);

  // Trigger VM provisioning (async — don't block webhook response)
  provisionVM({
    customer_id: customerId,
    pro_slug: proSlug,
    business_name: businessName,
    owner_name: ownerName,
    email,
    location,
    plan_slug: planSlug,
    onboarding_answers: (onboardingData.onboarding_answers as Record<string, unknown>) || {},
  }).then(() => {
    console.log(`[STRIPE_WEBHOOK] VM provisioning started for ${customerId}`);
  }).catch((err) => {
    console.error(`[STRIPE_WEBHOOK] VM provisioning error for ${customerId}:`, err);
  });
}

async function triggerProvisioning(
  customerId: string,
  sessionKey: string | undefined,
  proSlug: string,
  planSlug: string,
  email: string
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
    console.error(`[STRIPE_WEBHOOK] Retry provisioning error for ${customerId}:`, err);
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  await supabaseQuery('customers', 'PATCH',
    { hours_used: 0 },
    `stripe_subscription_id=eq.${subscriptionId}`
  );

  console.log(`[STRIPE_WEBHOOK] Hours reset for subscription: ${subscriptionId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  await supabaseQuery('customers', 'PATCH',
    {
      vm_status: 'stopped',
      stripe_subscription_status: 'canceled',
    },
    `stripe_subscription_id=eq.${subscriptionId}`
  );

  console.log(`[STRIPE_WEBHOOK] Subscription canceled: ${subscriptionId}`);
}
