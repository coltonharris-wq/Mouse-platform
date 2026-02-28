# Mouse Platform - Complete Integration

OpenClaw-as-a-Service Platform - Deploy AI employees in isolated VMs for your business.

## 🚀 Overview

The Mouse Platform enables businesses to deploy AI employees that work in isolated cloud VMs. Each customer gets their own King Mouse AI bot via Telegram, and can deploy specialized AI employees (Knights) for specific tasks.

## 📁 Project Structure

```
mouse-platform/
├── api-gateway/                 # FastAPI backend
│   ├── main_complete.py        # ✅ Main API server (production-ready)
│   ├── main.py                 # Legacy API (kept for reference)
│   ├── main_secure.py          # Secure version with fixes
│   ├── orchestrator.py         # Core business logic
│   ├── ai_agents.py            # KingMouse & Knight agents
│   ├── supabase_client.py      # Database operations
│   ├── orgo_client.py          # VM management
│   ├── telegram_bot.py         # Telegram integration
│   ├── token_pricing.py        # Token billing system
│   ├── stripe_webhook_handler.py
│   ├── auth.py                 # Authentication
│   └── requirements.txt
├── frontend/                    # Next.js 14 dashboard
│   ├── src/app/
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Customer dashboard
│   │   ├── pricing/            # Pricing page
│   │   └── api/                # API routes
│   └── package.json
├── supabase/
│   ├── schema.sql              # Database schema with RLS
│   ├── security_fixes_rls.sql  # Security policies
│   └── token_pricing_migration.sql
├── tests/                       # Comprehensive test suite
│   ├── test_security.py        # 15 security tests
│   ├── test_onboarding.py      # 12 onboarding tests
│   ├── test_messaging.py       # 18 messaging tests
│   ├── test_deployment.py      # 14 deployment tests
│   ├── test_payments.py        # 10 payment tests
│   ├── test_telegram.py        # 8 telegram tests
│   ├── test_websocket.py       # 6 websocket tests
│   └── test_integration.py     # 12 integration tests
├── demo_complete.py            # ✅ End-to-end demo script
└── README.md                   # This file
```

## ✨ Features

### Core Platform
- ✅ **Customer Onboarding** - Automated signup with King Mouse AI bot
- ✅ **AI Employee Deployment** - Spin up VM-based AI workers (Knights)
- ✅ **Real-time VM Streaming** - Watch AI employees work via WebSocket
- ✅ **Token-based Billing** - Usage-based pricing ($19/$49/$99 tiers)
- ✅ **Multi-tenant Architecture** - PostgreSQL RLS for data isolation
- ✅ **Telegram Integration** - King Mouse bots for each customer
- ✅ **Stripe Payments** - Complete billing and webhook handling

### Security
- ✅ API key authentication with Bearer tokens
- ✅ Webhook signature verification (Stripe, Telegram)
- ✅ VM ownership verification for screenshots
- ✅ WebSocket connection authentication
- ✅ Rate limiting support
- ✅ CORS restricted in production
- ✅ Input validation on all endpoints
- ✅ SQL injection protection

### API Endpoints

#### Customers
- `POST /api/v1/customers` - Create customer + King Mouse bot
- `GET /api/v1/customers/{id}` - Get customer details
- `GET /api/v1/customers/{id}/king-mouse` - Get bot status

#### Messaging
- `POST /api/v1/customers/{id}/message` - Send message to King Mouse

#### AI Employees
- `POST /api/v1/customers/{id}/employees` - Deploy AI employee
- `GET /api/v1/customers/{id}/employees` - List employees
- `GET /api/v1/customers/{id}/employees/{emp_id}` - Get employee details

#### VMs
- `POST /api/v1/customers/{id}/vms` - Create VM
- `GET /api/v1/customers/{id}/vms` - List VMs
- `GET /api/v1/customers/{id}/vms/{vm_id}` - Get VM details
- `GET /api/v1/customers/{id}/vms/{vm_id}/screenshot` - Get screenshot

#### Token Management
- `GET /api/v1/customers/{id}/tokens/balance` - Check balance
- `POST /api/v1/customers/{id}/tokens/purchase` - Buy tokens
- `POST /api/v1/customers/{id}/tokens/use` - Use tokens
- `GET /api/v1/customers/{id}/tokens/transactions` - List transactions

#### WebSocket
- `WS /ws/vms/{customer_id}/{vm_id}` - Live VM streaming

#### Webhooks
- `POST /webhooks/stripe` - Stripe events
- `POST /webhooks/telegram` - Telegram messages

#### Admin
- `GET /api/v1/admin/customers` - List all customers
- `GET /api/v1/admin/stats` - Platform statistics

## 🛠️ Setup

### Prerequisites
- Python 3.9+
- Node.js 18+ (for frontend)
- Supabase account
- Stripe account
- Orgo API key
- Telegram bot token

### 1. Clone and Install

```bash
cd mouse-platform/api-gateway
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` file in `api-gateway/`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# Orgo VM API
ORGO_API_KEY=sk_live_your_orgo_key
ORGO_WORKSPACE_ID=your-workspace-id

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PLATFORM_FEE_PERCENT=12

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret

# AI - Moonshot
MOONSHOT_API_KEY=your-moonshot-key

# Security
API_SECRET_KEY=your-super-secret-api-key-min-32-chars
JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=https://app.mouseplatform.com

# Server
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
```

### 3. Database Setup

Run the Supabase migrations:

```bash
# In Supabase SQL Editor, run:
1. supabase/schema.sql          # Base schema
2. supabase/security_fixes_rls.sql  # RLS policies
3. supabase/token_pricing_migration.sql  # Token system
```

### 4. Start API Server

```bash
cd api-gateway
python main_complete.py
```

Or with uvicorn:
```bash
uvicorn main_complete:app --reload --port 8000
```

### 5. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Run Demo
```bash
cd mouse-platform
python demo_complete.py
```

### Run Test Suite
```bash
cd mouse-platform/api-gateway
pytest ../tests/ -v
```

### Individual Test Files
```bash
pytest tests/test_security.py -v
pytest tests/test_onboarding.py -v
pytest tests/test_integration.py -v
```

## 📚 Documentation

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [TOKEN_PRICING.md](TOKEN_PRICING.md) - Billing system

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│   FastAPI        │────▶│   Supabase      │
│   Frontend      │◀────│   API Gateway    │◀────│   PostgreSQL    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Orgo API       │
                        │   VM Management  │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   AI Knights     │
                        │   (VM Workers)   │
                        └──────────────────┘
```

## 🔐 Security Features

1. **Authentication**: Bearer token API keys
2. **Authorization**: VM ownership verification
3. **Webhook Security**: Signature validation
4. **Data Isolation**: PostgreSQL RLS policies
5. **Rate Limiting**: Configurable per endpoint
6. **CORS**: Restricted origins in production
7. **Input Validation**: Pydantic models
8. **SQL Injection**: Parameterized queries

## 🚀 Deployment

### Railway (Recommended)
```bash
railway login
railway init
railway up
```

### Render
```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Auto-deploy on push
```

### Docker
```bash
docker build -t mouse-platform .
docker run -p 8000:8000 --env-file .env mouse-platform
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `ORGO_API_KEY` | Orgo VM API key | Yes |
| `ORGO_WORKSPACE_ID` | Orgo workspace ID | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Yes |
| `API_SECRET_KEY` | API authentication key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | No |
| `ENVIRONMENT` | development/production | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pytest tests/ -v`
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- 📧 Email: support@mouseplatform.com
- 💬 Discord: [Join our community](https://discord.gg/mouseplatform)
- 📖 Docs: https://docs.mouseplatform.com

---

Built with ❤️ by the Mouse Platform team
