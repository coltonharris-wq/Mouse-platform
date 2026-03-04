export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

/**
 * GET /api/onboarding/verify?session_id=xxx
 * Verify a Stripe checkout session and get customer details
 */
export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get customer data from metadata
    const customerId = session.metadata?.customer_id;
    const resellerId = session.metadata?.reseller_id;

    if (!customerId || !resellerId) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      );
    }

    // Get customer from database
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*, metadata')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get reseller branding
    const { data: reseller, error: resellerError } = await supabase
      .from('resellers')
      .select('name, logo_url, brand_primary, brand_navy, email')
      .eq('id', resellerId)
      .single();

    // Return customer data and branding
    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        businessName: customer.company_name,
        email: customer.email,
        planTier: customer.plan_tier,
        status: customer.status,
      },
      branding: reseller ? {
        companyName: reseller.name,
        logoUrl: reseller.logo_url,
        primaryColor: reseller.brand_primary,
        secondaryColor: reseller.brand_navy,
        fromEmail: reseller.email,
      } : null,
    });

  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
