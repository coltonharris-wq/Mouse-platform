export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import crypto from 'crypto';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function verifyStripeSignature(payload: string, sig: string, secret: string): boolean {
  try {
    const parts = sig.split(',').reduce((acc: Record<string, string>, part) => {
      const [k, v] = part.split('=');
      acc[k] = v;
      return acc;
    }, {});
    const timestamp = parts['t'];
    const expected = parts['v1'];
    const signed = crypto.createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signed), Buffer.from(expected));
  } catch {
    return false;
  }
}

async function stripeGet(endpoint: string) {
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
  });
  return res.json();
}

/**
 * Stripe Webhook Handler (V7)
 * Uses raw fetch — no SDK dependency
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  // Verify signature if webhook secret is configured
  if (WEBHOOK_SECRET && WEBHOOK_SECRET !== 'whsec_your_webhook_secret_here') {
    if (!verifyStripeSignature(payload, sig, WEBHOOK_SECRET)) {
      console.error('[webhook] Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log(`[webhook] Processing: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object, supabase);
        break;
      }
      case 'invoice.paid': {
        await handleInvoicePaid(event.data.object, supabase);
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.canceled': {
        await handleSubscriptionCanceled(event.data.object, supabase);
        break;
      }
      default:
        console.log(`[webhook] Unhandled: ${event.type}`);
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (err: any) {
    console.error(`[webhook] Error:`, err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: any, supabase: any) {
  const customerId = session.metadata?.customer_id;
  const plan = session.metadata?.plan;
  const workHours = parseFloat(session.metadata?.work_hours || '0');

  console.log('[webhook] Checkout:', { customerId, plan, workHours });

  if (!customerId) {
    console.error('[webhook] No customer_id in metadata');
    return;
  }

  // 1. Credit work hours
  if (workHours > 0) {
    const { data: current } = await supabase
      .from('customers')
      .select('work_hours_balance, work_hours_purchased')
      .eq('id', customerId)
      .single();

    if (current) {
      await supabase
        .from('customers')
        .update({
          work_hours_balance: (current.work_hours_balance || 0) + workHours,
          work_hours_purchased: (current.work_hours_purchased || 0) + workHours,
        })
        .eq('id', customerId);

      console.log(`[webhook] Credited ${workHours} hrs to ${customerId}`);
    }
  }

  // 2. Update plan
  await supabase
    .from('customers')
    .update({
      tier: plan,
      plan_tier: plan,
      stripe_customer_id: session.customer || undefined,
      payment_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId);

  // 3. Store payment record
  await supabase.from('payments').insert({
    customer_id: customerId,
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent,
    stripe_customer_id: session.customer,
    plan: plan,
    amount: session.amount_total || 0,
    currency: session.currency || 'usd',
    status: 'completed',
    metadata: { work_hours: workHours, plan },
    created_at: new Date().toISOString(),
  }).catch((e: any) => console.warn('[webhook] Payment insert:', e.message));

  console.log(`[webhook] ✅ ${customerId} → ${plan} (${workHours} hrs)`);
}

async function handleInvoicePaid(invoice: any, supabase: any) {
  const subId = invoice.subscription;
  if (!subId) return;

  try {
    const subscription = await stripeGet(`subscriptions/${subId}`);
    const customerId = subscription.metadata?.customer_id;
    const workHours = parseFloat(subscription.metadata?.work_hours || '0');

    if (!customerId || workHours <= 0) return;

    const { data: current } = await supabase
      .from('customers')
      .select('work_hours_balance, work_hours_purchased')
      .eq('id', customerId)
      .single();

    if (current) {
      await supabase
        .from('customers')
        .update({
          work_hours_balance: (current.work_hours_balance || 0) + workHours,
          work_hours_purchased: (current.work_hours_purchased || 0) + workHours,
          payment_status: 'active',
        })
        .eq('id', customerId);

      console.log(`[webhook] ✅ Renewal: ${customerId} +${workHours} hrs`);
    }
  } catch (err: any) {
    console.error('[webhook] invoice.paid error:', err.message);
  }
}

async function handleSubscriptionCanceled(subscription: any, supabase: any) {
  const customerId = subscription.metadata?.customer_id;
  if (!customerId) return;

  await supabase
    .from('customers')
    .update({
      payment_status: 'canceled',
      tier: 'free',
      plan_tier: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId);

  console.log(`[webhook] ⛔ Canceled: ${customerId}`);
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    events: ['checkout.session.completed', 'invoice.paid', 'customer.subscription.deleted'],
  });
}
