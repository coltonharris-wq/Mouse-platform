export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/reseller/webhook
 * 
 * Handle Stripe webhooks for reseller transactions
 * - payment_intent.succeeded: Mark referral as paid, create customer
 * - invoice.paid: Handle recurring payments
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    const stripe = await import('stripe').then(m => new m.default(STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover' as any,
    }));

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session, supabase, stripe);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice, supabase);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionCancelled(subscription, supabase);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: any, supabase: any, stripe: any) {
  const metadata = session.metadata || {};
  const { 
    reseller_id, 
    invite_code, 
    plan, 
    customer_email,
    business_name,
    business_type 
  } = metadata;

  if (!reseller_id || !invite_code) {
    console.log('Not a reseller referral, skipping');
    return;
  }

  console.log(`Processing reseller checkout: ${invite_code} for ${customer_email}`);

  // Get referral record
  const { data: referral } = await supabase
    .from('reseller_referrals')
    .select('*')
    .eq('stripe_checkout_session_id', session.id)
    .single();

  if (!referral) {
    console.error('Referral not found for session:', session.id);
    return;
  }

  // Create the actual customer account
  const customerId = `cst_${Date.now().toString(36)}`;
  const { error: customerError } = await supabase.from('customers').insert({
    id: customerId,
    email: customer_email,
    company_name: business_name || customer_email.split('@')[0],
    status: 'active',
    plan_tier: plan,
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
    reseller_id: reseller_id,
    work_hours_balance: 2, // Free hours for new customers
    work_hours_purchased: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (customerError) {
    console.error('Failed to create customer:', customerError);
    return;
  }

  // Update referral record
  await supabase
    .from('reseller_referrals')
    .update({
      customer_id: customerId,
      status: 'converted',
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      converted_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  // Create commission record for instant payout tracking
  const commissionAmount = Math.round(referral.amount * referral.commission_rate);
  await supabase.from('reseller_commissions').insert({
    id: `comm_${Date.now()}`,
    reseller_id: reseller_id,
    referral_id: referral.id,
    customer_id: customerId,
    amount: referral.amount,
    commission_rate: referral.commission_rate,
    commission_amount: commissionAmount,
    stripe_payment_intent_id: session.payment_intent,
    status: 'pending_payout', // Will be paid out via Stripe Connect
    created_at: new Date().toISOString(),
  });

  // Update reseller stats
  await supabase.rpc('increment_reseller_stats', {
    p_reseller_id: reseller_id,
    p_customer_count: 1,
    p_revenue_amount: referral.amount,
    p_commission_amount: commissionAmount,
  });

  console.log(`✅ Reseller referral completed: ${customerId} -> ${reseller_id}`);
}

async function handleInvoicePaid(invoice: any, supabase: any) {
  // Handle recurring subscription payments
  const subscriptionId = invoice.subscription;
  
  // Find the customer by subscription ID
  const { data: customer } = await supabase
    .from('customers')
    .select('id, reseller_id, plan_tier')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!customer || !customer.reseller_id) {
    return; // Not a reseller referral
  }

  // Find the original referral to get commission rate
  const { data: referral } = await supabase
    .from('reseller_referrals')
    .select('commission_rate')
    .eq('customer_id', customer.id)
    .single();

  if (!referral) return;

  const commissionRate = referral.commission_rate;
  const commissionAmount = Math.round(invoice.amount_due * commissionRate);

  // Create commission record for this recurring payment
  await supabase.from('reseller_commissions').insert({
    id: `comm_${Date.now()}`,
    reseller_id: customer.reseller_id,
    customer_id: customer.id,
    amount: invoice.amount_due,
    commission_rate: commissionRate,
    commission_amount: commissionAmount,
    stripe_payment_intent_id: invoice.payment_intent,
    stripe_invoice_id: invoice.id,
    status: 'pending_payout',
    is_recurring: true,
    created_at: new Date().toISOString(),
  });

  // Update reseller stats
  await supabase.rpc('increment_reseller_stats', {
    p_reseller_id: customer.reseller_id,
    p_customer_count: 0,
    p_revenue_amount: invoice.amount_due,
    p_commission_amount: commissionAmount,
  });

  console.log(`✅ Recurring commission recorded: ${customer.id} -> ${commissionAmount}`);
}

async function handleSubscriptionCancelled(subscription: any, supabase: any) {
  // Update customer status when subscription is cancelled
  await supabase
    .from('customers')
    .update({
      status: 'cancelled',
      stripe_subscription_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription cancelled: ${subscription.id}`);
}
