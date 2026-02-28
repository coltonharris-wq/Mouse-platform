#!/bin/bash
# Setup Firefox on all knights with claude.ai

export ORGO_API_KEY=$(cat ~/.openclaw/openclaw.json | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['skills']['entries']['orgo']['apiKey'])")
export ORGO_DIR="/Users/jewelsharris/.openclaw/skills/orgo"

cd "$ORGO_DIR"

# Correct Knight VM IDs
KNIGHTS=(
  "56908797-2d99-4efa-bfcf-dacf91ad6260:knight-1"
  "4ce12f0a-f75f-4421-b360-68ef3ce68e31:knight-2"
  "50f1f1fa-bd76-43c7-8c5b-83d3505ed8af:knight-3"
  "6c9101fa-c983-4fbb-b757-4f0fa91b2ece:knight-4"
  "6e4627e5-79af-4ca1-a98e-154142058708:knight-5"
  "43a1b334-91e9-4a9b-951f-2b8e67b35c1e:knight-6"
  "3d54d948-fdbe-4e9f-8c1a-cdd24a5e4fed:knight-7"
  "f99b97ac-93c9-4620-b848-b8bacb4b823a:knight-8"
)

echo "=== Setting up Visual Knights ==="
echo ""

for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  echo "Setting up $name ($id)..."
  
  # Install Firefox and Xvfb
  echo "  - Installing Firefox..."
  python3 scripts/orgo.py bash --id "$id" --command "apt-get update > /dev/null 2>&1 && apt-get install -y firefox-esr xvfb > /dev/null 2>&1" 2>&1 | tail -1 &
done
wait
echo "Installation complete!"
echo ""

# Start Xvfb and Firefox on each knight
for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  echo "Starting Firefox on $name..."
  
  # Start Xvfb
  python3 scripts/orgo.py bash --id "$id" --command "export DISPLAY=:1 && Xvfb :1 -screen 0 1920x1080x24 &" 2>&1 > /dev/null &
  
  # Start Firefox with claude.ai
  python3 scripts/orgo.py bash --id "$id" --command "export DISPLAY=:1 && firefox --width=1920 --height=1080 https://claude.ai &" 2>&1 > /dev/null &
done

echo ""
echo "=== All Knights Visual Ready! ==="
echo ""
echo "Open knight-command-center.html in your browser to watch all 8 knights!"
echo ""
echo "Direct VNC URLs:"
echo "  Knight 1: https://orgo-computer-puxot5i8.orgo.dev"
echo "  Knight 2: https://orgo-computer-p5uod1ze.orgo.dev"
echo "  Knight 3: https://orgo-computer-p328rz68.orgo.dev"
echo "  Knight 4: https://orgo-6c9101fa-c983-4fbb-b757-4f0fa91b2ece.orgo.dev"
echo "  Knight 5: https://orgo-6e4627e5-79af-4ca1-a98e-154142058708.orgo.dev"
echo "  Knight 6: https://orgo-43a1b334-91e9-4a9b-951f-2b8e67b35c1e.orgo.dev"
echo "  Knight 7: https://orgo-3d54d948-fdbe-4e9f-8c1a-cdd24a5e4fed.orgo.dev"
echo "  Knight 8: https://orgo-f99b97ac-93c9-4620-b848-b8bacb4b823a.orgo.dev"
