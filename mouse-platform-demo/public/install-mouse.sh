#!/bin/bash
# Mouse AI Agent Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/coltonharris-wq/mouse-platform-demo/main/public/install-mouse.sh | bash -s -- [flags]
# Fallback: https://raw.githubusercontent.com/coltonharris-wq/mouse/main/install.sh
set -e

# Parse arguments
SILENT=false
PRESET=""
API_KEY=""
PORT=3100
BIND="127.0.0.1"
USER_ID=""
AUTO_SKILLS=false
INSTALL_DAEMON=false
CUSTOMER_ID=""
WEBHOOK_URL=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --silent) SILENT=true; shift ;;
    --preset=*) PRESET="${1#*=}"; shift ;;
    --api-key=*) API_KEY="${1#*=}"; shift ;;
    --port=*) PORT="${1#*=}"; shift ;;
    --bind=*) BIND="${1#*=}"; shift ;;
    --user-id=*) USER_ID="${1#*=}"; shift ;;
    --customer-id=*) CUSTOMER_ID="${1#*=}"; shift ;;
    --webhook-url=*) WEBHOOK_URL="${1#*=}"; shift ;;
    --auto-skills) AUTO_SKILLS=true; shift ;;
    --install-daemon) INSTALL_DAEMON=true; shift ;;
    *) shift ;;
  esac
done

echo "🐭 Installing Mouse AI Agent..."

# Install Node.js 22 if not present
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 22 ]]; then
  echo "📦 Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm
fi

# Clone and build Mouse
echo "📥 Cloning Mouse..."
if [ -d "/opt/king-mouse" ]; then
  cd /opt/king-mouse && git pull
else
  mkdir -p /opt/king-mouse
  git clone https://github.com/coltonharris-wq/mouse.git /opt/king-mouse
  cd /opt/king-mouse
fi

echo "🔨 Building Mouse..."
pnpm install
pnpm build
pnpm link --global

# Run onboarding
echo "🚀 Running Mouse onboarding..."
ONBOARD_CMD="mouse onboard"
[ "$SILENT" = true ] && ONBOARD_CMD="$ONBOARD_CMD --silent"
[ -n "$PRESET" ] && ONBOARD_CMD="$ONBOARD_CMD --preset=$PRESET"
[ -n "$API_KEY" ] && ONBOARD_CMD="$ONBOARD_CMD --api-key=$API_KEY"
ONBOARD_CMD="$ONBOARD_CMD --port=$PORT --bind=$BIND"
[ -n "$USER_ID" ] && ONBOARD_CMD="$ONBOARD_CMD --user-id=$USER_ID"
[ "$AUTO_SKILLS" = true ] && ONBOARD_CMD="$ONBOARD_CMD --auto-skills"

eval $ONBOARD_CMD

# Install daemon
if [ "$INSTALL_DAEMON" = true ]; then
  echo "🔧 Installing Mouse as systemd service..."
  cat > /etc/systemd/system/king-mouse.service << SVCEOF
[Unit]
Description=King Mouse AI Agent
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/king-mouse
ExecStart=/usr/local/bin/mouse serve --port=$PORT --bind=$BIND
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SVCEOF

  systemctl daemon-reload
  systemctl enable king-mouse
  systemctl start king-mouse
fi

# Write status
mkdir -p /root/.mouse
echo "INSTALLED" > /root/.mouse/.status
echo "🐭👑 Mouse installed successfully!"

# Notify webhook if provided
if [ -n "$WEBHOOK_URL" ] && [ -n "$CUSTOMER_ID" ]; then
  curl -fsSL -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"customerId\": \"$CUSTOMER_ID\", \"status\": \"ready\"}" \
    2>/dev/null || true
fi

exit 0
