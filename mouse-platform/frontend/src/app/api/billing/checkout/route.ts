/**
 * POST /api/billing/checkout — Create Stripe checkout session for hour top-ups
 * Body: { customer_id, topup: '10hr' | '25hr' | '50hr' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl } from '@/lib/urls';

const TOPUP_TIERS: Record<string, { hours: number; unitCents: number; label: string }> = {
  '10hr': { hours: 10, unitCents: 4980, label: '10 Hours' },
  '25hr': { hours: 25, unitCents: 4980, label: '25 Hours' },
  '50hr': { hours: 50, unitCents: 4980, label: '50 Hours' },
};

export async function POST(request: NextRequest) {
  try {
    const { customer_id, topup } = await request.json();

    if (!customer_id || !topup) {
      return NextResponse.json({ error: 'customer_id and topup required' }, { status: 400 });
    }

    const tier = TOPUP_TIERS[topup];
    if (!tier) {
      return NextResponse.json({ error: 'Invalid topup tier' }, { status: 400 });
    }

    // Get customer email for Stripe
    const customers = await supabaseQuery(
      'customers', 'GET', undefined,
      `id=eq.${customer_id}&select=email,stripe_customer_id`
    );
    const customer = customers?.[0];
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const totalCents = tier.hours * tier.unitCents;

    const sessionParams: Record<string, unknown> = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `KingMouse ${tier.label} Top-Up`,
              description: `${tier.hours} hours of AI employee time at $${(tier.unitCents / 100).toFixed(2)}/hr`,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        customer_id,
        topup,
        hours: String(tier.hours),
      },
      success_url: getCustomerUrl('/dashboard/billing?topup=success'),
      cancel_url: getCustomerUrl('/dashboard/billing'),
    };

    if (customer.stripe_customer_id) {
      sessionParams.customer = customer.stripe_customer_id;
    } else {
      sessionParams.customer_email = customer.email;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getStripe().checkout.sessions.create(sessionParams as any);

    return NextResponse.json({ checkout_url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[BILLING_CHECKOUT]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
