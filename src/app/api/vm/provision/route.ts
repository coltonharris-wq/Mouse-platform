import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getVerticalConfig } from '@/lib/config-loader';

const ORGO_BASE = 'https://www.orgo.ai/api';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user already has an active VM
    const { data: existingVm } = await supabase
      .from('vms')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['provisioning', 'installing', 'ready'])
      .single();

    if (existingVm) {
      return NextResponse.json({
        success: true,
        data: { vm_id: existingVm.id, status: existingVm.status },
      });
    }

    // Get user profile for VM configuration
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Build config payload for the VM (includes vertical config for SOUL.md, USER.md, agents.md)
    const nicheSlug = profile?.niche?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';
    const verticalConfig = getVerticalConfig(profile?.vertical_config_id || nicheSlug);

    const configPayload = {
      user: {
        company_name: profile?.company_name || '',
        industry: profile?.industry || '',
        niche: profile?.niche || '',
        location: profile?.location || '',
        biggest_pain: profile?.biggest_pain || '',
        business_description: profile?.business_description || '',
        tools_used: profile?.tools_used || [],
        website_url: profile?.website_url || '',
        business_intel: profile?.business_intel || null,
      },
      vertical_config_id: nicheSlug,
      soul: verticalConfig?.soul || { role: 'You are King Mouse, an AI operations manager for small businesses.', capabilities: [] },
      kingMouse: verticalConfig?.kingMouse || {},
      receptionist: verticalConfig?.receptionist || {},
      leads: verticalConfig?.leads || {},
    };

    // Base64 encode config for the install script
    const configB64 = Buffer.from(JSON.stringify(configPayload)).toString('base64');

    // Step 1: Create VM via Orgo API with startup script that installs the Mouse fork
    const orgoResponse = await fetch(`${ORGO_BASE}/computers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ORGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspace_id: process.env.ORGO_WORKSPACE_ID,
        name: `mouse-${user.id.slice(0, 8)}-${Date.now()}`,
        ram: 4,
        cpu: 2,
        startup_script: `#!/bin/bash\ncurl -sSL https://mice.ink/install.sh | bash -s -- ${configB64}`,
      }),
    });

    if (!orgoResponse.ok) {
      const errorData = await orgoResponse.text();
      console.error(`Orgo create computer error (${orgoResponse.status}):`, errorData);
      return NextResponse.json(
        { success: false, error: `Failed to provision VM (${orgoResponse.status}): ${errorData.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const orgoData = await orgoResponse.json();
    const computerId = orgoData.id;
    const vmAddress = orgoData.url || orgoData.ip_address || orgoData.address || orgoData.ip || null;

    console.log('[Provision] Orgo response:', JSON.stringify(orgoData).slice(0, 500));

    // Save VM record — mark as provisioning (install script needs to complete first)
    const { data: vm, error: insertError } = await supabase
      .from('vms')
      .insert({
        user_id: user.id,
        orgo_vm_id: computerId,
        ip_address: vmAddress,
        status: 'provisioning',
        port: 18789,
        provision_started_at: new Date().toISOString(),
        config_json: configPayload,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save VM record:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save VM record' },
        { status: 500 }
      );
    }

    // Create work_hours record for new user (2.0 free hours to start)
    const { data: existingHours } = await supabase
      .from('work_hours')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingHours) {
      await supabase.from('work_hours').insert({
        user_id: user.id,
        total_purchased: 2.0,
        total_used: 0,
        remaining: 2.0,
      });
    }

    return NextResponse.json({
      success: true,
      data: { vm_id: vm.id, status: 'provisioning' },
    });
  } catch (err) {
    console.error('VM provision error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

