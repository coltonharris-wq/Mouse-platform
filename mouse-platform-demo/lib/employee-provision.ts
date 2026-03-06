/**
 * Employee VM Provisioning — Spawns role-specific AI employees for King Mouse
 * 
 * King Mouse calls this (via API) to provision new employee VMs.
 * Each employee is a full OpenClaw instance with a role-specific SOUL.md.
 * 
 * Flow: Create VM → Download runtime tarball → Configure with role template → Launch
 * 
 * Available roles: customer-support, sales, admin, operations, marketing
 */

// Valid employee roles
export const EMPLOYEE_ROLES = [
  'customer-support',
  'sales',
  'admin',
  'operations',
  'marketing',
] as const;

export type EmployeeRole = typeof EMPLOYEE_ROLES[number];

export const ROLE_DISPLAY_NAMES: Record<EmployeeRole, string> = {
  'customer-support': 'Customer Support Agent',
  'sales': 'Sales Agent',
  'admin': 'Admin & Scheduling Agent',
  'operations': 'Operations Agent',
  'marketing': 'Marketing & Content Agent',
};

export const ROLE_EMOJIS: Record<EmployeeRole, string> = {
  'customer-support': '🎧',
  'sales': '💰',
  'admin': '📋',
  'operations': '⚙️',
  'marketing': '📣',
};

export interface EmployeeProvisionConfig {
  customerId: string;
  employeeRole: EmployeeRole;
  employeeName: string;
  businessName: string;
  businessType?: string;
  ownerName?: string;
  parentVmId: string;      // King Mouse's VM ID
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  moonshotApiKey: string;
  orgoApiKey: string;
  orgoWorkspaceId: string;
}

/**
 * Runtime tarball URL — same as King Mouse, employees use the same OpenClaw runtime.
 */
const RUNTIME_TARBALL_URL = 'https://github.com/coltonharris-wq/Mouse-platform/releases/download/v12-runtime/mouse-runtime.tar.gz';

/**
 * GitHub raw URL base for employee templates.
 */
const TEMPLATE_BASE = 'https://raw.githubusercontent.com/coltonharris-wq/Mouse-platform/main/mouse-platform-demo/templates/employees';

/**
 * Generate OpenClaw config for an employee VM.
 * Simpler than King Mouse — no Orgo skill (employees don't spawn sub-VMs),
 * shorter heartbeat, lower concurrency.
 */
function generateEmployeeConfig(config: EmployeeProvisionConfig): object {
  return {
    models: {
      mode: 'merge',
      providers: {
        moonshot: {
          baseUrl: 'https://api.moonshot.ai/v1',
          apiKey: config.moonshotApiKey,
          api: 'openai-completions',
          models: [
            {
              id: 'kimi-k2.5',
              name: 'Kimi K2.5',
              reasoning: false,
              input: ['text'],
              cost: {
                input: 0.15,
                output: 0.6,
                cacheRead: 0,
                cacheWrite: 0,
              },
              contextWindow: 256000,
              maxTokens: 8192,
            },
          ],
        },
      },
    },
    agents: {
      defaults: {
        model: {
          primary: 'moonshot/kimi-k2.5',
          fallbacks: [],
        },
        models: {
          'moonshot/kimi-k2.5': {},
        },
        contextPruning: {
          mode: 'cache-ttl',
          ttl: '20m',
        },
        compaction: {
          mode: 'safeguard',
          memoryFlush: {
            enabled: true,
            softThresholdTokens: 80000,
            prompt: 'APPEND to memory/YYYY-MM-DD.md: tasks completed, customer interactions, issues encountered, learnings. If nothing important: NO_REPLY',
            systemPrompt: 'Session nearing compaction. Extract what matters for your role.',
          },
        },
        heartbeat: {
          every: '15m',
        },
        maxConcurrent: 1,
        subagents: {
          maxChildrenPerAgent: 0, // Employees don't spawn sub-agents
        },
      },
    },
    gateway: {
      port: 18789,
      mode: 'local',
      bind: 'loopback',
      auth: {
        mode: 'open',
      },
    },
    commands: {
      native: 'auto',
      restart: true,
    },
  };
}

/**
 * Generate the self-contained bash provision script for an employee VM.
 * Similar to King Mouse but:
 * - Uses role-specific SOUL.md (not King Mouse templates)
 * - No Orgo skill (employees don't spawn VMs)
 * - Simpler config (lower concurrency, no sub-agents)
 * - Reports ready status back to Supabase with role info
 */
export function generateEmployeeProvisionScript(config: EmployeeProvisionConfig): string {
  const roleDisplayName = ROLE_DISPLAY_NAMES[config.employeeRole] || config.employeeRole;
  const roleEmoji = ROLE_EMOJIS[config.employeeRole] || '🐭';
  
  return `#!/bin/bash
set -euo pipefail
LOG="/var/log/mouse-os-provision.log"
log() { echo "[EMPLOYEE] $(date '+%H:%M:%S') $1" | tee -a "$LOG"; }

log "=== EMPLOYEE PROVISIONING START ==="
log "Role: ${config.employeeRole} (${roleDisplayName})"
log "Business: ${config.businessName}"

# 1. Install Node 22
log "Step 1/6: Installing Node 22..."
mkdir -p /var/lib/apt/lists/partial
apt-get update -qq > /dev/null 2>&1
apt-get install -y -qq curl > /dev/null 2>&1
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
apt-get install -y -qq nodejs > /dev/null 2>&1
log "Node OK: $(node -v)"

# 2. Download runtime
MOUSE_HOME="$HOME/mouse-platform"
log "Step 2/6: Downloading runtime (~496MB)..."
rm -rf "$MOUSE_HOME"
cd "$HOME"
curl -fsSL -o /tmp/mouse-runtime.tar.gz "${RUNTIME_TARBALL_URL}"
log "Download complete"

# 3. Extract runtime
log "Step 3/6: Extracting runtime..."
tar -xzf /tmp/mouse-runtime.tar.gz
mv mouse-runtime mouse-platform
rm -f /tmp/mouse-runtime.tar.gz
log "Extracted: $(du -sh $MOUSE_HOME | cut -f1)"

# 4. Configure workspace + role templates
log "Step 4/6: Configuring workspace with ${config.employeeRole} templates..."
cd "$MOUSE_HOME"
mkdir -p workspace/memory
OPENCLAW_DIR="$HOME/.openclaw"
mkdir -p "$OPENCLAW_DIR"

cat > .env << 'ENVEOF'
CUSTOMER_ID=${config.customerId}
EMPLOYEE_ROLE=${config.employeeRole}
EMPLOYEE_NAME=${config.employeeName}
PARENT_VM_ID=${config.parentVmId}
BUSINESS_NAME=${config.businessName}
ENVEOF

# Download role-specific SOUL.md
curl -fsSL "${TEMPLATE_BASE}/${config.employeeRole}/SOUL.md" -o workspace/SOUL.md 2>/dev/null || log "WARN: Role SOUL.md download failed"

# Download shared employee AGENTS.md
curl -fsSL "${TEMPLATE_BASE}/AGENTS.md" -o workspace/AGENTS.md 2>/dev/null || log "WARN: AGENTS.md download failed"

# Replace template variables in SOUL.md
sed -i "s/{{BUSINESS_NAME}}/${config.businessName.replace(/[/\\&]/g, '\\$&')}/g" workspace/SOUL.md 2>/dev/null || true
sed -i "s/{{OWNER_NAME}}/${(config.ownerName || 'the owner').replace(/[/\\&]/g, '\\$&')}/g" workspace/SOUL.md 2>/dev/null || true
sed -i "s/{{BUSINESS_TYPE}}/${(config.businessType || 'business').replace(/[/\\&]/g, '\\$&')}/g" workspace/SOUL.md 2>/dev/null || true

# Create USER.md with business context
cat > workspace/USER.md << 'USEREOF'
# USER.md — Business Profile

- **Business Name:** ${config.businessName}
- **Owner:** ${config.ownerName || 'Unknown'}
- **Type:** ${config.businessType || 'Unknown'}
- **My Role:** ${roleDisplayName}
- **Reports To:** King Mouse (AI Operations Manager)
- **Parent VM:** ${config.parentVmId}

## Notes

_Build this out as you learn about the business. King Mouse may provide additional context._
USEREOF

# Create empty MEMORY.md
cat > workspace/MEMORY.md << 'MEMEOF'
# MEMORY.md — Role Knowledge

_Build this over time with business rules, procedures, and learnings for your role._
MEMEOF

# Download chat bridge (for communication with King Mouse/dashboard)
BRIDGE_URL="https://raw.githubusercontent.com/coltonharris-wq/Mouse-platform/main/mouse-platform-demo/scripts/chat-bridge.mjs"
curl -fsSL "$BRIDGE_URL" -o "$HOME/chat-bridge.mjs" 2>/dev/null || log "WARN: chat-bridge.mjs download failed"

log "Workspace configured with ${config.employeeRole} role"

# 5. Write gateway config
log "Step 5/6: Writing gateway config..."
cat > "$OPENCLAW_DIR/openclaw.json" << 'CONFIGEOF'
${JSON.stringify(generateEmployeeConfig(config), null, 2)}
CONFIGEOF

# Set workspace path in config
node -e "
const fs = require('fs');
const p = '$OPENCLAW_DIR/openclaw.json';
const c = JSON.parse(fs.readFileSync(p, 'utf8'));
c.agents = c.agents || {};
c.agents.defaults = c.agents.defaults || {};
c.agents.defaults.workspace = '$MOUSE_HOME/workspace';
fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('Config OK');
"
log "Config written"

# 6. Launch gateway
log "Step 6/6: Launching employee agent..."
cd "$MOUSE_HOME"
nohup node openclaw.mjs gateway --dev --bind loopback > /var/log/mouse-os-runtime.log 2>&1 &
echo $! > /var/run/mouse-os.pid
log "Launched (PID: $(cat /var/run/mouse-os.pid))"

# Notify Supabase
curl -s -X POST "${config.supabaseUrl}/rest/v1/notifications" \\
  -H "apikey: ${config.supabaseAnonKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"customer_id": "${config.customerId}", "type": "employee_ready", "agent_type": "${config.employeeRole}", "message": "${roleEmoji} ${config.employeeName} (${roleDisplayName}) is ready and reporting for duty!", "read": false}'

# Update employee_vms status
curl -s -X PATCH "${config.supabaseUrl}/rest/v1/employee_vms?computer_id=eq.COMPUTER_ID_PLACEHOLDER" \\
  -H "apikey: ${config.supabaseServiceKey}" \\
  -H "Authorization: Bearer ${config.supabaseServiceKey}" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=minimal" \\
  -d '{"status": "active", "agent_type": "${config.employeeRole}", "last_heartbeat": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

log "=== EMPLOYEE READY: ${config.employeeName} (${roleDisplayName}) ==="
`;
}

// ─── Kick Off Employee Provisioning ─────────────────────────

/**
 * Kick off employee provisioning on a VM.
 * Same pattern as King Mouse kickOffProvision — upload script, nohup, return fast.
 * Designed to complete within Vercel's 10s function timeout.
 */
export async function kickOffEmployeeProvision(
  computerId: string,
  config: EmployeeProvisionConfig
): Promise<{ started: boolean; error?: string; retryable?: boolean }> {
  // Import Orgo functions dynamically to avoid circular deps
  const { executeBash, executePython } = await import('./orgo');

  try {
    // Quick VM readiness check
    let vmReady = false;
    try {
      const test = await executeBash(computerId, 'echo VM_READY');
      if (test.output?.includes('VM_READY')) {
        vmReady = true;
      }
    } catch (_) {}

    if (!vmReady) {
      return { started: false, retryable: true, error: 'VM not responsive yet — retry in 10-15s' };
    }

    // Check if already provisioning
    try {
      const check = await executeBash(computerId,
        'test -f /var/log/mouse-os-provision.log && grep -c "PROVISIONING START\\|EMPLOYEE READY" /var/log/mouse-os-provision.log 2>/dev/null || echo 0'
      );
      if (check.output && parseInt(check.output.trim()) > 0) {
        return { started: true, error: 'Provision already in progress or complete' };
      }
    } catch (_) {}

    // Generate + upload the provision script
    let script = generateEmployeeProvisionScript(config);
    script = script.replace('COMPUTER_ID_PLACEHOLDER', computerId);

    const b64Script = Buffer.from(script).toString('base64');
    const uploadCode = `
import base64, os, pathlib
script = base64.b64decode("${b64Script}").decode()
home = str(pathlib.Path.home())
path = home + "/provision-employee.sh"
with open(path, "w") as f:
    f.write(script)
os.chmod(path, 0o755)
print("UPLOADED")
`;

    const uploadResult = await executePython(computerId, uploadCode, 15);
    if (!uploadResult.output?.includes('UPLOADED')) {
      return { started: false, error: `Upload failed: ${uploadResult.output}` };
    }

    // Run in background
    await executeBash(computerId,
      'nohup $HOME/provision-employee.sh > /var/log/mouse-os-provision.log 2>&1 &'
    );

    return { started: true };
  } catch (err: any) {
    return { started: false, retryable: true, error: err.message };
  }
}

/**
 * Validate an employee role string.
 */
export function isValidRole(role: string): role is EmployeeRole {
  return EMPLOYEE_ROLES.includes(role as EmployeeRole);
}

/**
 * Get role info for display.
 */
export function getRoleInfo(role: EmployeeRole) {
  return {
    role,
    displayName: ROLE_DISPLAY_NAMES[role],
    emoji: ROLE_EMOJIS[role],
  };
}

/**
 * List all available roles with display info.
 */
export function listRoles() {
  return EMPLOYEE_ROLES.map(role => getRoleInfo(role));
}
