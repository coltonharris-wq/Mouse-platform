import { NextRequest, NextResponse } from 'next/server';
import { resellerCustomerManager } from '@/lib/reseller-customer-manager';
import { createClient } from '@/lib/supabase-client';

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
    
    // Get the current session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get the user's profile to find their reseller_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('reseller_id, role')
      .eq('id', session.user.id)
      .single();

    let resellerId = profile?.reseller_id;
    
    if (!resellerId) {
      if (profile?.role === 'platform_owner' || profile?.role === 'admin') {
        resellerId = 'res-001';
      } else {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }
    }

    // Fetch customer from database
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
      .eq('reseller_id', resellerId)
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
    
    // Get the current session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
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
