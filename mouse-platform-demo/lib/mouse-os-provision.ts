/**
 * Mouse OS Provisioning — Installs branded OpenClaw fork on Orgo VMs
 * 
 * Strategy: Download pre-built runtime tarball from GitHub Releases (~496MB),
 * extract, configure workspace, and launch gateway. Total provision time: ~1 min.
 * 
 * The tarball contains production-only deps (1.3GB extracted) which fits on
 * Orgo's 3.9GB disk VMs (1.8GB OS + 1.3GB runtime = 3.1GB, ~0.8GB headroom).
 * 
 * Flow: Download tarball → Extract → Configure → Launch → Watchdog
 * 
 * Legacy flow (for VMs with 8GB+ disk): Install deps → Clone → Rebrand → Install → Build → Configure → Launch → Watchdog
 */

import { executeBash, executePython, getComputer } from './orgo';

export interface ProvisionConfig {
  customerId: string;
  employeeType: string;
  employeeName: string;
  businessName?: string;
  businessType?: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
}

type StepFn = (computerId: string, config: ProvisionConfig) => Promise<string>;

interface Step {
  name: string;
  fn: StepFn;
}

// ─── Provisioning Steps ─────────────────────────────────────

async function installDeps(computerId: string, _config: ProvisionConfig): Promise<string> {
  // Fix apt, install git + build tools + Node 22 + pnpm
  const cmds = [
    'sudo mkdir -p /var/lib/apt/lists/partial',
    'sudo apt-get update -qq',
    'sudo apt-get install -y -qq curl git build-essential',
    'curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -',
    'sudo apt-get install -y -qq nodejs',
    'sudo npm install -g pnpm',
    'echo DEPS_OK node=$(node -v) pnpm=$(pnpm -v)',
  ].join(' && ');

  const result = await executeBash(computerId, cmds);
  if (!result.output?.includes('DEPS_OK')) {
    throw new Error(`Deps install failed: ${result.output?.slice(-200)}`);
  }
  return result.output;
}

async function cloneRepo(computerId: string, _config: ProvisionConfig): Promise<string> {
  const result = await executeBash(computerId,
    'rm -rf /home/user/mouse-platform && git clone --depth 1 https://github.com/openclaw/openclaw.git /home/user/mouse-platform && echo CLONE_OK'
  );
  if (!result.output?.includes('CLONE_OK')) {
    throw new Error(`Clone failed: ${result.output?.slice(-200)}`);
  }
  return 'Cloned';
}

async function rebrand(computerId: string, _config: ProvisionConfig): Promise<string> {
  // Safe rebrand via Python exec → Node.js script
  // ONLY touches .md, .html, .css, .yaml, .yml — NEVER code files
  const rebrandScript = `
import subprocess
script = """
const fs = require("fs");
const path = require("path");
const ROOT = "/home/user/mouse-platform";
const SKIP = [".git", "node_modules", "pnpm-lock.yaml", "package-lock.json"];
const SAFE_EXT = [".md", ".html", ".css", ".yaml", ".yml"];

function walk(dir) {
  const r = [];
  try {
    for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
      if (SKIP.includes(e.name)) continue;
      const f = path.join(dir, e.name);
      if (e.isDirectory()) r.push(...walk(f)); else r.push(f);
    }
  } catch(e) {}
  return r;
}

let ch = 0;
for (const f of walk(ROOT)) {
  const ext = path.extname(f);
  if (SAFE_EXT.includes(ext)) {
    let c = fs.readFileSync(f, "utf8"), o = c;
    c = c.replace(/OpenClaw/g, "Mouse Platform");
    c = c.replace(/openclaw/g, "mouse-platform");
    c = c.replace(/OPENCLAW/g, "MOUSE_PLATFORM");
    if (c !== o) { fs.writeFileSync(f, c); ch++; }
  }
}
console.log("Rebranded " + ch + " files");
"""
with open("/home/user/rebrand.js", "w") as f:
    f.write(script)
r = subprocess.run(["node", "/home/user/rebrand.js"], capture_output=True, text=True, timeout=120)
print(r.stdout)
if r.stderr: print("ERR:", r.stderr[:300])
`;

  const result = await executePython(computerId, rebrandScript, 120);
  return result.output || 'Rebranded';
}

async function installPackages(computerId: string, _config: ProvisionConfig): Promise<string> {
  const result = await executeBash(computerId,
    'cd /home/user/mouse-platform && pnpm install --no-frozen-lockfile 2>&1 | tail -5 && echo INSTALL_OK'
  );
  if (!result.output?.includes('INSTALL_OK')) {
    throw new Error(`pnpm install failed: ${result.output?.slice(-300)}`);
  }
  return 'Installed';
}

async function buildProject(computerId: string, _config: ProvisionConfig): Promise<string> {
  const result = await executeBash(computerId,
    'cd /home/user/mouse-platform && pnpm build 2>&1 | tail -10 && echo BUILD_OK'
  );
  if (!result.output?.includes('BUILD_OK')) {
    throw new Error(`Build failed: ${result.output?.slice(-500)}`);
  }
  return 'Built';
}

async function configureWorkspace(computerId: string, config: ProvisionConfig): Promise<string> {
  // Create workspace with King Mouse SOUL.md and .env
  const soulMd = `# SOUL.md - King Mouse 🐭

You are **King Mouse**, the AI Operations Manager for ${config.businessName || 'this business'}.

## Core Identity
- You run operations autonomously for ${config.employeeName} (${config.employeeType})
- You learn the owner's decision-making style
- You only escalate what truly needs human approval
- You get smarter every day

## Rules
1. Speed > perfection
2. Only ask for approval on decisions above your confidence threshold
3. Log everything
4. Protect customer data absolutely`;

  const envContent = [
    `CUSTOMER_ID=${config.customerId}`,
    `EMPLOYEE_TYPE=${config.employeeType}`,
    `EMPLOYEE_NAME=${config.employeeName}`,
    `BUSINESS_NAME=${config.businessName || ''}`,
    `SUPABASE_URL=${config.supabaseUrl}`,
    `SUPABASE_ANON_KEY=${config.supabaseAnonKey}`,
    `SUPABASE_SERVICE_KEY=${config.supabaseServiceKey}`,
  ].join('\\n');

  await executeBash(computerId,
    `cd /home/user/mouse-platform && mkdir -p workspace/memory config && printf '${envContent}' > .env`
  );

  // Write SOUL.md via Python to avoid shell escaping issues
  const writeSoul = `
with open("/home/user/mouse-platform/workspace/SOUL.md", "w") as f:
    f.write("""${soulMd.replace(/"/g, '\\"')}""")
print("SOUL_OK")
`;
  await executePython(computerId, writeSoul, 10);

  return 'Configured';
}

async function launchGateway(computerId: string, _config: ProvisionConfig): Promise<string> {
  // Start OpenClaw gateway in container mode (no systemd)
  await executeBash(computerId,
    'cd /home/user/mouse-platform && nohup node openclaw.mjs gateway --dev --allow-unconfigured --bind loopback > /var/log/mouse-os-runtime.log 2>&1 & echo $! > /var/run/mouse-os.pid && echo LAUNCHED_PID=$(cat /var/run/mouse-os.pid)'
  );
  return 'Launched';
}

async function setupWatchdog(computerId: string, config: ProvisionConfig): Promise<string> {
  // Activity tracker + 5-minute idle watchdog
  const watchdogScript = `
import os, time, subprocess, json, urllib.request

IDLE_LIMIT = 300  # 5 minutes
ACTIVITY_FILE = "/tmp/mouse-last-activity"
SUPABASE_URL = "${config.supabaseUrl}"
SUPABASE_KEY = "${config.supabaseAnonKey}"
CUSTOMER_ID = "${config.customerId}"

# Initialize activity file
with open(ACTIVITY_FILE, "w") as f:
    f.write(str(int(time.time())))

while True:
    time.sleep(60)
    try:
        with open(ACTIVITY_FILE) as f:
            last = int(f.read().strip())
        idle = int(time.time()) - last
        if idle > IDLE_LIMIT:
            # Sync state before stopping
            subprocess.run(["/usr/local/bin/mouse-state-sync.sh", "save"], timeout=30)
            # Notify
            data = json.dumps({
                "customer_id": CUSTOMER_ID,
                "type": "vm_idle_stop",
                "agent_type": "watchdog",
                "message": "Employee paused (5min idle). Will resume on next task.",
                "read": False
            }).encode()
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/notifications",
                data=data,
                headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
            )
            urllib.request.urlopen(req)
            # Self-stop
            os.system("sudo shutdown -h now")
    except Exception as e:
        pass
`;

  // Write watchdog as a Python script and run in background
  const setupCmd = `
with open("/home/user/watchdog.py", "w") as f:
    f.write("""${watchdogScript.replace(/"/g, '\\"')}""")
import subprocess
subprocess.Popen(["python3", "/home/user/watchdog.py"], stdout=open("/var/log/mouse-watchdog.log", "w"), stderr=subprocess.STDOUT)
print("WATCHDOG_OK")
`;

  await executePython(computerId, setupCmd, 10);

  // Activity ping script
  await executeBash(computerId,
    'echo \'#!/bin/bash\necho $(date +%s) > /tmp/mouse-last-activity\' > /usr/local/bin/mouse-activity-ping.sh && chmod +x /usr/local/bin/mouse-activity-ping.sh && date +%s > /tmp/mouse-last-activity'
  );

  return 'Watchdog active';
}

async function setupStateSync(computerId: string, config: ProvisionConfig): Promise<string> {
  // State sync script: tar workspace → Supabase Storage
  const syncScript = `#!/bin/bash
ACTION="\${1:-save}"
MOUSE_HOME="$HOME/mouse-platform"
SUPABASE_URL="${config.supabaseUrl}"
SUPABASE_KEY="${config.supabaseServiceKey}"
CUSTOMER_ID="${config.customerId}"
BUCKET="vm-state"

if [ "$ACTION" = "save" ]; then
    cd "$MOUSE_HOME"
    tar -czf /tmp/mouse-state.tar.gz --exclude='node_modules' --exclude='.git' workspace/ config/ .env 2>/dev/null
    curl -s -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET/$CUSTOMER_ID/state.tar.gz" \\
        -H "apikey: $SUPABASE_KEY" \\
        -H "Authorization: Bearer $SUPABASE_KEY" \\
        -H "Content-Type: application/gzip" \\
        --data-binary @/tmp/mouse-state.tar.gz > /dev/null 2>&1
elif [ "$ACTION" = "load" ]; then
    curl -s -o /tmp/mouse-state.tar.gz \\
        "$SUPABASE_URL/storage/v1/object/$BUCKET/$CUSTOMER_ID/state.tar.gz" \\
        -H "apikey: $SUPABASE_KEY" \\
        -H "Authorization: Bearer $SUPABASE_KEY"
    if [ -f /tmp/mouse-state.tar.gz ] && [ -s /tmp/mouse-state.tar.gz ]; then
        cd "$MOUSE_HOME" && tar -xzf /tmp/mouse-state.tar.gz 2>/dev/null
    fi
fi`;

  // Write and setup cron
  const setupSync = `
with open("/usr/local/bin/mouse-state-sync.sh", "w") as f:
    f.write("""${syncScript.replace(/"/g, '\\"')}""")
import subprocess, os
os.chmod("/usr/local/bin/mouse-state-sync.sh", 0o755)
# Add to crontab
subprocess.run("(crontab -l 2>/dev/null; echo '* * * * * /usr/local/bin/mouse-state-sync.sh save >> /var/log/mouse-state-sync.log 2>&1') | crontab -", shell=True)
# Try to load previous state
subprocess.run(["/usr/local/bin/mouse-state-sync.sh", "load"], timeout=30)
print("SYNC_OK")
`;

  await executePython(computerId, setupSync, 30);
  return 'State sync active';
}

// ─── Self-Provisioning (VM runs its own setup) ─────────────

/**
 * Generate a self-contained bash provision script for the VM.
 * The VM downloads deps, clones, rebrands, builds, and launches itself.
 * This avoids Vercel function timeouts — we just upload and nohup it.
 */
/**
 * Runtime tarball URL — pre-built Mouse Platform with production deps only.
 * Built from knight-1 (OpenClaw 2026.3.3), 496MB compressed, 1.3GB extracted.
 * Update this URL when rebuilding the runtime (bump the release tag).
 */
const RUNTIME_TARBALL_URL = 'https://github.com/coltonharris-wq/Mouse-platform/releases/download/v12-runtime/mouse-runtime.tar.gz';

function generateProvisionScript(config: ProvisionConfig): string {
  return `#!/bin/bash
set -euo pipefail
LOG="/var/log/mouse-os-provision.log"
log() { echo "[MOUSE-OS] $(date '+%H:%M:%S') $1" | tee -a "$LOG"; }

log "=== MOUSE OS PROVISIONING START ==="
log "Strategy: Pre-built runtime tarball (fast provision)"

# 1. Install Node 22 (required by OpenClaw — VMs may have Node 18 pre-installed)
log "Step 1/6: Installing Node 22..."
mkdir -p /var/lib/apt/lists/partial
apt-get update -qq > /dev/null 2>&1
apt-get install -y -qq curl > /dev/null 2>&1
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
apt-get install -y -qq nodejs > /dev/null 2>&1
log "Deps OK: node=$(node -v)"

# 2. Download pre-built runtime
MOUSE_HOME="$HOME/mouse-platform"
log "Step 2/6: Downloading Mouse Platform runtime (~496MB)..."
rm -rf "$MOUSE_HOME"
cd "$HOME"
curl -fsSL -o /tmp/mouse-runtime.tar.gz "${RUNTIME_TARBALL_URL}"
log "Download complete"

# 3. Extract runtime
log "Step 3/6: Extracting runtime..."
tar -xzf /tmp/mouse-runtime.tar.gz
mv mouse-runtime mouse-platform
rm -f /tmp/mouse-runtime.tar.gz
log "Extracted OK: $(du -sh $MOUSE_HOME | cut -f1)"

# 4. Configure workspace
log "Step 4/6: Configuring workspace..."
cd "$MOUSE_HOME"
mkdir -p workspace/memory config

cat > .env << 'ENVEOF'
CUSTOMER_ID=${config.customerId}
EMPLOYEE_TYPE=${config.employeeType}
EMPLOYEE_NAME=${config.employeeName}
BUSINESS_NAME=${config.businessName || ''}
SUPABASE_URL=${config.supabaseUrl}
SUPABASE_ANON_KEY=${config.supabaseAnonKey}
SUPABASE_SERVICE_KEY=${config.supabaseServiceKey}
ENVEOF

cat > workspace/SOUL.md << 'SOULEOF'
# SOUL.md - King Mouse

You are **King Mouse**, the AI Operations Manager for ${config.businessName || 'this business'}.
You run operations autonomously. You learn the owner's style.
Only escalate what truly needs human approval. Get smarter every day.
Protect customer data absolutely. Speed > perfection.
SOULEOF

log "Workspace configured"

# 5. State sync + Launch gateway + Watchdog
log "Step 5/6: Setting up state sync..."
cat > /usr/local/bin/mouse-state-sync.sh << 'SYNCEOF'
#!/bin/bash
ACTION="\${1:-save}"
if [ "$ACTION" = "save" ]; then
  cd $MOUSE_HOME
  tar -czf /tmp/mouse-state.tar.gz --exclude='node_modules' --exclude='.git' workspace/ config/ .env 2>/dev/null
  curl -s -X POST "${config.supabaseUrl}/storage/v1/object/vm-state/${config.customerId}/state.tar.gz" \\
    -H "apikey: ${config.supabaseServiceKey}" \\
    -H "Authorization: Bearer ${config.supabaseServiceKey}" \\
    -H "Content-Type: application/gzip" \\
    --data-binary @/tmp/mouse-state.tar.gz > /dev/null 2>&1
elif [ "$ACTION" = "load" ]; then
  curl -s -o /tmp/mouse-state.tar.gz \\
    "${config.supabaseUrl}/storage/v1/object/vm-state/${config.customerId}/state.tar.gz" \\
    -H "apikey: ${config.supabaseServiceKey}" \\
    -H "Authorization: Bearer ${config.supabaseServiceKey}"
  if [ -f /tmp/mouse-state.tar.gz ] && [ -s /tmp/mouse-state.tar.gz ]; then
    cd $MOUSE_HOME && tar -xzf /tmp/mouse-state.tar.gz 2>/dev/null
  fi
fi
SYNCEOF
chmod +x /usr/local/bin/mouse-state-sync.sh
(crontab -l 2>/dev/null; echo "* * * * * /usr/local/bin/mouse-state-sync.sh save >> /var/log/mouse-state-sync.log 2>&1") | crontab -
/usr/local/bin/mouse-state-sync.sh load 2>/dev/null || true
log "State sync configured"

# Launch gateway (container mode — no systemd)
log "Step 6/6: Launching King Mouse..."
cd "$MOUSE_HOME"
nohup node openclaw.mjs gateway --dev --allow-unconfigured --bind loopback > /var/log/mouse-os-runtime.log 2>&1 &
echo $! > /var/run/mouse-os.pid
log "King Mouse launched (PID: $(cat /var/run/mouse-os.pid))"

# Watchdog (5-min idle auto-stop)
log "Setting up watchdog..."
echo '#!/bin/bash
echo $(date +%s) > /tmp/mouse-last-activity' > /usr/local/bin/mouse-activity-ping.sh
chmod +x /usr/local/bin/mouse-activity-ping.sh
date +%s > /tmp/mouse-last-activity
log "Watchdog ready"

# Notify Supabase that provisioning is complete
curl -s -X POST "${config.supabaseUrl}/rest/v1/notifications" \\
  -H "apikey: ${config.supabaseAnonKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"customer_id": "${config.customerId}", "type": "employee_ready", "agent_type": "${config.employeeType}", "message": "🐭 ${config.employeeName} is ready! Mouse Platform installed and King Mouse is operational.", "read": false}'

# Update employee_vms status
curl -s -X PATCH "${config.supabaseUrl}/rest/v1/employee_vms?computer_id=eq.COMPUTER_ID_PLACEHOLDER" \\
  -H "apikey: ${config.supabaseServiceKey}" \\
  -H "Authorization: Bearer ${config.supabaseServiceKey}" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=minimal" \\
  -d '{"status": "active", "last_heartbeat": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

log "=== MOUSE OS READY ==="
`;
}

/**
 * Kick off Mouse OS provisioning on a VM.
 * Uploads a self-contained script and runs it with nohup.
 * Returns immediately — poll checkProvisionStatus() for completion.
 * 
 * This is the function to call from Vercel API routes (fast, no timeout issues).
 */
/**
 * Kick off Mouse OS provisioning on a VM.
 * 
 * FAST PATH (default): Single VM readiness check (5s), then upload+nohup.
 * If VM isn't ready yet, returns { started: false, retryable: true }.
 * The caller (hire route or provision-trigger route) can retry later.
 * 
 * This is designed to complete within Vercel's 10s function timeout.
 */
export async function kickOffProvision(
  computerId: string,
  config: ProvisionConfig
): Promise<{ started: boolean; error?: string; retryable?: boolean }> {
  try {
    // Quick VM readiness check — single attempt, no long polling
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

    // Check if already provisioning or provisioned
    try {
      const check = await executeBash(computerId, 
        'test -f /var/log/mouse-os-provision.log && grep -c "PROVISIONING START\\|MOUSE OS READY" /var/log/mouse-os-provision.log 2>/dev/null || echo 0'
      );
      if (check.output && parseInt(check.output.trim()) > 0) {
        return { started: true, error: 'Provision already in progress or complete' };
      }
    } catch (_) {}

    // Generate the provision script with config baked in
    let script = generateProvisionScript(config);
    script = script.replace('COMPUTER_ID_PLACEHOLDER', computerId);

    // Upload via Python exec (avoids shell escaping issues with large scripts)
    const b64Script = Buffer.from(script).toString('base64');
    const uploadCode = `
import base64, os
script = base64.b64decode("${b64Script}").decode()
import pathlib
home = str(pathlib.Path.home())
path = home + "/provision-mouse-os.sh"
with open(path, "w") as f:
    f.write(script)
os.chmod(path, 0o755)
print("UPLOADED")
`;

    const uploadResult = await executePython(computerId, uploadCode, 15);
    if (!uploadResult.output?.includes('UPLOADED')) {
      return { started: false, error: `Upload failed: ${uploadResult.output}` };
    }

    // Run in background with nohup (use $HOME since VMs may run as root or user)
    await executeBash(computerId,
      'nohup $HOME/provision-mouse-os.sh > /var/log/mouse-os-provision.log 2>&1 &'
    );

    return { started: true };
  } catch (err: any) {
    return { started: false, retryable: true, error: err.message };
  }
}

// ─── Legacy: Step-by-step provisioning (for non-serverless contexts) ─

const STEPS: Step[] = [
  { name: 'Installing dependencies', fn: installDeps },
  { name: 'Cloning OpenClaw', fn: cloneRepo },
  { name: 'Rebranding to Mouse Platform', fn: rebrand },
  { name: 'Installing packages', fn: installPackages },
  { name: 'Building Mouse Platform', fn: buildProject },
  { name: 'Configuring workspace', fn: configureWorkspace },
  { name: 'Setting up state sync', fn: setupStateSync },
  { name: 'Launching King Mouse', fn: launchGateway },
  { name: 'Setting up watchdog', fn: setupWatchdog },
];

/**
 * Provision Mouse OS step-by-step (use for long-running contexts like CLI).
 * For Vercel, use kickOffProvision() instead.
 */
export async function provisionMouseOS(
  computerId: string,
  config: ProvisionConfig,
  onProgress?: (step: string, index: number, total: number) => void
): Promise<{ success: boolean; log: string[]; error?: string }> {
  const log: string[] = [];
  const total = STEPS.length;

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const timestamp = new Date().toISOString().slice(11, 19);
    log.push(`[${timestamp}] Step ${i + 1}/${total}: ${step.name}...`);
    onProgress?.(step.name, i, total);

    try {
      const result = await step.fn(computerId, config);
      log.push(`[${timestamp}] ✓ ${step.name}: ${result.slice(0, 100)}`);
    } catch (err: any) {
      log.push(`[${timestamp}] ✗ ${step.name} FAILED: ${err.message}`);
      return { success: false, log, error: `Step "${step.name}" failed: ${err.message}` };
    }
  }

  try {
    await executeBash(computerId,
      'echo "MOUSE OS READY $(date)" >> /var/log/mouse-os-provision.log'
    );
  } catch (_) {}

  log.push(`[${new Date().toISOString().slice(11, 19)}] 🐭 MOUSE OS READY`);
  return { success: true, log };
}

/**
 * Check if provisioning is complete on a VM.
 */
export async function checkProvisionStatus(computerId: string): Promise<{
  status: 'pending' | 'provisioning' | 'ready' | 'error';
  log?: string;
}> {
  try {
    const result = await executeBash(computerId,
      'grep "MOUSE OS READY" /var/log/mouse-os-provision.log 2>/dev/null && echo STATUS_READY || echo STATUS_PENDING'
    );
    if (result.output?.includes('STATUS_READY')) {
      return { status: 'ready' };
    }
    // Check if provisioning is actively running
    const ps = await executeBash(computerId, 'ps aux | grep -v grep | grep "pnpm\\|node.*openclaw" | head -1');
    if (ps.output?.trim()) {
      return { status: 'provisioning', log: ps.output.trim() };
    }
    return { status: 'pending' };
  } catch {
    return { status: 'error' };
  }
}
