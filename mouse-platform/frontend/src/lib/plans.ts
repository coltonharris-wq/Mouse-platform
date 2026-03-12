// Client-safe subscription plan definitions
// This file can be imported by both client and server components

export const SUBSCRIPTION_PLANS = {
  pro: {
    slug: 'pro',
    name: 'Pro',
    priceCents: 9700,
    hoursIncluded: 20,
    overageRateCents: 498,  // $4.98/hr
    features: ['20 hours/month', '1 AI employee', 'Full agent capabilities', 'Email support'],
  },
  growth: {
    slug: 'growth',
    name: 'Growth',
    priceCents: 49700,
    hoursIncluded: 125,
    overageRateCents: 448,  // $4.48/hr
    features: ['125 hours/month', '1 AI employee', 'Full agent capabilities', 'Priority support', 'Custom workflows'],
  },
  enterprise: {
    slug: 'enterprise',
    name: 'Enterprise',
    priceCents: 99700,
    hoursIncluded: 300,
    overageRateCents: 398,  // $3.98/hr
    features: ['300 hours/month', '1 AI employee', 'Full agent capabilities', 'Dedicated support', 'Custom integrations', 'API access'],
  },
};

export type PlanSlug = keyof typeof SUBSCRIPTION_PLANS;

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
