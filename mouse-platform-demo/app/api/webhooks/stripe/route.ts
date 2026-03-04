import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { resellerCustomerManager } from '@/lib/reseller-customer-manager';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Stripe Webhook Handler
 * 
 * Handles:
 * - checkout.session.completed -> Activate customer, send credentials
 * - invoice.payment_succeeded -> Track recurring commissions
 * - customer.subscription.deleted -> Mark customer as cancelled
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`📩 Stripe webhook received: ${event.type}`);

    // Process the event
    const result = await resellerCustomerManager.handleStripeWebhook(event);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true, type: event.type });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    supported_events: [
      'checkout.session.completed',
      'invoice.payment_succeeded',
      'customer.subscription.deleted',
      'customer.subscription.canceled',
    ],
  });
}
