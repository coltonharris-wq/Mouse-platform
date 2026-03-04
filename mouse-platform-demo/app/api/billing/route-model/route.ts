import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getModelForTier } from '@/lib/billing-engine';

/**
 * GET: Determine which AI model to use for a customer based on their tier
 * Query: ?customer_id=xxx
 * Returns: { model, apiModel, tier }
 * 
 * This is called by AI employee workers before processing a task.
 * The customer never sees which model is running.
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  // Default to starter tier if we can't look up the customer
  let tier = 'starter';

  if (supabase) {
    try {
      const { data } = await supabase
        .from('customers')
        .select('plan_tier')
        .eq('id', customerId)
        .single();

      if (data?.plan_tier) {
        tier = data.plan_tier;
      }
    } catch (e) {
      // Fall back to starter
    }
  }

  const modelConfig = getModelForTier(tier);

  return NextResponse.json({
    success: true,
    customer_id: customerId,
    tier,
    ...modelConfig,
  });
}
