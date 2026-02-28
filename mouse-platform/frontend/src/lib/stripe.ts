import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export { stripe };

// Token package definitions matching the backend
export const TOKEN_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    priceCents: 1900,
    tokenAmount: 4000,
    description: 'Perfect for small teams getting started',
    features: [
      '4,000 tokens',
      'Message with King Mouse',
      'Deploy AI employees',
      'Email support'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    slug: 'growth',
    priceCents: 4900,
    tokenAmount: 12000,
    description: 'Best value for growing teams',
    features: [
      '12,000 tokens',
      'Everything in Starter',
      'Priority support',
      'API access'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    priceCents: 9900,
    tokenAmount: 30000,
    description: 'Maximum value for power users',
    features: [
      '30,000 tokens',
      'Everything in Growth',
      'Dedicated support',
      'Custom integrations'
    ]
  }
};

// Token costs for actions
export const TOKEN_COSTS = {
  messageKingMouse: { tokens: 10, description: 'Send a message to King Mouse' },
  deployAiEmployee: { tokens: 100, description: 'Deploy a new AI employee' },
  vmRuntime1h: { tokens: 500, description: '1 hour of VM runtime' },
  processEmail: { tokens: 5, description: 'Process 1 email' },
  apiCall: { tokens: 1, description: 'API call' }
};

// Low balance threshold
export const LOW_BALANCE_THRESHOLD = 500;

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
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
  const pkg = TOKEN_PACKAGES[packageSlug as keyof typeof TOKEN_PACKAGES];
  if (!pkg) throw new Error('Invalid package');

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.name,
            description: `${pkg.tokenAmount.toLocaleString()} tokens - ${pkg.description}`
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
      tokenAmount: pkg.tokenAmount.toString()
    }
  });

  return session;
}
