# Mouse Platform - Deployment Guide

## Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase account
- Stripe account
- Orgo API key
- Telegram Bot API access
- Vercel account (for frontend)

## Environment Variables

Create `.env` files in respective directories:

### API Gateway (.env)
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# Orgo
ORGO_API_KEY=sk_live_...
ORGO_WORKSPACE_ID=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=12

# Telegram
TELEGRAM_BOT_TOKEN=...

# Server
PORT=8000
HOST=0.0.0.0
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.mouseplatform.com
```

## Deployment Steps

### 1. Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed initial data
supabase seed apply
```

### 2. API Gateway Deployment

```bash
cd api-gateway

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn main:app --reload

# Deploy to production (Fly.io example)
fly deploy
```

### 3. Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

### 4. Telegram Bot Setup

1. Message @BotFather on Telegram
2. Create new bot: `/newbot`
3. Copy bot token to env
4. Set webhook: `POST https://api.telegram.org/bot<TOKEN>/setWebhook`
   with body: `{"url": "https://api.mouseplatform.com/webhooks/telegram"}`

### 5. Stripe Connect Setup

1. Enable Stripe Connect in dashboard
2. Create Express onboarding link
3. Add webhook endpoint: `https://api.mouseplatform.com/webhooks/stripe`
4. Select events:
   - `account.updated`
   - `customer.subscription.created`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 6. Orgo VM Template Setup

```bash
# Create base VM image with preinstalled dependencies
python3 scripts/setup-vm-template.py

# This installs:
# - Node.js 20
# - Python 3.10
# - Claude Code
# - OpenClaw
# - Common build tools
```

## Production Checklist

- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Stripe webhooks tested
- [ ] Telegram bot responding
- [ ] Orgo VMs provisioning
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Plausible/PostHog)
- [ ] Backup strategy configured
- [ ] Documentation updated

## Monitoring

```bash
# Check API health
curl https://api.mouseplatform.com/health

# Check VM status
curl https://api.mouseplatform.com/admin/vms/status

# View logs
fly logs -a mouse-platform-api
```

## Rollback Procedures

### Database
```bash
# Restore from backup
supabase db restore --backup-id <id>
```

### API Gateway
```bash
# Rollback to previous version
fly rollback -a mouse-platform-api
```

### Frontend
```bash
# Redeploy previous version in Vercel dashboard
```

## Troubleshooting

### VM Not Starting
1. Check Orgo API key
2. Verify workspace ID
3. Check VM quota limits

### Telegram Not Responding
1. Verify webhook URL
2. Check bot token
3. Review webhook logs

### Stripe Webhook Failing
1. Verify webhook secret
2. Check endpoint URL
3. Review Stripe dashboard logs
