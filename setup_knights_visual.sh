#!/bin/bash
# Knight Visual Setup Script
# Makes all knight VMs visual and streamable

export ORGO_API_KEY=$(cat ~/.openclaw/openclaw.json | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['skills']['entries']['orgo']['apiKey'])")
export ORGO_DIR="/Users/jewelsharris/.openclaw/skills/orgo"

# Knight VM IDs
KNIGHTS=(
  "aa1f8a3b-95ef-4e8a-92a0-92f60eb25eb8:knight-1"
  "2af94998-7f9f-4173-99d4-e9f328af7a6d:knight-2"
  "a6657bfe-52f5-48e6-955b-0b6a53dfc270:knight-3"
  "a992e468-52e8-448c-9258-a29c3f1fa5fc:knight-4"
  "899188f8-3274-4df3-a013-82ee7fbfa8e5:knight-5"
  "47ca0da0-74f7-475c-946c-9cb96e20e240:knight-6"
  "3d54d948-fdbe-4e9f-8c1a-cdd24a5e4fed:knight-7"
  "f99b97ac-93c9-4620-b848-b8bacb4b823a:knight-8"
)

echo "=== Knight Visual Setup ==="
echo "Setting up ${#KNIGHTS[@]} knights for visual streaming..."
echo ""

# Function to run orgo command
orgo() {
  python3 "$ORGO_DIR/scripts/orgo.py" "$@"
}

# Take screenshot of a knight
screenshot() {
  local id=$1
  local name=$2
  local output="/tmp/knight-${name}-$(date +%s).png"
  orgo screenshot --id "$id" --output "$output" 2>/dev/null
  echo "$output"
}

# Execute bash on knight
exec_bash() {
  local id=$1
  local cmd=$2
  orgo bash --id "$id" --command "$cmd" 2>/dev/null
}

# Execute python on knight  
exec_python() {
  local id=$1
  local code=$2
  orgo python --id "$id" --code "$code" 2>/dev/null
}

echo "1. Checking current VM states..."
for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  echo "   - $name: $id"
done

echo ""
echo "2. Taking initial screenshots..."
for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  echo "   Screenshotting $name..."
  screenshot "$id" "$name" > /dev/null &
done
wait
echo "   Screenshots saved to /tmp/"

echo ""
echo "3. Installing Firefox on all knights..."
for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  echo "   Installing Firefox on $name..."
  exec_bash "$id" "apt-get update && apt-get install -y firefox-esr xvfb" > /dev/null 2>&1 &
done
wait
echo "   Firefox installation complete!"

echo ""
echo "4. Launching Firefox on all knights..."
for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  echo "   Starting Firefox on $name..."
  # Start Firefox in background with display
  exec_bash "$id" "export DISPLAY=:1 && Xvfb :1 -screen 0 1920x1080x24 &" > /dev/null 2>&1
  exec_bash "$id" "export DISPLAY=:1 && firefox --width=1920 --height=1080 &" > /dev/null 2>&1 &
done
echo "   Firefox launched!"

echo ""
echo "5. Navigating to claude.ai on all knights..."
sleep 3
for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  echo "   Opening claude.ai on $name..."
  exec_bash "$id" "export DISPLAY=:1 && firefox claude.ai &" > /dev/null 2>&1 &
done
echo "   claude.ai opened!"

echo ""
echo "6. Setting up screenshot streaming..."
mkdir -p /tmp/knight-streams

cat > /tmp/knight-stream.sh << 'STREAMSCRIPT'
#!/bin/bash
export ORGO_API_KEY=$(cat ~/.openclaw/openclaw.json | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['skills']['entries']['orgo']['apiKey'])")
export ORGO_DIR="/Users/jewelsharris/.openclaw/skills/orgo"

KNIGHT_ID=$1
KNIGHT_NAME=$2
OUTPUT_DIR=$3

while true; do
  timestamp=$(date +%Y%m%d_%H%M%S)
  python3 "$ORGO_DIR/scripts/orgo.py" screenshot --id "$KNIGHT_ID" --output "$OUTPUT_DIR/${KNIGHT_NAME}_${timestamp}.png" 2>/dev/null
  sleep 5
done
STREAMSCRIPT

chmod +x /tmp/knight-stream.sh

for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  echo "   Starting stream capture for $name..."
  /tmp/knight-stream.sh "$id" "$name" "/tmp/knight-streams" > /dev/null 2>&1 &
  echo $! > "/tmp/knight-stream-${name}.pid"
done

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "VNC Access URLs:"
for knight in "${KNIGHTS[@]}"; do
  IFS=':' read -r id name <<< "$knight"
  url="https://orgo-${id}.orgo.dev"
  echo "  $name: $url"
done
echo ""
echo "Screenshot streams: /tmp/knight-streams/"
echo "Stream PIDs saved to /tmp/knight-stream-*.pid"
echo ""
echo "To stop streaming: kill \$(cat /tmp/knight-stream-*.pid)"
