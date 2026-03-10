export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

/**
 * POST /api/reseller/stripe/connect
 * 
 * Create a Stripe Connect account for a reseller and return onboarding link.
 * Requires Bearer token; caller must be the reseller (user_id match).
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: body, error: bodyError } = await import('@/lib/safe-json').then(m => m.safeParseJson<{ resellerId?: string; email?: string; businessName?: string }>(request));
    if (bodyError) {
      return NextResponse.json({ error: bodyError }, { status: 400 });
    }
    const { resellerId, email, businessName } = body;

    if (!resellerId || !email) {
      return NextResponse.json({ 
        error: 'Reseller ID and email are required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is this reseller
    const authSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: userError } = await authSupabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const { data: resellerCheck } = await supabase
      .from('resellers')
      .select('user_id')
      .eq('id', resellerId)
      .single();
    if (!resellerCheck || resellerCheck.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    const stripe = await import('stripe').then(m => new m.default(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    }));

    let accountId: string;

    if (reseller?.stripe_account_id) {
      // Account exists but onboarding incomplete — create new accountLink for existing account
      accountId = reseller.stripe_account_id;
    } else {
      // Create new Stripe Connect Express account
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
      accountId = account.id;

      // Save Stripe account ID to reseller record
      await supabase
        .from('resellers')
        .update({
          stripe_account_id: account.id,
          stripe_account_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', resellerId);
    }

    // Create onboarding link (OAuth flow + bank account linking)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      accountId,
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
 * Check Stripe Connect status for a reseller.
 * If resellerId omitted, resolves from Bearer token (for dashboard banner).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let resellerId = searchParams.get('resellerId');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve resellerId from token if not provided
    if (!resellerId) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) {
        return NextResponse.json({ error: 'Reseller ID or auth required' }, { status: 400 });
      }
      const authSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: { user }, error: userError } = await authSupabase.auth.getUser(token);
      if (userError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      const { data: resellerByUser } = await supabase
        .from('resellers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!resellerByUser) {
        return NextResponse.json({ connected: false, status: 'not_reseller' });
      }
      resellerId = resellerByUser.id;
    }

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
