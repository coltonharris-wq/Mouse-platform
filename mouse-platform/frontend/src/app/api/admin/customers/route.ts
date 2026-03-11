/**
 * GET /api/admin/customers
 * Admin endpoint — lists all customers with VM status, Pro, plan, hours used
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

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
