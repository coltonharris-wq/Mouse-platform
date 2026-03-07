export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

/**
 * POST /api/reseller/checkout
 * 
 * Create a Stripe checkout session for a reseller-referred customer
 * Uses Stripe Connect to route payments to reseller with instant payout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      plan, 
      inviteCode, 
      email, 
      customerId,
      businessName,
      businessType 
    } = body;

    if (!plan || !inviteCode || !email) {
      return NextResponse.json({ 
        error: 'Plan, invite code, and email are required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate reseller invite code
    const { data: reseller, error: resellerError } = await supabase
      .from('resellers')
      .select('id, company_name, pricing_config, stripe_account_id, commission_rate, status')
      .eq('invite_code', inviteCode)
      .single();

    if (resellerError || !reseller) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    if (reseller.status !== 'active') {
      return NextResponse.json({ error: 'Reseller account inactive' }, { status: 403 });
    }

    if (!reseller.stripe_account_id) {
      return NextResponse.json({ 
        error: 'Reseller not configured for payments' 
      }, { status: 400 });
    }

    // Get pricing for this plan (reseller pricing or default)
    const pricing = getResellerPricing(plan, reseller.pricing_config);

    // Create Stripe checkout session with Connect
    const stripe = await import('stripe').then(m => new m.default(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    }));

    // Calculate application fee (platform keeps this, reseller gets rest)
    // Default: 40% commission to reseller means 60% platform fee
    const commissionRate = reseller.commission_rate || 0.40;
    const applicationFeeAmount = Math.round(pricing.amount * (1 - commissionRate));

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Mouse AI - ${pricing.name} Plan`,
              description: pricing.description,
            },
            unit_amount: pricing.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboard?session_id={CHECKOUT_SESSION_ID}&reseller=${inviteCode}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${inviteCode}&canceled=true`,
      // Stripe Connect: Transfer funds to reseller's connected account
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: reseller.stripe_account_id,
        },
      },
      metadata: {
        reseller_id: reseller.id,
        invite_code: inviteCode,
        plan: plan,
        customer_email: email,
        customer_id: customerId || '',
        business_name: businessName || '',
        business_type: businessType || '',
      },
      subscription_data: {
        metadata: {
          reseller_id: reseller.id,
          invite_code: inviteCode,
        },
      },
    });

    // Create pending customer record linked to reseller
    const pendingCustomerId = `pending_${Date.now()}`;
    await supabase.from('reseller_referrals').insert({
      id: pendingCustomerId,
      reseller_id: reseller.id,
      invite_code: inviteCode,
      customer_email: email,
      plan: plan,
      amount: pricing.amount,
      commission_rate: commissionRate,
      stripe_checkout_session_id: session.id,
      status: 'pending_payment',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      pricing: {
        amount: pricing.amount,
        commissionRate,
        resellerAmount: pricing.amount - applicationFeeAmount,
        platformAmount: applicationFeeAmount,
      },
    });
  } catch (error: any) {
    console.error('Reseller checkout error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, { status: 500 });
  }
}

/**
 * Get pricing for a plan, using reseller's custom pricing if available
 */
function getResellerPricing(plan: string, resellerPricing: any) {
  // Default pricing
  const defaultPricing: Record<string, { name: string; amount: number; description: string }> = {
    starter: {
      name: 'Starter',
      amount: 9700, // $97.00
      description: '160 work hours/month with 1 AI Employee',
    },
    growth: {
      name: 'Growth',
      amount: 29700, // $297.00
      description: '500 work hours/month with 3 AI Employees',
    },
    pro: {
      name: 'Pro',
      amount: 49700, // $497.00
      description: 'Unlimited work hours with 5 AI Employees',
    },
  };

  // If reseller has custom pricing for this plan, use it
  if (resellerPricing && resellerPricing[plan]) {
    return {
      ...defaultPricing[plan],
      amount: resellerPricing[plan].amount || defaultPricing[plan].amount,
      description: resellerPricing[plan].description || defaultPricing[plan].description,
    };
  }

  return defaultPricing[plan] || defaultPricing.growth;
}
