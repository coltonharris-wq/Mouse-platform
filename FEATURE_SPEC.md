# FEATURE_SPEC.md — NL Automations + AI Receptionist + Reseller Links

> **Purpose:** This spec extends the deployed KingMouse platform with three major features. Execute top-to-bottom, phase by phase. Every data structure is defined before it's referenced. Every task has acceptance criteria.

> **Repo:** `/Users/jewelsharris/Desktop/Mouse-platform/mouse-platform`
> **Stack:** Next.js 15 · React 19 · TypeScript · Supabase · Stripe · Orgo VM · Twilio · OpenAI Realtime API · n8n Cloud
> **Live URL:** https://mouse-platform.vercel.app
> **Existing code context:** 42 routes deployed. Dashboard has dynamic sidebar per Pro. Stripe subscription checkout at `/api/stripe/create-subscription`. VM chat at `/api/vm/chat`. Plans defined in `src/lib/plans.ts`. Module registry at `src/config/dashboard-modules.ts`.

---

## SECTION 1: DATA CONTRACTS

Define all new database tables, schema changes, types, and API contracts BEFORE any task references them.

### 1.1 — Tiered Overage Pricing

The current `subscription_plans` table has `overage_rate_cents` set to 498 for all plans. Update:

```sql
UPDATE subscription_plans SET overage_rate_cents = 498 WHERE slug = 'pro';
UPDATE subscription_plans SET overage_rate_cents = 448 WHERE slug = 'growth';
UPDATE subscription_plans SET overage_rate_cents = 398 WHERE slug = 'enterprise';
```

Update `src/lib/plans.ts`:
```typescript
export const SUBSCRIPTION_PLANS = {
  pro: {
    slug: 'pro',
    name: 'Pro',
    priceCents: 9700,
    hoursIncluded: 20,
    overageRateCents: 498,  // $4.98/hr
    features: ['20 hours/month', '1 AI employee', 'Core automations', 'Email support'],
  },
  growth: {
    slug: 'growth',
    name: 'Growth',
    priceCents: 49700,
    hoursIncluded: 125,
    overageRateCents: 448,  // $4.48/hr
    features: ['125 hours/month', '1 AI employee', 'Advanced automations', 'Priority support', 'Custom workflows'],
  },
  enterprise: {
    slug: 'enterprise',
    name: 'Enterprise',
    priceCents: 99700,
    hoursIncluded: 300,
    overageRateCents: 398,  // $3.98/hr
    features: ['300 hours/month', '1 AI employee', 'All automations', 'Dedicated support', 'Custom integrations', 'API access'],
  },
};
```

Every UI that shows overage rates MUST read from this config — pricing page, billing module, plan comparison, checkout. No hardcoded "$4.98" strings anywhere.

### 1.2 — New Table: `customer_automations`

Tracks automations created by customers via natural language.

```sql
CREATE TABLE customer_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                        -- Human-readable name ("Reorder washers when low")
    description TEXT,                          -- Original natural language request
    parsed_intent JSONB NOT NULL,              -- Structured intent from LLM parsing
    n8n_workflow_id TEXT,                       -- n8n's workflow ID once deployed
    n8n_workflow_json JSONB,                    -- The generated n8n workflow JSON
    trigger_type TEXT NOT NULL,                 -- 'schedule', 'webhook', 'event'
    trigger_config JSONB DEFAULT '{}',          -- Trigger-specific config
    action_type TEXT NOT NULL,                  -- 'email', 'http', 'notification', 'order'
    action_config JSONB DEFAULT '{}',           -- Action-specific config
    status TEXT DEFAULT 'active',               -- 'active', 'paused', 'error', 'draft'
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_automations_customer ON customer_automations(customer_id);
CREATE INDEX idx_customer_automations_status ON customer_automations(status);

ALTER TABLE customer_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own automations" ON customer_automations
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = customer_automations.customer_id));
CREATE POLICY "Platform owners all automations" ON customer_automations
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
```

### 1.3 — New Table: `customer_phone_numbers`

Tracks Twilio phone numbers purchased for customers.

```sql
CREATE TABLE customer_phone_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,                 -- E.164 format: +19105551234
    twilio_sid TEXT NOT NULL,                   -- Twilio Phone Number SID (PN...)
    friendly_name TEXT,                         -- "Main Business Line"
    area_code TEXT,                             -- "910"
    status TEXT DEFAULT 'active',               -- 'active', 'released', 'porting'
    monthly_cost_cents INTEGER DEFAULT 200,     -- What Twilio charges us (~$2/mo)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_phone_numbers_customer ON customer_phone_numbers(customer_id);

ALTER TABLE customer_phone_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own phone numbers" ON customer_phone_numbers
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = customer_phone_numbers.customer_id));
CREATE POLICY "Platform owners all phone numbers" ON customer_phone_numbers
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
```

### 1.4 — New Table: `receptionist_config`

Per-customer AI receptionist settings.

```sql
CREATE TABLE receptionist_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    greeting_text TEXT DEFAULT 'Hello, thank you for calling. How can I help you today?',
    business_hours JSONB DEFAULT '{"mon":{"open":"09:00","close":"17:00"},"tue":{"open":"09:00","close":"17:00"},"wed":{"open":"09:00","close":"17:00"},"thu":{"open":"09:00","close":"17:00"},"fri":{"open":"09:00","close":"17:00"},"sat":null,"sun":null}',
    after_hours_message TEXT DEFAULT 'We are currently closed. Please leave a message and we will get back to you.',
    voicemail_enabled BOOLEAN DEFAULT TRUE,
    voicemail_email TEXT,                      -- Email to send voicemail transcripts
    voice_id TEXT DEFAULT 'alloy',             -- OpenAI voice: alloy, echo, fable, onyx, nova, shimmer
    language TEXT DEFAULT 'en',
    max_call_duration_seconds INTEGER DEFAULT 600, -- 10 min max
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE receptionist_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own receptionist config" ON receptionist_config
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = receptionist_config.customer_id));
CREATE POLICY "Platform owners all receptionist config" ON receptionist_config
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
```

### 1.5 — New Table: `call_logs`

Tracks all AI receptionist calls.

```sql
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    phone_number_id UUID REFERENCES customer_phone_numbers(id),
    caller_number TEXT,                        -- Who called
    direction TEXT DEFAULT 'inbound',          -- 'inbound' or 'outbound'
    duration_seconds INTEGER,
    status TEXT,                               -- 'completed', 'missed', 'voicemail', 'transferred'
    transcript TEXT,                           -- Full call transcript
    summary TEXT,                              -- AI-generated summary
    sentiment TEXT,                            -- 'positive', 'neutral', 'negative'
    actions_taken JSONB DEFAULT '[]',          -- Actions KingMouse took during call
    twilio_call_sid TEXT,
    recording_url TEXT,
    voicemail_transcript TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_call_logs_customer ON call_logs(customer_id);
CREATE INDEX idx_call_logs_created ON call_logs(created_at DESC);

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own call logs" ON call_logs
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = call_logs.customer_id));
CREATE POLICY "Platform owners all call logs" ON call_logs
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
```

### 1.6 — New Table: `port_requests`

Tracks phone number porting requests.

```sql
CREATE TABLE port_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,                -- Number to port
    carrier_name TEXT NOT NULL,
    carrier_account_number TEXT NOT NULL,
    carrier_pin TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_address TEXT NOT NULL,
    authorized_name TEXT NOT NULL,             -- Person signing LOA
    loa_signed BOOLEAN DEFAULT FALSE,
    loa_signed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',             -- 'pending', 'submitted', 'in_progress', 'completed', 'rejected'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE port_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own port requests" ON port_requests
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = port_requests.customer_id));
CREATE POLICY "Platform owners all port requests" ON port_requests
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
```

### 1.7 — New Table: `reseller_invite_links`

Tracks reseller referral/invite links.

```sql
CREATE TABLE reseller_invite_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,                 -- Short code: "bobsmith", "acme2026"
    url TEXT NOT NULL,                         -- Full URL: https://mouse-platform.vercel.app/join/bobsmith
    label TEXT,                                -- "Facebook Campaign March"
    pro_slug TEXT,                             -- Optional: pre-select a Pro
    plan_slug TEXT,                            -- Optional: pre-select a plan
    discount_percent INTEGER DEFAULT 0,        -- Reseller-offered discount (within markup cap)
    clicks INTEGER DEFAULT 0,
    signups INTEGER DEFAULT 0,
    revenue_cents INTEGER DEFAULT 0,           -- Total revenue from this link
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,                    -- Optional expiration
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invite_links_reseller ON reseller_invite_links(reseller_id);
CREATE INDEX idx_invite_links_code ON reseller_invite_links(code);

ALTER TABLE reseller_invite_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resellers own invite links" ON reseller_invite_links
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE reseller_id = reseller_invite_links.reseller_id)
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner')
    );
```

### 1.8 — Alter Table: `customers`

```sql
-- Track which reseller/invite link referred this customer
ALTER TABLE customers ADD COLUMN IF NOT EXISTS referred_by_reseller_id UUID REFERENCES resellers(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS referred_by_invite_link_id UUID REFERENCES reseller_invite_links(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone_number_id UUID REFERENCES customer_phone_numbers(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS receptionist_enabled BOOLEAN DEFAULT FALSE;
```

### 1.9 — TypeScript Types

```typescript
// src/types/automation.ts

export interface CustomerAutomation {
  id: string;
  customer_id: string;
  name: string;
  description: string;
  parsed_intent: ParsedAutomationIntent;
  n8n_workflow_id: string | null;
  trigger_type: 'schedule' | 'webhook' | 'event';
  trigger_config: Record<string, unknown>;
  action_type: 'email' | 'http' | 'notification' | 'order';
  action_config: Record<string, unknown>;
  status: 'active' | 'paused' | 'error' | 'draft';
  last_triggered_at: string | null;
  trigger_count: number;
  created_at: string;
}

export interface ParsedAutomationIntent {
  trigger: {
    type: string;           // "inventory_low", "new_lead", "schedule", "appointment_soon"
    entity?: string;        // "refrigerator", "washer"
    condition?: string;     // "less_than"
    threshold?: number;     // 4
    schedule?: string;      // "every_hour", "daily_9am", "weekly_monday"
  };
  action: {
    type: string;           // "send_email", "place_order", "send_notification", "http_request"
    recipient?: string;     // "supplier@example.com"
    subject?: string;
    body?: string;
    quantity?: number;      // 6
    item?: string;          // "refrigerator"
    url?: string;           // For HTTP requests
  };
  original_text: string;    // The customer's exact words
  confidence: number;       // 0-1 how confident the parse is
}

// src/types/receptionist.ts

export interface ReceptionistConfig {
  id: string;
  customer_id: string;
  is_enabled: boolean;
  greeting_text: string;
  business_hours: BusinessHours;
  after_hours_message: string;
  voicemail_enabled: boolean;
  voicemail_email: string | null;
  voice_id: string;
  language: string;
  max_call_duration_seconds: number;
}

export interface BusinessHours {
  mon: DayHours | null;
  tue: DayHours | null;
  wed: DayHours | null;
  thu: DayHours | null;
  fri: DayHours | null;
  sat: DayHours | null;
  sun: DayHours | null;
}

export interface DayHours {
  open: string;   // "09:00"
  close: string;  // "17:00"
}

export interface CallLog {
  id: string;
  customer_id: string;
  caller_number: string;
  direction: 'inbound' | 'outbound';
  duration_seconds: number;
  status: 'completed' | 'missed' | 'voicemail' | 'transferred';
  transcript: string | null;
  summary: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  actions_taken: string[];
  recording_url: string | null;
  created_at: string;
}

export interface PhoneNumber {
  id: string;
  customer_id: string;
  phone_number: string;
  friendly_name: string | null;
  area_code: string;
  status: 'active' | 'released' | 'porting';
  created_at: string;
}

// src/types/reseller.ts

export interface ResellerInviteLink {
  id: string;
  reseller_id: string;
  code: string;
  url: string;
  label: string | null;
  pro_slug: string | null;
  plan_slug: string | null;
  discount_percent: number;
  clicks: number;
  signups: number;
  revenue_cents: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}
```

### 1.10 — API Contracts

#### `POST /api/automations/parse`
Parse natural language automation request. Does NOT deploy — returns parsed intent for confirmation.

**Request:**
```json
{
  "customer_id": "cust_xxx",
  "text": "When my washer inventory drops below 5, email my supplier to order 15 units"
}
```

**Response:**
```json
{
  "parsed_intent": {
    "trigger": { "type": "inventory_low", "entity": "washer", "condition": "less_than", "threshold": 5 },
    "action": { "type": "send_email", "recipient": "supplier", "subject": "Reorder Request", "body": "Please send 15 washers", "quantity": 15, "item": "washer" },
    "original_text": "When my washer inventory drops below 5, email my supplier to order 15 units",
    "confidence": 0.95
  },
  "name": "Reorder washers when low",
  "confirmation_message": "I'll check washer inventory every hour. When it drops below 5, I'll email your supplier to order 15 units. Sound good?"
}
```

#### `POST /api/automations/deploy`
Confirm and deploy the parsed automation to n8n.

**Request:**
```json
{
  "customer_id": "cust_xxx",
  "name": "Reorder washers when low",
  "parsed_intent": { ... },
  "confirmed": true
}
```

**Response:**
```json
{
  "automation_id": "uuid",
  "n8n_workflow_id": "123",
  "status": "active",
  "message": "Automation deployed and active."
}
```

#### `GET /api/automations?customer_id=xxx`
List all automations for a customer.

#### `PATCH /api/automations/[id]`
Toggle automation on/off or update config.

#### `DELETE /api/automations/[id]`
Delete automation. Deactivates and removes n8n workflow.

#### `GET /api/receptionist/phone-numbers/search?area_code=910&country=US`
Search available Twilio phone numbers.

**Response:**
```json
{
  "numbers": [
    { "phone_number": "+19105551234", "friendly_name": "(910) 555-1234", "locality": "Wilmington", "region": "NC", "monthly_cost_cents": 200 },
    { "phone_number": "+19105555678", "friendly_name": "(910) 555-5678", "locality": "Wilmington", "region": "NC", "monthly_cost_cents": 200 }
  ]
}
```

#### `POST /api/receptionist/phone-numbers/purchase`
Buy a Twilio number for a customer.

**Request:**
```json
{
  "customer_id": "cust_xxx",
  "phone_number": "+19105551234",
  "friendly_name": "Main Business Line"
}
```

**Response:**
```json
{
  "success": true,
  "phone_number_id": "uuid",
  "phone_number": "+19105551234",
  "message": "Phone number activated. Your AI receptionist is ready."
}
```

#### `GET /api/receptionist/config?customer_id=xxx`
Get receptionist configuration.

#### `PATCH /api/receptionist/config`
Update receptionist settings (greeting, hours, voice, etc.).

#### `GET /api/receptionist/calls?customer_id=xxx&limit=20`
Get call log.

#### `POST /api/receptionist/port-request`
Submit a number porting request.

**Request:**
```json
{
  "customer_id": "cust_xxx",
  "phone_number": "+19105559999",
  "carrier_name": "AT&T",
  "carrier_account_number": "12345678",
  "carrier_pin": "1234",
  "business_name": "Bob's Appliance Repair",
  "business_address": "123 Main St, Wilmington NC 28401",
  "authorized_name": "Bob Smith"
}
```

**Response:**
```json
{
  "success": true,
  "port_request_id": "uuid",
  "message": "Port request submitted. We'll email you updates. Typical processing time: 1-2 weeks."
}
```

#### `POST /api/webhooks/twilio/[customer_id]`
Twilio webhook for incoming calls. Routes to OpenAI Realtime via KingMouse.

#### `POST /api/webhooks/twilio/status/[customer_id]`
Twilio status callback — call completed, duration, etc.

#### `POST /api/reseller/invite-links`
Create a new invite link.

**Request:**
```json
{
  "reseller_id": "uuid",
  "code": "bobsmith",
  "label": "Facebook Campaign March",
  "pro_slug": "appliance",
  "plan_slug": "growth",
  "discount_percent": 10
}
```

**Response:**
```json
{
  "id": "uuid",
  "code": "bobsmith",
  "url": "https://mouse-platform.vercel.app/join/bobsmith",
  "message": "Invite link created."
}
```

#### `GET /api/reseller/invite-links?reseller_id=xxx`
List reseller's invite links with stats.

#### `PATCH /api/reseller/invite-links/[id]`
Update link settings (label, discount, active/inactive).

#### `DELETE /api/reseller/invite-links/[id]`
Deactivate link.

#### `GET /api/join/[code]`
Public endpoint. Looks up invite link, increments click count, redirects to `/onboarding?ref=[code]&pro=[pro_slug]&plan=[plan_slug]`.

---

## SECTION 2: ENVIRONMENT VARIABLES NEEDED

Add these to Vercel:

```
# n8n Cloud
N8N_HOST=https://your-instance.app.n8n.cloud
N8N_API_KEY=xxx

# Twilio Master Account
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_MASTER_PHONE=+1xxx     # Optional: platform phone for outbound

# OpenAI (for Realtime API voice)
OPENAI_API_KEY=sk-xxx

# Support phone for SMS requests
SUPPORT_PHONE=9105158927
```

---

## SECTION 3: THE TASKS

### Phase 1 — Pricing & Stripe Updates (4 tasks)

---

**Task 1: Tiered overage pricing — database + config**
- **What:** Update overage rates: Pro $4.98, Growth $4.48, Enterprise $3.98.
- **Files:** `src/lib/plans.ts`, run SQL update on `subscription_plans` table
- **Implementation:**
  1. Run SQL from §1.1 to update `overage_rate_cents` per plan
  2. Update `SUBSCRIPTION_PLANS` in `plans.ts` to match
  3. Search entire codebase for hardcoded "4.98" or "498" — replace with dynamic reads from the plan config
- **Acceptance:** `SELECT slug, overage_rate_cents FROM subscription_plans` returns: pro=498, growth=448, enterprise=398. Pricing page shows correct per-plan overage rates. Billing module shows correct overage rate for the customer's plan.

---

**Task 2: Tiered overage — update all UI**
- **What:** Every place that displays overage rates must show the plan-specific rate.
- **Files:** `src/app/pricing/page.tsx`, `src/components/dashboard/BillingModule.tsx`, `src/components/onboarding/StepPayment.tsx`, and any other file displaying overage rates
- **Implementation:**
  1. Pricing page: show "$4.98/hr overage" under Pro, "$4.48/hr" under Growth, "$3.98/hr" under Enterprise
  2. Billing module: show the customer's plan-specific overage rate
  3. Onboarding payment step: show plan-specific overage rate during plan selection
  4. Do NOT hardcode rates — always read from `SUBSCRIPTION_PLANS[planSlug].overageRateCents`
- **Acceptance:** Each plan card shows its unique overage rate. Billing module for a Growth customer shows "$4.48/hr". No hardcoded overage strings in codebase.

---

**Task 3: Stripe promo codes**
- **What:** Create FOUNDERS97 promo code in Stripe. Enable promo code input on checkout.
- **Files:** `src/app/api/stripe/create-subscription/route.ts` (already has promo support — verify it works)
- **Implementation:**
  1. Create in Stripe Dashboard (or via API):
     - Coupon: `FOUNDERS97_COUPON` — $97 off, duration "once", applies to first invoice
     - Promotion Code: `FOUNDERS97` linked to that coupon, active, no expiry
  2. The existing `create-subscription` route already passes `allow_promotion_codes: true` when no specific promo is sent. Verify this works.
  3. Add `payment_method_collection: 'always'` to force card entry even at $0 (already present — verify)
  4. Create a reusable function to programmatically create promo codes via API: `POST /api/admin/promo-codes` so Colton can create codes without touching Stripe Dashboard
- **Acceptance:** Going through checkout with code `FOUNDERS97` on Pro plan ($97) results in $0 charge. Card info is still required. Checkout page shows promo code input field.

---

**Task 4: Stripe checkout branding**
- **What:** Mouse brand colors on Stripe Checkout instead of default white.
- **Files:** `src/app/api/stripe/create-subscription/route.ts`
- **Implementation:**
  1. In Stripe Dashboard → Settings → Branding: set primary color to `#0F6B6E` (teal), secondary to `#0B1F3B` (navy), upload KingMouse logo
  2. In code: Add to checkout session creation:
     ```typescript
     custom_text: {
       submit: { message: 'Your AI employee will be ready in ~2 minutes after payment.' },
     },
     ```
  3. Stripe Dashboard branding applies automatically to all Checkout sessions — no code changes needed for colors. But verify it renders correctly.
- **Acceptance:** Stripe Checkout shows teal accent color and KingMouse logo. Custom submit text visible.

---

### Phase 2 — Database Migrations (1 task)

---

**Task 5: Run all new migrations**
- **What:** Create all tables from §1.2 through §1.8.
- **Files:** `supabase/migrations/010_customer_automations.sql`, `011_phone_numbers.sql`, `012_receptionist_config.sql`, `013_call_logs.sql`, `014_port_requests.sql`, `015_invite_links.sql`, `016_alter_customers.sql`
- **Implementation:** Write each migration file with the SQL from §1.2-1.8. Apply via Supabase Management API or SQL editor.
- **Acceptance:** All 6 new tables exist. RLS policies active. `customers` table has new columns.

---

**Task 6: Create TypeScript types**
- **What:** Add type files from §1.9.
- **Files:** `src/types/automation.ts`, `src/types/receptionist.ts`, `src/types/reseller.ts`
- **Implementation:** Copy types from §1.9.
- **Acceptance:** All files compile. Types importable.

---

### Phase 3 — Natural Language Automation Engine (5 tasks)

---

**Task 7: Automation intent parser**
- **What:** LLM-powered parser that converts plain English to structured automation intent.
- **Files:** `src/lib/automation-parser.ts`
- **Implementation:**
  1. Create function `parseAutomationRequest(text: string, proSlug: string): Promise<ParsedAutomationIntent>`
  2. Call the customer's LLM (Kimi K2.5 via Moonshot API) with a system prompt:
     ```
     You are an automation intent parser for a {{pro_name}} business.
     
     Given a natural language automation request, extract:
     1. trigger: what event or condition starts this (inventory_low, new_lead, schedule, appointment_soon, etc.)
     2. action: what to do when triggered (send_email, place_order, send_notification, http_request)
     3. All relevant parameters (thresholds, recipients, quantities, schedules)
     
     Available tools for this business: {{tools_list}}
     
     Respond in JSON only. Format:
     {
       "trigger": { "type": "...", "entity": "...", "condition": "...", "threshold": ... },
       "action": { "type": "...", "recipient": "...", "quantity": ..., "item": "..." },
       "name": "Human-readable name for this automation",
       "confidence": 0.0-1.0
     }
     ```
  3. Look up Pro profile to get available tools for context
  4. Parse LLM JSON response, validate structure
  5. If confidence < 0.7, return with `needs_clarification: true` and a follow-up question
- **Acceptance:** `parseAutomationRequest("Order 6 fridges when stock < 4", "appliance")` returns valid `ParsedAutomationIntent` with trigger type `inventory_low`, threshold 4, action type `place_order`, quantity 6.

---

**Task 8: n8n workflow generator**
- **What:** Converts parsed intent to valid n8n workflow JSON and deploys via n8n REST API.
- **Files:** `src/lib/n8n-client.ts`, `src/lib/automation-deployer.ts`
- **Implementation:**
  1. `n8n-client.ts`: Wrapper for n8n Cloud REST API
     - `createWorkflow(json): Promise<{id, active}>`
     - `activateWorkflow(id): Promise<void>`
     - `deactivateWorkflow(id): Promise<void>`
     - `deleteWorkflow(id): Promise<void>`
     - `listWorkflows(): Promise<Workflow[]>`
     - Base URL from `N8N_HOST` env var, API key from `N8N_API_KEY`
     - All requests use `Authorization: Bearer ${N8N_API_KEY}` header
  2. `automation-deployer.ts`: Converts `ParsedAutomationIntent` to n8n JSON
     - Map trigger types to n8n trigger nodes:
       - `schedule` → Schedule Trigger node (cron)
       - `webhook` → Webhook node
       - `event` → Webhook node (called by KingMouse when event occurs)
     - Map action types to n8n action nodes:
       - `send_email` → Send Email node (SMTP or Gmail)
       - `place_order` → HTTP Request node (to supplier API/email)
       - `send_notification` → HTTP Request node (to webhook → KingMouse → owner)
       - `http_request` → HTTP Request node (generic)
     - Wire trigger → condition (If node when threshold exists) → action
     - Generate unique workflow name: `[customer_id]-[automation_name]`
  3. Deploy: POST to n8n API, store workflow ID in `customer_automations`
- **Acceptance:** Given a parsed intent for "reorder washers when < 5", generates valid n8n JSON with Schedule Trigger → If node → HTTP Request/Email node. Deploys successfully to n8n Cloud.

---

**Task 9: Automation API routes**
- **What:** All automation CRUD endpoints from §1.10.
- **Files:** `src/app/api/automations/parse/route.ts`, `src/app/api/automations/deploy/route.ts`, `src/app/api/automations/route.ts`, `src/app/api/automations/[id]/route.ts`
- **Implementation:**
  1. `POST /api/automations/parse` — Call parser, return intent + confirmation message
  2. `POST /api/automations/deploy` — Generate n8n JSON, deploy, save to DB
  3. `GET /api/automations?customer_id=xxx` — List automations
  4. `PATCH /api/automations/[id]` — Toggle status (active/paused), calls n8n activate/deactivate
  5. `DELETE /api/automations/[id]` — Delete from n8n + DB
- **Acceptance:** Full CRUD works. Creating an automation via parse → deploy creates an active n8n workflow.

---

**Task 10: Chat-based automation creation flow**
- **What:** When a customer types an automation request in the KingMouse chat, detect the intent and route to the automation creation flow.
- **Files:** `src/app/api/vm/chat/route.ts` (update), `src/app/dashboard/chat/page.tsx` (update)
- **Implementation:**
  1. In the chat route, BEFORE sending to VM, check if the message matches automation patterns:
     - Keywords: "when", "whenever", "if", "every", "automatically", "set up", "automate"
     - Combined with action words: "email", "order", "notify", "send", "alert", "remind"
  2. If automation detected:
     a. Call `/api/automations/parse` with the message text
     b. Return the confirmation message to the user: "I'll set up: [name]. [description]. Sound good?"
     c. If user confirms (next message is "yes", "do it", "sounds good"), call `/api/automations/deploy`
     d. Return: "Done! Automation is live. You can manage it in your Automations tab."
  3. If NOT automation-related, route to VM as normal
  4. Dashboard chat component needs to handle the confirmation flow (show confirm/cancel buttons)
- **Acceptance:** Customer types "email my supplier when washer stock drops below 5" → gets confirmation → confirms → automation deployed to n8n. All within the chat interface.

---

**Task 11: Automations dashboard module**
- **What:** "Automations" tab in dashboard showing all customer automations.
- **Files:** `src/app/dashboard/automations/page.tsx`, `src/components/dashboard/AutomationsModule.tsx`
- **Implementation:**
  1. List all automations with: name, description, status badge (active/paused/error), last triggered, trigger count
  2. Toggle switch for each: active ↔ paused (calls PATCH)
  3. Delete button with confirmation modal
  4. "Create Automation" button → opens chat with prompt "What would you like to automate?"
  5. Empty state: "No automations yet. Chat with KingMouse to create one."
- **Acceptance:** Page loads, shows automations list. Toggle works. Delete works. Create redirects to chat.

---

**Task 12: Add "automations" to dashboard module registry**
- **What:** Register the automations module so it appears in all Pro sidebars.
- **Files:** `src/config/dashboard-modules.ts`
- **Implementation:**
  1. Add to `DASHBOARD_MODULES`:
     ```typescript
     automations: {
       slug: 'automations',
       name: 'Automations',
       icon: 'Zap',
       component: 'AutomationsModule',
       route: '/dashboard/automations',
       description: 'Manage your automated workflows'
     }
     ```
  2. Add `"automations"` to every Pro profile's `dashboard_modules` array in the database (run SQL UPDATE)
- **Acceptance:** Automations tab appears in sidebar for all Pro types.

---

### Phase 4 — AI Receptionist (8 tasks)

---

**Task 13: Twilio phone number search API**
- **What:** Search available local phone numbers by area code.
- **Files:** `src/lib/twilio-client.ts`, `src/app/api/receptionist/phone-numbers/search/route.ts`
- **Implementation:**
  1. `twilio-client.ts`: Wrapper for Twilio REST API
     - `searchAvailableNumbers(areaCode, country='US', limit=10)`
     - `purchaseNumber(phoneNumber): Promise<{sid, phoneNumber}>`
     - `configureWebhook(sid, voiceUrl, statusUrl)`
     - `releaseNumber(sid)`
     - Uses `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` env vars
     - Use fetch (no Twilio SDK) to avoid adding deps
  2. Search endpoint: Query Twilio's AvailablePhoneNumbers API
     - `GET https://api.twilio.com/2010-04-01/Accounts/{SID}/AvailablePhoneNumbers/US/Local.json?AreaCode={code}&Limit={n}`
     - Return formatted list with locality, region, price
- **Acceptance:** `GET /api/receptionist/phone-numbers/search?area_code=910` returns available Wilmington-area numbers from Twilio.

---

**Task 14: Twilio phone number purchase API**
- **What:** Buy a number and configure it for the customer.
- **Files:** `src/app/api/receptionist/phone-numbers/purchase/route.ts`
- **Implementation:**
  1. Receive `customer_id`, `phone_number`, `friendly_name`
  2. Call Twilio to purchase: `POST /IncomingPhoneNumbers.json` with `PhoneNumber` param
  3. Configure voice webhook: `https://mouse-platform.vercel.app/api/webhooks/twilio/{customer_id}`
  4. Configure status callback: `https://mouse-platform.vercel.app/api/webhooks/twilio/status/{customer_id}`
  5. Save to `customer_phone_numbers` table
  6. Create default `receptionist_config` row if none exists
  7. Update `customers.receptionist_enabled = true`
- **Acceptance:** Purchasing a number creates it in Twilio, saves to DB, configures webhooks. Customer's receptionist is enabled.

---

**Task 15: Receptionist config API**
- **What:** CRUD for receptionist settings.
- **Files:** `src/app/api/receptionist/config/route.ts`
- **Implementation:**
  1. `GET /api/receptionist/config?customer_id=xxx` — Return config or default
  2. `PATCH /api/receptionist/config` — Update greeting, hours, voice, voicemail settings
  3. Validate business_hours JSON structure
  4. Validate voice_id is one of: alloy, echo, fable, onyx, nova, shimmer
- **Acceptance:** Can read and update all receptionist settings. Invalid voice_id returns 400.

---

**Task 16: Twilio inbound call webhook**
- **What:** Handle incoming calls via Twilio → OpenAI Realtime API for voice conversation.
- **Files:** `src/app/api/webhooks/twilio/[customer_id]/route.ts`
- **Implementation:**
  1. Twilio sends POST with call details (From, To, CallSid, etc.)
  2. Look up customer by customer_id from URL
  3. Look up `receptionist_config` for greeting, hours, voice
  4. Check business hours:
     - If within hours → connect to OpenAI Realtime
     - If after hours → play after_hours_message, offer voicemail
  5. Return TwiML response:
     - For AI conversation: Use `<Connect><Stream>` to stream audio to your WebSocket server
     - The WebSocket server bridges Twilio audio ↔ OpenAI Realtime API
     - KingMouse's system prompt + business context feeds the AI voice
  6. For v1 (simpler): Use `<Say>` with OpenAI TTS for greeting, then `<Gather>` for caller input, process with KingMouse, respond with `<Say>`. This is turn-based, not real-time streaming.
  7. **Go with v1 (turn-based) first.** Real-time streaming is Phase 2.
     - `<Say voice="Polly.Joanna">{greeting_text}</Say>`
     - `<Gather input="speech" timeout="5" action="/api/webhooks/twilio/{customer_id}/respond">`
     - On gather: send transcription to KingMouse VM via `/api/vm/chat`
     - Get response, return `<Say>{response}</Say>` + new `<Gather>` for next turn
     - On hangup: log call to `call_logs`
- **Acceptance:** Calling the Twilio number plays greeting, listens to speech, sends to KingMouse, speaks response. Call logged.

---

**Task 17: Twilio call response handler**
- **What:** Handle gathered speech input, route to KingMouse, return spoken response.
- **Files:** `src/app/api/webhooks/twilio/[customer_id]/respond/route.ts`
- **Implementation:**
  1. Extract `SpeechResult` from Twilio POST body
  2. Send to KingMouse via internal chat: `POST /api/vm/chat { customer_id, message: SpeechResult }`
  3. Get response text
  4. Return TwiML: `<Say>{response}</Say><Gather>` for next turn
  5. Track conversation turns (max 20 turns or max_call_duration_seconds)
  6. On max reached: "Thank you for calling. Goodbye." + hangup
- **Acceptance:** Multi-turn phone conversation works. Caller speaks → KingMouse responds → caller speaks again.

---

**Task 18: Twilio status callback**
- **What:** Log call completion details.
- **Files:** `src/app/api/webhooks/twilio/status/[customer_id]/route.ts`
- **Implementation:**
  1. Twilio sends: CallSid, CallStatus, CallDuration, RecordingUrl
  2. Create/update `call_logs` row with duration, status, recording URL
  3. If voicemail: save transcript
  4. Log to activity feed
- **Acceptance:** After call ends, call_logs row has accurate duration and status.

---

**Task 19: AI Receptionist dashboard page**
- **What:** Full receptionist management UI.
- **Files:** `src/app/dashboard/receptionist/page.tsx`, `src/components/dashboard/ReceptionistModule.tsx`
- **Implementation:**
  1. **Setup section** (if no phone number):
     - "Get a Phone Number" CTA
     - Area code search input
     - Available numbers grid (cards showing number, city, state)
     - "Activate" button per number
  2. **Active section** (if phone number exists):
     - Phone number display with green "Active" badge
     - Greeting text editor (textarea, save button)
     - Business hours editor (day-by-day open/close time pickers, toggle for closed days)
     - Voice selector (dropdown: Alloy, Echo, Fable, Onyx, Nova, Shimmer — with "Preview" play button)
     - Voicemail toggle + email input for transcripts
     - After-hours message editor
  3. **Call log section:**
     - Recent calls table: date, caller number, duration, status badge, sentiment badge
     - Click to expand: full transcript + summary + actions taken
     - Filter by: date range, status
  4. **Port number section:**
     - "Want to use your existing number?" link
     - Form: current number, carrier, account number, PIN, business name/address, authorized name
     - Submit → creates `port_requests` row
     - Confirmation: "Port request submitted. We'll email updates."
  5. **SMS section:**
     - Static card: "Want SMS capabilities? Text or call 910-515-8927 to get set up."
     - No self-service SMS. Just the support phone number.
- **Acceptance:** Full receptionist setup flow works. Customer can search numbers, buy one, configure greeting/hours/voice, see call logs, and submit port requests. SMS shows support contact only.

---

**Task 20: Add "receptionist" to dashboard module registry — UNIVERSAL**
- **What:** Register AI Receptionist module. Add to ALL Pro profiles.
- **Files:** `src/config/dashboard-modules.ts`, SQL update
- **Implementation:**
  1. Add to `DASHBOARD_MODULES`:
     ```typescript
     receptionist: {
       slug: 'receptionist',
       name: 'AI Receptionist',
       icon: 'Phone',
       component: 'ReceptionistModule',
       route: '/dashboard/receptionist',
       description: 'AI-powered phone receptionist for your business'
     }
     ```
  2. SQL: Add `"receptionist"` to every Pro profile's `dashboard_modules` array:
     ```sql
     UPDATE pro_profiles SET dashboard_modules = dashboard_modules || '["receptionist"]'::jsonb
     WHERE NOT dashboard_modules ? 'receptionist';
     ```
  3. Also add `"automations"` if Task 12 hasn't already
- **Acceptance:** AI Receptionist appears in sidebar for ALL Pro types (appliance, roofer, dentist, etc.). Always positioned after Chat.

---

### Phase 5 — Reseller Invite Links (5 tasks)

---

**Task 21: Invite link CRUD API**
- **What:** Full CRUD for reseller invite links.
- **Files:** `src/app/api/reseller/invite-links/route.ts`, `src/app/api/reseller/invite-links/[id]/route.ts`
- **Implementation:**
  1. `POST /api/reseller/invite-links` — Create link. Validate: code is unique, discount_percent within reseller's markup_cap_percent, reseller auth.
  2. `GET /api/reseller/invite-links?reseller_id=xxx` — List with stats (clicks, signups, revenue)
  3. `PATCH /api/reseller/invite-links/[id]` — Update label, discount, active status
  4. `DELETE /api/reseller/invite-links/[id]` — Soft delete (set is_active = false)
  5. Generate URL: `https://mouse-platform.vercel.app/join/{code}`
- **Acceptance:** CRUD works. Creating a link with duplicate code returns 409. Discount over markup cap returns 400.

---

**Task 22: Public invite link redirect**
- **What:** `/join/[code]` — Public page that tracks clicks and redirects to onboarding.
- **Files:** `src/app/join/[code]/page.tsx`
- **Implementation:**
  1. Server component: look up invite link by code
  2. If not found or expired or inactive → 404 page
  3. Increment `clicks` counter on the link
  4. Redirect to `/onboarding?ref={code}&pro={pro_slug}&plan={plan_slug}`
  5. If pro_slug is set, pre-select that Pro in onboarding step 3
  6. If plan_slug is set, pre-select that plan in onboarding step 5
- **Acceptance:** Visiting `/join/bobsmith` increments click count and redirects to onboarding with correct pre-selections.

---

**Task 23: Onboarding referral tracking**
- **What:** Onboarding flow captures and passes the referral code through to Stripe + customer creation.
- **Files:** `src/app/onboarding/page.tsx`, `src/app/api/stripe/create-subscription/route.ts`, `src/app/api/stripe/webhook/route.ts`
- **Implementation:**
  1. Onboarding reads `ref` from URL params, stores in form state
  2. Passed to `create-subscription` endpoint, stored in Stripe Checkout metadata: `ref_code`
  3. Webhook handler: on checkout.session.completed, look up invite link by ref_code
  4. Set `customers.referred_by_reseller_id` and `customers.referred_by_invite_link_id`
  5. Increment invite link's `signups` counter
  6. If invite link has `discount_percent`, apply as Stripe coupon (create on the fly if needed)
- **Acceptance:** Customer signs up via `/join/bobsmith` → customer record has reseller attribution → invite link shows +1 signup.

---

**Task 24: Reseller dashboard — invite links management**
- **What:** UI for resellers to create and manage invite links.
- **Files:** `src/app/dashboard/reseller/page.tsx` (or `src/app/reseller/page.tsx` — wherever reseller dashboard lives)
- **Implementation:**
  1. Create link form: code input, label, optional Pro/plan pre-selection, discount percent
  2. Links table: code, URL (with copy button), clicks, signups, revenue, status toggle
  3. Click a link → detail view with conversion funnel (clicks → signups → paying → revenue)
  4. Share buttons (copy URL, generate QR code)
  5. Reseller auth guard — only resellers see this
- **Acceptance:** Reseller can create links, see stats, toggle active/inactive, copy URLs.

---

**Task 25: Revenue attribution**
- **What:** When a referred customer pays, track revenue back to the invite link and reseller.
- **Files:** `src/app/api/stripe/webhook/route.ts` (update)
- **Implementation:**
  1. On `invoice.paid`: look up customer → check `referred_by_invite_link_id`
  2. If referred: update invite link `revenue_cents += invoice_amount`
  3. Create `revenue_events` row with reseller split calculation
  4. Commission: `reseller_amount = invoice_amount * (reseller.commission_percent / 100)`
  5. Platform keeps the rest
- **Acceptance:** After referred customer pays, invite link revenue updates. Revenue event logged with correct split.

---

### Phase 6 — Integration & Polish (3 tasks)

---

**Task 26: Update DashboardShell sidebar ordering**
- **What:** Ensure sidebar module order is: Chat → AI Receptionist → [Pro-specific] → Automations → Activity Log → Billing → Settings
- **Files:** `src/components/dashboard/DashboardShell.tsx`
- **Implementation:**
  1. After loading modules from API, sort them:
     - Fixed top: `chat`, `receptionist`
     - Middle: all Pro-specific modules (dynamic)
     - Fixed bottom: `automations`, `activity_log`, `billing`, `settings`
  2. Ensure this order is consistent regardless of what the DB returns
- **Acceptance:** Sidebar always shows Chat and AI Receptionist at top, Automations and Billing at bottom, Pro-specific in between.

---

**Task 27: Admin promo code management**
- **What:** API for Colton to create promo codes without touching Stripe Dashboard.
- **Files:** `src/app/api/admin/promo-codes/route.ts`
- **Implementation:**
  1. `POST /api/admin/promo-codes` — Create a Stripe coupon + promotion code
     - Request: `{ code: "SUMMER50", amount_off_cents: 5000, duration: "once" }`
     - Creates coupon via Stripe API, then creates promotion code with the specified code
  2. `GET /api/admin/promo-codes` — List all active promotion codes
  3. `DELETE /api/admin/promo-codes/[id]` — Deactivate a promotion code
  4. Platform owner auth required
- **Acceptance:** Creating a promo code via API makes it usable at Stripe Checkout immediately.

---

**Task 28: Port request email notification**
- **What:** When a port request is submitted, email Colton.
- **Files:** `src/app/api/receptionist/port-request/route.ts`
- **Implementation:**
  1. After saving port request to DB
  2. Send email to `colton.harris@automioapp.com` (or configured admin email):
     - Subject: "New Port Request — [customer business name]"
     - Body: All port details (number, carrier, account, PIN, business info)
     - Include link to admin dashboard port request view
  3. Use a simple email send method (Supabase edge function, or direct SMTP via n8n, or a webhook to an email service)
  4. If email sending is complex, use a simpler approach: insert a row into a `notifications` table that the admin dashboard displays
- **Acceptance:** Submitting a port request creates a notification visible to Colton (email or admin dashboard notification).

---

## SECTION 4: FILE STRUCTURE (New Files Only)

```
frontend/src/
├── app/
│   ├── api/
│   │   ├── automations/
│   │   │   ├── parse/route.ts
│   │   │   ├── deploy/route.ts
│   │   │   ├── route.ts                  # GET list
│   │   │   └── [id]/route.ts             # PATCH, DELETE
│   │   ├── receptionist/
│   │   │   ├── phone-numbers/
│   │   │   │   ├── search/route.ts
│   │   │   │   └── purchase/route.ts
│   │   │   ├── config/route.ts
│   │   │   ├── calls/route.ts
│   │   │   └── port-request/route.ts
│   │   ├── webhooks/
│   │   │   └── twilio/
│   │   │       ├── [customer_id]/
│   │   │       │   ├── route.ts           # Inbound call handler
│   │   │       │   └── respond/route.ts   # Speech gather response
│   │   │       └── status/
│   │   │           └── [customer_id]/route.ts  # Call completion
│   │   ├── reseller/
│   │   │   └── invite-links/
│   │   │       ├── route.ts               # POST, GET
│   │   │       └── [id]/route.ts          # PATCH, DELETE
│   │   ├── admin/
│   │   │   └── promo-codes/route.ts
│   │   └── join/
│   │       └── [code]/route.ts            # Public redirect
│   ├── dashboard/
│   │   ├── automations/page.tsx
│   │   └── receptionist/page.tsx
│   ├── join/
│   │   └── [code]/page.tsx                # Public invite landing
│   └── reseller/
│       └── page.tsx                       # Reseller invite link management
├── components/
│   ├── dashboard/
│   │   ├── AutomationsModule.tsx
│   │   └── ReceptionistModule.tsx
├── lib/
│   ├── automation-parser.ts
│   ├── automation-deployer.ts
│   ├── n8n-client.ts
│   └── twilio-client.ts
├── types/
│   ├── automation.ts
│   ├── receptionist.ts
│   └── reseller.ts
```

---

## SECTION 5: EXECUTION RULES

### 5.1 — Work Phase by Phase
Execute Phase 1 → 2 → 3 → 4 → 5 → 6. Do not skip ahead.

### 5.2 — Build & Test After Each Phase
After completing all tasks in a phase:
1. `cd frontend && npm run build` — must pass with zero errors
2. Fix TypeScript errors before moving on

### 5.3 — Commit After Each Phase
```bash
git add -A
git commit -m "Feature Phase N: [description]"
```

### 5.4 — Deploy After Phase 1 and Phase 6
Deploy to Vercel after Phase 1 (pricing/promo fixes — quick win) and after Phase 6 (everything done).

### 5.5 — No Placeholders
Every task must be functionally complete. No `// TODO` comments.

### 5.6 — Error Handling
Every API route: try/catch, structured JSON errors, console.error with endpoint prefix.

### 5.7 — Dependencies
Do NOT add Twilio SDK or n8n SDK. Use `fetch` for all external API calls. Keep deps minimal.

### 5.8 — Moonshot API for Automation Parser
Use Kimi K2.5 for the automation intent parser:
- Base URL: `https://api.moonshot.ai/v1`
- API Key: Use `MOONSHOT_API_KEY` env var (add to Vercel if not present)
- Model: `kimi-k2.5`
- Do NOT set custom temperature (reasoning model)

---

## SUMMARY

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-4 | Tiered pricing, promo codes, Stripe branding |
| 2 | 5-6 | Database migrations + types |
| 3 | 7-12 | Natural language automation engine |
| 4 | 13-20 | AI Receptionist (Twilio + voice) |
| 5 | 21-25 | Reseller invite links |
| 6 | 26-28 | Polish, sidebar ordering, admin tools |

**Total: 28 tasks across 6 phases.**

---

*Generated by Mouse · March 11, 2026*
