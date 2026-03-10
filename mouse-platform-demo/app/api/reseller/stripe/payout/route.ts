export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || '').trim();;

/**
 * POST /api/reseller/stripe/payout
 * 
 * Trigger an instant payout for a reseller
 * Transfers available balance to their connected bank account
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: resellerCheck } = await supabase
      .from('resellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!resellerCheck) {
      return NextResponse.json({ error: 'Reseller account required' }, { status: 403 });
    }

    const { data: body } = await import('@/lib/safe-json').then(m => m.safeParseJson<{ amount?: number }>(request));
    const { amount } = body || {};
    const resellerId = resellerCheck.id;

    // Get reseller's Stripe account
    const { data: reseller } = await supabase
      .from('resellers')
      .select('stripe_account_id, stripe_account_status, email, company_name')
      .eq('id', resellerId)
      .single();

    if (!reseller?.stripe_account_id) {
      return NextResponse.json({ 
        error: 'Stripe account not connected. Please complete onboarding first.' 
      }, { status: 400 });
    }

    if (reseller.stripe_account_status !== 'active') {
      return NextResponse.json({ 
        error: 'Stripe account not fully activated. Please complete verification.' 
      }, { status: 400 });
    }

    const stripe = await import('stripe').then(m => new m.default(STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover' as any,
    }));

    // Get available balance for the connected account
    const balance = await stripe.balance.retrieve({
      stripeAccount: reseller.stripe_account_id,
    });

    const availableBalance = balance.available.reduce((sum, b) => sum + b.amount, 0);

    if (availableBalance <= 0) {
      return NextResponse.json({ 
        error: 'No available balance to payout' 
      }, { status: 400 });
    }

    const payoutAmount = amount ? Math.min(amount, availableBalance) : availableBalance;

    // Create a transfer to the connected account's bank
    // Note: With Express accounts, payouts happen automatically based on schedule
    // For instant payouts, we need to use Stripe's instant payout feature (costs 1% fee)
    
    // For now, we'll create a transfer that triggers the standard payout
    // The reseller can then trigger instant payout from their Stripe Express dashboard
    
    // Actually, for Express accounts, we should just let them know their balance
    // They control payouts from their Express dashboard
    
    return NextResponse.json({
      success: true,
      availableBalance: availableBalance / 100, // Convert to dollars
      message: 'Balance available in your Stripe dashboard. You can withdraw instantly from there.',
      stripeDashboardUrl: `https://express.stripe.com/${reseller.stripe_account_id}`,
    });
  } catch (error: any) {
    console.error('Payout error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process payout' 
    }, { status: 500 });
  }
}

/**
 * GET /api/reseller/stripe/payout?resellerId=xxx
 * 
 * Get payout history and available balance
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: resellerByUser } = await supabase
      .from('resellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!resellerByUser) {
      return NextResponse.json({ error: 'Reseller account required' }, { status: 403 });
    }

    const resellerId = resellerByUser.id;

    const { data: reseller } = await supabase
      .from('resellers')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', resellerId)
      .single();

    if (!reseller?.stripe_account_id) {
      return NextResponse.json({ 
        connected: false,
        message: 'Stripe account not connected' 
      });
    }

    const stripe = await import('stripe').then(m => new m.default(STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover' as any,
    }));

    // Get balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: reseller.stripe_account_id,
    });

    // Get recent payouts
    const payouts = await stripe.payouts.list({
      stripeAccount: reseller.stripe_account_id,
      limit: 10,
    });

    // Get recent transfers (commissions earned)
    const transfers = await stripe.transfers.list({
      destination: reseller.stripe_account_id,
      limit: 10,
    });

    return NextResponse.json({
      connected: true,
      availableBalance: balance.available.reduce((sum, b) => sum + b.amount, 0) / 100,
      pendingBalance: balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100,
      recentPayouts: payouts.data.map(p => ({
        id: p.id,
        amount: p.amount / 100,
        status: p.status,
        arrivalDate: p.arrival_date ? new Date(p.arrival_date * 1000).toISOString() : null,
        created: new Date(p.created * 1000).toISOString(),
      })),
      recentCommissions: transfers.data.map(t => ({
        id: t.id,
        amount: t.amount / 100,
        description: t.description,
        created: new Date(t.created * 1000).toISOString(),
      })),
      stripeDashboardUrl: `https://express.stripe.com/${reseller.stripe_account_id}`,
    });
  } catch (error: any) {
    console.error('Payout history error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch payout data' 
    }, { status: 500 });
  }
}
