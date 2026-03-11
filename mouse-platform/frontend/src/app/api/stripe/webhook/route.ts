/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscriptions
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
  const email = session.customer_email;

  if (!proSlug || !planSlug || !email) {
    console.error('[STRIPE_WEBHOOK] Missing metadata on checkout session');
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

  // Check if customer already exists (idempotency)
  const existing = await supabaseQuery(
    'customers',
    'GET',
    undefined,
    `email=eq.${email}&select=id`
  );

  if (existing && existing.length > 0) {
    console.log('[STRIPE_WEBHOOK] Customer already exists, skipping creation');
    return;
  }

  // Create customer ID
  const customerId = `cust_${Date.now().toString(36)}`;

  // Create customer in Supabase
  await supabaseQuery('customers', 'POST', {
    id: customerId,
    company_name: email.split('@')[0], // Placeholder — real name set in onboarding/complete
    email,
    pro_slug: proSlug,
    subscription_plan: planSlug,
    hours_included: hoursIncluded,
    hours_used: 0,
    trial_hours_remaining: 2.0,
    vm_status: 'pending',
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string,
    stripe_subscription_status: 'active',
    status: 'active',
    created_at: new Date().toISOString(),
  });

  console.log(`[STRIPE_WEBHOOK] Customer created: ${customerId} (${email}, ${proSlug}, ${planSlug})`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Reset hours_used for new billing period
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

  // Set VM status to stopped
  await supabaseQuery('customers', 'PATCH',
    {
      vm_status: 'stopped',
      stripe_subscription_status: 'canceled',
    },
    `stripe_subscription_id=eq.${subscriptionId}`
  );

  console.log(`[STRIPE_WEBHOOK] Subscription canceled: ${subscriptionId}`);
}
