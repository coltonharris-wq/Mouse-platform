import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id is required' }, { status: 400 });
    }

    // Get all businesses for this reseller
    const businesses = await supabaseQuery(
      'reseller_businesses',
      'GET',
      undefined,
      `reseller_id=eq.${resellerId}&select=id,business_name,customer_id,status`
    );

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ agents: [] });
    }

    const agents = [];

    for (const biz of businesses) {
      if (!biz.customer_id) continue;

      // Check if there's a receptionist config (meaning a voice agent was set up)
      try {
        const configs = await supabaseQuery(
          'receptionist_config',
          'GET',
          undefined,
          `customer_id=eq.${biz.customer_id}&select=id,is_enabled,greeting_text,voice_id,business_hours`
        );

        if (!configs || configs.length === 0) continue;
        const config = configs[0];

        // Get phone number
        const phones = await supabaseQuery(
          'customer_phone_numbers',
          'GET',
          undefined,
          `customer_id=eq.${biz.customer_id}&status=eq.active&select=phone_number,twilio_sid&order=created_at.desc&limit=1`
        );

        if (!phones || phones.length === 0) continue;

        // Get today's call count
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const calls = await supabaseQuery(
          'call_logs',
          'GET',
          undefined,
          `customer_id=eq.${biz.customer_id}&created_at=gte.${todayStart.toISOString()}&select=id,duration_seconds`
        );

        const callsToday = calls?.length || 0;
        const totalDuration = (calls || []).reduce(
          (sum: number, c: { duration_seconds?: number }) => sum + (c.duration_seconds || 0),
          0
        );
        const avgDuration = callsToday > 0 ? Math.round(totalDuration / callsToday) : 0;

        agents.push({
          id: biz.customer_id,
          business_id: biz.id,
          business_name: biz.business_name,
          phone_number: phones[0].phone_number,
          twilio_sid: phones[0].twilio_sid,
          status: config.is_enabled ? 'active' : 'paused',
          greeting: config.greeting_text,
          voice_id: config.voice_id,
          business_hours: config.business_hours,
          calls_today: callsToday,
          avg_duration: avgDuration,
        });
      } catch {
        // Skip businesses with errors
      }
    }

    return NextResponse.json({ agents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VOICE_AGENTS]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
