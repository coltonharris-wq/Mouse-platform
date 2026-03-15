#!/bin/bash
# Mouse Platform — King Mouse VM Setup
# Downloads pre-built tarball, writes config, starts gateway
# Usage: Called by Orgo VM provisioning with base64 config arg

set -euo pipefail

CONFIG_B64="${1:-}"
MOUSE_TARBALL_URL="${MOUSE_TARBALL_URL:-https://github.com/coltonharris-wq/mouse/releases/download/v1/mouse-os.tar.gz}"
INSTALL_DIR="/opt/king-mouse"

echo "[Mouse] Setting up King Mouse on VM..."

# 1. Install Node 22 (if needed)
if ! node --version 2>/dev/null | grep -q "^v2[2-9]"; then
    echo "[Mouse] Installing Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -qq nodejs
fi

# 2. Download and extract pre-built tarball (no build on VM!)
echo "[Mouse] Downloading King Mouse..."
mkdir -p "$INSTALL_DIR"
curl -fsSL "$MOUSE_TARBALL_URL" | tar -xzf - -C "$INSTALL_DIR"
cd "$INSTALL_DIR"
echo "[Mouse] King Mouse extracted to $INSTALL_DIR"

# 3. Write config files from base64 payload
if [ -n "$CONFIG_B64" ]; then
    mkdir -p config
    echo "$CONFIG_B64" | base64 -d > config/config.json

    # Extract and write SOUL.md, USER.md, agents.md from config payload
    python3 -c "
import json, sys, os
config = json.load(open('config/config.json'))
os.chdir('$INSTALL_DIR')

# Write SOUL.md
soul = config.get('soul', {})
with open('SOUL.md', 'w') as f:
    f.write('# King Mouse — AI Operations Manager\n\n')
    f.write(soul.get('role', 'You are King Mouse, an AI operations manager.') + '\n\n')
    f.write('## Capabilities\n\n')
    for cap in soul.get('capabilities', []):
        f.write(f'- {cap}\n')
    f.write('\n## System Prompt\n\n')
    f.write(config.get('kingMouse', {}).get('systemPrompt', '') + '\n')

# Write USER.md
user = config.get('user', {})
with open('USER.md', 'w') as f:
    f.write('# User Profile\n\n')
    f.write(f'Company: {user.get(\"company_name\", \"Unknown\")}\n')
    f.write(f'Industry: {user.get(\"industry\", \"Unknown\")}\n')
    f.write(f'Niche: {user.get(\"niche\", \"Unknown\")}\n')
    f.write(f'Location: {user.get(\"location\", \"Unknown\")}\n')
    f.write(f'Pain point: {user.get(\"biggest_pain\", \"Unknown\")}\n')
    f.write(f'Description: {user.get(\"business_description\", \"\")}\n')

# Write agents.md
with open('agents.md', 'w') as f:
    f.write('# King Mouse Agents\n\n')
    f.write('## Receptionist Agent\n')
    recep = config.get('receptionist', {})
    f.write(f'Greeting: {recep.get(\"defaultGreeting\", \"\")}\n')
    f.write(f'Common reasons: {\", \".join(recep.get(\"commonReasons\", []))}\n\n')
    f.write('## Lead Manager Agent\n')
    leads = config.get('leads', {})
    f.write(f'Service types: {\", \".join(leads.get(\"serviceTypes\", []))}\n')
"
    echo "[Mouse] Config files written (SOUL.md, USER.md, agents.md)"
fi

# 4. Run silent onboard (writes mouse.json, sets up gateway config)
echo "[Mouse] Running silent onboard..."
MOUSE_SILENT=1 \
MOUSE_PRESET=king-mouse \
MOUSE_PORT="${MOUSE_PORT:-18789}" \
node openclaw.mjs onboard --silent --auto-skills 2>/dev/null || true

# 4b. Fix config: strip unrecognized keys, set gateway.mode=local
echo "[Mouse] Running doctor --fix..."
node openclaw.mjs doctor --fix 2>/dev/null || true

# 4c. Ensure gateway.mode=local and bind=lan (required for container VMs)
python3 -c "
import json, os
p = os.path.expanduser('~/.mouse/mouse.json')
if os.path.exists(p):
    c = json.load(open(p))
    g = c.setdefault('gateway', {})
    g['mode'] = 'local'
    if g.get('bind') in ['0.0.0.0', 'localhost', '127.0.0.1']:
        g['bind'] = 'lan'
    json.dump(c, open(p, 'w'), indent=2)
" 2>/dev/null || true

# 5. Start gateway (nohup — Orgo VMs are containers without systemd)
echo "[Mouse] Starting King Mouse gateway..."
NODE_ENV=production nohup node "$INSTALL_DIR/openclaw.mjs" gateway \
    > /tmp/king-mouse.log 2>&1 &
GATEWAY_PID=$!
echo "[Mouse] Gateway PID: $GATEWAY_PID"

# 6. Wait for health check
for i in $(seq 1 30); do
    if curl -sf http://127.0.0.1:18789/health >/dev/null 2>&1; then
        echo "[Mouse] King Mouse is ready on port 18789"
        exit 0
    fi
    sleep 2
done

echo "[Mouse] WARNING: Gateway may still be starting. PID: $GATEWAY_PID"
exit 0
