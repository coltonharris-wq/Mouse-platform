# Mouse Platform - Deployment Checklist

## Pre-Launch Requirements

### Critical Infrastructure
- [x] Stripe webhook signature validation implemented
- [x] Screenshot endpoint customer verification fixed
- [x] WebSocket authentication & authorization added
- [x] CORS restricted to specific origins
- [x] Input validation on all endpoints
- [x] Proper error handling without info leakage

### Authentication (DISABLED FOR TESTING)
- [ ] JWT middleware commented out for direct access
- [ ] All portal routes accessible without login
- [ ] Test customer ID injected for development

### Payment Processing
- [x] Stripe Connect integration configured
- [x] Token purchase flow working
- [x] Webhook handlers for all payment events
- [x] Token crediting on successful payment
- [x] Refund handling implemented

### Customer Signup
- [x] Customer creation endpoint working
- [x] Email validation implemented
- [x] Duplicate email checking
- [x] King Mouse bot auto-provisioned
- [x] QR code generation for Telegram

### Dashboard
- [x] Token balance display
- [x] Transaction history
- [x] Token costs reference
- [x] Quick action links

### Email Integration
- [ ] Gmail OAuth flow
- [ ] Outlook OAuth flow
- [ ] Email scanning background job
- [ ] Business context extraction

## Environment Variables Required

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# Orgo VM API
ORGO_API_KEY=sk_live_your_orgo_key
ORGO_WORKSPACE_ID=your-workspace-id

# Stripe (LIVE KEYS REQUIRED)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=12

# Stripe Connect (for reseller payouts)
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret

# AI
MOONSHOT_API_KEY=your-moonshot-key

# Server
PORT=8000
HOST=0.0.0.0

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ALLOWED_ORIGINS=https://app.mouseplatform.com,https://admin.mouseplatform.com

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

## Database Setup

### Supabase Tables Required
1. `customers` - Customer accounts
2. `resellers` - Reseller accounts  
3. `employees` - AI employee instances
4. `tasks` - Task records
5. `usage_logs` - Token usage tracking
6. `token_transactions` - Token purchase/usage history
7. `revenue_events` - Revenue tracking
8. `profiles` - Auth user mapping

### RLS Policies
- All tables must have RLS enabled
- Customers can only see their own data
- Resellers can only see their customers
- Platform owner can see everything

## Vercel Configuration

### Build Settings
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Environment Variables
Add all env vars from above in Vercel dashboard

### API Routes
- `/api/*` → Vercel Serverless Functions
- Webhooks must be configured with full URL

### Stripe Webhook URL
```
https://app.mouseplatform.com/api/webhooks/stripe
```

### Telegram Webhook URL
```
https://app.mouseplatform.com/api/webhooks/telegram
```

## Testing Checklist

### Pre-Deployment
1. Run local tests: `pytest tests/`
2. Verify Stripe webhooks: `stripe listen --forward-to localhost:8000/webhooks/stripe`
3. Test customer signup flow end-to-end
4. Test token purchase flow
5. Test VM deployment (with Orgo)
6. Test Telegram bot integration

### Post-Deployment
1. Health check endpoint returns 200
2. Customer signup creates records in Supabase
3. Stripe checkout redirects correctly
4. Webhooks receiving and processing events
5. Token balance updates after purchase
6. VM deployment starts Orgo VM

## Known Issues & Workarounds

### Issue: VM deployment may timeout
**Workaround:** Increase timeout in Orgo client to 60s

### Issue: Telegram bot QR codes expire
**Workaround:** Implement refresh mechanism or use deep links

### Issue: Email OAuth requires app review
**Workaround:** Use "Testing" mode with limited users during launch

### Issue: Stripe Connect onboarding incomplete
**Workaround:** Manually send onboarding links to resellers

## Launch Day Sequence

1. **T-2 hours:** Final database migration
2. **T-1 hour:** Deploy to Vercel production
3. **T-30 min:** Configure Stripe webhooks
4. **T-15 min:** Health check all endpoints
5. **T-0:** Enable customer signups
6. **T+1 hour:** Monitor error rates
7. **T+24 hours:** Review first day metrics

## Rollback Plan

If critical issues occur:
1. Disable customer signup endpoint
2. Redirect to "Maintenance" page
3. Fix issues in staging
4. Redeploy
5. Notify affected customers

## Support Contacts

- Platform issues: Colton Harris
- Stripe issues: Stripe dashboard/support
- Orgo issues: Orgo API support
- Supabase issues: Supabase dashboard
