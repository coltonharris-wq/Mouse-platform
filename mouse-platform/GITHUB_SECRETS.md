# GitHub Actions Secrets Required

Set these secrets in your GitHub repository settings:
https://github.com/coltonharris-wq/Mouse-platform/settings/secrets/actions

## For Vercel Deployment (frontend)

- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

Get these by running:
```bash
cd mouse-platform/frontend
vercel
# Then copy the values from .vercel/project.json
```

## For Railway Deployment (backend)

- `RAILWAY_TOKEN` - Your Railway API token

Get this from: https://railway.app/account/tokens

## Environment Variables

These should be set in your hosting platform (Render/Railway/Vercel),
NOT in GitHub secrets (unless using them in workflows):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `ORGO_API_KEY`
- `ORGO_WORKSPACE_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `MOONSHOT_API_KEY`
- `ADMIN_API_TOKEN`
