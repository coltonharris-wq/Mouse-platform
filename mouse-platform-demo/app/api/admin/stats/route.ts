export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    // Aggregate from multiple backend endpoints
    const [healthRes, salesRes] = await Promise.allSettled([
      fetch(`${API_URL}/health`),
      fetch(`${API_URL}/sales/dashboard`),
    ]);

    const health = healthRes.status === 'fulfilled' ? await healthRes.value.json() : {};
    const salesDash = salesRes.status === 'fulfilled' ? await salesRes.value.json() : {};

    return NextResponse.json({
      health,
      sales: salesDash,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Admin stats proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 502 });
  }
}
