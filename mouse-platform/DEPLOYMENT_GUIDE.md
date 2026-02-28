# Mouse Platform - Deployment Guide

Complete guide for deploying the Mouse Platform to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [API Deployment](#api-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Webhook Configuration](#webhook-configuration)
8. [Security Checklist](#security-checklist)
9. [Monitoring & Alerts](#monitoring--alerts)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **Supabase** - Database and authentication
- **Orgo** - VM infrastructure (get API key from dashboard)
- **Stripe** - Payment processing (Connect account for marketplace)
- **Telegram** - Bot platform (via BotFather)
- **Vercel/Railway/Render** - Hosting platform

### Local Requirements
```bash
# Python 3.11+
python --version

# Node.js 18+
node --version

# Git
git --version

# Supabase CLI (optional, for local dev)
npm install -g supabase
```

---

## Infrastructure Setup

### 1. Supabase Project

```bash
# Create new project at https://app.supabase.com
# Project name: mouse-platform-prod

# Get credentials from Settings > API:
# - Project URL (SUPABASE_URL)
# - Service Role Key (SUPABASE_SERVICE_KEY)
```

### 2. Orgo Workspace

```bash
# Sign up at https://orgo.com
# Create workspace for production
# Get API key from workspace settings

export ORGO_API_KEY="sk_live_..."
export ORGO_WORKSPACE_ID="..."
```

### 3. Stripe Connect

```bash
# Create Stripe account at https://stripe.com
# Enable Connect (Express accounts)
# Get API keys from Developers > API keys

export STRIPE_SECRET_KEY="sk_live_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
```

Configure webhook endpoint:
- URL: `https://api.mouseplatform.com/webhooks/stripe`
- Events: 
  - `customer.subscription.created`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`

### 4. Telegram Bot (via BotFather)

```bash
# Message @BotFather on Telegram
# /newbot → name it "Mouse Platform"
# Save the bot token

export TELEGRAM_BOT_TOKEN="123456:ABC-DEF..."

# Optional: Set webhook secret
export TELEGRAM_WEBHOOK_SECRET="your-random-secret"
```

---

## Environment Configuration

### Production `.env` file

```bash
# api-gateway/.env.production

# Environment
ENVIRONMENT=production

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>

# Orgo
ORGO_API_KEY=sk_live_<your-key>
ORGO_WORKSPACE_ID=<workspace-id>

# Stripe
STRIPE_SECRET_KEY=sk_live_<stripe-key>
STRIPE_WEBHOOK_SECRET=whsec_<webhook-secret>

# Telegram
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_WEBHOOK_SECRET=<optional-secret>

# AI
MOONSHOT_API_KEY=<moonshot-key>

# Admin
ADMIN_API_TOKEN=<random-256-bit-token>

# Frontend URL (for CORS)
FRONTEND_URL=https://app.mouseplatform.com

# Server
PORT=8000
```

**CRITICAL: Never commit this file to git!**

---

## Database Setup

### 1. Run Migrations

```bash
# Navigate to supabase directory
cd mouse-platform/supabase

# Connect to your Supabase project
supabase link --project-ref <project-ref>

# Push schema
supabase db push
```

### 2. Manual Schema Setup (if not using migrations)

Execute this SQL in Supabase SQL Editor:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE resellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    stripe_account_id TEXT,
    api_key TEXT UNIQUE,
    commission_rate DECIMAL(5,2) DEFAULT 12.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    reseller_id UUID REFERENCES resellers(id),
    company_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'growth', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'past_due')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_subscription_status TEXT,
    telegram_chat_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE king_mice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    bot_token TEXT NOT NULL,
    bot_username TEXT NOT NULL,
    bot_link TEXT NOT NULL,
    qr_code_url TEXT,
    status TEXT DEFAULT 'active',
    total_interactions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'deploying',
    vm_id TEXT,
    vm_url TEXT,
    current_task TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ
);

CREATE TABLE chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id),
    employee_id TEXT REFERENCES employees(id),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    stripe_event_id TEXT UNIQUE,
    amount INTEGER,
    customer_id TEXT REFERENCES customers(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE king_mice ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Customers access own data" ON customers
    FOR ALL USING (
        auth.uid()::text = id OR 
        EXISTS (SELECT 1 FROM resellers WHERE api_key = current_setting('request.headers')::json->>'x-api-key')
    );

CREATE POLICY "King mice access by customer" ON king_mice
    FOR ALL USING (customer_id IN (SELECT id FROM customers));

CREATE POLICY "Employees access by customer" ON employees
    FOR ALL USING (customer_id IN (SELECT id FROM customers));

-- Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_reseller ON customers(reseller_id);
CREATE INDEX idx_employees_customer ON employees(customer_id);
CREATE INDEX idx_employees_vm ON employees(vm_id);
CREATE INDEX idx_chat_logs_customer ON chat_logs(customer_id);
```

---

## API Deployment

### Option 1: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init --name mouse-platform-api

# Add environment variables
railway variables set ENVIRONMENT=production
railway variables set SUPABASE_URL=https://...
railway variables set SUPABASE_SERVICE_KEY=...
# ... set all variables

# Deploy
railway up

# Get domain
railway domain
```

### Option 2: Render

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: mouse-platform-api
    runtime: python
    buildCommand: cd api-gateway && pip install -r requirements.txt
    startCommand: cd api-gateway && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: ENVIRONMENT
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
      # ... other env vars
```

2. Deploy via Render dashboard

### Option 3: Docker (Self-hosted)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY api-gateway/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api-gateway/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t mouse-platform-api .
docker run -p 8000:8000 --env-file .env.production mouse-platform-api
```

---

## Frontend Deployment

### Vercel (Recommended)

```bash
cd mouse-platform/frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.mouseplatform.com
```

### Build Configuration

```javascript
// frontend/next.config.js
module.exports = {
  output: 'standalone',
  images: {
    domains: ['api.mouseplatform.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' wss://api.mouseplatform.com https://api.mouseplatform.com"
          }
        ]
      }
    ];
  }
};
```

---

## Webhook Configuration

### Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.mouseplatform.com/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Telegram Webhook

```bash
# Set webhook URL
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.mouseplatform.com/webhooks/telegram",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"
  }'

# Verify
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

---

## Security Checklist

### Before Going Live

- [ ] **Environment Variables**
  - [ ] All secrets stored securely (not in code)
  - [ ] `ENVIRONMENT=production` set
  - [ ] `ADMIN_API_TOKEN` is cryptographically random (256-bit)

- [ ] **CORS Configuration**
  - [ ] `allow_origins` restricted to production domains
  - [ ] Not using `"*"` in production

- [ ] **Webhook Security**
  - [ ] Stripe webhook signature verification enabled
  - [ ] Telegram webhook secret configured (optional but recommended)

- [ ] **Database**
  - [ ] RLS policies enabled on all tables
  - [ ] No service role key exposed to frontend
  - [ ] Backups configured (daily minimum)

- [ ] **API Security**
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints
  - [ ] Admin endpoints require authentication
  - [ ] VM ownership verification on screenshot/WebSocket endpoints

- [ ] **SSL/TLS**
  - [ ] HTTPS only (redirect HTTP → HTTPS)
  - [ ] Valid SSL certificate
  - [ ] Secure WebSocket (wss://)

- [ ] **Logging**
  - [ ] Error logging configured
  - [ ] No sensitive data in logs
  - [ ] Log aggregation set up (optional)

---

## Monitoring & Alerts

### Health Check Monitoring

Set up uptime monitoring for `/health` endpoint:

```bash
# Using UptimeRobot or similar
curl https://api.mouseplatform.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "supabase": true,
    "orgo": true,
    "telegram": true
  }
}
```

### Key Metrics to Monitor

| Metric | Alert Threshold |
|--------|-----------------|
| API Error Rate | > 5% |
| Response Time | > 2s p95 |
| Webhook Failures | Any Stripe webhook 4xx/5xx |
| VM Deployment Failures | > 10% |
| Database Connection Errors | Any |

### Log Aggregation (Optional)

```bash
# Using Papertrail/Datadog/Logtail
# Configure in hosting platform
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Access-Control-Allow-Origin header missing
```
**Fix:** Check `FRONTEND_URL` env var matches actual frontend domain

#### 2. Stripe Webhook Failing
```
Invalid signature
```
**Fix:** 
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Ensure raw body is passed to signature verification

#### 3. VM Screenshots Not Loading
```
403 Access Denied
```
**Fix:**
- Verify customer owns the VM
- Check `get_employee_by_vm` query

#### 4. WebSocket Connection Failed
```
WebSocket connection to 'wss://...' failed
```
**Fix:**
- Ensure WebSocket URL uses `wss://` (not `ws://`)
- Check firewall/VPC settings

#### 5. Database Connection Errors
```
Connection refused / timeout
```
**Fix:**
- Verify Supabase URL and key
- Check IP allowlist in Supabase
- Ensure connection pooling not exceeded

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=DEBUG
```

### Support

- **Documentation:** `/docs` (Swagger UI)
- **Health Check:** `/health`
- **API Status:** Check individual service health in `/health` response

---

## Post-Deployment Verification

### Smoke Tests

```bash
# 1. Health check
curl https://api.mouseplatform.com/health

# 2. Create test customer
curl -X POST https://api.mouseplatform.com/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test","email":"test@example.com","plan":"starter"}'

# 3. Send message
curl -X POST https://api.mouseplatform.com/api/v1/customers/<id>/message \
  -H "Content-Type: application/json" \
  -d '{"message":"I need a website"}'

# 4. List VMs
curl https://api.mouseplatform.com/api/v1/customers/<id>/vms
```

### Verify Webhooks

1. **Stripe:** Send test event from Stripe dashboard
2. **Telegram:** Send message to bot, verify response

---

## Maintenance

### Regular Tasks

| Task | Frequency |
|------|-----------|
| Review error logs | Daily |
| Check VM costs | Weekly |
| Update dependencies | Monthly |
| Rotate API keys | Quarterly |
| Security audit | Quarterly |

### Updating Deployment

```bash
# Pull latest
git pull origin main

# Deploy API
railway up  # or your deployment method

# Deploy Frontend
vercel --prod
```

---

**Last Updated:** February 27, 2026  
**Version:** 1.0.0