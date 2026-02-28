# Mouse Platform

AI Workforce Platform - Deploy AI employees that work in real cloud VMs. Your customers chat with King Mouse on Telegram, and AI knights execute tasks on real computers they can watch live.

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/coltonh/mouse-platform.git
cd mouse-platform

# 2. Install dependencies
cd api-gateway && pip install -r requirements.txt
cd ../frontend && npm install

# 3. Set environment variables
cp api-gateway/.env.example api-gateway/.env
# Edit with your API keys

# 4. Run database migrations
supabase db push

# 5. Start services
npm run dev          # Frontend
npm run api          # API Gateway
```

## Run the Demo

```bash
python3 demo/run-demo.py
```

This creates a test customer "Clean Eats" with 2 AI employees working on live VMs.

## Architecture

- **Frontend**: Next.js 14 with Tailwind CSS
- **API Gateway**: Python/FastAPI
- **Database**: Supabase (Postgres + Auth + RLS)
- **VMs**: Orgo cloud computers
- **Messaging**: Telegram Bot API
- **Payments**: Stripe Connect

## Key Features

🤖 **King Mouse** - Customer-facing AI on Telegram  
👥 **AI Employees** - Role-specific agents (Web Dev, Social Media, Sales, etc.)  
💻 **Real VMs** - Each employee works on actual cloud computer  
📺 **Live Streaming** - Watch employees work in real-time  
💰 **Stripe Connect** - Auto-split payments 88/12

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/customers` | Create customer + King Mouse |
| `POST /api/v1/customers/:id/message` | Chat with King Mouse |
| `POST /api/v1/customers/:id/vms` | Deploy AI employee |
| `GET /api/v1/customers/:id/vms/:id/screenshot` | Get VM screenshot |
| `WS /ws/vms/:customer/:vm` | Live VM streaming |

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy instructions
- [DEMO.md](DEMO.md) - Run the demo

## Project Structure

```
mouse-platform/
├── api-gateway/          # Python FastAPI backend
│   ├── main.py          # API routes
│   ├── orchestrator.py  # Core business logic
│   ├── ai_agents.py     # King Mouse & Knight agents
│   ├── orgo_client.py   # VM management
│   ├── supabase_client.py
│   └── telegram_bot.py
├── frontend/            # Next.js app
├── demo/                # Demo scripts
├── supabase/            # Database schema
└── docs/               # Documentation
```

## Environment Variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Orgo VMs
ORGO_API_KEY=
ORGO_WORKSPACE_ID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Telegram
TELEGRAM_BOT_TOKEN=

# AI
MOONSHOT_API_KEY=
```

## License

Proprietary - Automio Inc.
