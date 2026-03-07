export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

/**
 * POST /api/reseller/stripe/connect
 * 
 * Create a Stripe Connect account for a reseller and return onboarding link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resellerId, email, businessName } = body;

    if (!resellerId || !email) {
      return NextResponse.json({ 
        error: 'Reseller ID and email are required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if reseller already has a Stripe account
    const { data: reseller } = await supabase
      .from('resellers')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', resellerId)
      .single();

    if (reseller?.stripe_account_id && reseller?.stripe_account_status === 'active') {
      return NextResponse.json({
        success: true,
        alreadyConnected: true,
        message: 'Stripe account already connected',
      });
    }

    // Create Stripe Connect account
    const stripe = await import('stripe').then(m => new m.default(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    }));

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      business_type: 'individual',
      individual: {
        email: email,
      },
      business_profile: {
        name: businessName || 'Mouse AI Reseller',
        url: 'https://mouse.is',
        product_description: 'AI employee reselling and consulting services',
      },
      capabilities: {
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'manual', // Resellers can trigger instant payouts
          },
        },
      },
    });

    // Save Stripe account ID to reseller record
    await supabase
      .from('resellers')
      .update({
        stripe_account_id: account.id,
        stripe_account_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', resellerId);

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      accountId: account.id,
    });
  } catch (error: any) {
    console.error('Stripe Connect onboarding error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create Stripe Connect account' 
    }, { status: 500 });
  }
}

/**
 * GET /api/reseller/stripe/connect?resellerId=xxx
 * 
 * Check Stripe Connect status for a reseller
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resellerId = searchParams.get('resellerId');

    if (!resellerId) {
      return NextResponse.json({ error: 'Reseller ID required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: reseller } = await supabase
      .from('resellers')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', resellerId)
      .single();

    if (!reseller?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        status: 'not_started',
      });
    }

    // Check Stripe account status
    const stripe = await import('stripe').then(m => new m.default(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    }));

    const account = await stripe.accounts.retrieve(reseller.stripe_account_id);
    
    const isActive = account.charges_enabled && account.payouts_enabled;
    
    // Update status in database
    await supabase
      .from('resellers')
      .update({
        stripe_account_status: isActive ? 'active' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', resellerId);

    return NextResponse.json({
      connected: isActive,
      status: isActive ? 'active' : 'pending',
      accountId: reseller.stripe_account_id,
      requirements: account.requirements?.currently_due || [],
    });
  } catch (error: any) {
    console.error('Stripe Connect status error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to check Stripe Connect status' 
    }, { status: 500 });
  }
}
