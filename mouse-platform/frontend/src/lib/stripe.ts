import Stripe from 'stripe';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
};

// Work Hours package definitions
export const WORK_HOURS_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    priceCents: 9700,
    workHours: 20,
    description: 'Perfect for small teams getting started',
    features: [
      '20 AI Work Hours',
      'Message with King Mouse',
      'Deploy AI employees',
      'Email support'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    slug: 'growth',
    priceCents: 29700,
    workHours: 70,
    description: 'Best value for growing teams',
    features: [
      '70 AI Work Hours',
      'Everything in Starter',
      'Priority support',
      'API access'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    priceCents: 49700,
    workHours: 125,
    description: 'Maximum value for power users',
    features: [
      '125 AI Work Hours',
      'Everything in Growth',
      'Dedicated support',
      'Custom integrations'
    ]
  }
};

// Keep TOKEN_PACKAGES for backward compatibility during migration
export const TOKEN_PACKAGES = WORK_HOURS_PACKAGES;

// Work hour costs for actions
export const WORK_HOURS_COSTS = {
  messageKingMouse: { hours: 0.1, description: 'Send a message to King Mouse' },
  deployAiEmployee: { hours: 1, description: 'Deploy a new AI employee' },
  vmRuntime1h: { hours: 1, description: '1 hour of VM runtime' },
  processEmail: { hours: 0.05, description: 'Process 1 email' },
  apiCall: { hours: 0.01, description: 'API call' }
};

// Keep TOKEN_COSTS for backward compatibility
export const TOKEN_COSTS = {
  messageKingMouse: { tokens: 10, description: 'Send a message to King Mouse' },
  deployAiEmployee: { tokens: 100, description: 'Deploy a new AI employee' },
  vmRuntime1h: { tokens: 500, description: '1 hour of VM runtime' },
  processEmail: { tokens: 5, description: 'Process 1 email' },
  apiCall: { tokens: 1, description: 'API call' }
};

// Low balance threshold
export const LOW_BALANCE_THRESHOLD = 5;

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function formatWorkHours(hours: number): string {
  return `${hours.toLocaleString()} hours`;
}

export function formatTokens(tokens: number): string {
  return tokens.toLocaleString();
}

export function isLowBalance(balance: number): boolean {
  return balance < LOW_BALANCE_THRESHOLD;
}

export async function createCheckoutSession(
  customerId: string,
  packageSlug: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripe = getStripe();
  const pkg = WORK_HOURS_PACKAGES[packageSlug as keyof typeof WORK_HOURS_PACKAGES];
  if (!pkg) throw new Error('Invalid package');

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.name,
            description: `${pkg.workHours.toLocaleString()} AI Work Hours - ${pkg.description}`
          },
          unit_amount: pkg.priceCents
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      customerId,
      packageSlug,
      workHours: pkg.workHours.toString()
    }
  });

  return session;
}
