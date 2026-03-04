import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { calculateHoursDeducted, ServiceType } from '@/lib/billing-engine';

// POST: Log a usage event and deduct hours
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { customer_id, service, vendor_cost, description, tier } = await request.json();

    if (!customer_id || !service || vendor_cost === undefined) {
      return NextResponse.json({ error: 'Missing required fields: customer_id, service, vendor_cost' }, { status: 400 });
    }

    const billing = calculateHoursDeducted(service as ServiceType, vendor_cost, tier || 'starter');

    // Log the usage event
    const { error: logError } = await supabase.from('usage_logs').insert({
      customer_id,
      service,
      vendor_cost,
      marked_up_cost: billing.markedUpCost,
      hours_deducted: billing.hoursDeducted,
      margin: billing.margin,
      description: description || `${service} usage`,
      created_at: new Date().toISOString(),
    });

    if (logError) {
      console.error('Usage log error:', logError);
      // Don't fail if logging fails — still deduct hours
    }

    // Deduct hours from balance
    const { data: currentBalance, error: balanceError } = await supabase
      .from('work_hour_balances')
      .select('balance, total_hours')
      .eq('customer_id', customer_id)
      .single();

    if (balanceError || !currentBalance) {
      return NextResponse.json({ error: 'Customer balance not found' }, { status: 404 });
    }

    const newBalance = Math.max(0, currentBalance.balance - billing.hoursDeducted);
    
    const { error: updateError } = await supabase
      .from('work_hour_balances')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('customer_id', customer_id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    // Check low balance alert (10% remaining)
    const totalHours = currentBalance.total_hours || 20;
    const percentRemaining = (newBalance / totalHours) * 100;
    const lowBalance = percentRemaining <= 10;

    return NextResponse.json({
      success: true,
      usage: {
        service,
        vendor_cost,
        marked_up_cost: billing.markedUpCost,
        hours_deducted: billing.hoursDeducted,
        margin: billing.margin,
        new_balance: newBalance,
        low_balance: lowBalance,
        percent_remaining: Math.round(percentRemaining),
      },
    });
  } catch (error: any) {
    console.error('Billing usage error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Get customer balance and usage summary
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    const [balanceRes, usageRes] = await Promise.all([
      supabase.from('work_hour_balances').select('*').eq('customer_id', customerId).single(),
      supabase.from('usage_logs').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(50),
    ]);

    return NextResponse.json({
      success: true,
      balance: balanceRes.data || { balance: 0, total_hours: 0 },
      recentUsage: usageRes.data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
