#!/bin/bash
# ============================================
# Mouse OS Provisioning Script
# Runs inside Orgo VM after boot
# Clones OpenClaw, rebrands to Mouse Platform, builds, configures, launches
# ============================================

set -euo pipefail

MOUSE_HOME="/opt/mouse-platform"
OPENCLAW_REPO="https://github.com/openclaw/openclaw.git"
LOG_FILE="/var/log/mouse-os-provision.log"

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[MOUSE-OS]${NC} $(date '+%H:%M:%S') $1" | tee -a "$LOG_FILE"; }
err() { echo -e "${RED}[MOUSE-OS ERROR]${NC} $(date '+%H:%M:%S') $1" | tee -a "$LOG_FILE"; }

# ============================================
# 1. SYSTEM DEPENDENCIES
# ============================================
install_deps() {
    log "Installing system dependencies..."
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq git curl build-essential python3 python3-pip jq sed > /dev/null 2>&1

    # Install Node.js 22 via nvm
    if ! command -v node &> /dev/null; then
        log "Installing Node.js 22..."
        curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
        apt-get install -y -qq nodejs > /dev/null 2>&1
    fi

    # Install pnpm
    if ! command -v pnpm &> /dev/null; then
        log "Installing pnpm..."
        npm install -g pnpm > /dev/null 2>&1
    fi

    log "Dependencies installed: node=$(node -v), pnpm=$(pnpm -v)"
}

# ============================================
# 2. CLONE OPENCLAW
# ============================================
clone_openclaw() {
    log "Cloning OpenClaw source..."
    if [ -d "$MOUSE_HOME" ]; then
        rm -rf "$MOUSE_HOME"
    fi
    git clone --depth 1 "$OPENCLAW_REPO" "$MOUSE_HOME" > /dev/null 2>&1
    cd "$MOUSE_HOME"
    log "Cloned to $MOUSE_HOME ($(git rev-parse --short HEAD))"
}

# ============================================
# 3. REBRAND: OpenClaw -> Mouse Platform
# ============================================
rebrand() {
    log "Rebranding OpenClaw -> Mouse Platform (safe mode: docs/UI only)..."
    cd "$MOUSE_HOME"

    # SAFE REBRAND: Only touch .md, .html, .css, .yaml files
    # DO NOT touch .ts/.js/.tsx/.jsx — breaks class names, type annotations, import paths
    # Learned the hard way: code identifiers like OpenClawConfig become "Mouse PlatformConfig" = build failure
    find . -not -path './.git/*' -not -path '*/node_modules/*' \
        \( -name '*.md' -o -name '*.html' -o -name '*.css' -o -name '*.yaml' -o -name '*.yml' \) \
        -type f -exec sed -i 's/OpenClaw/Mouse Platform/g' {} + 2>/dev/null || true

    find . -not -path './.git/*' -not -path '*/node_modules/*' \
        \( -name '*.md' -o -name '*.html' -o -name '*.css' -o -name '*.yaml' -o -name '*.yml' \) \
        -type f -exec sed -i 's/openclaw/mouse-platform/g' {} + 2>/dev/null || true

    find . -not -path './.git/*' -not -path '*/node_modules/*' \
        \( -name '*.md' -o -name '*.html' -o -name '*.css' -o -name '*.yaml' -o -name '*.yml' \) \
        -type f -exec sed -i 's/OPENCLAW/MOUSE_PLATFORM/g' {} + 2>/dev/null || true

    log "Rebranding complete ✓ (docs/UI only, code untouched for build stability)"
}

# ============================================
# 4. BUILD
# ============================================
build_mouse_os() {
    log "Installing dependencies..."
    cd "$MOUSE_HOME"
    pnpm install --frozen-lockfile 2>&1 | tail -3 | tee -a "$LOG_FILE"

    log "Building Mouse Platform..."
    pnpm build 2>&1 | tail -5 | tee -a "$LOG_FILE"
    log "Build complete ✓"
}

# ============================================
# 5. CONFIGURE (inject customer config)
# ============================================
configure() {
    log "Applying customer configuration..."
    cd "$MOUSE_HOME"

    # Config dir
    mkdir -p config workspace

    # ENV file (populated by /api/vm/configure)
    if [ -f "/tmp/mouse-config.env" ]; then
        cp /tmp/mouse-config.env .env
        log "  .env injected from onboarding"
    fi

    # Customer config JSON (populated by /api/vm/configure)
    if [ -f "/tmp/mouse-config.json" ]; then
        cp /tmp/mouse-config.json config/customer.json
        log "  customer.json injected from onboarding"
    fi

    # SOUL.md for King Mouse
    cat > workspace/SOUL.md << 'SOUL_EOF'
# SOUL.md - King Mouse 🐭

You are **King Mouse**, the AI Operations Manager for this business.

## Core Identity
- You run operations autonomously
- You learn the owner's decision-making style
- You only escalate what truly needs human approval
- You get smarter every day

## Capabilities
- Handle admin, ordering, inventory, supply coordination
- Manage follow-ups and scheduling
- Route tasks to specialized sub-agents (Receptionist, Lead Funnel, etc.)
- Monitor business metrics and flag opportunities

## Rules
1. Speed > perfection. Ship it, fix it, improve it.
2. Only ask for approval on decisions above your confidence threshold
3. Log everything for the owner to review
4. Protect customer data absolutely
5. When in doubt, do the conservative thing
SOUL_EOF

    # AGENTS.md for King Mouse
    cat > workspace/AGENTS.md << 'AGENTS_EOF'
# AGENTS.md - King Mouse Workspace

## Sub-Agents
King Mouse can spawn specialized sub-agents:
- **Receptionist** — Handles calls, scheduling, customer intake
- **Lead Funnel** — Captures, scores, and nurtures leads
- **Admin** — Invoices, follow-ups, document management
- **Coordinator** — Supply chain, vendor communication

## Memory
- `workspace/memory/` — Daily operation logs
- `workspace/MEMORY.md` — Learned owner preferences and business rules
AGENTS_EOF

    log "Configuration applied ✓"
}

# ============================================
# 6. LAUNCH (headless)
# ============================================
launch() {
    log "Launching King Mouse in headless mode..."
    cd "$MOUSE_HOME"

    # Start in headless/daemon mode
    # The exact command depends on OpenClaw's CLI
    if [ -f "bin/openclaw" ] || command -v openclaw &> /dev/null; then
        nohup node bin/openclaw gateway start \
            --headless \
            --workspace "$MOUSE_HOME/workspace" \
            > /var/log/mouse-os-runtime.log 2>&1 &
        echo $! > /var/run/mouse-os.pid
        log "King Mouse launched (PID: $(cat /var/run/mouse-os.pid)) ✓"
    else
        # Fallback: run directly
        nohup node dist/index.js \
            > /var/log/mouse-os-runtime.log 2>&1 &
        echo $! > /var/run/mouse-os.pid
        log "Mouse Platform launched via dist/index.js (PID: $(cat /var/run/mouse-os.pid)) ✓"
    fi
}

# ============================================
# 7. WATCHDOG SETUP ($200 heartbeat)
# ============================================
setup_watchdog() {
    log "Setting up $200 watchdog (5-min idle stop)..."

    cat > /usr/local/bin/mouse-watchdog.sh << 'WATCHDOG_EOF'
#!/bin/bash
# Mouse OS Watchdog - stops VM after 5 minutes of inactivity
IDLE_LIMIT=300  # 5 minutes in seconds
ACTIVITY_FILE="/tmp/mouse-last-activity"

while true; do
    sleep 60
    if [ -f "$ACTIVITY_FILE" ]; then
        LAST=$(cat "$ACTIVITY_FILE")
        NOW=$(date +%s)
        IDLE=$((NOW - LAST))
        if [ "$IDLE" -gt "$IDLE_LIMIT" ]; then
            echo "[WATCHDOG] $(date) - Idle for ${IDLE}s. Triggering state-sync and stop."
            # Sync state before stopping
            /usr/local/bin/mouse-state-sync.sh save
            # Notify Supabase
            curl -s -X POST "${SUPABASE_URL}/rest/v1/notifications" \
                -H "apikey: ${SUPABASE_ANON_KEY}" \
                -H "Content-Type: application/json" \
                -d "{\"customer_id\": \"${CUSTOMER_ID}\", \"type\": \"vm_idle_stop\", \"message\": \"Employee paused due to inactivity (5min). Will resume on next task.\"}" \
                > /dev/null 2>&1
            # Self-stop
            shutdown -h now
        fi
    else
        echo "$(date +%s)" > "$ACTIVITY_FILE"
    fi
done
WATCHDOG_EOF

    chmod +x /usr/local/bin/mouse-watchdog.sh
    nohup /usr/local/bin/mouse-watchdog.sh > /var/log/mouse-watchdog.log 2>&1 &
    log "Watchdog started ✓"
}

# ============================================
# 8. STATE SYNC SETUP
# ============================================
setup_state_sync() {
    log "Setting up state sync to Supabase..."

    cat > /usr/local/bin/mouse-state-sync.sh << 'SYNC_EOF'
#!/bin/bash
# Mouse OS State Sync - syncs workspace state to Supabase Storage
ACTION="${1:-save}"
MOUSE_HOME="/opt/mouse-platform"
BUCKET="vm-state"
STATE_DIR="$MOUSE_HOME/workspace"

if [ "$ACTION" = "save" ]; then
    # Tar workspace (exclude node_modules, .git)
    cd "$MOUSE_HOME"
    tar -czf /tmp/mouse-state.tar.gz \
        --exclude='node_modules' --exclude='.git' \
        workspace/ config/ .env 2>/dev/null

    # Upload to Supabase Storage
    curl -s -X POST "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${CUSTOMER_ID}/state.tar.gz" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/gzip" \
        --data-binary @/tmp/mouse-state.tar.gz > /dev/null 2>&1

    echo "[STATE-SYNC] $(date) - State saved to Supabase"

elif [ "$ACTION" = "load" ]; then
    # Download from Supabase Storage
    curl -s -o /tmp/mouse-state.tar.gz \
        "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${CUSTOMER_ID}/state.tar.gz" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}"

    if [ -f /tmp/mouse-state.tar.gz ] && [ -s /tmp/mouse-state.tar.gz ]; then
        cd "$MOUSE_HOME"
        tar -xzf /tmp/mouse-state.tar.gz 2>/dev/null
        echo "[STATE-SYNC] $(date) - State restored from Supabase"
    else
        echo "[STATE-SYNC] $(date) - No previous state found, starting fresh"
    fi
fi
SYNC_EOF

    chmod +x /usr/local/bin/mouse-state-sync.sh

    # Set up 60-second cron for state sync
    (crontab -l 2>/dev/null; echo "* * * * * /usr/local/bin/mouse-state-sync.sh save >> /var/log/mouse-state-sync.log 2>&1") | crontab -
    log "State sync configured (60s interval) ✓"
}

# ============================================
# 9. ACTIVITY TRACKER (for watchdog)
# ============================================
setup_activity_tracker() {
    log "Setting up activity tracker..."

    cat > /usr/local/bin/mouse-activity-ping.sh << 'PING_EOF'
#!/bin/bash
# Called by King Mouse on every tool use to reset idle timer
echo "$(date +%s)" > /tmp/mouse-last-activity
PING_EOF

    chmod +x /usr/local/bin/mouse-activity-ping.sh
    # Initial activity timestamp
    date +%s > /tmp/mouse-last-activity
    log "Activity tracker ready ✓"
}

# ============================================
# MAIN EXECUTION
# ============================================
main() {
    log "================================================"
    log "  MOUSE OS PROVISIONING v12.0"
    log "  Starting build at $(date)"
    log "================================================"

    install_deps
    clone_openclaw
    rebrand
    build_mouse_os

    # Load previous state if exists
    setup_state_sync
    /usr/local/bin/mouse-state-sync.sh load

    configure
    setup_activity_tracker
    setup_watchdog
    launch

    log "================================================"
    log "  MOUSE OS READY 🐭"
    log "  King Mouse is operational"
    log "  Provision completed at $(date)"
    log "================================================"
}

main "$@"
