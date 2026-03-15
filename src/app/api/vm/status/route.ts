import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { extractVmIp } from '@/lib/orgo';

const ORGO_BASE = process.env.ORGO_BASE_URL || 'https://www.orgo.ai/api';

async function runInstallOnVM(orgoVmId: string, bashCommand: string): Promise<void> {
  // Orgo exec API expects Python code, so wrap bash in subprocess.
  // Run in background (nohup) so the exec call returns immediately —
  // the 800MB tarball download outlasts the Orgo exec timeout otherwise.
  const bgCommand = `nohup bash -c ${JSON.stringify(bashCommand)} > /tmp/mouse-install.log 2>&1 &`;
  const pythonCode = `import subprocess; subprocess.Popen(["bash", "-c", ${JSON.stringify(bgCommand)}]); print("install started in background")`;

  const res = await fetch(`${ORGO_BASE}/computers/${orgoVmId}/exec`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ORGO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: pythonCode }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Orgo exec (${res.status}): ${errText.slice(0, 300)}`);
  }
}

export async function GET(request: NextRequest) {
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

    const vmId = request.nextUrl.searchParams.get('vm_id');
    if (!vmId) {
      return NextResponse.json(
        { success: false, error: 'vm_id query parameter is required' },
        { status: 400 }
      );
    }

    // Check VM status in Supabase
    const { data: vm, error: vmError } = await supabase
      .from('vms')
      .select('*')
      .eq('id', vmId)
      .eq('user_id', user.id)
      .single();

    if (vmError || !vm) {
      return NextResponse.json(
        { success: false, error: 'VM not found' },
        { status: 404 }
      );
    }

    let healthStatus: string | null = null;

    // If VM has no IP address yet, try to fetch it from Orgo
    if (!vm.ip_address && vm.orgo_vm_id) {
      try {
        const orgoRes = await fetch(`${ORGO_BASE}/computers/${vm.orgo_vm_id}`, {
          headers: { 'Authorization': `Bearer ${process.env.ORGO_API_KEY}` },
          signal: AbortSignal.timeout(5000),
        });
        if (orgoRes.ok) {
          const orgoData = await orgoRes.json();
          const ip = orgoData.url || orgoData.ip_address || orgoData.address || orgoData.ip || null;
          if (ip) {
            await supabase.from('vms').update({ ip_address: ip }).eq('id', vmId);
            vm.ip_address = ip;
          }
        }
      } catch {
        // Orgo fetch failed — will retry on next poll
      }
    }

    // If VM is provisioning and has an IP, try to trigger install and check health
    if ((vm.status === 'provisioning' || vm.status === 'installing') && vm.ip_address) {
      // First check if gateway is already healthy (install already completed)
      const bareIp = extractVmIp(vm.ip_address);
      let gatewayUp = false;
      try {
        const healthResponse = await fetch(
          `http://${bareIp}:${vm.port}/health`,
          { signal: AbortSignal.timeout(5000) }
        );
        gatewayUp = healthResponse.ok;
      } catch {
        // Gateway not up yet
      }

      if (gatewayUp) {
        // Install complete — promote to ready
        await supabase
          .from('vms')
          .update({
            status: 'ready',
            ready_at: new Date().toISOString(),
            last_health_check: new Date().toISOString(),
          })
          .eq('id', vmId);
        vm.status = 'ready';
        vm.ready_at = new Date().toISOString();
        healthStatus = 'healthy';
      } else if (vm.status === 'provisioning' && vm.orgo_vm_id) {
        // VM is booted (has IP) but gateway not running — trigger install script
        // Mark as 'installing' first so we only trigger once
        await supabase
          .from('vms')
          .update({ status: 'installing' })
          .eq('id', vmId);
        vm.status = 'installing';

        // Build install command from stored config
        const configB64 = vm.config_json
          ? Buffer.from(JSON.stringify(vm.config_json)).toString('base64')
          : '';
        const installCmd = `curl -sSL https://mouse.is/install.sh | bash -s -- ${configB64}`;

        // Fire-and-forget: run install on the VM via Orgo exec API
        runInstallOnVM(vm.orgo_vm_id, installCmd).catch((err) => {
          console.error(`[Status] Failed to execute install on VM ${vm.orgo_vm_id}:`, err);
        });

        console.log(`[Status] Triggered install on VM ${vm.orgo_vm_id} (${vm.ip_address})`);
      }
      // If status is 'installing', just keep polling — install is running
    }

    // If VM is ready, ping the health endpoint
    if (vm.status === 'ready' && vm.ip_address && healthStatus === null) {
      try {
        const bareIp = extractVmIp(vm.ip_address);
        const healthResponse = await fetch(
          `http://${bareIp}:${vm.port}/health`,
          { signal: AbortSignal.timeout(5000) }
        );

        healthStatus = healthResponse.ok ? 'healthy' : 'unhealthy';

        // Update last health check
        await supabase
          .from('vms')
          .update({ last_health_check: new Date().toISOString() })
          .eq('id', vmId);
      } catch {
        healthStatus = 'unreachable';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        vm_id: vm.id,
        status: vm.status,
        ip_address: vm.ip_address,
        port: vm.port,
        health: healthStatus,
        provision_started_at: vm.provision_started_at,
        ready_at: vm.ready_at,
        last_health_check: vm.last_health_check,
        error_message: vm.error_message,
      },
    });
  } catch (err) {
    console.error('VM status error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
