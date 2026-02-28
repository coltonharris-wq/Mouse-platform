#!/bin/bash
# Mouse Platform - Full Deployment Script for VM
# Target VM: f99b97ac-93c9-4620-b848-b8bacb4b823a

set -e

echo "=========================================="
echo "🐭 Mouse Platform - Complete Deployment"
echo "=========================================="

# Configuration
VM_ID="f99b97ac-93c9-4620-b848-b8bacb4b823a"
DEPLOY_DIR="/opt/mouse-platform"
FRONTEND_PORT=3000
API_PORT=8000

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# 1. System Update & Dependencies
# ============================================
log_info "Step 1: Installing system dependencies..."

apt-get update -qq
apt-get install -y -qq \
    python3.11 \
    python3.11-venv \
    python3-pip \
    nodejs \
    npm \
    nginx \
    redis-server \
    postgresql-client \
    git \
    curl \
    wget \
    build-essential \
    libpq-dev \
    supervisor \
    certbot \
    python3-certbot-nginx \
    htop \
    vim \
    nano \
    unzip \
    > /dev/null 2>&1

log_success "System dependencies installed"

# ============================================
# 2. Node.js Setup (Latest LTS)
# ============================================
log_info "Step 2: Setting up Node.js..."

if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
fi

npm install -g pm2 npm@latest > /dev/null 2>&1

log_success "Node.js $(node -v) and NPM $(npm -v) installed"

# ============================================
# 3. Directory Setup
# ============================================
log_info "Step 3: Creating directory structure..."

mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/api-gateway
mkdir -p $DEPLOY_DIR/frontend
mkdir -p $DEPLOY_DIR/logs
mkdir -p $DEPLOY_DIR/data
mkdir -p /var/log/mouse-platform

log_success "Directory structure created"

# ============================================
# 4. Python Virtual Environment
# ============================================
log_info "Step 4: Setting up Python environment..."

cd $DEPLOY_DIR/api-gateway
python3.11 -m venv venv
source venv/bin/activate

pip install --upgrade pip wheel > /dev/null 2>&1

log_success "Python virtual environment ready"

# ============================================
# 5. Create Systemd Services
# ============================================
log_info "Step 5: Creating systemd services..."

# API Gateway Service
cat > /etc/systemd/system/mouse-api.service << 'EOF'
[Unit]
Description=Mouse Platform API Gateway
After=network.target redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mouse-platform/api-gateway
Environment=PATH=/opt/mouse-platform/api-gateway/venv/bin
Environment=ENVIRONMENT=production
Environment=PORT=8000
Environment=HOST=0.0.0.0
ExecStart=/opt/mouse-platform/api-gateway/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=5
StandardOutput=append:/var/log/mouse-platform/api.log
StandardError=append:/var/log/mouse-platform/api-error.log

[Install]
WantedBy=multi-user.target
EOF

# Frontend Service
cat > /etc/systemd/system/mouse-frontend.service << 'EOF'
[Unit]
Description=Mouse Platform Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mouse-platform/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
StandardOutput=append:/var/log/mouse-platform/frontend.log
StandardError=append:/var/log/mouse-platform/frontend-error.log

[Install]
WantedBy=multi-user.target
EOF

# Redis Service (ensure it's enabled)
systemctl enable redis-server > /dev/null 2>&1

log_success "Systemd services created"

# ============================================
# 6. Nginx Configuration
# ============================================
log_info "Step 6: Configuring Nginx..."

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create Mouse Platform nginx config
cat > /etc/nginx/sites-available/mouse-platform << 'EOF'
upstream api_backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

upstream frontend_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

server {
    listen 80;
    server_name _;  # Accept any hostname
    
    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/mouse-platform/nginx-access.log;
    error_log /var/log/mouse-platform/nginx-error.log;
    
    # API routes
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://api_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://api_backend/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
    
    # Webhook endpoints ( Stripe, Telegram )
    location /webhooks/ {
        proxy_pass http://api_backend/webhooks/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health {
        proxy_pass http://api_backend/health;
        access_log off;
    }
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://frontend_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
    
    # Static files (if served directly)
    location /_next/static/ {
        proxy_pass http://frontend_backend/_next/static/;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/mouse-platform /etc/nginx/sites-enabled/

# Test nginx config
nginx -t > /dev/null 2>&1 || {
    log_error "Nginx configuration test failed"
    exit 1
}

log_success "Nginx configured"

# ============================================
# 7. Firewall Configuration (UFW)
# ============================================
log_info "Step 7: Configuring firewall..."

if command -v ufw &> /dev/null; then
    ufw default deny incoming > /dev/null 2>&1
    ufw default allow outgoing > /dev/null 2>&1
    ufw allow ssh > /dev/null 2>&1
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
    ufw --force enable > /dev/null 2>&1
    log_success "Firewall configured"
else
    log_warn "UFW not installed, skipping firewall configuration"
fi

# ============================================
# 8. Log Rotation
# ============================================
log_info "Step 8: Setting up log rotation..."

cat > /etc/logrotate.d/mouse-platform << 'EOF'
/var/log/mouse-platform/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1
    endscript
}
EOF

log_success "Log rotation configured"

# ============================================
# 9. Monitoring Script
# ============================================
log_info "Step 9: Creating monitoring script..."

cat > /opt/mouse-platform/monitor.sh << 'EOF'
#!/bin/bash
# Mouse Platform Monitoring Script

echo "=========================================="
echo "🐭 Mouse Platform Status"
echo "=========================================="
echo ""

echo "📊 System Resources:"
echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "  Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "  Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"
echo ""

echo "🔧 Services:"
for service in mouse-api mouse-frontend redis-server nginx; do
    status=$(systemctl is-active $service 2>/dev/null)
    if [ "$status" = "active" ]; then
        echo "  ✓ $service: running"
    else
        echo "  ✗ $service: $status"
    fi
done
echo ""

echo "🌐 Network:"
echo "  HTTP (80): $(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "down")"
echo "  API (8000): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "down")"
echo ""

echo "📈 Recent Logs (last 5 lines):"
echo "  API:"
tail -n 3 /var/log/mouse-platform/api.log 2>/dev/null | sed 's/^/    /'
echo "  Frontend:"
tail -n 3 /var/log/mouse-platform/frontend.log 2>/dev/null | sed 's/^/    /'
echo ""

echo "=========================================="
EOF

chmod +x /opt/mouse-platform/monitor.sh

log_success "Monitoring script created"

# ============================================
# 10. Deployment Helper Script
# ============================================
log_info "Step 10: Creating deployment helper..."

cat > /opt/mouse-platform/deploy-code.sh << 'EOF'
#!/bin/bash
# Deploy Mouse Platform code to VM

echo "🚀 Deploying Mouse Platform code..."

DEPLOY_DIR="/opt/mouse-platform"

# Check if code directories exist
if [ ! -d "$DEPLOY_DIR/api-gateway" ] || [ ! -f "$DEPLOY_DIR/api-gateway/main.py" ]; then
    echo "⚠️  API Gateway code not found. Please upload code first."
    echo "   Expected: $DEPLOY_DIR/api-gateway/"
    exit 1
fi

if [ ! -d "$DEPLOY_DIR/frontend" ] || [ ! -f "$DEPLOY_DIR/frontend/package.json" ]; then
    echo "⚠️  Frontend code not found. Please upload code first."
    echo "   Expected: $DEPLOY_DIR/frontend/"
    exit 1
fi

echo "📦 Installing API dependencies..."
cd $DEPLOY_DIR/api-gateway
source venv/bin/activate
pip install -r requirements.txt -q

echo "📦 Building frontend..."
cd $DEPLOY_DIR/frontend
npm install -q
npm run build

echo "🔧 Setting permissions..."
chown -R root:root $DEPLOY_DIR
chmod -R 755 $DEPLOY_DIR

echo "🔄 Restarting services..."
systemctl restart mouse-api
systemctl restart mouse-frontend
systemctl restart nginx

echo "✅ Deployment complete!"
echo ""
echo "Services status:"
systemctl status mouse-api --no-pager -l
systemctl status mouse-frontend --no-pager -l
EOF

chmod +x /opt/mouse-platform/deploy-code.sh

log_success "Deployment helper created"

# ============================================
# 11. Environment Template
# ============================================
log_info "Step 11: Creating environment template..."

cat > /opt/mouse-platform/.env.template << 'EOF'
# ============================================
# Mouse Platform - Environment Configuration
# Copy this to .env and fill in your values
# ============================================

# Supabase (Database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Orgo (VM Infrastructure)
ORGO_API_KEY=sk_live_your_orgo_key
ORGO_WORKSPACE_ID=your-workspace-id

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PLATFORM_FEE_PERCENT=12

# Telegram (Bot)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_SECRET=optional-webhook-secret

# AI Services (Moonshot/Kimi)
MOONSHOT_API_KEY=your-moonshot-key
MOONSHOT_MODEL=kimi-k2.5

# Security
JWT_SECRET=generate-a-strong-jwt-secret-min-32-chars
ADMIN_API_TOKEN=generate-a-random-256-bit-token

# Application
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://app.your-domain.com

# Optional: Monitoring
# LOG_LEVEL=INFO
# SENTRY_DSN=your-sentry-dsn
EOF

log_success "Environment template created"

# ============================================
# 12. Final Setup
# ============================================
log_info "Step 12: Finalizing setup..."

# Reload systemd
systemctl daemon-reload

# Enable services
systemctl enable mouse-api > /dev/null 2>&1
systemctl enable mouse-frontend > /dev/null 2>&1
systemctl enable nginx > /dev/null 2>&1

# Start Redis
systemctl restart redis-server > /dev/null 2>&1

log_success "Services enabled"

echo ""
echo "=========================================="
echo "🎉 Deployment Infrastructure Complete!"
echo "=========================================="
echo ""
echo "VM ID: $VM_ID"
echo "Deploy Directory: $DEPLOY_DIR"
echo ""
echo "Next Steps:"
echo "  1. Upload your Mouse Platform code to:"
echo "     - $DEPLOY_DIR/api-gateway/"
echo "     - $DEPLOY_DIR/frontend/"
echo ""
echo "  2. Configure environment variables:"
echo "     cp $DEPLOY_DIR/.env.template $DEPLOY_DIR/api-gateway/.env"
echo "     nano $DEPLOY_DIR/api-gateway/.env"
echo ""
echo "  3. Deploy the code:"
echo "     /opt/mouse-platform/deploy-code.sh"
echo ""
echo "  4. Check status:"
echo "     /opt/mouse-platform/monitor.sh"
echo ""
echo "  5. View logs:"
echo "     tail -f /var/log/mouse-platform/api.log"
echo "     tail -f /var/log/mouse-platform/frontend.log"
echo ""
echo "Services:"
echo "  - API Gateway: http://localhost:8000"
echo "  - Frontend: http://localhost:3000"
echo "  - Nginx: http://localhost (port 80)"
echo ""
echo "=========================================="
