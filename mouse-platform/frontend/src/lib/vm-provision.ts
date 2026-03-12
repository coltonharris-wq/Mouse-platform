/**
 * VM Provisioning Logic
 * Creates and configures a KingMouse VM on Orgo for a customer.
 * Installs OpenClaw with Kimi K2.5 and writes Pro-specific SOUL.md.
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

const PRO_CAPABILITIES: Record<string, string> = {
  'appliance-repair': `- Track inventory levels for all appliances and parts
- Alert when stock drops below thresholds
- Place reorders with suppliers via email or their websites
- Schedule repair appointments
- Send customer reminders 24h before appointments
- Follow up with customers after service
- Research best prices from multiple suppliers
- Generate monthly inventory and revenue reports`,

  roofer: `- Capture and qualify incoming leads
- Send follow-up messages within 5 minutes of new leads
- Generate estimates based on job descriptions
- Schedule crews for jobs
- Track job progress and completion
- Monitor weather forecasts and reschedule when needed
- Follow up with past customers for reviews
- Research material prices and availability`,

  dentist: `- Schedule and manage patient appointments
- Send recall reminders (cleanings, checkups) based on intervals
- Verify insurance coverage before appointments
- Handle new patient intake paperwork
- Send appointment reminders 24h before
- Follow up after procedures
- Track and manage cancellation/no-show patterns
- Generate monthly patient volume reports`,
};

function buildSoulMd(params: {
  businessName: string;
  ownerName: string;
  location: string;
  proSlug: string;
  proName: string;
  onboardingAnswers: Record<string, unknown>;
}): string {
  const capabilities = PRO_CAPABILITIES[params.proSlug] || '- Handle all business operations as directed by the owner';

  return `# SOUL.md — KingMouse for ${params.businessName}

## Who You Are
You are KingMouse, an autonomous AI operations manager for ${params.businessName}.
Owner: ${params.ownerName} | Location: ${params.location} | Industry: ${params.proName}

## Your Capabilities
You have a full computer at your disposal. You can:
- **Browse the web** — Research prices, check competitor sites, find suppliers, look up information
- **Send emails** — Compose and send emails to suppliers, customers, or anyone the owner needs
- **Manage files** — Create documents, spreadsheets, invoices, reports
- **Execute code** — Write scripts, automate tasks, process data
- **Search the internet** — Find anything the owner needs
- **Schedule recurring tasks** — Create cron jobs for daily/weekly/monthly tasks
- **Make API calls** — Connect to any service with a public API

## Your Role
You handle ${params.businessName}'s operations so ${params.ownerName} doesn't have to. Specifically:

${capabilities}

## How You Work
1. When ${params.ownerName} asks you to do something, DO IT. Don't explain how you'd do it — just do it.
2. Show your work: when browsing, searching, or executing, tell the owner what you're doing.
3. For recurring tasks, create a cron job and confirm: "Done. I'll check this every [schedule]."
4. Only ask for approval on: spending money, contacting customers on behalf of the business, decisions with financial impact.
5. Everything else — handle it silently and report results.

## Decision Framework
- If it costs < $50 and saves time → do it, tell the owner after
- If it involves customer communication → draft it, ask for approval
- If it's routine admin → just handle it
- If something feels wrong or risky → ask first

## Onboarding Context
${JSON.stringify(params.onboardingAnswers, null, 2)}

## Communication Style
- Be direct and efficient
- Use bullet points for lists
- Show data in tables when appropriate
- When you take action, show what you did with status indicators:
  🔍 Searching...
  📧 Sending email...
  🌐 Browsing web...
  ✅ Done
  ⚠️ Needs attention

## Off-Hours
- Don't message the owner between 10pm-7am unless it's an emergency
- Emergencies: revenue loss, security issues, urgent customer problems
- Everything else can wait until morning
`;
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
    await updateVmStatus(customer_id, 'error');
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
    await updateVmStatus(customer_id, 'error');
    return { success: false, error: `Pro profile '${pro_slug}' not found` };
  }

  const profile = profiles[0];

  // VM name from email (sanitized)
  const vmName = `km-${email.replace(/@/g, '-').replace(/\./g, '-')}`;

  // Retry logic: up to 3 attempts
  let computerId: string | null = null;
  let lastError = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
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
        continue;
      }

      break;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  if (!computerId) {
    await updateVmStatus(customer_id, 'error');
    return { success: false, error: `VM provisioning failed after 3 attempts: ${lastError}` };
  }

  // Update customer with VM ID
  await supabaseQuery('customers', 'PATCH', {
    vm_computer_id: computerId,
    vm_status: 'provisioning',
  }, `id=eq.${customer_id}`);

  // Build SOUL.md — try pro_templates first, fall back to generic
  let soulMd: string;
  try {
    const templates = await supabaseQuery(
      'pro_templates',
      'GET',
      undefined,
      `niche=eq.${encodeURIComponent(pro_slug)}&active=eq.true&select=soul_template,niche,display_name&limit=1`
    );

    if (templates && templates.length > 0 && templates[0].soul_template) {
      // Use template SOUL.md with variable substitution
      soulMd = templates[0].soul_template
        .replace(/\{\{business_name\}\}/g, business_name)
        .replace(/\{\{owner_name\}\}/g, owner_name)
        .replace(/\{\{location\}\}/g, location || 'Not specified')
        .replace(/\{\{business_hours\}\}/g, (onboarding_answers.business_hours as string) || 'Not specified')
        .replace(/\{\{phone\}\}/g, (onboarding_answers.phone as string) || email);
    } else {
      soulMd = buildSoulMd({
        businessName: business_name,
        ownerName: owner_name,
        location: location || 'Not specified',
        proSlug: pro_slug,
        proName: profile.name,
        onboardingAnswers: onboarding_answers,
      });
    }
  } catch {
    soulMd = buildSoulMd({
      businessName: business_name,
      ownerName: owner_name,
      location: location || 'Not specified',
      proSlug: pro_slug,
      proName: profile.name,
      onboardingAnswers: onboarding_answers,
    });
  }

  // Build USER.md
  const userMd = `# USER.md
- Business: ${business_name}
- Owner: ${owner_name}
- Location: ${location || 'Not specified'}
- Email: ${email}
- Pro: ${profile.name}
- Plan: ${plan_slug || 'pro'}`;

  // Upload files + install OpenClaw
  try {
    // Create directories
    await bashExec(computerId, 'mkdir -p /opt/kingmouse/config /opt/kingmouse/workspace');

    // Write config files
    await bashExec(computerId,
      `cat > /opt/kingmouse/config/soul.md << 'SOULEOF'\n${soulMd}\nSOULEOF`
    );

    await bashExec(computerId,
      `cat > /opt/kingmouse/config/user.md << 'USEREOF'\n${userMd}\nUSEREOF`
    );

    // Write environment config
    const kimiKey = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '';
    const kimiBaseUrl = 'https://api.moonshot.ai/v1';
    await bashExec(computerId,
      `cat > /opt/kingmouse/workspace/.env << 'ENVEOF'
OPENCLAW_MODEL=kimi-k2.5
KIMI_API_KEY=${kimiKey}
MOONSHOT_API_KEY=${kimiKey}
LLM_BASE_URL=${kimiBaseUrl}
OPENCLAW_SOUL_PATH=/opt/kingmouse/config/soul.md
OPENCLAW_USER_PATH=/opt/kingmouse/config/user.md
SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}
SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}
CUSTOMER_ID=${customer_id}
ENVEOF`
    );

    // Copy soul + user to workspace
    await bashExec(computerId,
      'cp /opt/kingmouse/config/soul.md /opt/kingmouse/workspace/SOUL.md && cp /opt/kingmouse/config/user.md /opt/kingmouse/workspace/USER.md'
    );

    // Install OpenClaw — tarball (fast) or npm (slow)
    const tarballUrl = process.env.MOUSE_OS_TARBALL_URL;

    if (tarballUrl) {
      // Fast path: pre-built tarball (~60s provision)
      const tarInstall = await bashExec(computerId,
        `cd /opt && curl -fsSL "${tarballUrl}" | tar xz && ln -sf /opt/openclaw/bin/openclaw /usr/local/bin/openclaw`,
        180
      );
      if (!tarInstall.success) {
        console.error('[VM_PROVISION] Tarball install failed, falling back to npm:', tarInstall.error);
        // Fall through to npm install
        await bashExec(computerId,
          'curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs',
          120
        );
        await bashExec(computerId, 'npm install -g openclaw', 120);
      }
    } else {
      // Slow path: install from npm
      const nodeInstall = await bashExec(computerId,
        'curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs',
        120
      );
      if (!nodeInstall.success) {
        console.error('[VM_PROVISION] Node.js install failed:', nodeInstall.error);
      }

      const openclawInstall = await bashExec(computerId,
        'npm install -g openclaw',
        120
      );
      if (!openclawInstall.success) {
        console.error('[VM_PROVISION] OpenClaw install failed:', openclawInstall.error);
      }
    }

    // Start OpenClaw gateway
    await bashExec(computerId,
      'cd /opt/kingmouse/workspace && nohup openclaw gateway start > /opt/kingmouse/gateway.log 2>&1 &',
      30
    );

    // Wait 5s then health check
    await new Promise(r => setTimeout(r, 5000));

    const healthCheck = await bashExec(computerId,
      'openclaw gateway status 2>/dev/null || echo "NOT_RUNNING"',
      15
    );

    if (healthCheck.data?.output?.includes('NOT_RUNNING')) {
      console.error('[VM_PROVISION] Gateway failed to start, retrying...');
      const log = await bashExec(computerId, 'tail -20 /opt/kingmouse/gateway.log', 10);
      console.error('[VM_PROVISION] Gateway log:', log.data?.output);

      // Retry once
      await bashExec(computerId,
        'cd /opt/kingmouse/workspace && nohup openclaw gateway start > /opt/kingmouse/gateway.log 2>&1 &',
        30
      );
      await new Promise(r => setTimeout(r, 5000));
    }

    // Update status to running
    await supabaseQuery('customers', 'PATCH', {
      vm_status: 'running',
      vm_provisioned_at: new Date().toISOString(),
    }, `id=eq.${customer_id}`);

    return { success: true, computer_id: computerId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Config upload failed';
    console.error('[VM_PROVISION]', errorMsg);

    await updateVmStatus(customer_id, 'error');

    return { success: false, error: errorMsg, computer_id: computerId };
  }
}

async function updateVmStatus(customerId: string, status: string) {
  try {
    await supabaseQuery('customers', 'PATCH',
      { vm_status: status },
      `id=eq.${customerId}`
    );
  } catch {
    // Non-critical
  }
}
