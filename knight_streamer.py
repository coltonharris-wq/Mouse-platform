#!/usr/bin/env python3
"""
Knight Visual Streamer - Takes periodic screenshots of all knights
Saves to disk for review and creates a live gallery
"""

import os
import json
import time
import asyncio
import aiohttp
from datetime import datetime
from pathlib import Path

# Load API key
with open(os.path.expanduser("~/.openclaw/openclaw.json")) as f:
    config = json.load(f)
    ORGO_API_KEY = config['skills']['entries']['orgo']['apiKey']

ORGO_BASE_URL = "https://api.orgo.ai"

# Knight configurations
KNIGHTS = [
    {"id": "56908797-2d99-4efa-bfcf-dacf91ad6260", "name": "knight-1", "vnc": "https://orgo-computer-puxot5i8.orgo.dev"},
    {"id": "4ce12f0a-f75f-4421-b360-68ef3ce68e31", "name": "knight-2", "vnc": "https://orgo-computer-p5uod1ze.orgo.dev"},
    {"id": "50f1f1fa-bd76-43c7-8c5b-83d3505ed8af", "name": "knight-3", "vnc": "https://orgo-computer-p328rz68.orgo.dev"},
    {"id": "6c9101fa-c983-4fbb-b757-4f0fa91b2ece", "name": "knight-4", "vnc": "https://orgo-6c9101fa-c983-4fbb-b757-4f0fa91b2ece.orgo.dev"},
    {"id": "6e4627e5-79af-4ca1-a98e-154142058708", "name": "knight-5", "vnc": "https://orgo-6e4627e5-79af-4ca1-a98e-154142058708.orgo.dev"},
    {"id": "43a1b334-91e9-4a9b-951f-2b8e67b35c1e", "name": "knight-6", "vnc": "https://orgo-43a1b334-91e9-4a9b-951f-2b8e67b35c1e.orgo.dev"},
    {"id": "3d54d948-fdbe-4e9f-8c1a-cdd24a5e4fed", "name": "knight-7", "vnc": "https://orgo-3d54d948-fdbe-4e9f-8c1a-cdd24a5e4fed.orgo.dev"},
    {"id": "f99b97ac-93c9-4620-b848-b8bacb4b823a", "name": "knight-8", "vnc": "https://orgo-f99b97ac-93c9-4620-b848-b8bacb4b823a.orgo.dev"},
]

OUTPUT_DIR = Path("/tmp/knight-streams")
OUTPUT_DIR.mkdir(exist_ok=True)

class KnightStreamer:
    def __init__(self):
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers={
            "Authorization": f"Bearer {ORGO_API_KEY}"
        })
        return self
    
    async def __aexit__(self, *args):
        await self.session.close()
    
    async def get_screenshot(self, knight_id: str) -> bytes:
        """Get screenshot from a knight VM"""
        try:
            async with self.session.get(
                f"{ORGO_BASE_URL}/v1/computers/{knight_id}/screenshot"
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    import base64
                    return base64.b64decode(data.get("screenshot_base64", ""))
                else:
                    print(f"  Error {resp.status} for {knight_id}")
                    return None
        except Exception as e:
            print(f"  Exception for {knight_id}: {e}")
            return None
    
    async def capture_knight(self, knight: dict):
        """Capture screenshot for a single knight"""
        name = knight["name"]
        knight_id = knight["id"]
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{timestamp}.png"
        filepath = OUTPUT_DIR / filename
        
        screenshot = await self.get_screenshot(knight_id)
        if screenshot:
            with open(filepath, "wb") as f:
                f.write(screenshot)
            print(f"  ✓ {name}: {filename}")
            return True
        else:
            print(f"  ✗ {name}: Failed")
            return False
    
    async def capture_all(self):
        """Capture all knights in parallel"""
        print(f"\n🎬 Capturing at {datetime.now().strftime('%H:%M:%S')}...")
        tasks = [self.capture_knight(k) for k in KNIGHTS]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        success = sum(1 for r in results if r is True)
        print(f"  Captured {success}/{len(KNIGHTS)} knights")
    
    def create_gallery_html(self):
        """Create an HTML gallery of latest screenshots"""
        
        # Get latest screenshot for each knight
        latest = {}
        for knight in KNIGHTS:
            files = sorted(OUTPUT_DIR.glob(f"{knight['name']}_*.png"), reverse=True)
            if files:
                latest[knight['name']] = files[0]
        
        html = """<!DOCTYPE html>
<html>
<head>
    <title>🐭 Knight Stream Gallery</title>
    <style>
        body { font-family: system-ui; background: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; }
        h1 { text-align: center; color: #58a6ff; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1600px; margin: 0 auto; }
        .knight { background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; }
        .knight-header { background: #21262d; padding: 10px; font-weight: bold; }
        .knight img { width: 100%; height: auto; display: block; }
        .timestamp { padding: 10px; color: #8b949e; font-size: 12px; text-align: center; }
        .refresh { text-align: center; margin: 20px; }
        .refresh button { background: #238636; color: white; border: none; padding: 10px 30px; border-radius: 6px; cursor: pointer; font-size: 16px; }
        .refresh button:hover { background: #2ea043; }
    </style>
</head>
<body>
    <h1>🐭 Knight Stream Gallery</h1>
    <div class="refresh">
        <button onclick="location.reload()">🔄 Refresh Gallery</button>
        <span style="margin-left: 20px; color: #8b949e;">Auto-refresh every 10 seconds</span>
    </div>
    <div class="grid">
"""
        
        for knight in KNIGHTS:
            name = knight['name']
            if name in latest:
                img_path = latest[name]
                # Read and encode image
                import base64
                with open(img_path, "rb") as f:
                    img_data = base64.b64encode(f.read()).decode()
                timestamp = img_path.stem.split('_', 1)[1].replace('_', ' ')
                html += f"""
        <div class="knight">
            <div class="knight-header">⚔️ {name.replace('-', ' ').title()}</div>
            <img src="data:image/png;base64,{img_data}" alt="{name}">
            <div class="timestamp">Captured: {timestamp}</div>
        </div>
"""
            else:
                html += f"""
        <div class="knight">
            <div class="knight-header">⚔️ {name.replace('-', ' ').title()}</div>
            <div style="padding: 40px; text-align: center; color: #8b949e;">No screenshot yet</div>
        </div>
"""
        
        html += """
    </div>
    <script>
        setTimeout(() => location.reload(), 10000);
    </script>
</body>
</html>
"""
        
        gallery_path = OUTPUT_DIR / "gallery.html"
        with open(gallery_path, "w") as f:
            f.write(html)
        return gallery_path

async def main():
    print("🐭 Knight Visual Streamer")
    print("=" * 50)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Knights: {len(KNIGHTS)}")
    print("=" * 50)
    
    async with KnightStreamer() as streamer:
        # Initial capture
        await streamer.capture_all()
        
        # Create initial gallery
        gallery_path = streamer.create_gallery_html()
        print(f"\n📸 Gallery created: {gallery_path}")
        
        # Continuous capture loop
        print("\n🔄 Starting continuous capture (every 30 seconds)...")
        print("   Press Ctrl+C to stop\n")
        
        try:
            while True:
                await asyncio.sleep(30)
                await streamer.capture_all()
                streamer.create_gallery_html()
        except KeyboardInterrupt:
            print("\n\n✓ Streamer stopped")
            print(f"Screenshots saved to: {OUTPUT_DIR}")
            print(f"Gallery: {gallery_path}")

if __name__ == "__main__":
    asyncio.run(main())
