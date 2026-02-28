# Mouse Platform - Demo Guide

## Quick Start Demo

This demo creates a test customer "Clean Eats", sets up their King Mouse AI assistant, deploys 2 AI employees, and shows them working on VMs.

### Prerequisites

```bash
# Ensure all services are running
cd mouse-platform
npm run dev          # Frontend
cd api-gateway && uvicorn main:app --reload  # API
```

### Running the Demo

```bash
# Run the demo script
python3 demo/run-demo.py
```

### What Happens

1. **Creates Test Customer**
   - Company: "Clean Eats"
   - Contact: demo@cleaneats.com
   - Plan: Growth ($2,997/mo)

2. **Sets Up King Mouse**
   - Creates Telegram bot
   - Generates QR code
   - Configures AI personality

3. **Deploys AI Employees**
   - Employee 1: "Web Developer" (Builds website)
   - Employee 2: "Social Media Manager" (Creates content)

4. **Shows Live Work**
   - Opens customer dashboard
   - Displays VM screenshots
   - Shows task progress

### Manual Demo Steps

If you prefer to run manually:

```bash
# Step 1: Create customer
curl -X POST http://localhost:8000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Clean Eats",
    "email": "demo@cleaneats.com",
    "plan": "growth"
  }'

# Step 2: Get King Mouse QR
curl http://localhost:8000/api/v1/customers/<id>/king-mouse

# Step 3: Send message
curl -X POST http://localhost:8000/api/v1/customers/<id>/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I need a website built"}'

# Step 4: Watch VMs
curl http://localhost:8000/api/v1/customers/<id>/vms

# Step 5: Get screenshot
curl http://localhost:8000/api/v1/customers/<id>/vms/<vm-id>/screenshot
```

### Demo Data

The demo creates realistic data:
- Clean Eats = Healthy meal prep company
- Website = Shopify store with menu, ordering, about page
- Social Media = Instagram posts, stories, engagement

### Expected Output

```
🎯 Mouse Platform Demo
═══════════════════════════════════

✅ Customer Created: Clean Eats (ID: cst_123)
✅ King Mouse Active: @CleanEatsKingBot
✅ QR Code: https://api.mouseplatform.com/qr/cst_123

📱 Scan QR to chat with King Mouse

🤖 Deploying AI Employees...
   ├─ Web Developer (web-dev-001) - VM starting...
   └─ Social Media Manager (social-001) - VM starting...

✅ VMs Running!
   ├─ web-dev-001: https://orgo-xxx.orgo.dev
   └─ social-001: https://orgo-yyy.orgo.dev

🌐 Dashboard: http://localhost:3000/portal?id=cst_123

💬 Try sending: "I need a website for my meal prep business"
```

### Screenshots

The demo captures screenshots every 3 seconds showing:
- VS Code with website code
- Terminal with build output
- Browser testing the site
- File manager with assets

### Cleanup

```bash
# Remove demo data
python3 demo/cleanup-demo.py

# Or manually:
curl -X DELETE http://localhost:8000/api/v1/demo/cleanup
```

## Video Walkthrough

Record a demo session:

```bash
# Start recording
python3 demo/record-demo.py --output demo-video.mp4

# This will:
# 1. Run through all demo steps
# 2. Capture VM screens
# 3. Record dashboard interactions
# 4. Generate summary video
```
