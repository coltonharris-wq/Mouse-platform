# RESELLER_DASHBOARD_SPEC.md — Dashboard Redesign + 30 Verticals + KingMouse Emoji

> **Purpose:** This spec updates the EXISTING working platform. Do NOT rebuild core infrastructure (VM provisioning, chat routing, Stripe, onboarding). Only modify UI layout, add new pages, and extend existing functionality.

> **Repo:** `/Users/jewelsharris/Desktop/Mouse-platform/mouse-platform`
> **Stack:** Next.js 15 · React 19 · TypeScript · Supabase · Stripe · Tailwind
> **Live URL:** https://mouse-platform.vercel.app
> **What already works:** VM provisioning, Manus-style chat, onboarding flow, Stripe subscriptions, AI receptionist APIs, reseller invite links, conversations/messages API

---

## CRITICAL RULE

**DO NOT TOUCH these files unless explicitly told to:**
- `src/lib/vm-provision.ts`
- `src/lib/orgo.ts`
- `src/app/api/vm/*`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/onboarding/complete/route.ts`
- `src/app/api/conversations/*/messages/route.ts`

These are the working backend. You are only updating UI and adding new pages/APIs.

---

## SECTION 1: THREE DASHBOARDS

The platform has three user types. Each gets a different sidebar layout but shares the same Manus-style chat UI.

### 1.1 — Customer Dashboard (`/dashboard`)

**Sidebar:**
```
🐭 KingMouse [emoji status]
[Pro Badge: "Appliance Pro"]

[+ New Chat]

TODAY
  ○ Check inventory...
  ○ Order suppliers...

YESTERDAY
  ○ Schedule repair...

───────────────
📱 AI Receptionist
📊 Activity Log
💰 Billing & Hours
⚙️ Settings
```

This is what V2 already built. **Keep it exactly as-is.** Only add the emoji status indicator (Phase 2).

### 1.2 — Reseller Dashboard (`/reseller`)

**Sidebar:**
```
🐭 KingMouse [emoji status]
[Reseller Badge]

[+ New Chat]

TODAY
  ○ Find leads in...
  ○ Setup pricing...

───────────────
📊 Dashboard
🏪 Marketplace
🏢 Businesses
🔍 Lead Finder
📋 Task Log
🎤 Voice
⚙️ Settings
```

**Navigation items:**
| Route | Name | Icon | Description |
|-------|------|------|-------------|
| `/reseller` | KingMouse Chat | MessageSquare | ChatGPT-style chat (main page, same as customer) |
| `/reseller/dashboard` | Dashboard | BarChart3 | Analytics: revenue, customers, commissions |
| `/reseller/marketplace` | Marketplace | Store | 30 industry verticals |
| `/reseller/businesses` | Businesses | Building2 | Manage customers, set pricing, send invites |
| `/reseller/lead-finder` | Lead Finder | Search | Find and save leads |
| `/reseller/task-log` | Task Log | ClipboardList | Scheduled, in-progress, completed tasks |
| `/reseller/voice` | Voice | Phone | AI receptionist management |
| `/reseller/settings` | Settings | Settings | Account settings |

### 1.3 — Admin Dashboard (`/admin`)

**Sidebar:**
```
🐭 KingMouse [emoji status]
[Admin Badge]

[+ New Chat]

───────────────
📊 Dashboard
👥 Customers
🤝 Resellers
🏪 Marketplace
📋 Task Log
⚙️ Settings
```

Keep existing admin pages but restyle sidebar to match new layout.

---

## SECTION 2: DATA CONTRACTS

### 2.1 — 30 Pro Profiles (Seed Data)

Insert 27 new Pro profiles into `pro_profiles` table (3 already exist: appliance, roofer, dentist).

```sql
INSERT INTO pro_profiles (slug, name, description, category, prompt_template, tools, workflows, onboarding_questions, dashboard_modules, sort_order) VALUES
('hvac', 'HVAC Pro', 'AI operations manager for heating, ventilation, and air conditioning businesses.', 'home_services',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: HVAC\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle service scheduling, equipment tracking, maintenance contracts, and seasonal demand planning.',
 '["service_scheduling", "equipment_tracking", "maintenance_contracts", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 4),

('plumber', 'Plumber Pro', 'AI operations manager for plumbing businesses.', 'home_services',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Plumbing\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle emergency dispatch, scheduling, parts inventory, and customer follow-ups.',
 '["emergency_dispatch", "scheduling", "parts_inventory", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 5),

('electrician', 'Electrician Pro', 'AI operations manager for electrical contractor businesses.', 'trades',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Electrical Contractor\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle job scheduling, permit tracking, material ordering, and inspection coordination.',
 '["job_scheduling", "permit_tracking", "material_ordering", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 6),

('landscaper', 'Landscaper Pro', 'AI operations manager for landscaping and lawn care businesses.', 'home_services',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Landscaping\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle crew scheduling, route optimization, seasonal service planning, and equipment maintenance.',
 '["crew_scheduling", "route_optimization", "seasonal_planning", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 7),

('painter', 'Painter Pro', 'AI operations manager for painting contractor businesses.', 'trades',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Painting\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle estimate generation, crew scheduling, material ordering, and project tracking.',
 '["estimate_generation", "crew_scheduling", "material_ordering", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 8),

('auto_repair', 'Auto Repair Pro', 'AI operations manager for auto repair shops.', 'automotive',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Auto Repair\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle appointment scheduling, parts ordering, service tracking, and customer communication.',
 '["appointment_scheduling", "parts_ordering", "service_tracking", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 9),

('auto_detailing', 'Auto Detailing Pro', 'AI operations manager for auto detailing businesses.', 'automotive',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Auto Detailing\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle booking, supply inventory, package upselling, and customer loyalty.',
 '["booking", "supply_inventory", "package_management", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 10),

('cleaning', 'Cleaning Pro', 'AI operations manager for cleaning service businesses.', 'home_services',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Cleaning Service\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle booking, staff scheduling, supply tracking, and quality follow-ups.',
 '["booking", "staff_scheduling", "supply_tracking", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 11),

('pest_control', 'Pest Control Pro', 'AI operations manager for pest control businesses.', 'home_services',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Pest Control\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle route planning, recurring service scheduling, chemical inventory, and customer communication.',
 '["route_planning", "recurring_scheduling", "chemical_inventory", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 12),

('moving', 'Moving Pro', 'AI operations manager for moving companies.', 'home_services',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Moving Company\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle quote generation, crew and truck scheduling, inventory tracking, and customer coordination.',
 '["quote_generation", "crew_scheduling", "truck_management", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 13),

('real_estate', 'Real Estate Pro', 'AI operations manager for real estate agents and brokerages.', 'professional',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Real Estate\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle lead nurturing, showing scheduling, listing management, and transaction coordination.',
 '["lead_nurturing", "showing_scheduling", "listing_management", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 14),

('insurance', 'Insurance Pro', 'AI operations manager for insurance agencies.', 'professional',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Insurance Agency\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle policy renewals, lead follow-up, claims support, and client communication.',
 '["policy_management", "lead_followup", "claims_support", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 15),

('accounting', 'Accounting Pro', 'AI operations manager for accounting and bookkeeping firms.', 'professional',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Accounting\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle client onboarding, document collection, deadline tracking, and tax season scheduling.',
 '["client_onboarding", "document_collection", "deadline_tracking", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 16),

('law_firm', 'Law Firm Pro', 'AI operations manager for law firms.', 'professional',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Law Firm\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle client intake, appointment scheduling, document management, and billing tracking.',
 '["client_intake", "appointment_scheduling", "document_management", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 17),

('chiropractic', 'Chiropractic Pro', 'AI operations manager for chiropractic practices.', 'healthcare',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Chiropractic\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle patient scheduling, insurance verification, recall reminders, and treatment plan tracking.',
 '["patient_scheduling", "insurance_verification", "recall_reminders", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 18),

('veterinary', 'Veterinary Pro', 'AI operations manager for veterinary clinics.', 'healthcare',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Veterinary\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle appointment scheduling, vaccination reminders, prescription management, and client follow-ups.',
 '["appointment_scheduling", "vaccination_reminders", "prescription_management", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 19),

('med_spa', 'Med Spa Pro', 'AI operations manager for medical spas and aesthetic practices.', 'healthcare',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Med Spa\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle appointment booking, treatment plan management, product inventory, and client retention.',
 '["appointment_booking", "treatment_plans", "product_inventory", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 20),

('fitness', 'Fitness Pro', 'AI operations manager for gyms, studios, and personal trainers.', 'health_fitness',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Fitness\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle class scheduling, membership management, lead follow-up, and retention campaigns.',
 '["class_scheduling", "membership_management", "lead_followup", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 21),

('salon', 'Salon Pro', 'AI operations manager for hair salons and barber shops.', 'personal_services',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Salon\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle appointment booking, stylist scheduling, product inventory, and client reminders.',
 '["appointment_booking", "stylist_scheduling", "product_inventory", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 22),

('restaurant', 'Restaurant Pro', 'AI operations manager for restaurants and food service.', 'food_service',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Restaurant\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle reservation management, supplier ordering, staff scheduling, and review monitoring.',
 '["reservation_management", "supplier_ordering", "staff_scheduling", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 23),

('catering', 'Catering Pro', 'AI operations manager for catering businesses.', 'food_service',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Catering\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle event coordination, menu planning, vendor management, and logistics.',
 '["event_coordination", "menu_planning", "vendor_management", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 24),

('photography', 'Photography Pro', 'AI operations manager for photography businesses.', 'creative',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Photography\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle booking, contract management, gallery delivery, and client follow-ups.',
 '["booking", "contract_management", "gallery_delivery", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 25),

('construction', 'Construction Pro', 'AI operations manager for general contractors and construction companies.', 'trades',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Construction\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle project management, subcontractor coordination, permit tracking, and material ordering.',
 '["project_management", "subcontractor_coordination", "permit_tracking", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 26),

('property_mgmt', 'Property Management Pro', 'AI operations manager for property management companies.', 'real_estate',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Property Management\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle tenant communication, maintenance requests, rent collection reminders, and vendor coordination.',
 '["tenant_communication", "maintenance_requests", "rent_tracking", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 27),

('towing', 'Towing Pro', 'AI operations manager for towing and roadside assistance businesses.', 'automotive',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Towing\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle dispatch, driver tracking, billing, and customer communication.',
 '["dispatch", "driver_tracking", "billing", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 28),

('flooring', 'Flooring Pro', 'AI operations manager for flooring installation businesses.', 'trades',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Flooring\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle estimates, material ordering, crew scheduling, and project tracking.',
 '["estimate_generation", "material_ordering", "crew_scheduling", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 29),

('pool_service', 'Pool Service Pro', 'AI operations manager for pool cleaning and maintenance businesses.', 'home_services',
 E'You are KingMouse, an AI operations manager for {{business_name}}.\nBusiness type: Pool Service\nOwner: {{owner_name}}\nLocation: {{location}}\n\nYou handle route scheduling, chemical inventory, recurring service management, and customer billing.',
 '["route_scheduling", "chemical_inventory", "recurring_services", "call_receptionist"]',
 '[]', '[]',
 '["chat", "receptionist", "activity_log", "billing"]', 30);
```

### 2.2 — New Table: `reseller_businesses`

Tracks businesses a reseller is managing (invited or active customers).

```sql
CREATE TABLE reseller_businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id),  -- NULL until customer signs up
    business_name TEXT NOT NULL,
    business_email TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    pro_slug TEXT,
    custom_price_cents INTEGER,                  -- Reseller's custom price (NULL = default)
    invite_link_id UUID REFERENCES reseller_invite_links(id),
    status TEXT DEFAULT 'invited',               -- 'invited', 'signed_up', 'active', 'churned'
    monthly_revenue_cents INTEGER DEFAULT 0,
    notes TEXT,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reseller_businesses_reseller ON reseller_businesses(reseller_id);
CREATE INDEX idx_reseller_businesses_status ON reseller_businesses(status);

ALTER TABLE reseller_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resellers own businesses" ON reseller_businesses
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE reseller_id = reseller_businesses.reseller_id)
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner')
    );
```

### 2.3 — New Table: `saved_leads`

```sql
CREATE TABLE saved_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    employee_count TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new',                  -- 'new', 'contacted', 'interested', 'converted', 'lost'
    source TEXT DEFAULT 'manual',               -- 'manual', 'search', 'import'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_leads_reseller ON saved_leads(reseller_id);

ALTER TABLE saved_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resellers own leads" ON saved_leads
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE reseller_id = saved_leads.reseller_id)
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner')
    );
```

### 2.4 — New Table: `task_log`

Unified task log for what KingMouse is doing.

```sql
CREATE TABLE task_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    reseller_id UUID REFERENCES resellers(id),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,                         -- 'scheduled', 'in_progress', 'completed', 'failed'
    category TEXT,                              -- 'inventory', 'email', 'scheduling', 'research', 'call', 'order'
    schedule_cron TEXT,                         -- Cron expression for scheduled tasks
    next_run_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    result TEXT,                                -- What happened
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_log_customer ON task_log(customer_id);
CREATE INDEX idx_task_log_type ON task_log(type);
CREATE INDEX idx_task_log_reseller ON task_log(reseller_id);

ALTER TABLE task_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own task logs" ON task_log
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = task_log.customer_id));
CREATE POLICY "Resellers see their business task logs" ON task_log
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE reseller_id = task_log.reseller_id));
CREATE POLICY "Platform owners all task logs" ON task_log
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
```

### 2.5 — KingMouse Status Enum

```typescript
// src/types/kingmouse-status.ts
export type KingMouseStatus = 'idle' | 'thinking' | 'working' | 'orchestrating' | 'sleeping';

export const STATUS_EMOJI: Record<KingMouseStatus, string> = {
  idle: '🐭',
  thinking: '💭',
  working: '🔨',
  orchestrating: '🎭',
  sleeping: '😴',
};

export const STATUS_LABELS: Record<KingMouseStatus, string> = {
  idle: 'Ready',
  thinking: 'Thinking...',
  working: 'Working...',
  orchestrating: 'Orchestrating...',
  sleeping: 'Off hours',
};
```

---

## SECTION 3: API CONTRACTS

### 3.1 — Reseller Analytics

#### `GET /api/reseller/analytics?reseller_id=xxx`

**Response:**
```json
{
  "total_customers": 12,
  "active_customers": 10,
  "total_revenue_cents": 5970000,
  "monthly_revenue_cents": 497000,
  "total_commission_cents": 2388000,
  "monthly_commission_cents": 198800,
  "customers_by_status": { "active": 10, "invited": 2 },
  "revenue_by_month": [
    { "month": "2026-01", "revenue_cents": 497000 },
    { "month": "2026-02", "revenue_cents": 497000 }
  ]
}
```

### 3.2 — Reseller Businesses CRUD

#### `POST /api/reseller/businesses`
Create a business + generate invite link in one step.

**Request:**
```json
{
  "reseller_id": "uuid",
  "business_name": "Bob's Appliance Repair",
  "business_email": "bob@example.com",
  "contact_name": "Bob Smith",
  "phone": "9105551234",
  "pro_slug": "appliance",
  "custom_price_cents": 14700
}
```

**Response:**
```json
{
  "business_id": "uuid",
  "invite_link": "https://mouse-platform.vercel.app/join/bob-appliance-abc123",
  "status": "invited"
}
```

#### `GET /api/reseller/businesses?reseller_id=xxx`
List all businesses.

#### `PATCH /api/reseller/businesses/[id]`
Update business details, notes.

### 3.3 — Lead Finder

#### `GET /api/reseller/leads/search?query=appliance+repair&location=wilmington+nc`
Search for businesses (uses web search or Google Places API).

**Response:**
```json
{
  "results": [
    {
      "name": "Bob's Appliance Repair",
      "address": "123 Main St, Wilmington, NC",
      "phone": "(910) 555-1234",
      "website": "https://bobsappliance.com",
      "industry": "Appliance Repair"
    }
  ]
}
```

#### `POST /api/reseller/leads`
Save a lead.

#### `GET /api/reseller/leads?reseller_id=xxx`
List saved leads.

#### `PATCH /api/reseller/leads/[id]`
Update lead status.

#### `GET /api/reseller/leads/export?reseller_id=xxx`
Export leads as CSV.

### 3.4 — Task Log

#### `GET /api/task-log?customer_id=xxx&type=scheduled`
Get tasks by type.

#### `GET /api/task-log?reseller_id=xxx`
Get all tasks across a reseller's businesses.

### 3.5 — KingMouse Status

#### `GET /api/kingmouse/status?customer_id=xxx`

**Response:**
```json
{
  "status": "working",
  "current_task": "Checking inventory levels",
  "last_active": "2026-03-11T20:00:00Z"
}
```

The status is determined by:
- `sleeping` — outside business hours (10pm-7am)
- `working` — active `in_progress` task exists in task_log
- `thinking` — message was sent, waiting for VM response
- `orchestrating` — multiple tasks running simultaneously
- `idle` — no active tasks, ready for input

---

## SECTION 4: THE TASKS

### Phase 1 — Database & Types (3 tasks)

---

**Task 1: Run migrations**
- Insert 27 new Pro profiles (§2.1)
- Create `reseller_businesses` table (§2.2)
- Create `saved_leads` table (§2.3)
- Create `task_log` table (§2.4)
- Apply RLS policies
- **Acceptance:** `SELECT count(*) FROM pro_profiles` returns 30. New tables exist.

---

**Task 2: TypeScript types**
- Create `src/types/kingmouse-status.ts` (§2.5)
- Create `src/types/reseller-dashboard.ts` with interfaces for ResellerBusiness, SavedLead, TaskLogEntry
- **Acceptance:** Types compile.

---

**Task 3: API routes for new features**
- `GET /api/reseller/analytics`
- `POST/GET /api/reseller/businesses` + `PATCH /api/reseller/businesses/[id]`
- `GET /api/reseller/leads/search`
- `POST/GET /api/reseller/leads` + `PATCH /api/reseller/leads/[id]`
- `GET /api/reseller/leads/export`
- `GET /api/task-log`
- `GET /api/kingmouse/status`
- **Acceptance:** All endpoints return correct JSON. Business creation auto-generates invite link.

---

### Phase 2 — KingMouse Emoji Status (2 tasks)

---

**Task 4: Status component**
- Create `src/components/KingMouseAvatar.tsx`
- Shows 🐭 with animated status emoji overlay
- Props: `status: KingMouseStatus`, `size: 'sm' | 'md' | 'lg'`
- CSS animation: gentle pulse on `thinking`, spinning on `orchestrating`, bounce on `working`, static on `idle`, fade on `sleeping`
- Status label tooltip on hover
- **Acceptance:** Component renders all 5 states with distinct animations.

---

**Task 5: Wire status into existing UI**
- Replace the static 🐭 emoji in `DashboardShell.tsx` sidebar header with `<KingMouseAvatar />`
- Fetch status from `/api/kingmouse/status` every 10 seconds
- Update emoji in real-time
- Also show in chat header area
- **Acceptance:** When KingMouse is processing a message, emoji changes to 💭 thinking → 🔨 working → 🐭 idle.

---

### Phase 3 — Reseller Dashboard Layout (3 tasks)

---

**Task 6: Reseller layout + shell**
- Create `src/app/reseller/layout.tsx`
- Create `src/components/reseller/ResellerShell.tsx`
- Same Manus-style layout as customer DashboardShell but with reseller nav items (§1.2)
- Main route (`/reseller`) is KingMouse chat (same chat component, different system prompt context)
- Include `<KingMouseAvatar />` in sidebar header
- Dark sidebar, light content area
- Mobile responsive (hamburger menu)
- **Acceptance:** `/reseller` loads with correct sidebar nav. Chat works.

---

**Task 7: Reseller chat context**
- The reseller's KingMouse should have a different system prompt:
  ```
  You are KingMouse, a reseller operations assistant. You help resellers:
  - Find and qualify leads
  - Set up new businesses on the platform
  - Track customer performance
  - Manage pricing and commissions
  - Generate invite links
  
  You have access to lead search, business management, and analytics.
  ```
- When reseller sends a chat message, route to `/api/demo/chat` with the reseller system prompt (resellers don't have their own VM — they share the platform's LLM)
- **Acceptance:** Reseller can chat with KingMouse about their business. KingMouse responds in reseller context.

---

**Task 8: Update existing `/reseller/page.tsx`**
- Current page is just invite link management
- Replace with the KingMouse chat page (same as customer dashboard main page)
- Move invite link management to `/reseller/businesses` (it's part of businesses now)
- **Acceptance:** `/reseller` shows KingMouse chat. Old invite link UI is gone from this page.

---

### Phase 4 — Dashboard Analytics (1 task)

---

**Task 9: Reseller analytics page**
- Create `src/app/reseller/dashboard/page.tsx`
- Layout:
  - Top row: 4 stat cards (Total Customers, Active Customers, Monthly Revenue, Monthly Commission)
  - Charts row: Revenue over time (bar chart), Customers by status (donut)
  - Table: Recent signups
- Use simple CSS/SVG charts (no chart library — keep deps minimal)
  - Bar chart: `<div>` bars with percentage heights
  - Donut: SVG circle with `stroke-dasharray`
- Fetch from `/api/reseller/analytics`
- **Acceptance:** Dashboard shows real data from Supabase. Charts render.

---

### Phase 5 — Marketplace (30 Verticals) (2 tasks)

---

**Task 10: Reseller marketplace page**
- Create `src/app/reseller/marketplace/page.tsx`
- Grid of 30 Pro cards (same component as landing page marketplace, reuse `ProCard`)
- Filter by category: All, Home Services, Trades, Healthcare, Professional, Automotive, Food Service, Creative, Personal Services, Health & Fitness
- Search bar to filter by name
- Each card shows: icon (use emoji based on industry), name, description, category badge
- Click card → expand with full details + "Add to My Offerings" button
- **Acceptance:** Page loads 30 Pros from API. Filter and search work.

---

**Task 11: Update landing page marketplace**
- Update `src/app/page.tsx` and `src/app/marketplace/page.tsx` to show all 30 Pros (not just 3)
- Same category filter as reseller marketplace
- "Hire Now" buttons still link to `/onboarding?pro={slug}`
- **Acceptance:** Landing page and `/marketplace` show 30 industry cards.

---

### Phase 6 — Businesses Tab (2 tasks)

---

**Task 12: Businesses page**
- Create `src/app/reseller/businesses/page.tsx`
- **Top section:** "Add Business" button
- **Add Business form (modal or expandable):**
  1. Business name
  2. Owner name
  3. Email
  4. Phone
  5. Select Pro (dropdown of 30 verticals)
  6. Custom monthly price (input, defaults to plan price)
  7. "Create & Send Invite" button
- On submit: calls `POST /api/reseller/businesses` → auto-creates invite link → shows link with copy button + "Send Email" option
- **Business list table:**
  - Columns: Business Name, Pro, Status (badge: invited/active/churned), Monthly Revenue, Date Added
  - Click row → detail view with notes, edit, resend invite
- **Acceptance:** Can add business, see invite link, track status. Table shows all businesses.

---

**Task 13: Business detail + invite management**
- Click a business → expandable detail or slide-out panel
- Shows: all business info, invite link (with copy), notes editor, status history
- "Resend Invite" button (re-sends email or regenerates link)
- "Convert to Active" when customer signs up (automatic via webhook, but manual override available)
- **Acceptance:** Detail panel shows all info. Notes save. Invite link copyable.

---

### Phase 7 — Lead Finder (2 tasks)

---

**Task 14: Lead Finder page**
- Create `src/app/reseller/lead-finder/page.tsx`
- **Search bar:** Company name or industry + location
- Search calls `/api/reseller/leads/search` which uses web search (Google Places or web_search)
- **Results:** Cards or table with: company name, address, phone, website, industry
- Each result has "Save Lead" button → saves to `saved_leads` table
- **Saved leads tab:** Shows all saved leads with status badges (new, contacted, interested, converted, lost)
- Status dropdown to update lead status
- "Export CSV" button → downloads all saved leads
- **Acceptance:** Search returns results. Can save leads. Can export CSV.

---

**Task 15: Lead search API**
- Create `src/app/api/reseller/leads/search/route.ts`
- For v1: Use Google Places API (if key available) or fall back to a web search query
- Format results consistently
- Rate limit: 10 searches per minute per reseller
- **Acceptance:** Search returns formatted business results.

---

### Phase 8 — Task Log (1 task)

---

**Task 16: Task Log page**
- Create `src/app/reseller/task-log/page.tsx`
- **Three tabs:**
  1. **Scheduled** — Recurring tasks KingMouse has set up (cron jobs). Shows: task name, schedule (human-readable), next run, customer
  2. **In Progress** — What KingMouse is currently doing. Shows: task name, customer, started time, live duration counter
  3. **Completed** — History. Shows: task name, customer, completed time, result summary, status badge (success/failed)
- Filter by customer (dropdown)
- Filter by date range
- Filter by category (inventory, email, scheduling, etc.)
- Pagination (20 per page)
- **Acceptance:** All three tabs load data. Filters work. Completed tasks show results.

---

### Phase 9 — Voice (1 task)

---

**Task 17: Voice page (reseller context)**
- Create `src/app/reseller/voice/page.tsx`
- For resellers: shows aggregated call stats across all their businesses
- Table: business name, phone number, total calls, avg duration, last call
- Click business → shows that business's call log (same component as customer receptionist)
- Link to each business's receptionist config
- **Acceptance:** Reseller can see call activity across all businesses.

---

### Phase 10 — Admin Dashboard Update (1 task)

---

**Task 18: Restyle admin sidebar**
- Update `src/app/admin/layout.tsx`
- Match the same dark sidebar style as customer/reseller dashboards
- Nav: Dashboard, Customers, Resellers, Marketplace (manage Pro profiles), Task Log, Settings
- Include `<KingMouseAvatar />` in header
- **Acceptance:** Admin pages have consistent sidebar. KingMouse emoji shows.

---

### Phase 11 — Polish & Deploy (2 tasks)

---

**Task 19: Mobile responsive**
- All new pages (reseller dashboard, marketplace, businesses, lead finder, task log, voice) work on mobile
- Sidebar collapses to hamburger
- Tables scroll horizontally on small screens
- Forms are single-column on mobile
- **Acceptance:** All pages usable on iPhone 12-14 screen sizes.

---

**Task 20: Deploy + verify**
- `vercel --prod`
- Test:
  1. Customer dashboard — emoji changes during chat
  2. Landing page — shows 30 Pros
  3. Reseller dashboard — all 7 nav items load
  4. Reseller chat — KingMouse responds in reseller context
  5. Analytics page — shows charts with data
  6. Marketplace — 30 Pros with filters
  7. Businesses — add business, generate invite link
  8. Lead Finder — search and save leads
  9. Task Log — three tabs load
  10. Voice — shows call stats
  11. Admin — restyled sidebar with emoji
- Report broken items
- **Acceptance:** All routes return 200. All features functional.

---

## SECTION 5: EXECUTION RULES

### 5.1 — Phase Order
Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

### 5.2 — Build After Each Phase
`cd frontend && npm run build` — zero errors.

### 5.3 — Commit After Each Phase
`git add -A && git commit -m "Reseller Phase N: [description]"`

### 5.4 — DO NOT TOUCH Backend Infrastructure
VM provisioning, Stripe webhook, onboarding/complete, conversation message routing — leave these alone. This spec is UI + new pages + new API routes only.

### 5.5 — No New Dependencies
No chart libraries. Use CSS/SVG for charts. Use existing Lucide icons. Use existing Tailwind.

### 5.6 — Reuse Components
Reuse `ProCard`, `ProGrid`, `KingMouseAvatar`, and chat components across customer/reseller/admin dashboards where possible.

---

## SUMMARY

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-3 | Database: 30 Pros + new tables + APIs |
| 2 | 4-5 | KingMouse emoji status (site-wide) |
| 3 | 6-8 | Reseller dashboard layout + chat |
| 4 | 9 | Analytics page |
| 5 | 10-11 | Marketplace (30 verticals) |
| 6 | 12-13 | Businesses tab |
| 7 | 14-15 | Lead Finder |
| 8 | 16 | Task Log |
| 9 | 17 | Voice |
| 10 | 18 | Admin restyle |
| 11 | 19-20 | Mobile + deploy |

**Total: 20 tasks across 11 phases.**

---

*Generated by Mouse · March 11, 2026*
