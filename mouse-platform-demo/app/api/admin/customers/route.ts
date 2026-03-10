export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/admin/customers
 * Get all customers with optional filtering
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const supabase = getSupabaseServer();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const planFilter = searchParams.get('plan') || 'all';
    const statusFilter = searchParams.get('status') || 'all';
    const resellerFilter = searchParams.get('reseller') || 'all';
    
    // Start building the query
    let query = supabase
      .from('customers')
      .select(`
        *,
        resellers:reseller_id (name)
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (planFilter !== 'all') {
      query = query.eq('plan_tier', planFilter.toLowerCase());
    }
    
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter.toLowerCase());
    }
    
    if (resellerFilter !== 'all') {
      query = query.eq('reseller_id', resellerFilter);
    }
    
    const { data: customers, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers', details: error.message },
        { status: 500 }
      );
    }
    
    // Format customers for frontend
    const formattedCustomers = customers?.map((customer: any) => ({
      id: customer.id,
      company: customer.company_name,
      email: customer.email,
      plan: customer.plan_tier.charAt(0).toUpperCase() + customer.plan_tier.slice(1),
      status: customer.status,
      mrr: customer.plan_tier === 'enterprise' ? 7500 : customer.plan_tier === 'growth' ? 2997 : 997,
      resellerId: customer.reseller_id,
      resellerName: customer.resellers?.name || 'Unknown',
      stripeCustomerId: customer.stripe_customer_id,
      stripeSubscriptionId: customer.stripe_subscription_id,
      stripeSubscriptionStatus: customer.stripe_subscription_status,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    })) || [];
    
    return NextResponse.json({ 
      customers: formattedCustomers,
      count: formattedCustomers.length 
    });
    
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const supabase = getSupabaseServer();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    const body = await request.json();
    
    const { company_name, email, plan_tier = 'starter', reseller_id, status = 'active' } = body;
    
    // Validation
    if (!company_name || !email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Generate unique ID
    const id = `cust-${Date.now()}`;
    
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        id,
        company_name,
        email,
        plan_tier: plan_tier.toLowerCase(),
        reseller_id: reseller_id || '89d0058a-2440-44d0-91c2-a0fcd6ead2e2', // Default Automio reseller
        status: status.toLowerCase(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create customer', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      customer,
      message: 'Customer created successfully',
    });
    
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
