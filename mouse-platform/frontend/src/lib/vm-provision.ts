/**
 * VM Provisioning Logic — install.sh Flow
 *
 * Creates a VM on Orgo, writes customer-specific files, and executes
 * install.sh which handles OpenClaw installation, v2026.3+ config,
 * gateway startup, and signals completion via .provision-complete.
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

const GATEWAY_PORT = 18789;

/**
 * Build SOUL.md — the AI employee's personality and capabilities.
 */
function buildSoulMd(params: {
  business_name: string;
  owner_name: string;
  location: string;
  pro_slug: string;
  plan_slug: string;
  onboarding_answers: Record<string, unknown>;
}): string {
  const a = params.onboarding_answers;

  return `# SOUL.md — KingMouse for ${params.business_name}

## Who You Are
You are KingMouse, an autonomous AI operations manager for ${params.business_name}.
Owner: ${params.owner_name} | Location: ${params.location} | Industry: ${params.pro_slug}

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
You handle ${params.business_name}'s operations so ${params.owner_name} doesn't have to.

Business description: ${(a.business_description as string) || 'Not provided'}
Pain points: ${(a.biggest_pain as string) || 'Not provided'}
Tools they use: ${(a.tools_used as string) || 'Not provided'}
Team size: ${(a.team_size as string) || 'Not provided'}

## How You Work
1. When ${params.owner_name} asks you to do something, DO IT. Don't explain how — just do it.
2. Show your work: when browsing, searching, or executing, tell the owner what you're doing.
3. For recurring tasks, create a cron job and confirm: "Done. I'll check this every [schedule]."
4. If something goes wrong, fix it. Don't just report errors — resolve them.
5. Protect ${params.owner_name}'s interests — never share credentials, never make purchases without approval.

## Decision Framework
**Handle autonomously:** Research, data gathering, report generation, scheduling, file management, email drafts
**Ask first:** Sending emails to customers, making purchases, deleting data, changing passwords, anything involving money

## Communication Style
- Direct and efficient — no fluff
- Use status indicators: [DONE], [WORKING], [BLOCKED], [QUESTION]
- No messages between 10pm-7am unless emergency
`;
}

/**
 * Build USER.md — owner and business context.
 */
function buildUserMd(params: {
  customer_id: string;
  business_name: string;
  owner_name: string;
  email: string;
  location: string;
  pro_slug: string;
  plan_slug: string;
}): string {
  return `# USER.md
- Business: ${params.business_name}
- Owner: ${params.owner_name}
- Location: ${params.location}
- Email: ${params.email}
- Industry: ${params.pro_slug}
- Plan: ${params.plan_slug}
- Customer ID: ${params.customer_id}
`;
}

/**
 * Return the install.sh script content.
 * This is the canonical copy — also lives at public/install.sh.
 */
function getInstallScript(): string {
  return `#!/bin/bash
set -euo pipefail

MOUSE_PORT="\${MOUSE_PORT:-${GATEWAY_PORT}}"
INSTALL_DIR="/opt/king-mouse"
CONFIG_DIR="\$INSTALL_DIR/config"
WORKSPACE_DIR="\$INSTALL_DIR/workspace"
LOG_FILE="\$INSTALL_DIR/install.log"

exec > >(tee -a "\$LOG_FILE") 2>&1

echo "=== KingMouse Install \\$(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "Port: \$MOUSE_PORT"

# Phase 1: Install OpenClaw
echo "--- Phase 1: Installing OpenClaw ---"
npm install -g openclaw 2>/dev/null || true
echo "y" | MOUSE_SILENT=1 MOUSE_PRESET=king-mouse MOUSE_PORT="\$MOUSE_PORT" \\
  DISPLAY=:99 npx openclaw onboard --install-daemon 2>/dev/null || true

if ! command -v openclaw &>/dev/null; then
  echo "FATAL: openclaw not available"
  exit 1
fi

# Phase 2: Directories
mkdir -p "\$CONFIG_DIR" "\$WORKSPACE_DIR"

# Phase 3: Write v2026.3+ config
MOONSHOT_KEY=""
[ -f "\$INSTALL_DIR/.moonshot-key" ] && MOONSHOT_KEY=\\$(tr -d '[:space:]' < "\$INSTALL_DIR/.moonshot-key")

CONFIG_PATH="/root/.openclaw/openclaw.json"
rm -f "\$CONFIG_PATH"
mkdir -p "\\$(dirname "\$CONFIG_PATH")"

# Persist API key as environment variable (OpenClaw reads MOONSHOT_API_KEY from env)
echo "export MOONSHOT_API_KEY=\$MOONSHOT_KEY" >> /etc/environment
echo "export MOONSHOT_API_KEY=\$MOONSHOT_KEY" >> /root/.bashrc

cat > "\$CONFIG_PATH" << CONFIGEOF
{
  "gateway": {
    "mode": "local",
    "port": \$MOUSE_PORT,
    "bind": "lan",
    "controlUi": { "allowedOrigins": ["*"] }
  },
  "agents": {
    "defaults": {
      "model": "moonshot/kimi-k2.5"
    }
  },
  "tools": { "exec": { "host": "gateway", "security": "full", "ask": "off" } },
  "browser": { "enabled": true }
}
CONFIGEOF

openclaw doctor --fix 2>/dev/null || true

# Phase 4: Start Gateway
cd "\$WORKSPACE_DIR"
cp -f "\$CONFIG_DIR/soul.md" "\$WORKSPACE_DIR/SOUL.md" 2>/dev/null || true
cp -f "\$CONFIG_DIR/user.md" "\$WORKSPACE_DIR/USER.md" 2>/dev/null || true
source /etc/environment 2>/dev/null
DISPLAY=:99 nohup openclaw gateway run > "\$INSTALL_DIR/gateway.log" 2>&1 &
GATEWAY_PID=\$!

# Phase 5: Health Check
HEALTHY=false
for i in \\$(seq 1 30); do
  sleep 2
  if curl -sf "http://127.0.0.1:\$MOUSE_PORT/health" >/dev/null 2>&1; then
    HEALTHY=true
    break
  fi
done

if [ "\$HEALTHY" = false ]; then
  if kill -0 "\$GATEWAY_PID" 2>/dev/null; then
    echo "Process alive, health pending"
  else
    echo "FATAL: Gateway died"
    tail -50 "\$INSTALL_DIR/gateway.log" 2>/dev/null || true
    exit 1
  fi
fi

# Phase 6: Done
echo "SUCCESS" > "\$INSTALL_DIR/.provision-complete"
echo "=== Install complete \\$(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
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

  const kimiKey = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '';
  if (!kimiKey) {
    await updateVmStatus(customer_id, 'error');
    return { success: false, error: 'KIMI_API_KEY / MOONSHOT_API_KEY not configured' };
  }

  // VM name from email (sanitized)
  const vmName = `km-${email.replace(/@/g, '-').replace(/\./g, '-')}`;

  // --- Step 1: Create VM on Orgo (retry up to 3x) ---
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
    return { success: false, error: `VM creation failed after 3 attempts: ${lastError}` };
  }

  // Update customer with VM ID
  await supabaseQuery('customers', 'PATCH', {
    vm_computer_id: computerId,
    vm_status: 'provisioning',
  }, `id=eq.${customer_id}`);

  // --- Step 2: Install Node.js ---
  try {
    const nodeInstall = await bashExec(computerId,
      'curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs',
      120
    );
    if (!nodeInstall.success) {
      console.error('[VM_PROVISION] Node.js primary install failed, trying fallback:', nodeInstall.error);
      await bashExec(computerId, 'apt-get update && apt-get install -y nodejs npm', 120);
    }
  } catch (err) {
    console.error('[VM_PROVISION] Node.js install error:', err);
    await updateVmStatus(customer_id, 'error');
    return { success: false, error: 'Node.js installation failed', computer_id: computerId };
  }

  // --- Step 3: Write customer files ---
  try {
    await bashExec(computerId, 'mkdir -p /opt/king-mouse/config /opt/king-mouse/workspace');

    // Write API key
    await bashExec(computerId,
      `cat > /opt/king-mouse/.moonshot-key << 'KEYEOF'\n${kimiKey}\nKEYEOF`
    );

    // Write SOUL.md
    const soulMd = buildSoulMd({
      business_name,
      owner_name,
      location: location || 'Not specified',
      pro_slug,
      plan_slug: plan_slug || 'pro',
      onboarding_answers,
    });
    await bashExec(computerId,
      `cat > /opt/king-mouse/config/soul.md << 'SOULEOF'\n${soulMd}\nSOULEOF`
    );

    // Write USER.md
    const userMd = buildUserMd({
      customer_id,
      business_name,
      owner_name,
      email,
      location: location || 'Not specified',
      pro_slug,
      plan_slug: plan_slug || 'pro',
    });
    await bashExec(computerId,
      `cat > /opt/king-mouse/config/user.md << 'USEREOF'\n${userMd}\nUSEREOF`
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to write customer files';
    console.error('[VM_PROVISION]', errorMsg);
    await updateVmStatus(customer_id, 'error');
    return { success: false, error: errorMsg, computer_id: computerId };
  }

  // --- Step 4: Upload and execute install.sh ---
  try {
    const installScript = getInstallScript();
    await bashExec(computerId,
      `cat > /opt/king-mouse/install.sh << 'INSTALLEOF'\n${installScript}\nINSTALLEOF`
    );
    await bashExec(computerId, 'chmod +x /opt/king-mouse/install.sh');

    // Run install.sh in background
    await bashExec(computerId,
      `nohup MOUSE_PORT=${GATEWAY_PORT} /opt/king-mouse/install.sh > /opt/king-mouse/install-exec.log 2>&1 &`,
      30
    );

    console.log(`[VM_PROVISION] install.sh launched for customer ${customer_id} on VM ${computerId}`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to launch install.sh';
    console.error('[VM_PROVISION]', errorMsg);
    // Don't mark as error — the VM exists and we can retry
    console.error('[VM_PROVISION] VM created but install.sh launch failed. Manual retry may be needed.');
  }

  // vm_status stays 'provisioning' — the status endpoint checks for
  // /opt/king-mouse/.provision-complete and flips to 'ready' when done
  return { success: true, computer_id: computerId };
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
