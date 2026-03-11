/**
 * VM Provisioning Logic
 * Creates and configures a KingMouse VM on Orgo for a customer
 */

import { createComputer, bashExec, getComputer } from '@/lib/orgo';
import { supabaseQuery } from '@/lib/supabase-server';

interface ProvisionParams {
  customer_id: string;
  pro_slug: string;
  business_name: string;
  owner_name: string;
  email: string;
  location?: string;
  plan_slug?: string;
  onboarding_answers: Record<string, unknown>;
}

interface ProvisionResult {
  success: boolean;
  computer_id?: string;
  error?: string;
}

export async function provisionVM(params: ProvisionParams): Promise<ProvisionResult> {
  const {
    customer_id,
    pro_slug,
    business_name,
    owner_name,
    email,
    location,
    plan_slug,
    onboarding_answers,
  } = params;

  const workspaceId = process.env.ORGO_WORKSPACE_ID;
  if (!workspaceId) {
    return { success: false, error: 'ORGO_WORKSPACE_ID not configured' };
  }

  // Look up Pro profile
  const profiles = await supabaseQuery(
    'pro_profiles',
    'GET',
    undefined,
    `slug=eq.${pro_slug}&select=*`
  );

  if (!profiles || profiles.length === 0) {
    return { success: false, error: `Pro profile '${pro_slug}' not found` };
  }

  const profile = profiles[0];

  // VM name from email (sanitized)
  const vmName = email.replace(/@/g, '-').replace(/\./g, '-');

  // Retry logic: up to 3 attempts
  let computerId: string | null = null;
  let lastError = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Create Orgo VM
      const vm = await createComputer(workspaceId, vmName, 8, 4);

      if (!vm.success || !vm.data) {
        lastError = vm.error || 'VM creation failed';
        continue;
      }

      computerId = vm.data.id;

      // Wait for boot (poll every 5s, max 60s)
      let booted = false;
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const status = await getComputer(computerId);
        if (status.data?.status === 'running') {
          booted = true;
          break;
        }
      }

      if (!booted) {
        lastError = 'VM failed to boot within 60s';
        // Clean up failed VM on timeout — retry with fresh one
        continue;
      }

      break; // Success — exit retry loop
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  if (!computerId) {
    // Update customer with error status
    await supabaseQuery('customers', 'PATCH',
      { vm_status: 'error' },
      `id=eq.${customer_id}`
    );
    return { success: false, error: `VM provisioning failed after 3 attempts: ${lastError}` };
  }

  // Update customer with VM ID
  await supabaseQuery('customers', 'PATCH', {
    vm_computer_id: computerId,
    vm_status: 'provisioning',
  }, `id=eq.${customer_id}`);

  // Generate soul.md from Pro prompt_template
  const soulContent = interpolateTemplate(profile.prompt_template, {
    business_name: business_name,
    owner_name: owner_name,
    location: location || 'Not specified',
  });

  const soulMd = `# SOUL.md\n${soulContent}\n\n## Onboarding Context\n${JSON.stringify(onboarding_answers, null, 2)}`;

  // Generate user.md
  const userMd = `# USER.md
- Business: ${business_name}
- Owner: ${owner_name}
- Location: ${location || 'Not specified'}
- Email: ${email}
- Pro: ${profile.name}
- Plan: ${plan_slug || 'pro'}`;

  // Generate tools config
  const toolsConfig = JSON.stringify({
    pro_slug,
    tools: profile.tools,
    workflows: profile.workflows,
    dashboard_modules: profile.dashboard_modules,
  }, null, 2);

  // Upload files to VM
  try {
    await bashExec(computerId, `mkdir -p /opt/kingmouse/config`);

    await bashExec(computerId,
      `cat > /opt/kingmouse/config/soul.md << 'SOULEOF'\n${soulMd}\nSOULEOF`
    );

    await bashExec(computerId,
      `cat > /opt/kingmouse/config/user.md << 'USEREOF'\n${userMd}\nUSEREOF`
    );

    await bashExec(computerId,
      `cat > /opt/kingmouse/config/tools.json << 'TOOLSEOF'\n${toolsConfig}\nTOOLSEOF`
    );

    // Install OpenClaw and configure with Kimi K2.5 model
    await bashExec(computerId,
      `cat > /opt/kingmouse/config/openclaw.env << 'ENVEOF'
OPENCLAW_MODEL=kimi-k2.5
OPENCLAW_SOUL_PATH=/opt/kingmouse/config/soul.md
OPENCLAW_USER_PATH=/opt/kingmouse/config/user.md
SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}
SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
CUSTOMER_ID=${customer_id}
ENVEOF`
    );

    // Update status to provisioning (scripts running)
    await supabaseQuery('customers', 'PATCH', {
      vm_status: 'provisioning',
      vm_provisioned_at: new Date().toISOString(),
    }, `id=eq.${customer_id}`);

    return { success: true, computer_id: computerId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Config upload failed';
    console.error('[VM_PROVISION]', errorMsg);

    await supabaseQuery('customers', 'PATCH',
      { vm_status: 'error' },
      `id=eq.${customer_id}`
    );

    return { success: false, error: errorMsg, computer_id: computerId };
  }
}

function interpolateTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}
