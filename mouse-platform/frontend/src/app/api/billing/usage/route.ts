/**
 * GET /api/billing/usage?customer_id=xxx
 * Returns current billing period usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { verifyAuth, requireCustomerAccess } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customer_id required' },
        { status: 400 }
      );
    }

    const auth = await verifyAuth(request);
    const accessError = requireCustomerAccess(auth, customerId);
    if (accessError) return accessError;

    // Get customer plan info
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=subscription_plan,hours_included,hours_used`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customers[0];
    const hoursIncluded = customer.hours_included || 0;
    const hoursUsed = parseFloat(customer.hours_used) || 0;
    const hoursRemaining = Math.max(0, hoursIncluded - hoursUsed);
    const overageHours = Math.max(0, hoursUsed - hoursIncluded);
    const overageCostCents = Math.round(overageHours * 498);

    // Current billing period (calendar month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return NextResponse.json({
      plan: customer.subscription_plan || 'none',
      hours_included: hoursIncluded,
      hours_used: Math.round(hoursUsed * 100) / 100,
      hours_remaining: Math.round(hoursRemaining * 100) / 100,
      overage_hours: Math.round(overageHours * 100) / 100,
      overage_cost_cents: overageCostCents,
      billing_period_start: periodStart.toISOString(),
      billing_period_end: periodEnd.toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[BILLING_USAGE]', message);
    return NextResponse.json(
      { error: 'Failed to fetch billing usage' },
      { status: 500 }
    );
  }
}
