/**
 * GET /api/billing/invoices?customer_id=xxx
 * Returns Stripe invoice history for a customer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    // Get Stripe customer ID from our DB
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=stripe_customer_id`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const stripeCustomerId = customers[0].stripe_customer_id;

    if (!stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    const stripe = getStripe();
    const stripeInvoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 24,
    });

    const invoices = stripeInvoices.data.map((inv) => ({
      id: inv.id,
      date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      amount_cents: inv.amount_paid || inv.total || 0,
      status: inv.status || 'unknown',
      pdf_url: inv.invoice_pdf || null,
      hosted_url: inv.hosted_invoice_url || null,
      period_start: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
      period_end: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
    }));

    return NextResponse.json({ invoices });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[BILLING_INVOICES]', message);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
