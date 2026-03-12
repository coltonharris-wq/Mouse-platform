/**
 * GET /api/export/settings?customer_id=xxx
 * Exports customer config as JSON download.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    // Get customer info
    const customers = await supabaseQuery(
      'customers',
      'GET',
      undefined,
      `id=eq.${customerId}&select=business_name,email,phone,owner_name,industry,niche,subscription_plan`
    );

    // Get notification preferences
    const prefs = await supabaseQuery(
      'notification_preferences',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&limit=1`
    );

    // Get receptionist config
    let receptionistConfig = null;
    try {
      const configs = await supabaseQuery(
        'receptionist_config',
        'GET',
        undefined,
        `customer_id=eq.${customerId}&limit=1`
      );
      if (configs && configs.length > 0) receptionistConfig = configs[0];
    } catch {
      // Table may not exist
    }

    // Get connected apps
    const apps = await supabaseQuery(
      'workspace_apps',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&connected=eq.true&select=app_slug,app_name,category`
    );

    const data = {
      exported_at: new Date().toISOString(),
      account: customers?.[0] || null,
      notification_preferences: prefs?.[0] || null,
      receptionist: receptionistConfig,
      connected_apps: apps || [],
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="settings.json"',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[EXPORT_SETTINGS]', message);
    return NextResponse.json({ error: 'Failed to export settings' }, { status: 500 });
  }
}
