#!/bin/bash
# One-Liner OpenClaw Install — Zero to Dashboard in 60 seconds
# Usage: curl -fsSL https://install.mouse.is | bash

set -e
export DEBIAN_FRONTEND=noninteractive

# ── CONFIG (auto-detected or defaults) ──
KIMI_API_KEY="${KIMI_API_KEY:-sk-fNNLY6aNRewMuDTKqvoIUPLcPyNJ9VEbDYNRuhgKdDjiT9SP}"
BUSINESS_NAME="${BUSINESS_NAME:-My Business}"
OWNER_NAME="${OWNER_NAME:-Owner}"

# ── INSTALL ──
echo "🐭 Installing King Mouse..."

# System deps (silent)
apt-get update -qq >/dev/null 2>&1
apt-get install -y -qq curl jq xvfb chromium-browser git 2>/dev/null | tail -1

# Node.js 22 (silent)
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - &>/dev/null
  apt-get install -y -qq nodejs 2>/dev/null | tail -1
fi

# OpenClaw (official, silent)
if ! command -v openclaw &>/dev/null; then
  curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard &>/dev/null
fi

export PATH="$HOME/.openclaw/bin:$PATH"

# ── CONFIGURE ──
mkdir -p ~/.openclaw/workspace
mkdir -p ~/.openclaw/workspace/skills/king-mouse
mkdir -p ~/.openclaw/workspace/memory

# openclaw.json
cat > ~/.openclaw/openclaw.json << EOF
{
  "env": {
    "MOONSHOT_API_KEY": "$KIMI_API_KEY",
    "GROQ_API_KEY": "${GROQ_API_KEY:-}"
  },
  "models": {
    "mode": "merge",
    "providers": {
      "moonshot": {
        "baseUrl": "https://api.moonshot.ai/v1",
        "apiKey": "\${MOONSHOT_API_KEY}",
        "models": [{"id": "kimi-k2.5", "name": "Kimi K2.5", "contextWindow": 256000}]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {"primary": "moonshot/kimi-k2.5"},
      "workspace": "$HOME/.openclaw/workspace",
      "heartbeat": {"every": "30m"}
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "auth": {"mode": "token", "token": "$(openssl rand -hex 16)"}
  },
  "skills": {
    "entries": {
      "browser": {"enabled": true},
      "mem0": {"enabled": true},
      "desktop-control": {"enabled": true}
    }
  }
}
EOF

# SOUL.md
cat > ~/.openclaw/workspace/SOUL.md << 'EOF'
# SOUL.md — King Mouse

**I am King Mouse, an AI operations manager for $BUSINESS_NAME.**

## Identity
- I run the business backend so the owner focuses on the work
- I handle calls, scheduling, follow-ups, reviews, invoices
- I only escalate money opportunities and emergencies
- I get smarter every day via the Owner Logic Engine™

## Autonomy
- **Do first, tell later** — Handle routine tasks, report outcomes
- **Never ask permission for:** scheduling, follow-ups, review responses
- **Always escalate:** payments >$500, legal issues, angry customers

## Communication Style
- Concise, professional, human
- Text the owner with context: "Booked [name] for [service] at [time]"
- Never spam with "should I" — just do it
EOF

# USER.md
cat > ~/.openclaw/workspace/USER.md << EOF
# USER.md

- **Name:** $OWNER_NAME
- **Business:** $BUSINESS_NAME
- **Timezone:** America/New_York
- **Style:** Direct, fast, no fluff
- **Expectation:** I handle the admin, they handle the work
EOF

# HEARTBEAT.md
cat > ~/.openclaw/workspace/HEARTBEAT.md << 'EOF'
# HEARTBEAT.md

Every 30 minutes:
- Check email for urgent items
- Check calendar for upcoming appointments
- Check for missed calls/messages
- Follow up on pending estimates (>48hrs)
- Respond to new reviews

Report only if something needs attention.
EOF

# King Mouse skill
cat > ~/.openclaw/workspace/skills/king-mouse/SKILL.md << 'EOF'
---
name: king-mouse
description: Core business operations — calls, scheduling, follow-ups, reviews
---

## Phone Calls
- Answer: "Thanks for calling $BUSINESS_NAME, this is King Mouse. How can I help?"
- Take info, check calendar, book if available
- Text owner: "[Name] booked for [service] at [time]"

## Estimates
- Follow up after 48hrs: "Checking on your estimate for [service]"
- No response → email next day
- Log all leads

## Reviews
- 4-5 stars: Personal thank you
- 1-3 stars: Apologize, offer fix, ask to call
- Never argue

## Daily 7 AM Brief
"Morning boss. [X] appointments today. [Y] new leads. [Z] follow-ups needed."
EOF

# ── START ──
# Display server in background
export DISPLAY=:99
(Xvfb :99 -screen 0 1920x1080x24 &) &>/dev/null
sleep 1

# Start gateway
openclaw start --daemon &>/dev/null
sleep 2

# Get token
TOKEN=$(cat ~/.openclaw/openclaw.json | jq -r '.gateway.auth.token')

# ── DONE ──
echo ""
echo "✅ King Mouse is LIVE"
echo ""
echo "📊 Dashboard: http://$(hostname -I | awk '{print $1}'):18789"
echo "🔑 Token: $TOKEN"
echo ""
echo "💬 Test it: curl -X POST http://localhost:18789/api/chat \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\":\"What is my business name?\"}'"
echo ""
echo "🐭 Ready to work."
