export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAdmin } from '@/lib/admin-auth';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' as any as any })
  : null;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  if (!stripe) {
    return NextResponse.json({ 
      success: true, 
      data: { 
        mrr: 0, 
        totalGross: 0, 
        platformFees: 0, 
        subscriptions: [],
        charges: [],
        message: 'Stripe not configured. Add STRIPE_SECRET_KEY to .env.local' 
      } 
    });
  }

  try {
    // Get active subscriptions
    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    const mrr = subs.data.reduce((sum, sub) => {
      const item = sub.items.data[0];
      if (!item?.price?.unit_amount) return sum;
      const monthly = item.price.recurring?.interval === 'year' 
        ? (item.price.unit_amount / 12) 
        : item.price.unit_amount;
      return sum + monthly / 100;
    }, 0);

    // Get recent charges
    const charges = await stripe.charges.list({ limit: 50 });
    const totalGross = charges.data
      .filter(c => c.paid && !c.refunded)
      .reduce((sum, c) => sum + c.amount / 100, 0);

    // Get balance
    const balance = await stripe.balance.retrieve();
    const available = balance.available.reduce((sum, b) => sum + b.amount / 100, 0);

    return NextResponse.json({
      success: true,
      data: {
        mrr: Math.round(mrr * 100) / 100,
        totalGross: Math.round(totalGross * 100) / 100,
        platformFees: 0, // Connected account fees
        activeSubscriptions: subs.data.length,
        recentCharges: charges.data.slice(0, 10).map(c => ({
          id: c.id,
          amount: c.amount / 100,
          currency: c.currency,
          status: c.status,
          created: new Date(c.created * 1000).toISOString(),
          description: c.description,
        })),
        balanceAvailable: available,
      },
    });
  } catch (error: any) {
    console.error('Revenue fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
