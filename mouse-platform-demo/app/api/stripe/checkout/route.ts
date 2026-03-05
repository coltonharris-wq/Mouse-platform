export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mouse-platform-demo.vercel.app';

// Plan → Stripe Price mapping
const PLAN_PRICES: Record<string, { priceId: string; hours: number; mode: 'subscription' | 'payment' }> = {
  pro:        { priceId: process.env.STRIPE_PRO_PRICE_ID!, hours: 20, mode: 'subscription' },
  growth:     { priceId: process.env.STRIPE_GROWTH_PRICE_ID!, hours: 125, mode: 'subscription' },
  enterprise: { priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!, hours: 300, mode: 'subscription' },
  reseller:   { priceId: process.env.STRIPE_RESELLER_PRICE_ID!, hours: 0, mode: 'subscription' },
  topup_10:   { priceId: process.env.STRIPE_TOPUP_10_PRICE_ID!, hours: 10, mode: 'payment' },
  topup_25:   { priceId: process.env.STRIPE_TOPUP_25_PRICE_ID!, hours: 25, mode: 'payment' },
  topup_50:   { priceId: process.env.STRIPE_TOPUP_50_PRICE_ID!, hours: 50, mode: 'payment' },
};

async function stripePost(endpoint: string, params: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Stripe error: ${res.status}`);
  }
  return data;
}

async function stripeGet(endpoint: string, params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}${qs}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
  });
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, customerId, customerEmail, promoCode, successUrl, cancelUrl } = body;

    const planConfig = PLAN_PRICES[plan];
    if (!planConfig) {
      return NextResponse.json(
        { error: `Unknown plan: ${plan}. Valid: ${Object.keys(PLAN_PRICES).join(', ')}` },
        { status: 400 }
      );
    }

    if (!planConfig.priceId) {
      return NextResponse.json({ error: `Price not configured for plan: ${plan}` }, { status: 500 });
    }

    // Build Stripe checkout session params (form-encoded)
    const params: Record<string, string> = {
      'mode': planConfig.mode,
      'payment_method_types[0]': 'card',
      'line_items[0][price]': planConfig.priceId,
      'line_items[0][quantity]': '1',
      'success_url': successUrl || `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': cancelUrl || `${APP_URL}/checkout/cancel`,
      'metadata[customer_id]': customerId || '',
      'metadata[plan]': plan,
      'metadata[work_hours]': String(planConfig.hours),
      'allow_promotion_codes': 'true',
    };

    if (customerEmail) {
      params['customer_email'] = customerEmail;
    }

    if (planConfig.mode === 'subscription') {
      params['subscription_data[metadata][customer_id]'] = customerId || '';
      params['subscription_data[metadata][plan]'] = plan;
      params['subscription_data[metadata][work_hours]'] = String(planConfig.hours);
    }

    // Handle promo code
    if (promoCode) {
      try {
        const promos = await stripeGet('promotion_codes', { code: promoCode, limit: '1' });
        if (promos.data?.length > 0 && promos.data[0].active) {
          delete params['allow_promotion_codes'];
          params['discounts[0][promotion_code]'] = promos.data[0].id;
        }
      } catch {
        // Continue with allow_promotion_codes=true
      }
    }

    const session = await stripePost('checkout/sessions', params);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
