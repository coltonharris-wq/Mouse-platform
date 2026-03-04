import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

/**
 * GET /api/admin/customers/[id]
 * Get a single customer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        resellers:reseller_id (name, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer', details: error.message },
        { status: 500 }
      );
    }
    
    // Format customer for frontend
    const formattedCustomer = {
      id: customer.id,
      company: customer.company_name,
      email: customer.email,
      plan: customer.plan_tier.charAt(0).toUpperCase() + customer.plan_tier.slice(1),
      status: customer.status,
      mrr: customer.plan_tier === 'enterprise' ? 7500 : customer.plan_tier === 'growth' ? 2997 : 997,
      resellerId: customer.reseller_id,
      resellerName: customer.resellers?.name || 'Unknown',
      resellerEmail: customer.resellers?.email || '',
      stripeCustomerId: customer.stripe_customer_id,
      stripeSubscriptionId: customer.stripe_subscription_id,
      stripeSubscriptionStatus: customer.stripe_subscription_status,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    };
    
    return NextResponse.json({ customer: formattedCustomer });
    
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/customers/[id]
 * Update a customer (full update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();
    
    const { company_name, email, plan_tier, status, reseller_id } = body;
    
    // Build update object with only provided fields
    const updateData: any = {};
    if (company_name !== undefined) updateData.company_name = company_name;
    if (email !== undefined) updateData.email = email;
    if (plan_tier !== undefined) updateData.plan_tier = plan_tier.toLowerCase();
    if (status !== undefined) updateData.status = status.toLowerCase();
    if (reseller_id !== undefined) updateData.reseller_id = reseller_id;
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update customer', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      customer,
      message: 'Customer updated successfully',
    });
    
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/customers/[id]
 * Partial update (for status changes, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();
    
    const { action, ...updateFields } = body;
    
    // Handle specific actions
    if (action) {
      switch (action) {
        case 'suspend':
          const { data: suspendedCustomer, error: suspendError } = await supabase
            .from('customers')
            .update({ status: 'suspended' })
            .eq('id', id)
            .select()
            .single();
          
          if (suspendError) {
            return NextResponse.json(
              { error: 'Failed to suspend customer', details: suspendError.message },
              { status: 500 }
            );
          }
          
          return NextResponse.json({
            success: true,
            customer: suspendedCustomer,
            message: 'Customer suspended successfully',
          });
          
        case 'activate':
          const { data: activatedCustomer, error: activateError } = await supabase
            .from('customers')
            .update({ status: 'active' })
            .eq('id', id)
            .select()
            .single();
          
          if (activateError) {
            return NextResponse.json(
              { error: 'Failed to activate customer', details: activateError.message },
              { status: 500 }
            );
          }
          
          return NextResponse.json({
            success: true,
            customer: activatedCustomer,
            message: 'Customer activated successfully',
          });
          
        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}` },
            { status: 400 }
          );
      }
    }
    
    // General field updates
    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update customer', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      customer,
      message: 'Customer updated successfully',
    });
    
  } catch (error) {
    console.error('Error patching customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Delete a customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete customer', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
    
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
