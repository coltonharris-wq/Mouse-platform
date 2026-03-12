/**
 * DELETE /api/customers?customer_id=xxx&confirmation=DELETE
 * Schedules account deletion — cancels Stripe sub, marks customer as deleted.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseQuery } from '@/lib/supabase-server';

export async function DELETE(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  const confirmation = request.nextUrl.searchParams.get('confirmation');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  if (confirmation !== 'DELETE') {
    return NextResponse.json({ error: 'Must pass confirmation=DELETE' }, { status: 400 });
  }

  try {
    // Get customer
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=stripe_customer_id,stripe_subscription_id,status`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = customers[0];

    // Cancel Stripe subscription if exists
    if (customer.stripe_subscription_id) {
      try {
        await getStripe().subscriptions.cancel(customer.stripe_subscription_id);
      } catch {
        // May already be cancelled
      }
    }

    // Mark customer as deleted (soft delete)
    await supabaseQuery(
      'customers',
      'PATCH',
      {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      },
      `id=eq.${customerId}`
    );

    return NextResponse.json({ success: true, message: 'Account scheduled for deletion' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[CUSTOMER_DELETE]', message);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
