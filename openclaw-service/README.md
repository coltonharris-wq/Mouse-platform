# OpenClaw-as-a-Service

A production-grade, multi-tenant AI agent platform with per-customer VM isolation.

## Quick Start

```bash
# Clone and enter directory
cd openclaw-service

# Copy environment template
cp deployment/.env.example .env
# Edit .env with your API keys

# Deploy
./scripts/deploy.sh
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTROL PLANE                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │   API      │  │  Telegram  │  │  WhatsApp  │               │
│  │  Server    │  │  Handler   │  │  Handler   │               │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘               │
│        └───────────────┴───────────────┘                      │
│                      │                                          │
│              ┌───────┴───────┐                                 │
│              │  VM Orchestrator│                               │
│              └───────┬───────┘                                 │
└──────────────────────┼────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
    │Tenant 1 │   │Tenant 2 │   │Tenant N │
    │KingMouse│   │KingMouse│   │KingMouse│
    │+ Knights│   │+ Knights│   │+ Knights│
    └─────────┘   └─────────┘   └─────────┘
```

## Features

- **Multi-tenant isolation**: Each customer gets isolated VMs via Orgo
- **Per-customer bots**: Telegram and WhatsApp bots per tenant
- **Real-time chat**: WebSocket connections for live messaging
- **VM orchestration**: Automatic Knight deployment for tasks
- **Security hardened**: RLS, encryption, rate limiting, WAF
- **Production ready**: Docker, monitoring, health checks

## API Endpoints

### Tenants
- `POST /api/v1/tenants` - Create new tenant
- `GET /api/v1/tenants/me` - Get current tenant

### Conversations
- `POST /api/v1/conversations` - Create conversation
- `POST /api/v1/conversations/{id}/messages` - Send message
- `GET /api/v1/conversations/{id}/messages` - Get history

### Knights (VM Workers)
- `POST /api/v1/knights` - Deploy Knight
- `GET /api/v1/knights` - List Knights
- `DELETE /api/v1/knights/{id}` - Stop Knight

### WebSockets
- `WS /ws/tenant/{id}` - Real-time events

### Webhooks
- `POST /webhooks/telegram/{slug}` - Telegram updates
- `POST /webhooks/whatsapp/{slug}` - WhatsApp updates
- `POST /webhooks/stripe` - Payment events

## CLI Usage

```bash
# Onboard new customer
python scripts/openclaw-cli.py onboard \
  --name "Acme Corp" \
  --email "admin@acme.com" \
  --tier pro

# Deploy Knight
python scripts/openclaw-cli.py deploy-knight \
  --tenant-id <id> \
  --task "Build a website"

# Check status
python scripts/openclaw-cli.py status --tenant-id <id>
```

## Security

- Row Level Security (RLS) on all tenant data
- AES-256 encryption for credentials
- JWT + API key authentication
- Rate limiting per tenant
- Network isolation between VMs
- Security headers (CSP, HSTS, etc.)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis connection |
| `JWT_SECRET` | JWT signing key |
| `ENCRYPTION_KEY` | Credential encryption |
| `ORGO_API_KEY` | Orgo VM API key |
| `ORGO_WORKSPACE_ID` | Orgo workspace |
| `STRIPE_SECRET_KEY` | Stripe payments |

## Testing

```bash
# Run tests
pytest tests/test_suite.py -v

# Run with coverage
pytest tests/test_suite.py --cov=api --cov-report=html

# Security tests
pytest tests/test_suite.py -m security -v
```

## Deployment

### Docker Compose (Recommended)
```bash
docker-compose -f deployment/docker-compose.yml up -d
```

### Kubernetes
```bash
kubectl apply -f deployment/k8s/
```

### Scaling
- API servers: Stateless, scale horizontally
- VM pool: Orgo handles auto-scaling
- Database: Use read replicas

## License

MIT
