import { NextRequest, NextResponse } from 'next/server';
import { purchaseNumber, configureWebhook } from '@/lib/twilio-client';
import { supabaseQuery } from '@/lib/supabase-server';
import { getCustomerUrl } from '@/lib/urls';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reseller_id,
      business_id,
      business_name,
      phone_number,
      greeting,
      business_hours,
      voice_tone,
      language,
      features,
    } = body;

    if (!reseller_id || !phone_number || !greeting) {
      return NextResponse.json(
        { error: 'reseller_id, phone_number, and greeting are required' },
        { status: 400 }
      );
    }

    // Resolve or create the business record
    let customerId: string | null = null;
    let resolvedBusinessId = business_id;

    if (business_id) {
      // Look up existing business
      const businesses = await supabaseQuery(
        'reseller_businesses',
        'GET',
        undefined,
        `id=eq.${business_id}&select=id,customer_id,business_name`
      );
      if (businesses && businesses.length > 0) {
        customerId = businesses[0].customer_id;
      }
    } else if (business_name) {
      // Create a new business record
      const created = await supabaseQuery('reseller_businesses', 'POST', {
        reseller_id,
        business_name,
        status: 'active',
      });
      if (created && created.length > 0) {
        resolvedBusinessId = created[0].id;
      }
    }

    // If no customer_id, generate a synthetic one for the voice agent
    if (!customerId) {
      customerId = `voice_${resolvedBusinessId || Date.now()}`;
    }

    // Purchase the Twilio number
    const purchaseResult = await purchaseNumber(phone_number);

    // Configure webhook for inbound calls
    await configureWebhook(
      purchaseResult.sid,
      getCustomerUrl(`/api/webhooks/twilio/${customerId}`),
      getCustomerUrl(`/api/webhooks/twilio/status/${customerId}`)
    );

    // Save phone number to DB
    await supabaseQuery('customer_phone_numbers', 'POST', {
      customer_id: customerId,
      phone_number: purchaseResult.phone_number,
      twilio_sid: purchaseResult.sid,
      friendly_name: purchaseResult.friendly_name,
      area_code: phone_number.substring(2, 5),
      status: 'active',
    });

    // Create or update receptionist config
    const existing = await supabaseQuery(
      'receptionist_config',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&select=id`
    );

    const configPayload = {
      customer_id: customerId,
      is_enabled: true,
      greeting_text: greeting,
      voice_id: voice_tone === 'Friendly' ? 'nova' : voice_tone === 'Energetic' ? 'shimmer' : 'alloy',
      business_hours: business_hours ? { raw: business_hours } : null,
    };

    if (!existing || existing.length === 0) {
      await supabaseQuery('receptionist_config', 'POST', configPayload);
    } else {
      await supabaseQuery(
        'receptionist_config',
        'PATCH',
        configPayload,
        `customer_id=eq.${customerId}`
      );
    }

    // Link customer_id to the business record if we have one
    if (resolvedBusinessId) {
      await supabaseQuery(
        'reseller_businesses',
        'PATCH',
        { customer_id: customerId, status: 'active' },
        `id=eq.${resolvedBusinessId}`
      );
    }

    return NextResponse.json({
      success: true,
      agent_id: customerId,
      phone_number: purchaseResult.phone_number,
      twilio_sid: purchaseResult.sid,
      business_id: resolvedBusinessId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[VOICE_DEPLOY]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
