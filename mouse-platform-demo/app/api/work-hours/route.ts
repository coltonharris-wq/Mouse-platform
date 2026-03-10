export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();

// GET /api/work-hours/balance?customerId=xxx
// Get current work hours balance and usage breakdown
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get customer's work hours balance
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('work_hours_balance')
      .eq('id', customerId)
      .single();

    if (customerError) {
      return NextResponse.json(
        { error: 'Failed to fetch customer balance' },
        { status: 500 }
      );
    }

    // Get monthly usage breakdown
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const { data: monthlyUsage, error: usageError } = await supabase
      .from('feature_usage_monthly')
      .select('*')
      .eq('customer_id', customerId)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage:', usageError);
    }

    // Get feature breakdown using the function
    const { data: breakdown, error: breakdownError } = await supabase
      .rpc('get_feature_usage_breakdown', {
        p_customer_id: customerId,
        p_year: year,
        p_month: month,
      });

    return NextResponse.json({
      success: true,
      balance: customer?.work_hours_balance || 0,
      monthlyUsage: monthlyUsage || {
        text_chat_hours: 0,
        voice_chat_hours: 0,
        image_generation_hours: 0,
        video_generation_hours: 0,
        screen_recording_hours: 0,
        api_call_hours: 0,
        employee_deployment_hours: 0,
        vm_runtime_hours: 0,
        total_hours_consumed: 0,
      },
      breakdown: breakdown || [],
    });
  } catch (error) {
    console.error('Error in work-hours API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work hours data' },
      { status: 500 }
    );
  }
}

// POST /api/work-hours/usage
// Record feature usage and deduct work hours
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      employeeId,
      featureType,
      units,
      workHours,
      metadata,
    } = body;

    if (!customerId || !featureType || !units || !workHours) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, featureType, units, workHours' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the database function to record usage
    const { data, error } = await supabase
      .rpc('record_feature_usage', {
        p_customer_id: customerId,
        p_employee_id: employeeId || null,
        p_feature_type: featureType,
        p_units_used: units,
        p_work_hours_consumed: workHours,
        p_metadata: metadata || {},
      });

    if (error) {
      console.error('Error recording feature usage:', error);
      return NextResponse.json(
        { error: 'Failed to record feature usage' },
        { status: 500 }
      );
    }

    const result = data?.[0];

    if (!result?.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient work hours balance',
          currentBalance: result?.new_balance,
          required: workHours,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      workHoursConsumed: result?.total_consumed,
      newBalance: result?.new_balance,
    });
  } catch (error) {
    console.error('Error in work-hours usage API:', error);
    return NextResponse.json(
      { error: 'Failed to record usage' },
      { status: 500 }
    );
  }
}

// PATCH /api/work-hours/balance
// Update work hours balance (for purchases)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { customerId, amount, type = 'purchase' } = body;

    if (!customerId || !amount) {
      return NextResponse.json(
        { error: 'Customer ID and amount required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('work_hours_balance')
      .eq('id', customerId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      );
    }

    const currentBalance = customer?.work_hours_balance || 0;
    const newBalance = type === 'purchase' 
      ? currentBalance + amount 
      : Math.max(0, currentBalance - amount);

    const { error: updateError } = await supabase
      .from('customers')
      .update({ 
        work_hours_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      previousBalance: currentBalance,
      newBalance,
      change: type === 'purchase' ? amount : -amount,
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    );
  }
}
