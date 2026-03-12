/**
 * GET /api/admin/customers
 * Admin endpoint — lists all customers with VM status, Pro, plan, hours used
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, ...updates } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    // Attribution lock: prevent reseller_id changes without admin_override
    if (updates.reseller_id !== undefined) {
      const existing = await supabaseQuery(
        'customers', 'GET', undefined,
        `id=eq.${customer_id}&select=id,reseller_id`
      );
      const customer = existing?.[0];

      if (customer?.reseller_id && updates.reseller_id !== customer.reseller_id) {
        if (!body.admin_override || !body.reason) {
          return NextResponse.json(
            { error: 'Cannot change reseller attribution. Use admin_override with reason.' },
            { status: 403 }
          );
        }

        // Log the override
        await supabaseQuery('attribution_log', 'POST', {
          customer_id,
          old_reseller_id: customer.reseller_id,
          new_reseller_id: updates.reseller_id,
          changed_by: 'admin',
          reason: body.reason,
        });
      }
    }

    // Remove non-column fields before patching
    delete updates.admin_override;
    delete updates.reason;

    await supabaseQuery('customers', 'PATCH', updates, `id=eq.${customer_id}`);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ADMIN_CUSTOMERS_PATCH]', message);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Add platform_owner auth check (Phase 9, Task 46)
    // For now, this endpoint is accessible but will be locked down

    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      'select=id,company_name,email,pro_slug,subscription_plan,vm_status,vm_computer_id,hours_used,hours_included,created_at&order=created_at.desc'
    );

    return NextResponse.json({
      customers: (customers || []).map((c: Record<string, unknown>) => ({
        id: c.id,
        company_name: c.company_name,
        email: c.email,
        pro_slug: c.pro_slug,
        plan: c.subscription_plan,
        vm_status: c.vm_status,
        hours_used: parseFloat(String(c.hours_used)) || 0,
        hours_included: c.hours_included || 0,
        created_at: c.created_at,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ADMIN_CUSTOMERS]', message);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
