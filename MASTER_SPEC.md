# MASTER_SPEC.md — KingMouse AI Employee Platform

> **Purpose:** This is the single source of truth for the entire platform rebuild. Claude Code should execute this document top-to-bottom without asking questions. Every data structure is defined before it's referenced. Every task has acceptance criteria.

> **Repo:** `/Users/jewelsharris/Desktop/Mouse-platform/mouse-platform`
> **Stack:** Next.js 15.1.3 · React 19 · TypeScript · Supabase (Postgres + Auth + RLS) · Stripe · Orgo VM API · n8n
> **Supabase Project:** `dgfnpllysgmszmfifnnk`
> **Live URL:** https://mouse-platform-demo.vercel.app
> **Stripe:** Live keys in Vercel env vars. Webhook active.

---

## SECTION 1: SYSTEM ARCHITECTURE

### 1.1 — What This Platform Is

KingMouse is an **AI Employee platform**. Businesses sign up, choose an industry-specific "Pro" (e.g., Appliance Pro, Roofer Pro, Dentist Pro), pay, and receive a fully configured AI employee running on its own VM.

**This is NOT a chatbot.** KingMouse is an autonomous AI operations manager that handles admin, ordering, follow-ups, scheduling, and decision-making — and only asks the owner to approve things.

### 1.2 — One VM Per Customer

Every paying customer gets **one** Orgo VM. That VM runs:

1. **KingMouse Agent** — An OpenClaw instance (the AI brain)
2. **Pro Profile** — Industry-specific configuration (prompts, tools, workflows)
3. **n8n** — Automation engine for deterministic tasks

There are **no separate employee VMs**. There are **no sub-agents on different VMs**. One VM. One agent. One customer.

```
Customer
  ↓
Dashboard (Next.js on Vercel)
  ↓
KingMouse VM (Orgo)
  ├── OpenClaw Agent (AI reasoning)
  ├── Pro Profile Config (industry behavior)
  └── n8n (automation workflows)
        ↓
  External Systems (email, CRM, calendar, suppliers)
```

### 1.3 — What a "Pro" Is

A Pro is a **configuration profile**, NOT a separate AI agent. It consists of:

| Component | What It Is | Example (Appliance Pro) |
|-----------|-----------|------------------------|
| `prompt.md` | Industry-specific system prompt | "You assist an appliance repair business with scheduling, inventory, and suppliers." |
| `tools.json` | Enabled capabilities | `["inventory_tracking", "appointment_scheduling", "supplier_ordering", "call_receptionist"]` |
| `workflows.json` | n8n workflow templates to deploy | `["inventory_reorder", "appointment_scheduler", "receptionist"]` |
| `onboarding.json` | Extra signup questions for this industry | `["What items do you track?", "Reorder threshold?", "How do you place orders?"]` |
| `dashboard_modules.json` | Which dashboard widgets to show | `["inventory", "orders", "appointments", "supplier_contacts"]` |

### 1.4 — Customer Lifecycle

```
1. Landing Page → Browse Employee Marketplace (Pro listings)
2. Click "Hire" on a Pro → Signup form
3. Business info (name, owner, type)
4. Needs & goals questionnaire
5. Industry-specific questions (from Pro's onboarding.json)
6. Stripe payment
7. Account created in Supabase
8. VM provisioned on Orgo
9. OpenClaw installed with:
   - user.md (from signup answers)
   - soul.md (from Pro prompt.md + business context)
   - Pro profile config
   - n8n workflows deployed
10. Customer enters dashboard (adapted to their Pro)
```

### 1.5 — Dashboard Architecture

One dashboard. Dynamic modules. The dashboard reads the customer's `pro_slug` and renders only the modules defined in that Pro's `dashboard_modules.json`.

Example:
- **Appliance Pro** → Inventory panel, Orders panel, Appointments, Supplier contacts
- **Roofer Pro** → Lead generation, Estimates, Job scheduling
- **Dentist Pro** → Patient scheduling, Recall reminders, Insurance follow-ups

Core modules always visible:
- Chat with KingMouse
- Activity log / task history
- Work hours & billing
- Settings

### 1.6 — Billing Model

**Hourly billing at $4.98/hr** (vs. $35/hr human). NOT token-based. The old token system is being replaced.

| Plan | Price/mo | Hours Included | Overage |
|------|----------|---------------|---------|
| Pro | $97 | 20 hrs | $4.98/hr |
| Growth | $497 | 125 hrs | $4.98/hr |
| Enterprise | $997 | 300 hrs | $4.98/hr |

First 2 hours free (trial).

Work hours are tracked by the VM reporting uptime to Supabase. Billing is **subscription-based** via Stripe (not one-time token purchases).

### 1.7 — Reseller Model

Resellers get 40% recurring commission. They can white-label with custom branding. Reseller markup is capped (defined in admin). Stripe Connect handles instant payouts.

---

## SECTION 2: DATA & STATE CONTRACTS

### 2.1 — Database Schema Changes

The existing schema needs significant changes. Below is the **migration SQL** to run against Supabase.

#### 2.1.1 — New Table: `pro_profiles`

```sql
-- Pro profiles: industry configuration packs
CREATE TABLE pro_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,           -- 'appliance', 'roofer', 'dentist'
    name TEXT NOT NULL,                  -- 'Appliance Pro'
    description TEXT,                    -- Short description for marketplace
    icon_url TEXT,                       -- Marketplace icon
    category TEXT,                       -- 'home_services', 'healthcare', 'trades'
    prompt_template TEXT NOT NULL,       -- System prompt template (has {{business_name}} etc.)
    tools JSONB NOT NULL DEFAULT '[]',   -- ["inventory_tracking", "scheduling", ...]
    workflows JSONB NOT NULL DEFAULT '[]', -- ["inventory_reorder", "appointment_scheduler"]
    onboarding_questions JSONB NOT NULL DEFAULT '[]', -- [{question, field_name, type, options?}]
    dashboard_modules JSONB NOT NULL DEFAULT '[]',    -- ["inventory", "orders", "appointments"]
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pro_profiles_slug ON pro_profiles(slug);
CREATE INDEX idx_pro_profiles_category ON pro_profiles(category);
```

#### 2.1.2 — Alter Table: `customers`

```sql
-- Add Pro profile reference + onboarding data to customers
ALTER TABLE customers ADD COLUMN pro_profile_id UUID REFERENCES pro_profiles(id);
ALTER TABLE customers ADD COLUMN pro_slug TEXT;
ALTER TABLE customers ADD COLUMN owner_name TEXT;
ALTER TABLE customers ADD COLUMN business_type TEXT;
ALTER TABLE customers ADD COLUMN location TEXT;
ALTER TABLE customers ADD COLUMN onboarding_answers JSONB DEFAULT '{}';
ALTER TABLE customers ADD COLUMN vm_computer_id TEXT;
ALTER TABLE customers ADD COLUMN vm_status TEXT DEFAULT 'pending'; -- pending, provisioning, running, stopped, error
ALTER TABLE customers ADD COLUMN vm_provisioned_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN subscription_plan TEXT; -- 'pro', 'growth', 'enterprise'
ALTER TABLE customers ADD COLUMN hours_included INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN hours_used DECIMAL(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN trial_hours_remaining DECIMAL(4,2) DEFAULT 2.0;

-- Drop old token-related columns (if they exist elsewhere)
-- The old token system is dead. Hourly billing only.

CREATE INDEX idx_customers_pro_slug ON customers(pro_slug);
CREATE INDEX idx_customers_vm_status ON customers(vm_status);
```

#### 2.1.3 — New Table: `work_sessions`

```sql
-- Tracks VM work time for hourly billing
CREATE TABLE work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    vm_computer_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER, -- computed on end
    billed_hours DECIMAL(6,2),
    billing_rate DECIMAL(6,2) DEFAULT 4.98,
    status TEXT DEFAULT 'active', -- active, completed, error
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_work_sessions_customer ON work_sessions(customer_id);
CREATE INDEX idx_work_sessions_status ON work_sessions(status);
```

#### 2.1.4 — New Table: `automation_workflows`

```sql
-- Tracks deployed n8n workflows per customer
CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    workflow_slug TEXT NOT NULL,        -- 'inventory_reorder', 'appointment_scheduler'
    workflow_name TEXT NOT NULL,        -- 'Inventory Reorder'
    n8n_workflow_id TEXT,              -- n8n's internal ID once deployed
    config JSONB DEFAULT '{}',         -- Customer-specific config (thresholds, etc.)
    status TEXT DEFAULT 'pending',     -- pending, active, paused, error
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_customer ON automation_workflows(customer_id);
```

#### 2.1.5 — New Table: `subscription_plans`

```sql
-- Plan definitions (replaces token packages)
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,           -- 'pro', 'growth', 'enterprise'
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,        -- monthly price in cents
    hours_included INTEGER NOT NULL,     -- included hours per month
    overage_rate_cents INTEGER DEFAULT 498, -- $4.98 = 498 cents per hour
    stripe_price_id TEXT,               -- Stripe recurring Price ID
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.1.6 — Alter Table: `resellers`

```sql
-- Add markup cap for resellers
ALTER TABLE resellers ADD COLUMN markup_cap_percent INTEGER DEFAULT 50;
ALTER TABLE resellers ADD COLUMN commission_percent INTEGER DEFAULT 40;
ALTER TABLE resellers ADD COLUMN custom_domain TEXT;
```

#### 2.1.7 — RLS Policies for New Tables

```sql
-- pro_profiles: public read, admin write
ALTER TABLE pro_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active pro profiles" ON pro_profiles
    FOR SELECT USING (is_active = true);
CREATE POLICY "Platform owners manage pro profiles" ON pro_profiles
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));

-- work_sessions: customer reads own, platform reads all
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own work sessions" ON work_sessions
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = work_sessions.customer_id));
CREATE POLICY "Platform owners all work sessions" ON work_sessions
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));

-- automation_workflows: customer reads own
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own automation workflows" ON automation_workflows
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = automation_workflows.customer_id));
CREATE POLICY "Platform owners all automation workflows" ON automation_workflows
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));

-- subscription_plans: public read
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active plans" ON subscription_plans
    FOR SELECT USING (is_active = true);
CREATE POLICY "Platform owners manage plans" ON subscription_plans
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
```

#### 2.1.8 — Seed Data: Initial Pro Profiles

```sql
INSERT INTO pro_profiles (slug, name, description, category, prompt_template, tools, workflows, onboarding_questions, dashboard_modules, sort_order) VALUES
(
    'appliance',
    'Appliance Pro',
    'AI operations manager for appliance repair businesses. Handles inventory, scheduling, and supplier coordination.',
    'home_services',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Appliance Repair\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Inventory tracking and reorder alerts\n- Appointment scheduling and reminders\n- Supplier ordering and coordination\n- Customer follow-ups\n- Admin tasks and documentation\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["inventory_tracking", "appointment_scheduling", "supplier_ordering", "call_receptionist", "customer_followup"]',
    '["inventory_reorder", "appointment_scheduler", "receptionist", "supplier_order"]',
    '[{"question": "What items do you track inventory for?", "field_name": "inventory_items", "type": "textarea"}, {"question": "What quantity should trigger a reorder alert?", "field_name": "reorder_threshold", "type": "number"}, {"question": "How do you typically place supplier orders?", "field_name": "order_method", "type": "select", "options": ["Website", "Email", "Phone", "Other"]}, {"question": "Do you want automated appointment reminders?", "field_name": "auto_reminders", "type": "boolean"}]',
    '["chat", "inventory", "orders", "appointments", "supplier_contacts", "activity_log", "billing"]',
    1
),
(
    'roofer',
    'Roofer Pro',
    'AI operations manager for roofing companies. Lead generation, estimates, job scheduling, and crew coordination.',
    'trades',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Roofing\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Lead capture and qualification\n- Estimate generation and follow-up\n- Job scheduling and crew coordination\n- Material ordering\n- Customer communication\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["lead_capture", "estimate_generation", "job_scheduling", "material_ordering", "crew_coordination", "call_receptionist"]',
    '["lead_capture", "estimate_followup", "job_scheduler", "receptionist"]',
    '[{"question": "What roofing services do you offer?", "field_name": "services", "type": "textarea"}, {"question": "Average estimate turnaround time?", "field_name": "estimate_turnaround", "type": "select", "options": ["Same day", "24 hours", "48 hours", "1 week"]}, {"question": "How many crew members do you manage?", "field_name": "crew_size", "type": "number"}, {"question": "Do you want automated lead follow-up?", "field_name": "auto_lead_followup", "type": "boolean"}]',
    '["chat", "leads", "estimates", "jobs", "crew", "activity_log", "billing"]',
    2
),
(
    'dentist',
    'Dentist Pro',
    'AI operations manager for dental practices. Patient scheduling, recall management, insurance follow-ups.',
    'healthcare',
    E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Dental Practice\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle:\n- Patient scheduling and reminders\n- Recall management (6-month cleanings, etc.)\n- Insurance verification and follow-up\n- New patient intake\n- Admin tasks and documentation\n\nYou only ask {{owner_name}} to approve decisions. You handle everything else autonomously.',
    '["patient_scheduling", "recall_management", "insurance_followup", "patient_intake", "call_receptionist"]',
    '["appointment_scheduler", "recall_reminder", "insurance_verify", "receptionist"]',
    '[{"question": "How many operatories/chairs?", "field_name": "operatories", "type": "number"}, {"question": "Default recall interval?", "field_name": "recall_interval", "type": "select", "options": ["3 months", "6 months", "12 months"]}, {"question": "Do you verify insurance before appointments?", "field_name": "insurance_verify", "type": "boolean"}, {"question": "What practice management software do you use?", "field_name": "pms_software", "type": "text"}]',
    '["chat", "patients", "appointments", "recalls", "insurance", "activity_log", "billing"]',
    3
);
```

#### 2.1.9 — Seed Data: Subscription Plans

```sql
INSERT INTO subscription_plans (slug, name, price_cents, hours_included, overage_rate_cents, features, sort_order) VALUES
('pro', 'Pro', 9700, 20, 498, '["20 hours/month", "1 AI employee", "Core automations", "Email support"]', 1),
('growth', 'Growth', 49700, 125, 498, '["125 hours/month", "1 AI employee", "Advanced automations", "Priority support", "Custom workflows"]', 2),
('enterprise', 'Enterprise', 99700, 300, 498, '["300 hours/month", "1 AI employee", "All automations", "Dedicated support", "Custom integrations", "API access"]', 3);
```

### 2.2 — Pro Profile Schema (TypeScript)

```typescript
// src/types/pro.ts

export interface ProProfile {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: string;
  prompt_template: string;
  tools: string[];
  workflows: string[];
  onboarding_questions: OnboardingQuestion[];
  dashboard_modules: string[];
  is_active: boolean;
  sort_order: number;
}

export interface OnboardingQuestion {
  question: string;
  field_name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  hours_included: number;
  overage_rate_cents: number;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
}
```

### 2.3 — Dashboard Module Registry

```typescript
// src/config/dashboard-modules.ts

export interface DashboardModule {
  slug: string;
  name: string;
  icon: string;           // Lucide icon name
  component: string;      // React component path
  route: string;          // Dashboard sub-route
  description: string;
}

// Master registry — all possible modules
export const DASHBOARD_MODULES: Record<string, DashboardModule> = {
  chat: {
    slug: 'chat',
    name: 'Chat with KingMouse',
    icon: 'MessageSquare',
    component: 'ChatModule',
    route: '/dashboard/chat',
    description: 'Talk to your AI employee'
  },
  inventory: {
    slug: 'inventory',
    name: 'Inventory',
    icon: 'Package',
    component: 'InventoryModule',
    route: '/dashboard/inventory',
    description: 'Track stock levels and reorder alerts'
  },
  orders: {
    slug: 'orders',
    name: 'Orders',
    icon: 'ShoppingCart',
    component: 'OrdersModule',
    route: '/dashboard/orders',
    description: 'Supplier orders and purchase history'
  },
  appointments: {
    slug: 'appointments',
    name: 'Appointments',
    icon: 'Calendar',
    component: 'AppointmentsModule',
    route: '/dashboard/appointments',
    description: 'Schedule and manage appointments'
  },
  supplier_contacts: {
    slug: 'supplier_contacts',
    name: 'Suppliers',
    icon: 'Truck',
    component: 'SuppliersModule',
    route: '/dashboard/suppliers',
    description: 'Supplier directory and contact info'
  },
  leads: {
    slug: 'leads',
    name: 'Leads',
    icon: 'UserPlus',
    component: 'LeadsModule',
    route: '/dashboard/leads',
    description: 'Incoming leads and follow-up status'
  },
  estimates: {
    slug: 'estimates',
    name: 'Estimates',
    icon: 'FileText',
    component: 'EstimatesModule',
    route: '/dashboard/estimates',
    description: 'Generate and track estimates'
  },
  jobs: {
    slug: 'jobs',
    name: 'Jobs',
    icon: 'Briefcase',
    component: 'JobsModule',
    route: '/dashboard/jobs',
    description: 'Active and completed jobs'
  },
  crew: {
    slug: 'crew',
    name: 'Crew',
    icon: 'Users',
    component: 'CrewModule',
    route: '/dashboard/crew',
    description: 'Crew assignments and scheduling'
  },
  patients: {
    slug: 'patients',
    name: 'Patients',
    icon: 'Heart',
    component: 'PatientsModule',
    route: '/dashboard/patients',
    description: 'Patient records and history'
  },
  recalls: {
    slug: 'recalls',
    name: 'Recalls',
    icon: 'Bell',
    component: 'RecallsModule',
    route: '/dashboard/recalls',
    description: 'Patient recall scheduling'
  },
  insurance: {
    slug: 'insurance',
    name: 'Insurance',
    icon: 'Shield',
    component: 'InsuranceModule',
    route: '/dashboard/insurance',
    description: 'Insurance verification and claims'
  },
  activity_log: {
    slug: 'activity_log',
    name: 'Activity Log',
    icon: 'History',
    component: 'ActivityLogModule',
    route: '/dashboard/activity',
    description: 'Everything KingMouse has done'
  },
  billing: {
    slug: 'billing',
    name: 'Billing & Hours',
    icon: 'Clock',
    component: 'BillingModule',
    route: '/dashboard/billing',
    description: 'Work hours used and subscription status'
  }
};

// Resolve which modules a customer sees
export function getModulesForPro(dashboardModuleSlugs: string[]): DashboardModule[] {
  return dashboardModuleSlugs
    .map(slug => DASHBOARD_MODULES[slug])
    .filter(Boolean);
}
```

### 2.4 — API Contracts

#### 2.4.1 — `GET /api/pro-profiles`
List all active Pro profiles (for marketplace/onboarding).

**Response:**
```json
{
  "profiles": [
    {
      "slug": "appliance",
      "name": "Appliance Pro",
      "description": "AI operations manager for appliance repair...",
      "icon_url": "/icons/appliance.svg",
      "category": "home_services",
      "onboarding_questions": [...],
      "dashboard_modules": [...]
    }
  ]
}
```

#### 2.4.2 — `GET /api/pro-profiles/[slug]`
Get a single Pro profile by slug.

**Response:** Single profile object (same shape as array item above).

#### 2.4.3 — `POST /api/onboarding/complete`
Called after Stripe payment succeeds. Creates customer, provisions VM, injects config.

**Request:**
```json
{
  "stripe_session_id": "cs_live_xxx",
  "business_name": "Bob's Appliance Repair",
  "owner_name": "Bob Smith",
  "email": "bob@example.com",
  "location": "Dallas, TX",
  "pro_slug": "appliance",
  "plan_slug": "growth",
  "onboarding_answers": {
    "inventory_items": "washers, dryers, refrigerators",
    "reorder_threshold": 5,
    "order_method": "Email",
    "auto_reminders": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "customer_id": "cust_xxx",
  "vm_status": "provisioning",
  "message": "Your AI employee is being set up. Ready in ~2 minutes."
}
```

#### 2.4.4 — `POST /api/vm/provision`
Replaces the old `/api/vm/configure`. Provisions a single KingMouse VM for a customer.

**Request:**
```json
{
  "customer_id": "cust_xxx",
  "pro_slug": "appliance",
  "business_name": "Bob's Appliance Repair",
  "owner_name": "Bob Smith",
  "onboarding_answers": {}
}
```

**Response:**
```json
{
  "success": true,
  "computer_id": "orgo_xxx",
  "status": "provisioning"
}
```

#### 2.4.5 — `GET /api/vm/status?customer_id=xxx`
Returns VM status for a customer.

**Response:**
```json
{
  "status": "running",
  "computer_id": "orgo_xxx",
  "uptime_hours": 14.5,
  "last_heartbeat": "2026-03-11T04:30:00Z"
}
```

#### 2.4.6 — `POST /api/vm/chat`
Send a message to the customer's KingMouse VM. Routes through OpenClaw WebSocket.

**Request:**
```json
{
  "customer_id": "cust_xxx",
  "message": "What's my inventory status?"
}
```

**Response:**
```json
{
  "response": "Your current inventory: Washers (12), Dryers (8), Refrigerators (3). Refrigerators are below your reorder threshold of 5. Want me to place an order?",
  "actions_taken": []
}
```

#### 2.4.7 — `GET /api/dashboard/modules?customer_id=xxx`
Returns the dashboard module config for a customer based on their Pro.

**Response:**
```json
{
  "pro_slug": "appliance",
  "pro_name": "Appliance Pro",
  "modules": [
    {"slug": "chat", "name": "Chat with KingMouse", "icon": "MessageSquare", "route": "/dashboard/chat"},
    {"slug": "inventory", "name": "Inventory", "icon": "Package", "route": "/dashboard/inventory"}
  ]
}
```

#### 2.4.8 — `GET /api/billing/usage?customer_id=xxx`
Returns current billing period usage.

**Response:**
```json
{
  "plan": "growth",
  "hours_included": 125,
  "hours_used": 47.5,
  "hours_remaining": 77.5,
  "overage_hours": 0,
  "overage_cost_cents": 0,
  "billing_period_start": "2026-03-01T00:00:00Z",
  "billing_period_end": "2026-03-31T23:59:59Z"
}
```

#### 2.4.9 — `POST /api/stripe/create-subscription`
Creates a Stripe subscription for a customer during onboarding.

**Request:**
```json
{
  "email": "bob@example.com",
  "plan_slug": "growth",
  "pro_slug": "appliance",
  "success_url": "https://mouse-platform-demo.vercel.app/onboarding/success",
  "cancel_url": "https://mouse-platform-demo.vercel.app/onboarding/cancel"
}
```

**Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/xxx",
  "session_id": "cs_live_xxx"
}
```

#### 2.4.10 — `POST /api/stripe/webhook`
Handles Stripe webhook events. On `checkout.session.completed`, triggers customer creation + VM provisioning.

#### 2.4.11 — `GET /api/admin/customers`
Admin endpoint. Lists all customers with VM status, Pro, plan, hours used.

**Response:**
```json
{
  "customers": [
    {
      "id": "cust_xxx",
      "company_name": "Bob's Appliance Repair",
      "email": "bob@example.com",
      "pro_slug": "appliance",
      "plan": "growth",
      "vm_status": "running",
      "hours_used": 47.5,
      "created_at": "2026-03-10T..."
    }
  ]
}
```

### 2.5 — File Structure (Target State)

```
frontend/src/
├── app/
│   ├── api/
│   │   ├── pro-profiles/
│   │   │   ├── route.ts                    # GET all profiles
│   │   │   └── [slug]/route.ts             # GET single profile
│   │   ├── onboarding/
│   │   │   └── complete/route.ts           # POST complete onboarding
│   │   ├── vm/
│   │   │   ├── provision/route.ts          # POST provision VM (replaces configure)
│   │   │   ├── status/route.ts             # GET VM status (keep, update)
│   │   │   ├── chat/route.ts               # POST chat with VM
│   │   │   └── telemetry/route.ts          # POST VM heartbeat (keep)
│   │   ├── dashboard/
│   │   │   └── modules/route.ts            # GET dashboard modules for customer
│   │   ├── billing/
│   │   │   └── usage/route.ts              # GET billing usage
│   │   ├── stripe/
│   │   │   ├── create-subscription/route.ts # POST create Stripe subscription checkout
│   │   │   └── webhook/route.ts            # POST Stripe webhook handler
│   │   └── admin/
│   │       └── customers/route.ts          # GET admin customer list
│   ├── onboarding/
│   │   ├── page.tsx                        # Onboarding flow (multi-step)
│   │   ├── success/page.tsx                # Post-payment success + VM deploying
│   │   └── cancel/page.tsx                 # Payment cancelled
│   ├── dashboard/
│   │   ├── layout.tsx                      # Dashboard shell (sidebar from Pro modules)
│   │   ├── page.tsx                        # Dashboard home (overview)
│   │   ├── chat/page.tsx                   # Chat with KingMouse
│   │   ├── inventory/page.tsx              # Inventory module
│   │   ├── orders/page.tsx                 # Orders module
│   │   ├── appointments/page.tsx           # Appointments module
│   │   ├── leads/page.tsx                  # Leads module
│   │   ├── estimates/page.tsx              # Estimates module
│   │   ├── jobs/page.tsx                   # Jobs module
│   │   ├── billing/page.tsx                # Billing & hours
│   │   ├── activity/page.tsx               # Activity log
│   │   └── settings/page.tsx               # Account settings
│   ├── admin/
│   │   ├── layout.tsx                      # Admin layout
│   │   ├── page.tsx                        # Admin dashboard
│   │   └── customers/page.tsx              # Customer management
│   ├── marketplace/
│   │   └── page.tsx                        # Public Pro marketplace (landing page section)
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Landing page
│   └── pricing/page.tsx                    # Pricing page (update to subscription plans)
├── components/
│   ├── onboarding/
│   │   ├── StepBusinessInfo.tsx
│   │   ├── StepNeedsGoals.tsx
│   │   ├── StepProSelection.tsx
│   │   ├── StepIndustryQuestions.tsx
│   │   └── StepPayment.tsx
│   ├── dashboard/
│   │   ├── DashboardShell.tsx              # Layout with dynamic sidebar
│   │   ├── ModuleLoader.tsx                # Dynamic module renderer
│   │   ├── ChatModule.tsx
│   │   ├── InventoryModule.tsx
│   │   ├── OrdersModule.tsx
│   │   ├── AppointmentsModule.tsx
│   │   ├── LeadsModule.tsx
│   │   ├── EstimatesModule.tsx
│   │   ├── JobsModule.tsx
│   │   ├── CrewModule.tsx
│   │   ├── PatientsModule.tsx
│   │   ├── RecallsModule.tsx
│   │   ├── InsuranceModule.tsx
│   │   ├── SuppliersModule.tsx
│   │   ├── ActivityLogModule.tsx
│   │   └── BillingModule.tsx
│   ├── marketplace/
│   │   ├── ProCard.tsx                     # Pro profile card for marketplace
│   │   └── ProGrid.tsx                     # Grid of Pro cards
│   └── ui/                                 # Shared UI primitives
├── config/
│   └── dashboard-modules.ts                # Module registry (defined in §2.3)
├── types/
│   └── pro.ts                              # TypeScript types (defined in §2.2)
├── lib/
│   ├── orgo.ts                             # Orgo API client (keep, update)
│   ├── stripe.ts                           # Stripe client (rewrite for subscriptions)
│   ├── supabase-server.ts                  # Supabase client (keep)
│   └── vm-provision.ts                     # VM provisioning logic (new)
```

---

## SECTION 3: THE 32 TASKS

### Phase 1 — Database & Auth (Run migrations, seed data)

---

**Task 1: Run schema migrations**
- **What:** Execute all SQL from §2.1 against Supabase. Create new tables, alter existing ones, add RLS policies, seed Pro profiles and subscription plans.
- **Files:** `supabase/migrations/001_pro_profiles.sql`, `supabase/migrations/002_alter_customers.sql`, `supabase/migrations/003_work_sessions.sql`, `supabase/migrations/004_automation_workflows.sql`, `supabase/migrations/005_subscription_plans.sql`, `supabase/migrations/006_alter_resellers.sql`, `supabase/migrations/007_rls_policies.sql`, `supabase/migrations/008_seed_data.sql`
- **Implementation:** Write each migration as a separate `.sql` file. Combine all the SQL from §2.1 split by logical concern. Run them via Supabase CLI or dashboard SQL editor.
- **Acceptance:** `SELECT * FROM pro_profiles` returns 3 rows (appliance, roofer, dentist). `SELECT * FROM subscription_plans` returns 3 rows. `customers` table has new columns (`pro_slug`, `vm_computer_id`, `vm_status`, etc.). All RLS policies are active.

---

**Task 2: Create TypeScript types**
- **What:** Create the shared type definitions from §2.2.
- **Files:** `frontend/src/types/pro.ts`
- **Implementation:** Copy the TypeScript interfaces from §2.2 verbatim.
- **Acceptance:** File compiles with no errors. Types are importable from other files.

---

**Task 3: Create dashboard module registry**
- **What:** Create the module config from §2.3.
- **Files:** `frontend/src/config/dashboard-modules.ts`
- **Implementation:** Copy the registry from §2.3 verbatim.
- **Acceptance:** `getModulesForPro(["chat", "inventory"])` returns 2 module objects.

---

### Phase 2 — Core API Routes

---

**Task 4: Pro profiles API**
- **What:** `GET /api/pro-profiles` and `GET /api/pro-profiles/[slug]`
- **Files:** `frontend/src/app/api/pro-profiles/route.ts`, `frontend/src/app/api/pro-profiles/[slug]/route.ts`
- **Implementation:** Query `pro_profiles` table from Supabase. Filter by `is_active = true`. Return JSON per §2.4.1 and §2.4.2.
- **Acceptance:** `curl /api/pro-profiles` returns array of 3 profiles. `curl /api/pro-profiles/appliance` returns single profile.

---

**Task 5: Remove cloud fallback from VM chat**
- **What:** If the customer's VM is not running, return an error. Never fall back to direct LLM API calls. The VM IS the product.
- **Files:** `frontend/src/app/api/vm/chat/route.ts` (create or update existing)
- **Implementation:** Check `customers.vm_status`. If not `'running'`, return `{ error: "Your AI employee is currently offline. Please contact support.", status: 503 }`. Remove any code that calls Moonshot/OpenAI/etc directly as a fallback.
- **Acceptance:** With a stopped VM, `POST /api/vm/chat` returns 503 with error message. No LLM API calls are made.

---

**Task 6: VM provisioning endpoint**
- **What:** `POST /api/vm/provision` — replaces the old `/api/vm/configure`. Provisions a single KingMouse VM for a customer.
- **Files:** `frontend/src/app/api/vm/provision/route.ts`, `frontend/src/lib/vm-provision.ts`
- **Implementation:**
  1. Receive `customer_id`, `pro_slug`, `business_name`, `owner_name`, `onboarding_answers`
  2. Look up Pro profile from DB
  3. Create Orgo VM (name = customer's email, per Task 32)
  4. Wait for boot (poll every 5s, max 60s)
  5. Generate `soul.md` by interpolating Pro's `prompt_template` with business data
  6. Generate `user.md` with business details
  7. Upload both to VM via Orgo bash
  8. Install OpenClaw + configure with Kimi K2.5 model
  9. Update `customers` row: `vm_computer_id`, `vm_status = 'provisioning'`
  10. Return success
- **Acceptance:** Calling endpoint creates an Orgo VM, uploads config files, starts provisioning. Customer row in DB shows `vm_computer_id` populated and `vm_status = 'provisioning'`.

---

**Task 7: Dashboard modules API**
- **What:** `GET /api/dashboard/modules?customer_id=xxx`
- **Files:** `frontend/src/app/api/dashboard/modules/route.ts`
- **Implementation:** Look up customer's `pro_slug`. Look up Pro profile's `dashboard_modules`. Map through the module registry (§2.3). Return module list.
- **Acceptance:** For a customer with `pro_slug = 'appliance'`, returns modules: chat, inventory, orders, appointments, supplier_contacts, activity_log, billing.

---

**Task 8: Billing usage API**
- **What:** `GET /api/billing/usage?customer_id=xxx`
- **Files:** `frontend/src/app/api/billing/usage/route.ts`
- **Implementation:** Query `work_sessions` for current billing period (current calendar month). Sum `billed_hours`. Compare to `customers.hours_included`. Calculate overage.
- **Acceptance:** Returns correct hours used, remaining, and overage calculation.

---

**Task 9: Stripe subscription checkout**
- **What:** `POST /api/stripe/create-subscription` — Creates a Stripe Checkout session for a recurring subscription (not one-time token purchase).
- **Files:** `frontend/src/app/api/stripe/create-subscription/route.ts`
- **Implementation:**
  1. Look up plan from `subscription_plans` table
  2. Create Stripe Checkout session in `subscription` mode
  3. Use `stripe_price_id` from the plan if set, otherwise create a price on the fly
  4. Store `pro_slug` and `plan_slug` in Checkout metadata
  5. Return checkout URL
- **Acceptance:** Calling endpoint redirects to Stripe Checkout. Checkout shows recurring subscription price.

---

**Task 10: Stripe webhook handler (rewrite)**
- **What:** Handle `checkout.session.completed` for subscriptions. On success: create customer record, trigger VM provisioning.
- **Files:** `frontend/src/app/api/stripe/webhook/route.ts`
- **Implementation:**
  1. Verify Stripe webhook signature
  2. On `checkout.session.completed`:
     a. Extract metadata: `pro_slug`, `plan_slug`, customer email, business info
     b. Create customer in Supabase with `pro_slug`, `subscription_plan`, `hours_included`
     c. Create profile linking auth user to customer
     d. Call internal VM provisioning logic (from Task 6)
  3. On `invoice.paid`: reset `hours_used` to 0 for new billing period
  4. On `customer.subscription.deleted`: set `vm_status = 'stopped'`, stop VM
- **Acceptance:** Completing a Stripe Checkout creates a customer in DB, starts VM provisioning. Invoice paid resets hours.

---

**Task 11: Work hours billing loop**
- **What:** VMs report uptime via telemetry endpoint. Track and deduct hours in real-time.
- **Files:** `frontend/src/app/api/vm/telemetry/route.ts` (update existing)
- **Implementation:**
  1. VM sends heartbeat every 5 minutes with `computer_id`
  2. Endpoint looks up customer by `vm_computer_id`
  3. If no active `work_session`, create one
  4. Update `work_sessions.ended_at` to now, compute `duration_seconds`
  5. Update `customers.hours_used` with cumulative total
  6. If `hours_used > hours_included` and no active subscription overage, log overage event
- **Acceptance:** After 1 hour of VM uptime (12 heartbeats), `customers.hours_used` increments by ~1.0. `work_sessions` table has accurate records.

---

**Task 12: Admin customers endpoint**
- **What:** `GET /api/admin/customers`
- **Files:** `frontend/src/app/api/admin/customers/route.ts`
- **Implementation:** Query all customers joined with pro_profiles and work_sessions. Require platform_owner auth.
- **Acceptance:** Returns full customer list with Pro, plan, VM status, hours used.

---

### Phase 3 — Onboarding Flow (UI)

---

**Task 13: Onboarding multi-step form**
- **What:** Build the 5-step onboarding flow from §1.4.
- **Files:** `frontend/src/app/onboarding/page.tsx`, `frontend/src/components/onboarding/StepBusinessInfo.tsx`, `StepNeedsGoals.tsx`, `StepProSelection.tsx`, `StepIndustryQuestions.tsx`, `StepPayment.tsx`
- **Implementation:**
  - Step 1 (StepBusinessInfo): business name, owner name, email, location, business type
  - Step 2 (StepNeedsGoals): What do you need help with? (checkboxes: scheduling, inventory, leads, customer comms, admin, other)
  - Step 3 (StepProSelection): Fetch Pro profiles from API, display as cards. User selects one. Show description + what's included.
  - Step 4 (StepIndustryQuestions): Render the selected Pro's `onboarding_questions` dynamically. Each question rendered based on its `type`.
  - Step 5 (StepPayment): Select plan (Pro/Growth/Enterprise). Show pricing. "Start Subscription" button → calls `/api/stripe/create-subscription` → redirects to Stripe Checkout.
  - State managed with React useState, passed between steps.
- **Acceptance:** User can complete all 5 steps. Clicking "Start Subscription" redirects to Stripe Checkout with correct plan and metadata.

---

**Task 14: Onboarding success page**
- **What:** After Stripe payment, user lands here. Shows "deploying" animation while VM provisions.
- **Files:** `frontend/src/app/onboarding/success/page.tsx`
- **Implementation:**
  1. Read `session_id` from URL params
  2. Call `/api/onboarding/complete` with session_id + stored onboarding data
  3. Poll `/api/vm/status` every 5s until `vm_status = 'running'`
  4. Show deploying animation with copy: "For your security, we're putting King Mouse in a sandbox" (Task 31)
  5. On ready, redirect to `/dashboard`
- **Acceptance:** After payment, page shows deploying animation. When VM is ready, redirects to dashboard.

---

**Task 15: Onboarding complete API**
- **What:** `POST /api/onboarding/complete` — orchestrates post-payment setup.
- **Files:** `frontend/src/app/api/onboarding/complete/route.ts`
- **Implementation:**
  1. Verify Stripe session completed
  2. Create customer in Supabase (if webhook hasn't already)
  3. Trigger VM provisioning
  4. Return customer_id and vm_status
- **Acceptance:** Idempotent — calling twice with same session_id doesn't create duplicate customers.

---

### Phase 4 — Dashboard (UI)

---

**Task 16: Dashboard shell with dynamic sidebar**
- **What:** Dashboard layout that renders sidebar navigation based on customer's Pro modules.
- **Files:** `frontend/src/app/dashboard/layout.tsx`, `frontend/src/components/dashboard/DashboardShell.tsx`
- **Implementation:**
  1. On mount, fetch `/api/dashboard/modules?customer_id=xxx`
  2. Render sidebar with module icons and names as navigation links
  3. Highlight active route
  4. Core modules always present: chat (top), activity_log, billing, settings (bottom)
  5. Pro-specific modules in the middle section
  6. Mobile: collapsible sidebar / bottom nav
- **Acceptance:** Appliance Pro customer sees: Chat, Inventory, Orders, Appointments, Suppliers, Activity Log, Billing, Settings. Roofer Pro sees: Chat, Leads, Estimates, Jobs, Crew, Activity Log, Billing, Settings.

---

**Task 17: Dashboard home / overview page**
- **What:** Dashboard landing page showing summary cards.
- **Files:** `frontend/src/app/dashboard/page.tsx` (rewrite existing)
- **Implementation:**
  1. Show Pro name at top ("Appliance Pro — Active")
  2. Hours used card (hours_used / hours_included with progress bar)
  3. Recent activity feed (last 10 items from activity log)
  4. Quick action buttons based on Pro modules
  5. VM status indicator (green dot = running)
  6. Remove ALL token-related UI (old system is dead)
- **Acceptance:** Dashboard loads, shows correct Pro name, hours used, activity feed. No token references anywhere.

---

**Task 18: Chat module**
- **What:** Chat interface for talking to KingMouse.
- **Files:** `frontend/src/app/dashboard/chat/page.tsx`, `frontend/src/components/dashboard/ChatModule.tsx`
- **Implementation:**
  1. Text input + send button
  2. Messages displayed in chat bubble format
  3. Send via `POST /api/vm/chat`
  4. Show typing indicator while waiting
  5. Display response with any actions taken
  6. Persist chat history (query `chat_logs` table)
  7. If VM offline, show error banner (not fallback)
- **Acceptance:** User types message, gets response from KingMouse VM. Chat history persists across page reloads.

---

**Task 19: Billing module**
- **What:** Shows subscription status, hours used, and billing history.
- **Files:** `frontend/src/app/dashboard/billing/page.tsx`, `frontend/src/components/dashboard/BillingModule.tsx`
- **Implementation:**
  1. Fetch `/api/billing/usage`
  2. Show plan name, price, hours included
  3. Progress bar: hours used / hours included
  4. Overage section if over limit
  5. Work session history table
  6. "Upgrade Plan" button if on lower tier
  7. Link to Stripe Customer Portal for subscription management
- **Acceptance:** Shows accurate hours used. Progress bar reflects real usage.

---

**Task 20: Activity log module**
- **What:** Shows everything KingMouse has done.
- **Files:** `frontend/src/app/dashboard/activity/page.tsx`, `frontend/src/components/dashboard/ActivityLogModule.tsx`
- **Implementation:**
  1. Query `chat_logs` + `tasks` tables for customer
  2. Display chronologically with type badges (chat, task, automation, notification)
  3. Filterable by type
  4. Paginated (20 per page)
- **Acceptance:** Shows chronological activity feed. Filters work.

---

**Task 21: Placeholder modules for industry-specific features**
- **What:** Create placeholder pages for: inventory, orders, appointments, suppliers, leads, estimates, jobs, crew, patients, recalls, insurance.
- **Files:** `frontend/src/app/dashboard/[module]/page.tsx` for each
- **Implementation:** Each page shows:
  1. Module name + icon
  2. "Coming soon — KingMouse is managing this for you" message
  3. Link to chat ("Ask KingMouse about your [module]")
  4. These will be built out as n8n integrations come online
- **Acceptance:** Each module route loads without error. Shows appropriate placeholder.

---

### Phase 5 — Stripe & Billing Updates

---

**Task 22: Rewrite Stripe config for subscriptions**
- **What:** Replace the token-based Stripe config with subscription plans.
- **Files:** `frontend/src/lib/stripe.ts`
- **Implementation:**
  1. Remove `TOKEN_PACKAGES`, `TOKEN_COSTS`, `formatTokens`, `isLowBalance`, `LOW_BALANCE_THRESHOLD`
  2. Add `SUBSCRIPTION_PLANS` matching the DB seed data
  3. Add `createSubscriptionCheckout(email, planSlug, proSlug, successUrl, cancelUrl)` function
  4. Add `createCustomerPortalSession(stripeCustomerId)` for managing subscriptions
  5. Keep `formatPrice` helper
- **Acceptance:** No token references in stripe.ts. Subscription checkout creates correctly.

---

**Task 23: Update pricing page**
- **What:** Replace token pricing with subscription plans.
- **Files:** `frontend/src/app/pricing/page.tsx`
- **Implementation:**
  1. Show 3 plans: Pro ($97/mo), Growth ($497/mo), Enterprise ($997/mo)
  2. Each shows: hours included, price per hour ($4.98), features
  3. "First 2 hours free" banner
  4. CTA buttons link to onboarding flow (not direct Stripe)
  5. "$4.98/hr vs $35/hr" comparison graphic
- **Acceptance:** Pricing page shows subscription plans. CTAs link to `/onboarding`.

---

**Task 24: Stripe checkout branding**
- **What:** Custom colors on Stripe Checkout to match Mouse branding.
- **Files:** `frontend/src/app/api/stripe/create-subscription/route.ts`
- **Implementation:** Use `stripe.checkout.sessions.create` with `custom_text` and brand colors. Set `payment_method_types: ['card']`. Add company logo.
- **Acceptance:** Stripe Checkout page shows Mouse branding, not default Stripe styling.

---

### Phase 6 — VM Provisioning Details

---

**Task 25: VM naming from email**
- **What:** When creating an Orgo VM, use the customer's signup email as the computer name.
- **Files:** `frontend/src/lib/vm-provision.ts`
- **Implementation:** In `createComputer` call, set `name` to sanitized email (replace `@` and `.` with `-`). Example: `bob-example-com`.
- **Acceptance:** Orgo VM is created with name derived from customer email.

---

**Task 26: Pro profile injection into VM**
- **What:** When provisioning, inject the Pro's configuration into the OpenClaw instance on the VM.
- **Files:** `frontend/src/lib/vm-provision.ts`
- **Implementation:**
  1. Interpolate `prompt_template` with: `{{business_name}}`, `{{owner_name}}`, `{{location}}`
  2. Write `soul.md`:
     ```
     # SOUL.md
     [interpolated prompt_template]
     
     ## Onboarding Context
     [JSON of onboarding_answers]
     ```
  3. Write `user.md`:
     ```
     # USER.md
     - Business: [business_name]
     - Owner: [owner_name]
     - Location: [location]
     - Email: [email]
     - Pro: [pro_name]
     - Plan: [plan_name]
     ```
  4. Write Pro tools config so OpenClaw knows what capabilities are active
  5. Upload all via Orgo `bashExec` (cat heredoc)
- **Acceptance:** After provisioning, VM has `soul.md` and `user.md` with correct customer data interpolated.

---

**Task 27: Deploying page copy**
- **What:** The success/deploying page should say "For your security, we're putting King Mouse in a sandbox" during VM provisioning.
- **Files:** `frontend/src/app/onboarding/success/page.tsx`
- **Implementation:** Animated sandbox/loading visual. Copy reads: "For your security, we're putting King Mouse in a sandbox. This takes about 2 minutes." Progress steps: Creating secure environment → Installing KingMouse → Configuring for your business → Almost ready...
- **Acceptance:** Deploying page shows the sandbox copy with animated progress steps.

---

**Task 28: Fix King Mouse VM reliability**
- **What:** 100% provision success rate. Handle edge cases.
- **Files:** `frontend/src/lib/vm-provision.ts`, `frontend/src/app/api/vm/provision/route.ts`
- **Implementation:**
  1. Retry logic: If Orgo VM creation fails, retry up to 3 times with exponential backoff
  2. If boot times out (60s), delete VM and retry with fresh one
  3. If provisioning script fails, capture error log and update `vm_status = 'error'` with error message
  4. Add `/api/vm/retry-provision` endpoint for manual retries
  5. Add webhook/callback from VM when provisioning completes (update `vm_status = 'running'`)
- **Acceptance:** VM provisioning succeeds on first try or retries gracefully. Failures are logged with actionable error messages.

---

### Phase 7 — Intelligence Features (KingMouse Intelligence — KMI)

These features are prompt engineering + data structures. They're injected into the KingMouse agent's system prompt and backed by Supabase tables.

---

**Task 29: KMI — Silent Failure Detector**
- **What:** KingMouse notices patterns before they become critical.
- **Files:** Add to Pro `prompt_template` + new `failure_patterns` table
- **Implementation:**
  1. Create table `failure_patterns` (customer_id, pattern_type, description, severity, detected_at, resolved_at)
  2. Add to system prompt: "Monitor for patterns: declining appointment confirmations, increasing order errors, response time degradation. Log detected patterns to the failure_patterns table via API. Alert the owner when severity is high."
  3. Expose patterns in dashboard activity log
- **Acceptance:** When KingMouse detects a pattern (e.g., 3 missed appointments in a row), it logs a failure_pattern and notifies the owner.

---

**Task 30: KMI — AI Secret Shopper**
- **What:** KingMouse periodically calls/contacts the business to test quality.
- **Files:** Add to prompt template + `secret_shopper_results` table
- **Implementation:**
  1. Create table `secret_shopper_results` (customer_id, test_type, scenario, result, score, notes, tested_at)
  2. Add to system prompt: "Periodically conduct secret shopper tests. Call the business number, submit a web inquiry, or email as a fake customer. Score the response on timeliness, accuracy, and professionalism. Log results."
  3. Display results in dashboard as a "Quality Score" widget
- **Acceptance:** Table exists. Prompt instructs KingMouse to conduct tests. Dashboard shows quality score.

---

**Task 31: KMI — Real Customer Memory**
- **What:** KingMouse remembers individual customers and their history.
- **Files:** `customer_memories` table + prompt addition
- **Implementation:**
  1. Create table `customer_memories` (id, business_customer_id, customer_name, customer_contact, preferences, history JSONB, last_interaction, created_at)
  2. Note: `business_customer_id` is the ID of the BUSINESS's customer (end customer), not the Mouse platform customer.
  3. Add to prompt: "When interacting with a customer, check customer_memories for their history. Remember their preferences, past issues, and communication style. Update the memory after each interaction."
- **Acceptance:** Table exists. KingMouse system prompt includes customer memory instructions.

---

**Task 32: KMI — Attention Filtering**
- **What:** Only shows the owner money opportunities + emergencies. Filters noise.
- **Files:** Prompt addition + `owner_alerts` table
- **Implementation:**
  1. Create table `owner_alerts` (id, customer_id, alert_type ['money_opportunity', 'emergency', 'info'], title, description, priority, read, created_at)
  2. Add to prompt: "Do NOT bother the owner with routine updates. Only alert them for: (1) revenue opportunities, (2) emergencies, (3) decisions that require human judgment. Everything else, handle silently."
  3. Dashboard shows alert badge with unread count
- **Acceptance:** Table exists. Prompt clearly defines when to alert vs. stay silent.

---

**Task 33: KMI — Autonomous Urgency Creation**
- **What:** Auto-sends "almost full", "limited availability" messages to drive action.
- **Files:** Prompt addition
- **Implementation:** Add to prompt: "When appointments are 80%+ booked, inventory is running low, or a deadline is approaching, proactively send urgency messages to relevant parties (customers, suppliers). Examples: 'Only 2 slots left this week', 'Reorder needed — stock at 3 units'."
- **Acceptance:** Prompt includes urgency creation instructions with specific triggers and examples.

---

**Task 34: KMI — System Improvement Engine**
- **What:** Suggests business improvements based on patterns in complaints and operations.
- **Files:** `improvement_suggestions` table + prompt addition
- **Implementation:**
  1. Create table `improvement_suggestions` (id, customer_id, category, suggestion, evidence, status ['new', 'accepted', 'dismissed'], created_at)
  2. Add to prompt: "Analyze patterns in customer complaints, operational delays, and missed opportunities. Generate actionable improvement suggestions. Categorize as: process, communication, pricing, or service."
  3. Dashboard section: "KingMouse Suggestions" with accept/dismiss buttons
- **Acceptance:** Table exists. Prompt includes improvement analysis instructions.

---

**Task 35: KMI — Owner Brain Clone**
- **What:** Copies the owner's phrases, decision patterns, and communication style.
- **Files:** `owner_patterns` table + prompt addition
- **Implementation:**
  1. Create table `owner_patterns` (id, customer_id, pattern_type ['phrase', 'decision', 'preference'], content, context, learned_at)
  2. Add to prompt: "Learn the owner's communication style. When they correct your response, remember the preferred phrasing. Adopt their vocabulary, tone, and decision-making patterns over time. Store learned patterns."
- **Acceptance:** Table exists. Prompt includes learning instructions.

---

**Task 36: KMI — Asset Builder**
- **What:** Auto-creates FAQs, SMS reply templates, website copy.
- **Files:** `generated_assets` table + prompt addition
- **Implementation:**
  1. Create table `generated_assets` (id, customer_id, asset_type ['faq', 'sms_template', 'email_template', 'website_copy'], title, content, status ['draft', 'approved', 'active'], created_at, updated_at)
  2. Add to prompt: "Based on common customer questions and interactions, generate reusable assets: FAQ entries, SMS reply templates, email templates. Present drafts for owner approval."
  3. Dashboard section: "Generated Assets" with approve/edit/delete
- **Acceptance:** Table exists. Prompt includes asset generation instructions.

---

**Task 37: KMI — Strategic Silence**
- **What:** Knows when NOT to talk. Doesn't over-communicate.
- **Files:** Prompt addition (no new table)
- **Implementation:** Add to prompt: "Practice strategic silence. Do NOT: send unnecessary status updates, repeat information the owner already knows, interrupt the owner during off-hours (10pm-7am unless emergency), follow up on tasks that are progressing normally. The owner hired you to handle things — silence means things are working."
- **Acceptance:** Prompt includes explicit silence rules with off-hours definition.

---

**Task 38: KMI — Product Idea Machine**
- **What:** Flags new service/product opportunities based on customer demand.
- **Files:** `product_ideas` table + prompt addition
- **Implementation:**
  1. Create table `product_ideas` (id, customer_id, idea, evidence, estimated_demand, status ['new', 'considering', 'implemented', 'dismissed'], created_at)
  2. Add to prompt: "When you notice repeated customer requests for services not currently offered, or market opportunities based on seasonal patterns, log product ideas. Include evidence (e.g., '5 customers asked about dryer vent cleaning this month')."
- **Acceptance:** Table exists. Prompt includes opportunity detection instructions.

---

### Phase 8 — Automation & Workflows

---

**Task 39: Fix Lead Finder**
- **What:** Lead finder feature needs to work. Capture leads from web forms, calls, emails.
- **Files:** `frontend/src/components/dashboard/LeadsModule.tsx`, n8n workflow template
- **Implementation:**
  1. Create `leads` table (id, customer_id, source, name, contact, status ['new', 'contacted', 'qualified', 'converted', 'lost'], notes, created_at, updated_at)
  2. Build LeadsModule: list of leads with status badges, click to expand details
  3. n8n workflow: webhook receiver for lead capture → insert to DB → notify KingMouse
  4. KingMouse prompt addition: "When a new lead comes in, qualify it, send a follow-up within 5 minutes, and update the lead status."
- **Acceptance:** Leads table exists. LeadsModule shows leads. New lead via webhook appears in dashboard.

---

**Task 40: Inventory automation workflow (n8n template)**
- **What:** n8n workflow that checks inventory levels and triggers reorders.
- **Files:** `n8n-workflows/inventory_reorder.json`
- **Implementation:** Create a JSON workflow template:
  1. Trigger: Schedule (every hour) OR webhook from KingMouse
  2. Query inventory levels (from customer's data source)
  3. Compare to reorder threshold (from onboarding_answers)
  4. If below threshold: send reorder notification to KingMouse
  5. KingMouse formats and sends the order (via email/webhook)
  6. Log the task
- **Acceptance:** Valid n8n JSON workflow. Can be imported into n8n instance.

---

**Task 41: Appointment scheduling workflow (n8n template)**
- **What:** n8n workflow for appointment management.
- **Files:** `n8n-workflows/appointment_scheduler.json`
- **Implementation:** Create JSON workflow template:
  1. Trigger: Webhook (new appointment request)
  2. Check availability
  3. Confirm appointment
  4. Send reminder 24h before
  5. Log to activity
- **Acceptance:** Valid n8n JSON workflow.

---

**Task 42: Supplier ordering workflow (n8n template)**
- **What:** n8n workflow for placing supplier orders.
- **Files:** `n8n-workflows/supplier_order.json`
- **Implementation:** Template workflow:
  1. Trigger: KingMouse sends order request
  2. Format order email/API call
  3. Send to supplier
  4. Log order + expected delivery
  5. Schedule follow-up check
- **Acceptance:** Valid n8n JSON workflow.

---

**Task 43: Call receptionist workflow (n8n template)**
- **What:** n8n workflow for handling inbound calls (via Twilio or similar).
- **Files:** `n8n-workflows/receptionist.json`
- **Implementation:** Template workflow:
  1. Trigger: Incoming call webhook
  2. Route to KingMouse for AI handling
  3. If KingMouse can resolve → handle
  4. If needs human → transfer/voicemail
  5. Log call details
- **Acceptance:** Valid n8n JSON workflow.

---

### Phase 9 — Admin & Security

---

**Task 44: Verify admin tracking**
- **What:** Admin dashboard shows all customers, VMs, usage, revenue.
- **Files:** `frontend/src/app/admin/page.tsx`, `frontend/src/app/admin/customers/page.tsx`
- **Implementation:**
  1. Admin layout with navigation
  2. Overview: total customers, total revenue, total VMs running, aggregate hours
  3. Customer list with: name, email, Pro, plan, VM status, hours used, revenue
  4. Click customer → detail view with full activity
  5. Auth guard: only `platform_owner` role can access
- **Acceptance:** Admin pages render. Only platform owners can access. Data is accurate.

---

**Task 45: Reseller markup cap**
- **What:** Resellers can mark up pricing but within a cap.
- **Files:** `frontend/src/app/api/admin/resellers/route.ts`
- **Implementation:**
  1. `resellers.markup_cap_percent` column (already added in migration)
  2. When reseller creates a customer with custom pricing, validate: `reseller_price <= base_price * (1 + markup_cap_percent/100)`
  3. Admin can set/edit markup cap per reseller
- **Acceptance:** Reseller with 50% cap cannot charge more than 1.5x base price.

---

**Task 46: Security verification**
- **What:** Audit all API endpoints for auth. No unauthenticated access to customer data.
- **Files:** All API routes
- **Implementation:**
  1. Every API route (except public ones like `/api/pro-profiles`) must verify Supabase auth
  2. Customer endpoints must verify the requesting user owns the customer_id
  3. Admin endpoints must verify `platform_owner` role
  4. VM provisioning must verify Stripe payment completed
  5. Add rate limiting headers
- **Acceptance:** Unauthenticated requests to protected endpoints return 401. Cross-customer access returns 403.

---

**Task 47: Stripe Connect for resellers**
- **What:** Resellers get instant payouts via Stripe Connect.
- **Files:** `frontend/src/app/api/stripe/connect/route.ts`
- **Implementation:**
  1. `POST /api/stripe/connect/onboard` — Create Stripe Connect account for reseller, return onboarding link
  2. `GET /api/stripe/connect/status` — Check if reseller's Stripe Connect is active
  3. When customer pays under a reseller, split payment: platform takes (100 - commission_percent)%, reseller gets commission_percent%
  4. Use Stripe Connect with `transfer_data` or `application_fee_amount`
- **Acceptance:** Reseller can onboard to Stripe Connect. Customer payment splits correctly between platform and reseller.

---

**Task 48: Admin navigation fix**
- **What:** Admin nav should be clean and functional.
- **Files:** `frontend/src/app/admin/layout.tsx`
- **Implementation:**
  1. Sidebar: Dashboard, Customers, Resellers, Plans, Settings
  2. Mobile responsive
  3. Active state highlighting
  4. Breadcrumbs
- **Acceptance:** Admin nav works on desktop and mobile. All links resolve.

---

### Phase 10 — Landing Page & Marketplace

---

**Task 49: Employee Marketplace on landing page**
- **What:** Landing page shows the Pro marketplace. Users browse Pros and click "Hire" to start onboarding.
- **Files:** `frontend/src/app/page.tsx`, `frontend/src/app/marketplace/page.tsx`, `frontend/src/components/marketplace/ProCard.tsx`, `frontend/src/components/marketplace/ProGrid.tsx`
- **Implementation:**
  1. Landing page hero: "Hire an AI Employee for $4.98/hr"
  2. Below hero: Pro marketplace grid
  3. Each Pro card: icon, name, description, "What it handles" list, "Hire Now" CTA
  4. CTA links to `/onboarding?pro=[slug]`
  5. Also accessible at `/marketplace` as standalone page
- **Acceptance:** Landing page shows Pro cards. Clicking "Hire Now" goes to onboarding with Pro pre-selected.

---

**Task 50: Update landing page copy**
- **What:** Landing page messaging aligned with new architecture.
- **Files:** `frontend/src/app/page.tsx`
- **Implementation:**
  1. Hero: "Stop Hiring. Start Deploying. AI Employees at $4.98/hr."
  2. Subhead: "KingMouse handles operations, scheduling, inventory, and customer communication — so you don't have to."
  3. Social proof section (placeholder)
  4. How it works: 1) Pick your Pro, 2) Answer a few questions, 3) Pay, 4) Your AI employee starts working
  5. Pricing preview (links to /pricing)
  6. Marketplace section (Pro grid)
  7. FAQ section
- **Acceptance:** Landing page has all sections. No references to tokens, chatbots, or old architecture.

---

### Phase 11 — Cleanup

---

**Task 51: Remove all token system references**
- **What:** Delete every trace of the old token system from the codebase.
- **Files:** All files
- **Implementation:**
  1. Delete `frontend/src/app/api/tokens/` directory entirely
  2. Delete `components/TokenCheckout.tsx`, `TokenDashboard.tsx`, `TokenPricing.tsx`
  3. Remove token imports from all files
  4. Remove `TOKEN_PACKAGES`, `TOKEN_COSTS` from stripe.ts (already handled in Task 22, verify)
  5. Search entire codebase for "token" — remove all references that relate to the old billing system
  6. Note: Keep the word "token" where it refers to auth tokens (JWT, bot tokens, API keys)
- **Acceptance:** `grep -r "TOKEN_PACKAGES\|TOKEN_COSTS\|tokenAmount\|token_balance\|formatTokens" frontend/src/` returns zero results.

---

**Task 52: Remove old employee provisioning code**
- **What:** Delete the old multi-employee VM provisioning that created separate VMs per employee.
- **Files:** `frontend/src/app/api/vm/configure/route.ts`
- **Implementation:**
  1. Delete `frontend/src/app/api/vm/configure/route.ts` (replaced by `/api/vm/provision`)
  2. Remove `getSkillsForType` function and employee_type VM logic
  3. Remove references to `employee_vms` table operations in old code
  4. Keep the `employees` table in DB for now (may be repurposed for KMI features) but remove UI that creates/manages separate employee VMs
- **Acceptance:** No code path exists to create multiple VMs for one customer.

---

## SECTION 4: EXECUTION RULES

### 4.1 — Work Phase by Phase

Execute tasks in phase order (Phase 1 → Phase 2 → ... → Phase 11). Within each phase, tasks can be done in any order.

### 4.2 — Build & Test After Each Phase

After completing all tasks in a phase:
1. Run `cd frontend && npm run build` — must pass with zero errors
2. Run `npm run lint` — fix any warnings
3. If tests exist, run them
4. Fix any TypeScript errors before moving to next phase

### 4.3 — Commit After Each Phase

After each phase passes build:
```bash
git add -A
git commit -m "Phase N: [description]"
```

Example: `git commit -m "Phase 1: Database migrations and type definitions"`

### 4.4 — No Placeholders

Do not use `// TODO` or `// implement later`. Every task must be complete when committed. If a feature needs external integration (like n8n), implement the API contract and data structures fully — the n8n workflow JSON can be a template that needs import.

### 4.5 — Error Handling

Every API route must:
1. Try/catch the entire handler
2. Return structured JSON errors: `{ error: string, status: number }`
3. Log errors to console with `[ENDPOINT_NAME]` prefix
4. Never expose internal errors to the client

### 4.6 — Environment Variables Required

Ensure these are referenced (they exist in Vercel env):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ORGO_API_KEY
ORGO_WORKSPACE_ID
```

### 4.7 — Do Not Change

- Do NOT change the Next.js version (15.1.3)
- Do NOT add Tailwind CSS plugins or UI libraries (use existing Tailwind + Lucide icons)
- Do NOT create a separate backend server — everything runs in Next.js API routes
- Do NOT use any ORM — use raw Supabase client queries

### 4.8 — Dependencies

Only add dependencies if absolutely necessary. Current deps: `next`, `react`, `react-dom`, `stripe`, `lucide-react`, `typescript`. You may add:
- `@supabase/supabase-js` (if not already installed)
- Nothing else without explicit approval

### 4.9 — Supabase Queries

Use the existing `supabaseQuery` helper in `frontend/src/lib/supabase-server.ts` or the Supabase JS client directly. For migrations, write raw SQL files.

### 4.10 — When In Doubt

If a task is ambiguous, implement the simplest version that satisfies the acceptance criteria. Don't over-engineer. Ship it.

---

## SUMMARY

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-3 | Database + Types |
| 2 | 4-12 | Core API Routes |
| 3 | 13-15 | Onboarding Flow |
| 4 | 16-21 | Dashboard UI |
| 5 | 22-24 | Stripe & Billing |
| 6 | 25-28 | VM Provisioning |
| 7 | 29-38 | KMI Intelligence Features |
| 8 | 39-43 | Automation & Workflows |
| 9 | 44-48 | Admin & Security |
| 10 | 49-50 | Landing Page & Marketplace |
| 11 | 51-52 | Cleanup |

**Total: 52 tasks across 11 phases.**

> Note: The original list had 32 items. Some items were expanded into multiple tasks because they contained compound work (e.g., "Stripe Connect" became onboarding + webhook + subscription management). All original 32 requirements are covered. Nothing was dropped.

---

*Generated by Mouse · March 11, 2026*
