export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || '').trim();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mouse-platform-demo.vercel.app';

// Plan config with inline pricing — no env price IDs needed
const PLAN_CONFIG: Record<string, {
  name: string;
  unitAmount: number; // cents
  hours: number;
  mode: 'subscription' | 'payment';
  description: string;
}> = {
  starter: {
    name: 'Mouse Pro Plan',
    unitAmount: 9700, // $97/month
    hours: 20,
    mode: 'subscription',
    description: '20 work hours/month — AI Operations Manager',
  },
  pro: {
    name: 'Mouse Pro Plan',
    unitAmount: 9700, // $97/month
    hours: 20,
    mode: 'subscription',
    description: '20 work hours/month — AI Operations Manager',
  },
  growth: {
    name: 'Mouse Growth Plan',
    unitAmount: 49700, // $497/month
    hours: 125,
    mode: 'subscription',
    description: '125 work hours/month — AI Operations Manager + Team',
  },
  enterprise: {
    name: 'Mouse Enterprise Plan',
    unitAmount: 99700, // $997/month
    hours: 300,
    mode: 'subscription',
    description: '300 work hours/month — Full AI Workforce',
  },
  reseller: {
    name: 'Mouse Reseller Plan',
    unitAmount: 9700, // $97/month
    hours: 20,
    mode: 'subscription',
    description: 'Reseller plan — 20 work hours + resell margin',
  },
  topup_10: {
    name: '10 Work Hours Top-Up',
    unitAmount: 4900, // $49
    hours: 10,
    mode: 'payment',
    description: '10 additional work hours',
  },
  topup_25: {
    name: '25 Work Hours Top-Up',
    unitAmount: 9900, // $99
    hours: 25,
    mode: 'payment',
    description: '25 additional work hours',
  },
  topup_50: {
    name: '50 Work Hours Top-Up',
    unitAmount: 17900, // $179
    hours: 50,
    mode: 'payment',
    description: '50 additional work hours',
  },
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
    // Use request origin so mice.ink users return to mice.ink after Stripe
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '') || APP_URL;
    const dynamicUrl = origin.startsWith('http') ? origin : `https://${origin}`;

    const body = await request.json();
    const { plan, customerId, customerEmail, email, promoCode, promo_code, successUrl, cancelUrl } = body;
    const finalEmail = customerEmail || email;
    const finalPromo = promoCode || promo_code;

    const planConfig = PLAN_CONFIG[plan];
    if (!planConfig) {
      return NextResponse.json(
        { error: `Unknown plan: ${plan}. Valid: ${Object.keys(PLAN_CONFIG).join(', ')}` },
        { status: 400 }
      );
    }

    // Build Stripe checkout session params using inline price_data
    const params: Record<string, string> = {
      'mode': planConfig.mode,
      'payment_method_types[0]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(planConfig.unitAmount),
      'line_items[0][price_data][product_data][name]': planConfig.name,
      'line_items[0][price_data][product_data][description]': planConfig.description,
      'line_items[0][quantity]': '1',
      'success_url': successUrl || `${dynamicUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': cancelUrl || `${dynamicUrl}/signup?canceled=true`,
      'client_reference_id': customerId || '',
      'metadata[customer_id]': customerId || '',
      'metadata[plan]': plan,
      'metadata[work_hours]': String(planConfig.hours),
      'allow_promotion_codes': 'true',
      'payment_method_collection': 'always',
    };

    // Add recurring interval for subscriptions
    if (planConfig.mode === 'subscription') {
      params['line_items[0][price_data][recurring][interval]'] = 'month';
      params['subscription_data[metadata][customer_id]'] = customerId || '';
      params['subscription_data[metadata][plan]'] = plan;
      params['subscription_data[metadata][work_hours]'] = String(planConfig.hours);
    }

    if (finalEmail) {
      params['customer_email'] = finalEmail;
    }

    // Handle promo code
    if (finalPromo) {
      try {
        const promos = await stripeGet('promotion_codes', { code: finalPromo, limit: '1' });
        if (promos.data?.length > 0 && promos.data[0].active) {
          delete params['allow_promotion_codes'];
          params['discounts[0][promotion_code]'] = promos.data[0].id;
        }
      } catch {
        // Continue with allow_promotion_codes=true
      }
    }

    console.log(`💳 Creating Stripe checkout: plan=${plan}, amount=$${planConfig.unitAmount / 100}, customer=${customerId}`);
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
