export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { resellerCustomerManager } from '@/lib/reseller-customer-manager';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getResellerIdFromToken(request: NextRequest): Promise<{ resellerId: string } | { error: string; status: number }> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { error: 'Unauthorized', status: 401 };

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return { error: 'Invalid token', status: 401 };

  const { data: reseller } = await supabase
    .from('resellers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!reseller) return { error: 'Reseller account required', status: 403 };
  return { resellerId: reseller.id };
}

/**
 * GET /api/reseller/customers/[id]
 * Get single customer details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getResellerIdFromToken(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch customer — must belong to this reseller
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        revenue_events (
          gross_amount,
          reseller_amount,
          timestamp,
          type
        )
      `)
      .eq('id', id)
      .eq('reseller_id', auth.resellerId)
      .single();

    if (error || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Transform to OnboardedCustomer format
    const totalCommission = customer.revenue_events?.reduce(
      (sum: number, event: any) => sum + (event.reseller_amount || 0),
      0
    ) / 100;

    const mrr = customer.plan_tier === 'starter' ? 997 : 
                customer.plan_tier === 'pro' ? 1997 : 4997;

    const transformedCustomer = {
      id: customer.id,
      businessName: customer.company_name,
      ownerName: customer.metadata?.owner_name || '',
      email: customer.email,
      phone: customer.metadata?.phone || '',
      status: customer.status === 'active' ? 'active' : 
              customer.status === 'cancelled' ? 'cancelled' : 'pending_payment',
      mrr: customer.stripe_subscription_status === 'active' ? mrr : 0,
      commissionEarned: totalCommission,
      commissionRate: 0.40,
      stripeCustomerId: customer.stripe_customer_id,
      stripeSubscriptionId: customer.stripe_subscription_id,
      createdAt: customer.created_at,
      activatedAt: customer.stripe_subscription_status === 'active' 
        ? customer.updated_at 
        : undefined,
      planTier: customer.plan_tier || 'starter',
      resellerId: customer.reseller_id,
    };

    return NextResponse.json({ customer: transformedCustomer });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reseller/customers/[id]
 * Perform actions on a customer (resend-invite, cancel, reactivate)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getResellerIdFromToken(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Parse action from body
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'resend-invite':
        const resendResult = await resellerCustomerManager.resendWelcomeEmail(id);
        
        if (!resendResult.success) {
          return NextResponse.json(
            { error: resendResult.error || 'Failed to resend invite' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Invite resent successfully'
        });

      case 'cancel':
        const cancelResult = await resellerCustomerManager.updateCustomerStatus(id, 'cancelled');
        
        if (!cancelResult.success) {
          return NextResponse.json(
            { error: cancelResult.error || 'Failed to cancel customer' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Customer cancelled successfully'
        });

      case 'reactivate':
        const reactivateResult = await resellerCustomerManager.updateCustomerStatus(id, 'active');
        
        if (!reactivateResult.success) {
          return NextResponse.json(
            { error: reactivateResult.error || 'Failed to reactivate customer' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Customer reactivated successfully'
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error performing customer action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
