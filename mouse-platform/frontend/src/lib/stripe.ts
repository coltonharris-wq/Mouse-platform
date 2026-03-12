import Stripe from 'stripe';
import { getCustomerUrl } from '@/lib/urls';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = (process.env.STRIPE_SECRET_KEY || '').trim();
    _stripe = new Stripe(key, {
      apiVersion: '2024-12-18.acacia',
      timeout: 20000,
    });
  }
  return _stripe;
}

// Re-export client-safe plan data for server-side usage
export { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/plans';

export async function createSubscriptionCheckout(
  email: string,
  planSlug: string,
  proSlug: string,
  successUrl: string,
  cancelUrl: string
) {
  const { SUBSCRIPTION_PLANS } = await import('@/lib/plans');
  const plan = SUBSCRIPTION_PLANS[planSlug as keyof typeof SUBSCRIPTION_PLANS];
  if (!plan) throw new Error('Invalid plan');

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `KingMouse ${plan.name} Plan`,
            description: `${plan.hoursIncluded} hours/month of AI employee time`,
          },
          unit_amount: plan.priceCents,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    metadata: {
      pro_slug: proSlug,
      plan_slug: planSlug,
    },
    subscription_data: {
      metadata: {
        pro_slug: proSlug,
        plan_slug: planSlug,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: getCustomerUrl('/dashboard/billing'),
  });

  return session;
}
