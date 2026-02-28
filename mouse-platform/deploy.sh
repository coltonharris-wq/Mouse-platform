#!/bin/bash
# Mouse Platform Production Deployment Script
# This script guides you through deploying Mouse Platform to production

set -e

echo "🚀 Mouse Platform Production Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ git is required${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required${NC}"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ Python 3 is required${NC}"; exit 1; }
echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Step 1: GitHub
echo "📦 Step 1: GitHub Repository"
echo "----------------------------"
echo "Repository: https://github.com/coltonharris-wq/Mouse-platform"
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

# Step 2: Supabase
echo "🗄️  Step 2: Supabase Database Setup"
echo "-----------------------------------"
echo "1. Go to https://app.supabase.com and create a new project"
echo "2. Name it: mouse-platform-prod"
echo "3. Note down the Project URL and Service Role Key"
echo "4. Run the schema migration:"
echo ""
echo "   cd mouse-platform/supabase"
echo "   supabase link --project-ref <your-project-ref>"
echo "   supabase db push"
echo ""
echo "Or manually execute the SQL in schema.sql in the Supabase SQL Editor"
echo ""

# Step 3: Vercel Frontend
echo "🌐 Step 3: Vercel Frontend Deployment"
echo "-------------------------------------"
echo "Option A - Vercel CLI:"
echo "   cd mouse-platform/frontend"
echo "   vercel --prod"
echo ""
echo "Option B - GitHub Integration (Recommended):"
echo "   1. Go to https://vercel.com/new"
echo "   2. Import GitHub repo: coltonharris-wq/Mouse-platform"
echo "   3. Set root directory to: frontend"
echo "   4. Add environment variables:"
echo "      - NEXT_PUBLIC_API_URL=https://api.mouseplatform.com"
echo ""

# Step 4: Backend API
echo "⚙️  Step 4: Backend API Deployment"
echo "----------------------------------"
echo "Option A - Render (Easiest):"
echo "   1. Go to https://render.com"
echo "   2. Create new Web Service"
echo "   3. Connect GitHub repo"
echo "   4. Render will use render.yaml configuration"
echo ""
echo "Option B - Railway:"
echo "   1. Go to https://railway.app"
echo "   2. Create new project from GitHub repo"
echo "   3. Add environment variables"
echo ""

# Step 5: Environment Variables
echo "🔐 Step 5: Environment Variables"
echo "--------------------------------"
echo "Required environment variables for production:"
echo ""
cat << 'EOF'
# Supabase
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>

# Orgo VMs
ORGO_API_KEY=sk_live_<your-orgo-key>
ORGO_WORKSPACE_ID=<workspace-id>

# Stripe
STRIPE_SECRET_KEY=sk_live_<stripe-key>
STRIPE_WEBHOOK_SECRET=whsec_<webhook-secret>
STRIPE_PLATFORM_FEE_PERCENT=12

# Telegram
TELEGRAM_BOT_TOKEN=<bot-token>

# AI
MOONSHOT_API_KEY=<moonshot-key>

# Security
ADMIN_API_TOKEN=<random-256-bit-token>
FRONTEND_URL=https://app.mouseplatform.com
EOF
echo ""

# Step 6: Stripe Webhooks
echo "💳 Step 6: Stripe Webhook Configuration"
echo "----------------------------------------"
echo "1. Go to https://dashboard.stripe.com/webhooks"
echo "2. Add endpoint: https://api.mouseplatform.com/webhooks/stripe"
echo "3. Select events:"
echo "   - customer.subscription.created"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "   - customer.subscription.deleted"
echo "4. Copy the webhook signing secret"
echo ""

# Step 7: Domain Setup
echo "🌐 Step 7: Domain Configuration"
echo "-------------------------------"
echo "1. Purchase domain: mouseplatform.com (or your preferred domain)"
echo "2. In Vercel: Add custom domain to project"
echo "3. In Render/Railway: Configure custom domain for API"
echo "4. Update DNS records as instructed by Vercel/Render"
echo ""

# Step 8: Telegram Bot
echo "🤖 Step 8: Telegram Bot Setup"
echo "-----------------------------"
echo "1. Message @BotFather on Telegram"
echo "2. Create new bot with /newbot"
echo "3. Save the bot token"
echo "4. Set webhook:"
echo "   curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{"url": "https://api.mouseplatform.com/webhooks/telegram"}'"
echo ""

echo "✅ Deployment Guide Complete!"
echo "============================="
echo ""
echo "Next steps:"
echo "1. Create Supabase project and run migrations"
echo "2. Deploy frontend to Vercel"
echo "3. Deploy backend to Render/Railway"
echo "4. Configure Stripe webhooks"
echo "5. Set up Telegram bot"
echo "6. Configure custom domain"
echo ""
echo "📚 Documentation: mouse-platform/DEPLOYMENT_GUIDE.md"
