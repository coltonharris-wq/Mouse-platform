// Client-safe subscription plan definitions
// This file can be imported by both client and server components

export const SUBSCRIPTION_PLANS = {
  pro: {
    slug: 'pro',
    name: 'Pro',
    priceCents: 9700,
    hoursIncluded: 20,
    overageRateCents: 498,
    features: ['20 hours/month', '1 AI employee', 'Core automations', 'Email support'],
  },
  growth: {
    slug: 'growth',
    name: 'Growth',
    priceCents: 49700,
    hoursIncluded: 125,
    overageRateCents: 498,
    features: ['125 hours/month', '1 AI employee', 'Advanced automations', 'Priority support', 'Custom workflows'],
  },
  enterprise: {
    slug: 'enterprise',
    name: 'Enterprise',
    priceCents: 99700,
    hoursIncluded: 300,
    overageRateCents: 498,
    features: ['300 hours/month', '1 AI employee', 'All automations', 'Dedicated support', 'Custom integrations', 'API access'],
  },
};

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
