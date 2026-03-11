/**
 * POST /api/vm/retry-provision
 * Manual retry for failed VM provisioning
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { provisionVM } from '@/lib/vm-provision';

export async function POST(request: NextRequest) {
  try {
    const { customer_id } = await request.json();

    if (!customer_id) {
      return NextResponse.json(
        { error: 'customer_id required' },
        { status: 400 }
      );
    }

    // Look up customer
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customer_id}&select=*`
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customers[0];

    // Only allow retry if VM is in error or pending state
    if (customer.vm_status !== 'error' && customer.vm_status !== 'pending') {
      return NextResponse.json(
        { error: `VM is currently ${customer.vm_status}. Retry only available for error/pending states.` },
        { status: 400 }
      );
    }

    // Trigger re-provisioning
    const result = await provisionVM({
      customer_id,
      pro_slug: customer.pro_slug,
      business_name: customer.company_name,
      owner_name: customer.owner_name || '',
      email: customer.email,
      location: customer.location || '',
      plan_slug: customer.subscription_plan || 'pro',
      onboarding_answers: customer.onboarding_answers || {},
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      computer_id: result.computer_id,
      status: 'provisioning',
      message: 'VM provisioning retry initiated.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_RETRY_PROVISION]', message);
    return NextResponse.json(
      { error: 'Failed to retry provisioning' },
      { status: 500 }
    );
  }
}
