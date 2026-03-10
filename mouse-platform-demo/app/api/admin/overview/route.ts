export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
  }

  try {
    const [customersRes, resellersRes, profilesRes, hiredRes] = await Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('resellers').select('*'),
      supabase.from('profiles').select('id, role, created_at'),
      supabase.from('hired_employees').select('id, status'),
    ]);

    const customers = customersRes.data || [];
    const resellers = resellersRes.data || [];
    const profiles = profilesRes.data || [];
    const hiredEmployees = hiredRes.data || [];

    // System health checks
    const anthropicStatus = await checkAnthropic();

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers: customers.length,
        totalResellers: resellers.length,
        totalProfiles: profiles.length,
        activeEmployees: hiredEmployees.filter((e: any) => e.status === 'active').length,
        totalEmployeesHired: hiredEmployees.length,
        planDistribution: customers.reduce((acc: any, c: any) => {
          acc[c.plan_tier] = (acc[c.plan_tier] || 0) + 1;
          return acc;
        }, {}),
        systemHealth: {
          supabase: 'connected',
          anthropic: anthropicStatus,
          backend: 'unknown',
        },
        recentCustomers: customers.slice(0, 5),
        recentResellers: resellers.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function checkAnthropic(): Promise<string> {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return 'no_key';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });
    return res.ok ? 'connected' : `error_${res.status}`;
  } catch {
    return 'unreachable';
  }
}
