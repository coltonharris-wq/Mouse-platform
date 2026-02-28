# Mouse Platform - System Architecture

## Overview

The Mouse Platform is a multi-tenant AI employee deployment system that connects business owners with AI workers running in isolated cloud VMs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MOUSE PLATFORM                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Next.js    │    │   Python     │    │    Orgo      │                   │
│  │   Frontend   │◄──►│   API GW     │◄──►│   VM API     │                   │
│  │              │    │              │    │              │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  Customer    │    │  Supabase    │    │  AI Knights  │                   │
│  │  Dashboard   │    │  Database    │    │  (VM Workers)│                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend (Next.js 14)
- **Public Pages**: Marketing, pricing, onboarding
- **Admin Portal**: Platform owner management
- **Dashboard**: Reseller customer/employee management  
- **Customer Portal**: AI employee deployment and monitoring

### 2. API Gateway (Python/FastAPI)
- RESTful API for all platform operations
- WebSocket support for real-time VM streaming
- Authentication middleware with Supabase
- Integration with Orgo VM API

### 3. Orchestrator (TypeScript/Python)
- Core business logic
- VM lifecycle management
- Employee task orchestration
- Billing/usage tracking

### 4. Database (Supabase/Postgres)
- Multi-tenant data with RLS
- Real-time subscriptions
- Auth with role-based access

### 5. VM Infrastructure (Orgo)
- Isolated Linux VMs per AI employee
- Screenshots, mouse/keyboard control
- File upload/download
- WebSocket streaming

## Data Flow

### Customer Onboarding
```
1. Customer signs up via /onboard
2. API Gateway creates customer record
3. Stripe subscription created
4. Customer receives Telegram bot QR
5. Customer can now chat with King Mouse
```

### AI Employee Deployment
```
1. Customer chats "I need a website built"
2. King Mouse processes request
3. Orchestrator calls Orgo API
4. VM spun up with knight agent
5. Knight starts working on task
6. Customer watches live on dashboard
```

### VM Streaming
```
1. Dashboard opens WebSocket connection
2. API Gateway polls Orgo for screenshots
3. Screenshots streamed to frontend
4. Customer sees real-time AI work
```

## Multi-Tenancy Model

```
Platform Owner (Colton)
    │
    ├── Reseller 1 (Automio)
    │       ├── Customer A (Clean Eats)
    │       │       ├── AI Employee 1 (Web Dev)
    │       │       └── AI Employee 2 (Social Media)
    │       └── Customer B
    │
    └── Reseller 2 (Future Partner)
            └── Customer C
```

## Security

- **RLS Policies**: All data access filtered by tenant
- **VM Isolation**: Each AI employee runs in separate VM
- **API Keys**: Encrypted at rest, rotated regularly
- **Stripe Connect**: PCI-compliant payment handling

## Scaling Considerations

- **Horizontal**: Orgo VMs scale independently
- **Database**: Supabase handles connection pooling
- **API**: Stateless design allows load balancing
- **Frontend**: Vercel edge deployment
