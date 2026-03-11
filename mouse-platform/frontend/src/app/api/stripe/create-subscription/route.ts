/**
 * POST /api/stripe/create-subscription
 * Creates a Stripe Checkout session for a recurring subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { email, plan_slug, pro_slug, success_url, cancel_url } = await request.json();

    if (!email || !plan_slug || !pro_slug) {
      return NextResponse.json(
        { error: 'email, plan_slug, and pro_slug are required' },
        { status: 400 }
      );
    }

    // Look up plan from subscription_plans table
    const plans = await supabaseQuery(
      'subscription_plans',
      'GET',
      undefined,
      `slug=eq.${plan_slug}&is_active=eq.true`
    );

    if (!plans || plans.length === 0) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    const plan = plans[0];

    // Use existing stripe_price_id or create price on the fly
    let priceId = plan.stripe_price_id;

    if (!priceId) {
      const price = await getStripe().prices.create({
        currency: 'usd',
        unit_amount: plan.price_cents,
        recurring: { interval: 'month' },
        product_data: {
          name: `KingMouse ${plan.name} Plan`,
          metadata: { plan_slug },
        },
      });
      priceId = price.id;

      // Save price ID back to DB for future use
      await supabaseQuery('subscription_plans', 'PATCH',
        { stripe_price_id: priceId },
        `slug=eq.${plan_slug}`
      );
    }

    const defaultSuccessUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mouse-platform-demo.vercel.app'}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mouse-platform-demo.vercel.app'}/onboarding/cancel`;

    // Create Stripe Checkout session in subscription mode
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        pro_slug,
        plan_slug,
      },
      subscription_data: {
        metadata: {
          pro_slug,
          plan_slug,
        },
      },
      success_url: success_url || defaultSuccessUrl,
      cancel_url: cancel_url || defaultCancelUrl,
    });

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[STRIPE_CREATE_SUBSCRIPTION]', message);
    return NextResponse.json(
      { error: 'Failed to create subscription checkout' },
      { status: 500 }
    );
  }
}
