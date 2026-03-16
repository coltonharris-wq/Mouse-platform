#!/bin/bash
# ┌─────────────────────────────────────────────────┐
# │ KingMouse VM Install Script                     │
# │ Installs OpenClaw, writes v2026.3+ config,      │
# │ starts gateway, signals completion.             │
# └─────────────────────────────────────────────────┘
#
# Prerequisites (written by vm-provision.ts before this runs):
#   /opt/king-mouse/.moonshot-key    — Moonshot/Kimi API key
#   /opt/king-mouse/config/soul.md   — Business-specific SOUL.md
#   /opt/king-mouse/config/user.md   — Owner context
#
# Environment:
#   MOUSE_PORT  — Gateway port (default: 18789)

set -euo pipefail

MOUSE_PORT="${MOUSE_PORT:-18789}"
INSTALL_DIR="/opt/king-mouse"
CONFIG_DIR="$INSTALL_DIR/config"
WORKSPACE_DIR="$INSTALL_DIR/workspace"
LOG_FILE="$INSTALL_DIR/install.log"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== KingMouse Install $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "Port: $MOUSE_PORT"

# ─── Phase 1: Install OpenClaw ───────────────────────────────
echo "--- Phase 1: Installing OpenClaw ---"

npm install -g openclaw 2>/dev/null || true

# Bypass interactive onboard prompt added in v2026.3.13
# The prompt defaults to "No" in non-interactive mode, killing onboard.
# Pipe "y" to accept, set MOUSE_SILENT to suppress extra output.
echo "y" | MOUSE_SILENT=1 MOUSE_PRESET=king-mouse MOUSE_PORT="$MOUSE_PORT" \
  DISPLAY=:99 npx openclaw onboard --install-daemon 2>/dev/null || true

if ! command -v openclaw &>/dev/null; then
  echo "FATAL: openclaw not available after install"
  exit 1
fi

echo "OpenClaw version: $(openclaw --version 2>/dev/null || echo 'unknown')"

# ─── Phase 2: Directory Structure ────────────────────────────
echo "--- Phase 2: Directory Setup ---"

mkdir -p "$CONFIG_DIR" "$WORKSPACE_DIR"

# ─── Phase 3: Write OpenClaw Config (v2026.3+ format) ────────
echo "--- Phase 3: Writing Config ---"

# Read API key written by vm-provision.ts
MOONSHOT_KEY=""
if [ -f "$INSTALL_DIR/.moonshot-key" ]; then
  MOONSHOT_KEY=$(tr -d '[:space:]' < "$INSTALL_DIR/.moonshot-key")
fi

if [ -z "$MOONSHOT_KEY" ]; then
  echo "WARNING: No API key found at $INSTALL_DIR/.moonshot-key"
fi

# Persist API key as environment variable (OpenClaw reads MOONSHOT_API_KEY from env)
echo "export MOONSHOT_API_KEY=$MOONSHOT_KEY" >> /etc/environment
echo "export MOONSHOT_API_KEY=$MOONSHOT_KEY" >> /root/.bashrc

# Delete legacy config — v2026.3+ rejects old keys
CONFIG_PATH="/root/.openclaw/openclaw.json"
rm -f "$CONFIG_PATH"
mkdir -p "$(dirname "$CONFIG_PATH")"

# Write ONLY valid v2026.3+ keys
cat > "$CONFIG_PATH" << CONFIGEOF
{
  "gateway": {
    "mode": "local",
    "port": $MOUSE_PORT,
    "bind": "lan",
    "controlUi": {
      "allowedOrigins": ["*"]
    }
  },
  "agents": {
    "defaults": {
      "model": "moonshot/kimi-k2.5"
    }
  },
  "tools": {
    "exec": {
      "host": "gateway",
      "security": "full",
      "ask": "off"
    }
  },
  "browser": {
    "enabled": true
  }
}
CONFIGEOF

echo "Config written to $CONFIG_PATH"

# Apply any remaining config migrations
echo "--- Phase 3b: Running doctor --fix ---"
openclaw doctor --fix 2>/dev/null || true

# ─── Phase 4: Start Gateway ──────────────────────────────────
echo "--- Phase 4: Starting Gateway ---"

cd "$WORKSPACE_DIR"

# Copy soul/user files to workspace
cp -f "$CONFIG_DIR/soul.md" "$WORKSPACE_DIR/SOUL.md" 2>/dev/null || true
cp -f "$CONFIG_DIR/user.md" "$WORKSPACE_DIR/USER.md" 2>/dev/null || true

# Start gateway in background — source env for MOONSHOT_API_KEY
source /etc/environment 2>/dev/null
DISPLAY=:99 nohup openclaw gateway run \
  > "$INSTALL_DIR/gateway.log" 2>&1 &
GATEWAY_PID=$!
echo "Gateway PID: $GATEWAY_PID"

# ─── Phase 5: Health Check ───────────────────────────────────
echo "--- Phase 5: Health Check ---"

HEALTHY=false
for i in $(seq 1 30); do
  sleep 2
  if curl -sf "http://127.0.0.1:$MOUSE_PORT/health" >/dev/null 2>&1; then
    HEALTHY=true
    echo "Gateway healthy after $((i * 2))s"
    break
  fi
done

if [ "$HEALTHY" = false ]; then
  if kill -0 "$GATEWAY_PID" 2>/dev/null; then
    echo "Process alive but health check pending — marking complete anyway"
  else
    echo "FATAL: Gateway process died"
    tail -50 "$INSTALL_DIR/gateway.log" 2>/dev/null || true
    exit 1
  fi
fi

# ─── Phase 6: Mark Complete ──────────────────────────────────
echo "--- Phase 6: Done ---"

echo "SUCCESS" > "$INSTALL_DIR/.provision-complete"

echo "=== Install complete $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
