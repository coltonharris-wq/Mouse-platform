#!/bin/bash
# Mouse Platform — King Mouse VM Setup
# Called by Orgo VM provisioning with config payload
# Usage: Called internally by VM provisioning API with base64 config arg

set -e

CONFIG_B64="${1:-}"
INSTALL_DIR="/opt/mouse"

echo "[Mouse] Setting up King Mouse on VM..."

# 1. Create working directories
mkdir -p $INSTALL_DIR/{config,logs,models}

# 2. Install system dependencies
apt-get update -qq
apt-get install -y -qq python3 python3-pip ffmpeg git curl

# 3. Install OpenAI Whisper locally (FREE speech-to-text for voice chat + receptionist)
pip3 install -q openai-whisper
python3 -c "import whisper; whisper.load_model('base', download_root='$INSTALL_DIR/models')"
echo "[Mouse] Whisper STT installed locally"

# 4. Install King Mouse fork (Colton's OpenClaw fork with Mouse branding)
curl -fsSL https://raw.githubusercontent.com/coltonharris-wq/mouse/main/scripts/install.sh | bash -s -- --silent --preset=king-mouse
echo "[Mouse] Mouse fork installed"

# 5. Write config files from base64 payload
if [ -n "$CONFIG_B64" ]; then
  echo "$CONFIG_B64" | base64 -d > $INSTALL_DIR/config/config.json

  # Extract and write SOUL.md, USER.md, agents.md from config payload
  python3 -c "
import json, sys
config = json.load(open('$INSTALL_DIR/config/config.json'))

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

# 6. Create Whisper STT service (listens on port 18790 for voice chat)
cat > $INSTALL_DIR/whisper_server.py << 'PYEOF'
from http.server import HTTPServer, BaseHTTPRequestHandler
import whisper
import tempfile
import json
import os

model = whisper.load_model("base", download_root="/opt/mouse/models")

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        audio_data = self.rfile.read(length)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_data)
            f.flush()
            result = model.transcribe(f.name)
            os.unlink(f.name)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"text": result["text"]}).encode())
    def log_message(self, format, *args): pass

HTTPServer(("0.0.0.0", 18790), Handler).serve_forever()
PYEOF

# 7. Create Whisper systemd service
cat > /etc/systemd/system/whisper.service << EOF
[Unit]
Description=Whisper STT Service (Voice Chat)
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 $INSTALL_DIR/whisper_server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 8. Start services
systemctl daemon-reload
systemctl enable whisper
systemctl start whisper

# 9. Start King Mouse gateway
mouse gateway start
echo "[Mouse] King Mouse gateway started"

# 10. Wait for health checks
for i in {1..30}; do
  if mouse gateway status 2>/dev/null | grep -q "running"; then
    echo "[Mouse] King Mouse is ready"
    echo "[Mouse] Whisper STT is ready on port 18790"
    exit 0
  fi
  sleep 2
done

echo "[Mouse] WARNING: Gateway may still be starting. Check with: mouse gateway status"
exit 0
