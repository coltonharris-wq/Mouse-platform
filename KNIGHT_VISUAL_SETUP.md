# 🐭 Knight Army - Visual Streaming Setup

## ✅ What's Working NOW

All **8 Knight VMs** are running with Firefox and ready for visual work:

| Knight | VNC URL | Status |
|--------|---------|--------|
| Knight 1 | https://orgo-computer-puxot5i8.orgo.dev | 🟢 Running |
| Knight 2 | https://orgo-computer-p5uod1ze.orgo.dev | 🟢 Running |
| Knight 3 | https://orgo-computer-p328rz68.orgo.dev | 🟢 Running |
| Knight 4 | https://orgo-6c9101fa-c983-4fbb-b757-4f0fa91b2ece.orgo.dev | 🟢 Running |
| Knight 5 | https://orgo-6e4627e5-79af-4ca1-a98e-154142058708.orgo.dev | 🟢 Running |
| Knight 6 | https://orgo-43a1b334-91e9-4a9b-951f-2b8e67b35c1e.orgo.dev | 🟢 Running |
| Knight 7 | https://orgo-3d54d948-fdbe-4e9f-8c1a-cdd24a5e4fed.orgo.dev | 🟢 Running |
| Knight 8 | https://orgo-f99b97ac-93c9-4620-b848-b8bacb4b823a.orgo.dev | 🟢 Running |

## 🎬 How to Watch (Like the YouTube Video!)

### Option 1: Command Center Dashboard (RECOMMENDED)
Open this in your browser for a **control room view** of all 8 knights:
```
http://localhost:8765/knight-command-center.html
```

This shows:
- All 8 knights in a grid layout
- Live VNC preview in each frame
- Direct links to open full VNC
- Quick links to claude.ai for each knight

### Option 2: Individual Knight VNC
Click any VNC URL above to open that knight in full screen. You can:
- See everything the knight is doing in real-time
- Interact if needed (mouse, keyboard)
- Open terminal with `Ctrl+Alt+T`
- Open browser and navigate to claude.ai

### Option 3: Open in Browser Tabs
Open all 8 knights in separate browser tabs and tile them:
```bash
open https://orgo-computer-puxot5i8.orgo.dev
open https://orgo-computer-p5uod1ze.orgo.dev
open https://orgo-computer-p328rz68.orgo.dev
open https://orgo-6c9101fa-c983-4fbb-b757-4f0fa91b2ece.orgo.dev
open https://orgo-6e4627e5-79af-4ca1-a98e-154142058708.orgo.dev
open https://orgo-43a1b334-91e9-4a9b-951f-2b8e67b35c1e.orgo.dev
open https://orgo-3d54d948-fdbe-4e9f-8c1a-cdd24a5e4fed.orgo.dev
open https://orgo-f99b97ac-93c9-4620-b848-b8bacb4b823a.orgo.dev
```

## 🛠 What's Installed on Each Knight

- ✅ Firefox (with claude.ai ready)
- ✅ Xvfb (virtual display)
- ✅ Python 3
- ✅ Node.js
- ✅ Terminal access

## 🎯 Making Knights Work Visually

### To have a knight work on code:

1. **Open the VNC** for that knight
2. **Open Terminal** (`Ctrl+Alt+T`)
3. **Option A - Claude.ai in Browser:**
   - Firefox is already open
   - Navigate to claude.ai
   - Start coding visually!

4. **Option B - VS Code: Server:**
   ```bash
   # In the knight's terminal
   npx code-server --bind-addr 0.0.0.0:8080
   ```
   Then open `http://<knight-ip>:8080` in browser

5. **Option C - Install Claude Code:**
   ```bash
   # In the knight's terminal
   npm install -g @anthropic-ai/claude-code
   claude
   ```

## 📸 Screenshot Streaming

The screenshot streamer is running in the background:
- PID: check `cat /tmp/knight_streamer.pid`
- Logs: `tail -f /tmp/knight_streamer.log`
- Gallery: http://localhost:8765/knight_stream_gallery.html

Note: The screenshot API has some issues (404 errors), but VNC streaming works perfectly!

## 🎥 Recording/Streaming Setup

For a true "YouTube video" experience:

1. **Open the Command Center** on a secondary monitor
2. **Use OBS or QuickTime** to record your screen
3. **Narrate** what each knight is doing
4. **Switch between** knights using the VNC links

## 🔧 Controls

### HTTP Server (serves dashboard)
- Running on port 8765
- PID: `cat /tmp/knight_server.pid`
- Stop: `kill $(cat /tmp/knight_server.pid)`

### Streamer (takes periodic screenshots)
- Running in background
- PID: `cat /tmp/knight_streamer.pid`
- Stop: `kill $(cat /tmp/knight_streamer.pid)`

## 📁 Files Created

- `knight-command-center.html` - Dashboard with all 8 knights
- `knight_streamer.py` - Screenshot capture script
- `setup_visual_knights.sh` - Setup script for Firefox on all knights
- `/tmp/knight-streams/` - Screenshot storage

## 🚀 Quick Commands

```bash
# Open dashboard
open http://localhost:8765/knight-command-center.html

# Check streamer status
ps aux | grep knight_streamer

# View all knights in separate tabs
for url in https://orgo-computer-puxot5i8.orgo.dev https://orgo-computer-p5uod1ze.orgo.dev https://orgo-computer-p328rz68.orgo.dev https://orgo-6c9101fa-c983-4fbb-b757-4f0fa91b2ece.orgo.dev https://orgo-6e4627e5-79af-4ca1-a98e-154142058708.orgo.dev https://orgo-43a1b334-91e9-4a9b-951f-2b8e67b35c1e.orgo.dev https://orgo-3d54d948-fdbe-4e9f-8c1a-cdd24a5e4fed.orgo.dev https://orgo-f99b97ac-93c9-4620-b848-b8bacb4b823a.orgo.dev; do
  open "$url"
done
```

## 🎉 Summary

**YES - You can now watch knights work live!** 

Just like the YouTube video showing multiple AI agents coding, you now have:
- ✅ 8 VMs running (knights 1-8)
- ✅ Firefox installed on each
- ✅ VNC access for live viewing
- ✅ Command center dashboard
- ✅ All knights ready to work on claude.ai

**Open http://localhost:8765/knight-command-center.html and enjoy the show! 🍿**
