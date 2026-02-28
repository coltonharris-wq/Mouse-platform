# Mouse Platform

AI Workforce Platform - Deploy AI employees that work in real cloud VMs. Your customers chat with King Mouse on Telegram, and AI knights execute tasks on real computers they can watch live.

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/coltonh/mouse-platform.git
cd mouse-platform

# 2. Install dependencies
npm install

# 3. Set environment variables (optional for local dev)
cp .env.example .env
# Edit with your API keys if needed

# 4. Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`

No deploy needed to view changes - just run `npm run dev` locally!

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

🤖 **King Mouse** - Customer-facing AI on Telegram with floating chat widget
👥 **AI Employees** - Role-specific agents (Web Dev, Social Media, Sales, etc.)
💻 **Real VMs** - Each employee works on actual cloud computer
📺 **Live Streaming** - Watch employees work in real-time
📹 **Screen Replay** - Record and replay AI employee actions
🛡️ **6-Layer Security** - Comprehensive guardrails and protection
💰 **Work Hours System** - Purchase, track, and manage AI work hours
💳 **Stripe Connect** - Auto-split payments 88/12

## Project Structure

```
mouse-platform/
├── app/                    # Next.js app directory
│   ├── components/         # Shared components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── king-mouse/     # King Mouse components
│   │   └── security/       # Security components
│   ├── dashboard/          # Dashboard pages
│   │   ├── admin/          # Admin portal
│   │   ├── customer/       # Customer portal
│   │   ├── reseller/       # Reseller portal
│   │   └── sales/          # Sales portal
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── api-gateway/            # Python FastAPI backend
│   ├── main.py            # API routes
│   ├── orchestrator.py    # Core business logic
│   ├── ai_agents.py       # King Mouse & Knight agents
│   ├── orgo_client.py     # VM management
│   ├── supabase_client.py
│   └── telegram_bot.py
├── demo/                   # Demo scripts
├── supabase/               # Database schema
└── docs/                  # Documentation
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

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Portals

The platform includes 4 specialized portals:

1. **Admin Portal** (`/dashboard/admin`) - System management
2. **Sales Portal** (`/dashboard/sales`) - Pipeline and leads
3. **Reseller Portal** (`/dashboard/reseller`) - Commission tracking
4. **Customer Portal** (`/dashboard/customer`) - AI employee management

### Key Components

- **King Mouse Avatar** - Floating chat widget for customer support
- **Screen Replay** - Full session recording and playback
- **Security Dashboard** - 6-layer guardrails visualization
- **Work Hours System** - Balance tracking and purchasing

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy instructions
- [DEMO.md](DEMO.md) - Run the demo

## License

Proprietary - Automio Inc.
