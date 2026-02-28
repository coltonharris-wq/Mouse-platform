#!/bin/bash
# Mouse Platform - Complete Deployment to VM
# This script packages and deploys the full Mouse Platform to the target VM

set -e

VM_ID="f99b97ac-93c9-4620-b848-b8bacb4b823a"
WORKSPACE_DIR="/Users/jewelsharris/.openclaw/workspace/mouse-platform"
DEPLOY_PACKAGE="/tmp/mouse-platform-deploy.tar.gz"

echo "=========================================="
echo "🐭 Mouse Platform - VM Deployment"
echo "=========================================="
echo "Target VM: $VM_ID"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# 1. Create Deployment Package
# ============================================
echo -e "${BLUE}[1/6]${NC} Creating deployment package..."

cd $WORKSPACE_DIR

# Create package with all necessary files
tar -czf $DEPLOY_PACKAGE \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='venv' \
    --exclude='.git' \
    api-gateway/ \
    frontend/ \
    supabase/ \
    demo/ \
    deploy/vm-setup.sh \
    README.md \
    ARCHITECTURE.md \
    2>/dev/null || true

PACKAGE_SIZE=$(du -h $DEPLOY_PACKAGE | cut -f1)
echo -e "${GREEN}✓${NC} Package created: $PACKAGE_SIZE"

# ============================================
# 2. Upload to VM
# ============================================
echo -e "${BLUE}[2/6]${NC} Uploading to VM..."

# Note: This would typically use the Orgo file upload API
# For now, we'll create instructions for manual upload
echo -e "${YELLOW}!${NC} To upload to VM $VM_ID:"
echo "   Option 1: Use Orgo CLI:"
echo "     python3 ~/.openclaw/skills/orgo/scripts/orgo.py file upload \\"
echo "       --computer-id $VM_ID \\"
echo "       --file-path $DEPLOY_PACKAGE"
echo ""
echo "   Option 2: Manual upload via VNC/SSH"
echo ""

# ============================================
# 3. Create Remote Setup Script
# ============================================
echo -e "${BLUE}[3/6]${NC} Creating remote setup instructions..."

cat > /tmp/remote-setup.sh << 'REMOTE_EOF'
#!/bin/bash
# Run this on the VM after uploading the package

set -e

echo "🚀 Setting up Mouse Platform on VM..."

# Extract package
cd /tmp
tar -xzf mouse-platform-deploy.tar.gz -C /opt/

# Run VM setup
chmod +x /opt/mouse-platform/deploy/vm-setup.sh
/opt/mouse-platform/deploy/vm-setup.sh

# Move code to proper locations
mkdir -p /opt/mouse-platform/api-gateway
mkdir -p /opt/mouse-platform/frontend
mkdir -p /opt/mouse-platform/supabase
mkdir -p /opt/mouse-platform/demo

cp -r /opt/api-gateway/* /opt/mouse-platform/api-gateway/ 2>/dev/null || true
cp -r /opt/frontend/* /opt/mouse-platform/frontend/ 2>/dev/null || true
cp -r /opt/supabase/* /opt/mouse-platform/supabase/ 2>/dev/null || true
cp -r /opt/demo/* /opt/mouse-platform/demo/ 2>/dev/null || true

# Install API dependencies
echo "📦 Installing API dependencies..."
cd /opt/mouse-platform/api-gateway
source venv/bin/activate
pip install -r requirements.txt

# Build frontend
echo "📦 Building frontend..."
cd /opt/mouse-platform/frontend
npm install
npm run build

# Set permissions
chown -R root:root /opt/mouse-platform
chmod -R 755 /opt/mouse-platform

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Configure .env file:"
echo "     nano /opt/mouse-platform/api-gateway/.env"
echo ""
echo "  2. Start services:"
echo "     systemctl start mouse-api"
echo "     systemctl start mouse-frontend"
echo "     systemctl start nginx"
echo ""
echo "  3. Check status:"
echo "     /opt/mouse-platform/monitor.sh"
echo ""
REMOTE_EOF

chmod +x /tmp/remote-setup.sh
cp /tmp/remote-setup.sh /tmp/mouse-platform-remote-setup.sh

echo -e "${GREEN}✓${NC} Remote setup script created: /tmp/mouse-platform-remote-setup.sh"

# ============================================
# 4. Create Environment File
# ============================================
echo -e "${BLUE}[4/6]${NC} Creating environment configuration..."

cat > /tmp/mouse-platform.env << 'ENV_EOF'
# ============================================
# Mouse Platform - Production Environment
# VM: f99b97ac-93c9-4620-b848-b8bacb4b823a
# ============================================

# Application
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0
FRONTEND_URL=http://localhost
ALLOWED_ORIGINS=http://localhost,http://localhost:3000

# Supabase (Update with your credentials)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Orgo (Update with your credentials)
ORGO_API_KEY=sk_live_your_orgo_key
ORGO_WORKSPACE_ID=your-workspace-id

# Stripe (Update with your credentials)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PLATFORM_FEE_PERCENT=12

# Telegram (Update with your credentials)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_SECRET=optional-webhook-secret

# AI Services (Update with your credentials)
MOONSHOT_API_KEY=your-moonshot-key
MOONSHOT_MODEL=kimi-k2.5

# Security (Generate strong secrets)
JWT_SECRET=change-this-to-a-32-char-minimum-secret
ADMIN_API_TOKEN=change-this-to-a-random-256-bit-token

# Logging
LOG_LEVEL=INFO
ENV_EOF

echo -e "${GREEN}✓${NC} Environment file created: /tmp/mouse-platform.env"

# ============================================
# 5. Create Quick Start Guide
# ============================================
echo -e "${BLUE}[5/6]${NC} Creating quick start guide..."

cat > /tmp/MOUSE_PLATFORM_DEPLOYMENT_GUIDE.md << 'GUIDE_EOF'
# Mouse Platform - Deployment Guide for VM

## VM Information
- **VM ID**: f99b97ac-93c9-4620-b848-b8bacb4b823a
- **VM Name**: knight-8
- **Target Directory**: /opt/mouse-platform

## Files to Upload

1. **Deployment Package**: `/tmp/mouse-platform-deploy.tar.gz`
   - Contains: api-gateway, frontend, supabase, demo, docs

2. **Setup Script**: `/tmp/mouse-platform-remote-setup.sh`
   - Run this on the VM to complete setup

3. **Environment File**: `/tmp/mouse-platform.env`
   - Configure with your actual API keys

## Deployment Steps

### Option 1: Orgo CLI (Recommended)

```bash
# Upload package
python3 ~/.openclaw/skills/orgo/scripts/orgo.py file upload \
  --computer-id f99b97ac-93c9-4620-b848-b8bacb4b823a \
  --file-path /tmp/mouse-platform-deploy.tar.gz

# Upload setup script
python3 ~/.openclaw/skills/orgo/scripts/orgo.py file upload \
  --computer-id f99b97ac-93c9-4620-b848-b8bacb4b823a \
  --file-path /tmp/mouse-platform-remote-setup.sh

# Upload environment template
python3 ~/.openclaw/skills/orgo/scripts/orgo.py file upload \
  --computer-id f99b97ac-93c9-4620-b848-b8bacb4b823a \
  --file-path /tmp/mouse-platform.env
```

### Option 2: Execute on VM

```bash
# Run setup script on VM
python3 ~/.openclaw/skills/orgo/scripts/orgo.py bash \
  --id f99b97ac-93c9-4620-b848-b8bacb4b823a \
  --command "cd /tmp && chmod +x mouse-platform-remote-setup.sh && ./mouse-platform-remote-setup.sh"
```

## Post-Deployment

### 1. Configure Environment

Edit `/opt/mouse-platform/api-gateway/.env` with your actual credentials:
- Supabase URL and keys
- Orgo API key and workspace ID
- Stripe keys
- Telegram bot token
- Moonshot API key

### 2. Start Services

```bash
systemctl start mouse-api
systemctl start mouse-frontend
systemctl start nginx
```

### 3. Verify Deployment

```bash
# Check all services
/opt/mouse-platform/monitor.sh

# Check API health
curl http://localhost/health

# Check logs
tail -f /var/log/mouse-platform/api.log
tail -f /var/log/mouse-platform/frontend.log
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Nginx | 80 | Reverse proxy |
| API Gateway | 8000 | FastAPI backend |
| Frontend | 3000 | Next.js app |
| Redis | 6379 | Caching & queues |

## Troubleshooting

### API Won't Start
```bash
# Check Python environment
cd /opt/mouse-platform/api-gateway
source venv/bin/activate
python -c "import main; print('OK')"

# Check logs
journalctl -u mouse-api -f
```

### Frontend Won't Start
```bash
# Check Node.js
node -v
npm -v

# Rebuild
cd /opt/mouse-platform/frontend
npm install
npm run build

# Check logs
journalctl -u mouse-frontend -f
```

### Database Connection Issues
```bash
# Test Supabase connection
cd /opt/mouse-platform/api-gateway
source venv/bin/activate
python -c "
from supabase_client import SupabaseClient
client = SupabaseClient()
print('Supabase connected')
"
```

## Features Included

✅ Full API Gateway (FastAPI)
✅ Next.js Frontend
✅ Supabase Integration
✅ Orgo VM Management
✅ Stripe Payments
✅ Telegram Bot
✅ AI Agents (King Mouse & Knights)
✅ Token System
✅ WebSocket Support
✅ Rate Limiting
✅ Caching Layer
✅ Monitoring & Logging

## Security

- JWT-based authentication
- RLS policies on database
- Rate limiting on API
- CORS configuration
- Input validation
- SQL injection protection
- XSS protection headers

## Support

For issues, check:
1. Service logs: `/var/log/mouse-platform/`
2. System status: `/opt/mouse-platform/monitor.sh`
3. Documentation: `/opt/mouse-platform/README.md`
GUIDE_EOF

echo -e "${GREEN}✓${NC} Quick start guide created: /tmp/MOUSE_PLATFORM_DEPLOYMENT_GUIDE.md"

# ============================================
# 6. Summary
# ============================================
echo -e "${BLUE}[6/6]${NC} Deployment package ready!"
echo ""
echo "=========================================="
echo "📦 Deployment Package Summary"
echo "=========================================="
echo ""
echo "Files Created:"
echo "  1. $DEPLOY_PACKAGE ($PACKAGE_SIZE)"
echo "  2. /tmp/mouse-platform-remote-setup.sh"
echo "  3. /tmp/mouse-platform.env"
echo "  4. /tmp/MOUSE_PLATFORM_DEPLOYMENT_GUIDE.md"
echo ""
echo "Next Steps:"
echo "  1. Upload files to VM using Orgo CLI"
echo "  2. Run remote setup script on VM"
echo "  3. Configure environment variables"
echo "  4. Start services"
echo ""
echo "Quick Command:"
echo "  python3 ~/.openclaw/skills/orgo/scripts/orgo.py bash \\"
echo "    --id $VM_ID \\"
echo "    --command \"cd /tmp && tar -xzf mouse-platform-deploy.tar.gz && chmod +x mouse-platform-remote-setup.sh && ./mouse-platform-remote-setup.sh\""
echo ""
echo "=========================================="
