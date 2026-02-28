# 🚀 Mouse Platform - Production Deployment

This directory contains everything needed to deploy Mouse Platform to production.

## Quick Start

```bash
# 1. Run the deployment guide
./deploy.sh

# 2. Set up database
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_KEY=your-service-key
./migrate.sh

# 3. Configure Stripe webhooks
export STRIPE_SECRET_KEY=sk_live_your_key
python3 configure-stripe-webhooks.py --url https://api.mouseplatform.com/webhooks/stripe

# 4. Verify deployment
export API_URL=https://api.mouseplatform.com
export FRONTEND_URL=https://app.mouseplatform.com
python3 verify-deployment.py
```

## Deployment Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Render/Railway │────▶│   Supabase      │
│   (Frontend)    │     │   (API Backend)  │     │   (Database)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Stripe         │
                        │   (Payments)     │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Telegram       │
                        │   (Bot)          │
                        └──────────────────┘
```

## Step-by-Step Deployment

### 1. Database (Supabase)

1. Create project at https://app.supabase.com
2. Name: `mouse-platform-prod`
3. Run migrations:
   ```bash
   supabase link --project-ref <your-ref>
   supabase db push
   ```

### 2. Frontend (Vercel)

**Option A - GitHub Integration (Recommended):**
1. Go to https://vercel.com/new
2. Import `coltonharris-wq/Mouse-platform`
3. Set root directory: `frontend`
4. Add env var: `NEXT_PUBLIC_API_URL=https://api.mouseplatform.com`

**Option B - CLI:**
```bash
cd frontend
vercel --prod
```

### 3. Backend API (Render)

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Render auto-detects `render.yaml` configuration
5. Add environment variables from `.env.production`

### 4. Stripe Configuration

```bash
export STRIPE_SECRET_KEY=sk_live_...
python3 configure-stripe-webhooks.py
```

Copy the webhook secret and add to environment variables.

### 5. Domain Setup

1. Purchase domain (e.g., mouseplatform.com)
2. In Vercel: Add custom domain
3. In Render: Configure custom domain for API
4. Update DNS records

### 6. Telegram Bot

1. Message @BotFather
2. Create bot with `/newbot`
3. Set webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://api.mouseplatform.com/webhooks/telegram"}'
   ```

## Environment Variables

See `api-gateway/.env.production` for full list.

**Critical variables:**
- `SUPABASE_URL` & `SUPABASE_SERVICE_KEY`
- `ORGO_API_KEY` & `ORGO_WORKSPACE_ID`
- `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `ADMIN_API_TOKEN` (generate random 256-bit token)

## Verification

Run the verification script after deployment:

```bash
python3 verify-deployment.py \
  --api-url https://api.mouseplatform.com \
  --frontend-url https://app.mouseplatform.com
```

## Post-Deployment Checklist

- [ ] Health check endpoint returns 200
- [ ] API docs accessible at `/docs`
- [ ] Frontend loads without errors
- [ ] Stripe webhooks receiving events
- [ ] Telegram bot responding
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] CORS configured correctly

## Troubleshooting

### Database Connection Issues
```bash
# Test Supabase connection
supabase status
```

### Webhook Failures
```bash
# Test Stripe webhook
stripe trigger customer.subscription.created

# Test Telegram webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check `FRONTEND_URL` is set correctly

## Support

- **Documentation**: See `DEPLOYMENT_GUIDE.md`
- **API Docs**: Available at `/docs` after deployment
- **Issues**: Check GitHub Issues
