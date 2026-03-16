/**
 * POST /api/vm/provision
 * Provisions a single KingMouse VM for a customer
 * Replaces the old /api/vm/configure
 */

import { NextRequest, NextResponse } from 'next/server';
import { provisionVM } from '@/lib/vm-provision';
import { supabaseQuery } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, pro_slug, business_name, owner_name, email, location, plan_slug, onboarding_answers } = body;

    if (!customer_id || !pro_slug || !business_name) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, pro_slug, business_name' },
        { status: 400 }
      );
    }

    const resolvedOwnerName = owner_name || 'Business Owner';

    // Set provisioning status immediately so client poll sees it
    await supabaseQuery('customers', 'PATCH', {
      vm_status: 'provisioning',
    }, `id=eq.${customer_id}`);

    const result = await provisionVM({
      customer_id,
      pro_slug,
      business_name,
      owner_name: resolvedOwnerName,
      email: email || '',
      location: location || '',
      plan_slug: plan_slug || 'pro',
      onboarding_answers: onboarding_answers || {},
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, computer_id: result.computer_id },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      computer_id: result.computer_id,
      status: 'provisioning',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VM_PROVISION]', message);
    return NextResponse.json(
      { error: 'Failed to provision VM' },
      { status: 500 }
    );
  }
}
