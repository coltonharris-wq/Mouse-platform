/**
 * POST /api/onboarding/complete
 * Orchestrates post-payment setup — creates customer + triggers VM provisioning
 * Idempotent: calling twice with same session_id won't create duplicates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseQuery } from '@/lib/supabase-server';
import { provisionVM } from '@/lib/vm-provision';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stripe_session_id,
      business_name,
      owner_name,
      email,
      location,
      pro_slug,
      plan_slug,
      onboarding_answers,
    } = body;

    if (!stripe_session_id) {
      return NextResponse.json(
        { error: 'stripe_session_id required' },
        { status: 400 }
      );
    }

    // Verify Stripe session completed
    const session = await getStripe().checkout.sessions.retrieve(stripe_session_id);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 }
      );
    }

    // Idempotency check — see if customer already exists for this session
    const existing = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `stripe_subscription_id=eq.${session.subscription}&select=id,vm_status`
    );

    if (existing && existing.length > 0) {
      // Already created (by webhook or previous call) — return existing
      return NextResponse.json({
        success: true,
        customer_id: existing[0].id,
        vm_status: existing[0].vm_status,
        message: 'Customer already exists. Checking VM status.',
      });
    }

    // Get plan details
    const resolvedPlanSlug = plan_slug || session.metadata?.plan_slug || 'pro';
    const resolvedProSlug = pro_slug || session.metadata?.pro_slug;

    const plans = await supabaseQuery(
      'subscription_plans',
      'GET',
      undefined,
      `slug=eq.${resolvedPlanSlug}`
    );

    const plan = plans?.[0];
    const hoursIncluded = plan?.hours_included || 0;

    // Create customer
    const customerId = `cust_${Date.now().toString(36)}`;

    await supabaseQuery('customers', 'POST', {
      id: customerId,
      company_name: business_name || email?.split('@')[0] || 'New Customer',
      email: email || session.customer_email,
      owner_name: owner_name || '',
      location: location || '',
      pro_slug: resolvedProSlug,
      subscription_plan: resolvedPlanSlug,
      hours_included: hoursIncluded,
      hours_used: 0,
      trial_hours_remaining: 2.0,
      onboarding_answers: onboarding_answers || {},
      vm_status: 'pending',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      stripe_subscription_status: 'active',
      status: 'active',
      created_at: new Date().toISOString(),
    });

    // Trigger VM provisioning (async — don't block response)
    provisionVM({
      customer_id: customerId,
      pro_slug: resolvedProSlug,
      business_name: business_name || 'New Business',
      owner_name: owner_name || '',
      email: email || session.customer_email || '',
      location: location || '',
      plan_slug: resolvedPlanSlug,
      onboarding_answers: onboarding_answers || {},
    }).catch((err) => {
      console.error('[ONBOARDING_COMPLETE] VM provisioning error:', err);
    });

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      vm_status: 'provisioning',
      message: 'Your AI employee is being set up. Ready in ~2 minutes.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ONBOARDING_COMPLETE]', message);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
