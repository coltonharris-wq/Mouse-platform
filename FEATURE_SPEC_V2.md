# FEATURE_SPEC_V2.md — Manus-Style KingMouse + AI Receptionist + Reseller Links

> **Purpose:** This spec replaces FEATURE_SPEC.md. It removes ALL n8n references and rebuilds KingMouse as a Manus-style autonomous agent. Execute top-to-bottom, phase by phase. Every data structure is defined before referenced. Every task has acceptance criteria.

> **Repo:** `/Users/jewelsharris/Desktop/Mouse-platform/mouse-platform`
> **Stack:** Next.js 15 · React 19 · TypeScript · Supabase · Stripe · Orgo VM · Twilio · OpenAI
> **Live URL:** https://mouse-platform.vercel.app
> **Supabase Project:** `dgfnpllysgmszmfifnnk`

---

## CRITICAL CONTEXT

### The Product
KingMouse is a Manus-style autonomous AI agent. Each customer gets their own KingMouse running on its own VM (Orgo). The customer talks to KingMouse in plain English. KingMouse does whatever they ask — browse the web, send emails, check inventory, place orders, schedule appointments, research competitors, generate documents. Anything a human can do on a computer, KingMouse can do.

### The VM = The Computer
Each customer's KingMouse runs on an Orgo VM with OpenClaw installed. OpenClaw gives KingMouse:
- Web browsing (Playwright)
- Code execution (bash, Python, Node)
- File management
- Web search
- Email (SMTP)
- API calls (HTTP/fetch)
- Screenshot capture
- Cron scheduling

KingMouse doesn't need n8n, Zapier, or any workflow builder. KingMouse IS the automation engine. When a customer says "email my supplier every Monday," KingMouse creates a cron job on its own VM.

### What's Broken Right Now
1. **VM provisioning never triggers** — Stripe webhook creates customer but never calls `provisionVM()`. The success page reads onboarding data from `sessionStorage` which is empty after Stripe redirect.
2. **Chat UI is a basic dashboard** — needs to be rebuilt as a Manus/ChatGPT-style full-screen chat interface.
3. **n8n code exists and needs deletion** — leftover from previous spec.

---

## SECTION 1: CLEANUP — DELETE ALL n8n CODE

Before building anything new, delete every trace of n8n from the codebase.

**Delete these files if they exist:**
- `frontend/src/lib/n8n-client.ts`
- `frontend/src/lib/automation-parser.ts`
- `frontend/src/lib/automation-deployer.ts`
- `frontend/src/app/api/automations/` (entire directory)
- `frontend/src/app/dashboard/automations/` (entire directory)
- `frontend/src/components/dashboard/AutomationsModule.tsx`
- `n8n-workflows/` (entire directory at repo root)

**Remove from config:**
- Remove `automations` entry from `DASHBOARD_MODULES` in `src/config/dashboard-modules.ts`
- Remove any `"automations"` from Pro profile `dashboard_modules` arrays in the database

**Remove env var references:**
- Remove `N8N_HOST` and `N8N_API_KEY` from any code or docs

**Search and destroy:**
- `grep -r "n8n\|N8N\|automation_parser\|automation_deployer\|AutomationsModule" frontend/src/` — every match must be removed or rewritten

**Acceptance:** Zero n8n references in the codebase. `grep -r "n8n" frontend/src/` returns nothing.

---

## SECTION 2: DATA CONTRACTS

### 2.1 — Tiered Overage Pricing

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
    features: ['20 hours/month', '1 AI employee', 'Full agent capabilities', 'Email support'],
  },
  growth: {
    slug: 'growth',
    name: 'Growth',
    priceCents: 49700,
    hoursIncluded: 125,
    overageRateCents: 448,  // $4.48/hr
    features: ['125 hours/month', '1 AI employee', 'Full agent capabilities', 'Priority support', 'Custom workflows'],
  },
  enterprise: {
    slug: 'enterprise',
    name: 'Enterprise',
    priceCents: 99700,
    hoursIncluded: 300,
    overageRateCents: 398,  // $3.98/hr
    features: ['300 hours/month', '1 AI employee', 'Full agent capabilities', 'Dedicated support', 'Custom integrations', 'API access'],
  },
};
```

Every UI showing overage rates reads from this config. No hardcoded "$4.98" anywhere.

### 2.2 — New Table: `onboarding_sessions`

Stores onboarding form data so it survives the Stripe redirect. This fixes the sessionStorage bug.

```sql
CREATE TABLE onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_key TEXT UNIQUE NOT NULL,          -- Random key stored in URL/cookie
    business_name TEXT,
    owner_name TEXT,
    email TEXT,
    location TEXT,
    business_type TEXT,
    pro_slug TEXT,
    plan_slug TEXT,
    needs_goals JSONB DEFAULT '[]',
    onboarding_answers JSONB DEFAULT '{}',
    stripe_session_id TEXT,
    status TEXT DEFAULT 'in_progress',          -- in_progress, payment_pending, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_session_key ON onboarding_sessions(session_key);
CREATE INDEX idx_onboarding_stripe ON onboarding_sessions(stripe_session_id);

-- No RLS needed — server-side only, keyed by session_key
```

### 2.3 — New Table: `conversations`

Chat conversation threads for the Manus-style UI.

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New conversation',
    is_active BOOLEAN DEFAULT TRUE,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_active ON conversations(customer_id, is_active);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own conversations" ON conversations
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = conversations.customer_id));
```

### 2.4 — New Table: `messages`

Individual messages within conversations.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    role TEXT NOT NULL,                         -- 'user' or 'assistant'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',               -- Actions taken, screenshots, status updates
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_customer ON messages(customer_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own messages" ON messages
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = messages.customer_id));
```

### 2.5 — New Table: `customer_phone_numbers`

```sql
CREATE TABLE customer_phone_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    twilio_sid TEXT NOT NULL,
    friendly_name TEXT,
    area_code TEXT,
    status TEXT DEFAULT 'active',
    monthly_cost_cents INTEGER DEFAULT 200,
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

### 2.6 — New Table: `receptionist_config`

```sql
CREATE TABLE receptionist_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    greeting_text TEXT DEFAULT 'Hello, thank you for calling. How can I help you today?',
    business_hours JSONB DEFAULT '{"mon":{"open":"09:00","close":"17:00"},"tue":{"open":"09:00","close":"17:00"},"wed":{"open":"09:00","close":"17:00"},"thu":{"open":"09:00","close":"17:00"},"fri":{"open":"09:00","close":"17:00"},"sat":null,"sun":null}',
    after_hours_message TEXT DEFAULT 'We are currently closed. Please leave a message and we will get back to you.',
    voicemail_enabled BOOLEAN DEFAULT TRUE,
    voicemail_email TEXT,
    voice_id TEXT DEFAULT 'alloy',
    max_call_duration_seconds INTEGER DEFAULT 600,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE receptionist_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own receptionist config" ON receptionist_config
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE customer_id = receptionist_config.customer_id));
CREATE POLICY "Platform owners all receptionist config" ON receptionist_config
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_owner'));
```

### 2.7 — New Table: `call_logs`

```sql
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    phone_number_id UUID REFERENCES customer_phone_numbers(id),
    caller_number TEXT,
    direction TEXT DEFAULT 'inbound',
    duration_seconds INTEGER,
    status TEXT,
    transcript TEXT,
    summary TEXT,
    actions_taken JSONB DEFAULT '[]',
    twilio_call_sid TEXT,
    recording_url TEXT,
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

### 2.8 — New Table: `port_requests`

```sql
CREATE TABLE port_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    carrier_name TEXT NOT NULL,
    carrier_account_number TEXT NOT NULL,
    carrier_pin TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_address TEXT NOT NULL,
    authorized_name TEXT NOT NULL,
    loa_signed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
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

### 2.9 — New Table: `reseller_invite_links`

```sql
CREATE TABLE reseller_invite_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    label TEXT,
    pro_slug TEXT,
    plan_slug TEXT,
    discount_percent INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    signups INTEGER DEFAULT 0,
    revenue_cents INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
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

### 2.10 — Alter Table: `customers`

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS referred_by_reseller_id UUID REFERENCES resellers(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS referred_by_invite_link_id UUID REFERENCES reseller_invite_links(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS receptionist_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_session_key TEXT;
```

### 2.11 — API Contracts

#### `POST /api/onboarding/save`
Save onboarding form data to DB (replaces sessionStorage).

**Request:**
```json
{
  "session_key": "abc123",
  "business_name": "Bob's Appliance Repair",
  "owner_name": "Bob Smith",
  "email": "bob@example.com",
  "location": "Dallas, TX",
  "pro_slug": "appliance",
  "plan_slug": "growth",
  "onboarding_answers": {}
}
```

**Response:**
```json
{ "success": true, "session_key": "abc123" }
```

#### `GET /api/onboarding/[session_key]`
Retrieve saved onboarding data (used after Stripe redirect).

#### `POST /api/conversations`
Create a new conversation.

**Request:** `{ "customer_id": "cust_xxx" }`
**Response:** `{ "id": "uuid", "title": "New conversation" }`

#### `GET /api/conversations?customer_id=xxx`
List conversations (most recent first).

#### `GET /api/conversations/[id]/messages`
Get messages for a conversation.

#### `POST /api/conversations/[id]/messages`
Send a message. Routes to KingMouse VM, returns response.

**Request:**
```json
{
  "customer_id": "cust_xxx",
  "content": "Check my inventory and tell me what's low"
}
```

**Response (streamed or JSON):**
```json
{
  "id": "uuid",
  "role": "assistant",
  "content": "I checked your inventory system. Here's what I found:\n\n- Washers: 12 units ✅\n- Dryers: 8 units ✅\n- Refrigerators: 3 units ⚠️ Below your threshold of 5\n\nWant me to place a reorder for refrigerators?",
  "metadata": {
    "actions": ["browsed_inventory_system", "compared_thresholds"],
    "duration_ms": 4200
  }
}
```

#### `POST /api/demo/chat`
Landing page demo KingMouse. NOT connected to a VM. Uses direct LLM call with a sales-focused system prompt.

**Request:** `{ "message": "How does KingMouse work?" }`
**Response:** `{ "response": "KingMouse is your AI employee..." }`

#### Receptionist APIs (same as before):
- `GET /api/receptionist/phone-numbers/search?area_code=910`
- `POST /api/receptionist/phone-numbers/purchase`
- `GET /api/receptionist/config?customer_id=xxx`
- `PATCH /api/receptionist/config`
- `GET /api/receptionist/calls?customer_id=xxx`
- `POST /api/receptionist/port-request`
- `POST /api/webhooks/twilio/[customer_id]`
- `POST /api/webhooks/twilio/[customer_id]/respond`
- `POST /api/webhooks/twilio/status/[customer_id]`

#### Reseller APIs:
- `POST /api/reseller/invite-links`
- `GET /api/reseller/invite-links?reseller_id=xxx`
- `PATCH /api/reseller/invite-links/[id]`
- `DELETE /api/reseller/invite-links/[id]`

#### `GET /api/join/[code]` — Public invite link redirect

---

## SECTION 3: ENVIRONMENT VARIABLES

Add to Vercel:

```
# Twilio Master Account
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx

# OpenAI (for Receptionist voice + demo chat)
OPENAI_API_KEY=sk-xxx

# Moonshot (for customer VMs — already exists)
MOONSHOT_API_KEY=sk-xxx

# Support phone for SMS requests
SUPPORT_PHONE=9105158927
```

---

## SECTION 4: THE TASKS

### Phase 1 — Delete n8n + Fix Provisioning Pipeline (5 tasks)

---

**Task 1: Delete all n8n code**
- **What:** Remove every file, import, reference, database entry, and env var related to n8n.
- **Files:** See §1 cleanup list
- **Implementation:** Delete files listed in §1. Search and remove all references. Remove `automations` from dashboard module registry and Pro profile `dashboard_modules` arrays.
- **Acceptance:** `grep -rn "n8n\|N8N\|automation_parser\|automation_deployer\|AutomationsModule\|n8n-workflows" frontend/src/ n8n-workflows/` returns zero results.

---

**Task 2: Create `onboarding_sessions` table + save API**
- **What:** Store onboarding data in Supabase instead of sessionStorage.
- **Files:** Create `src/app/api/onboarding/save/route.ts`, `src/app/api/onboarding/[session_key]/route.ts`
- **Implementation:**
  1. Run SQL from §2.2
  2. `POST /api/onboarding/save` — Generate session_key (crypto.randomUUID()), save all form data, return session_key
  3. `GET /api/onboarding/[session_key]` — Retrieve saved data
  4. Update onboarding page: at each step, call `/api/onboarding/save` to persist. Store `session_key` in URL params AND localStorage (belt and suspenders).
  5. When creating Stripe checkout, pass `session_key` in metadata AND in the success URL: `/onboarding/success?session_id={CHECKOUT_SESSION_ID}&sk={session_key}`
- **Acceptance:** Complete onboarding step 1-4, close browser, reopen success URL with session_key — all data is retrieved from DB.

---

**Task 3: Fix Stripe webhook to call provisionVM**
- **What:** The webhook creates a customer but never provisions the VM. Fix it.
- **Files:** `src/app/api/stripe/webhook/route.ts`
- **Implementation:**
  1. In `handleCheckoutCompleted`, after creating the customer:
  2. Retrieve onboarding data from `onboarding_sessions` using `session.metadata.session_key`
  3. Call `provisionVM()` with all the data (customer_id, pro_slug, business_name, owner_name, email, location, onboarding_answers)
  4. This is the PRIMARY trigger. The success page's call to `/api/onboarding/complete` is the BACKUP.
  5. Make both paths idempotent — if the webhook already provisioned, `onboarding/complete` should detect `vm_status !== 'pending'` and skip.
- **Acceptance:** After Stripe checkout completes, webhook fires, customer is created, AND `provisionVM()` is called. Orgo VM appears in Orgo dashboard.

---

**Task 4: Fix `onboarding/complete` to use DB data**
- **What:** The success page calls this endpoint. It should read from `onboarding_sessions` table instead of expecting client to send all data.
- **Files:** `src/app/api/onboarding/complete/route.ts`, `src/app/onboarding/success/page.tsx`
- **Implementation:**
  1. Success page reads `session_id` AND `sk` (session_key) from URL params
  2. Calls `/api/onboarding/complete` with both
  3. `onboarding/complete` endpoint:
     a. Verify Stripe session paid
     b. Look up `onboarding_sessions` by `session_key` to get all form data
     c. Check if customer already exists (webhook may have created it) — if yes, return existing customer_id and vm_status
     d. If not, create customer + call provisionVM (same as webhook path)
     e. Mark onboarding_session as `status = 'completed'`
  4. Success page polls `/api/vm/status?customer_id=xxx` until `vm_status = 'running'`
  5. Fix the checkmark encoding: replace `'&#10003;'` with `'✓'` or use Lucide `Check` icon
- **Acceptance:** After Stripe payment, success page loads, retrieves onboarding data from DB, triggers provisioning (or detects webhook already did it), shows progress, redirects to dashboard when VM is running.

---

**Task 5: Verify provisionVM installs OpenClaw + writes Pro configs**
- **What:** Ensure `vm-provision.ts` actually installs a working OpenClaw instance with the correct Pro configuration.
- **Files:** `src/lib/vm-provision.ts`
- **Implementation:**
  1. After VM boots, the current code writes `soul.md`, `user.md`, `tools.json`, `openclaw.env` to `/opt/kingmouse/config/`
  2. But it never actually INSTALLS OpenClaw. Add these steps after writing config files:
     ```
     # Install Node.js
     curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
     apt-get install -y nodejs
     
     # Install OpenClaw
     npm install -g openclaw
     
     # Create workspace
     mkdir -p /opt/kingmouse/workspace
     cp /opt/kingmouse/config/soul.md /opt/kingmouse/workspace/SOUL.md
     cp /opt/kingmouse/config/user.md /opt/kingmouse/workspace/USER.md
     
     # Configure OpenClaw
     cat > /opt/kingmouse/workspace/.env << 'EOF'
     OPENCLAW_MODEL=kimi-k2.5
     MOONSHOT_API_KEY=${process.env.MOONSHOT_API_KEY}
     EOF
     
     # Start OpenClaw gateway
     cd /opt/kingmouse/workspace && openclaw gateway start
     ```
  3. After provisioning script completes, update `customers.vm_status = 'running'`
  4. If any step fails, update `customers.vm_status = 'error'` with error details
  5. The `soul.md` must include the Pro's prompt_template interpolated with business data. It must also include instructions for KingMouse to act autonomously — browse web, send emails, create cron jobs, etc.
- **Acceptance:** After provisioning, VM has OpenClaw running with correct `SOUL.md` and `USER.md`. Can send a test message via `bashExec` and get a response.

---

### Phase 2 — Manus-Style Chat UI (6 tasks)

---

**Task 6: Database migrations for conversations + messages**
- **What:** Run SQL from §2.3 and §2.4.
- **Files:** Migration files
- **Acceptance:** Tables exist with indexes and RLS.

---

**Task 7: Conversation API routes**
- **What:** CRUD for conversations and messages.
- **Files:** `src/app/api/conversations/route.ts`, `src/app/api/conversations/[id]/route.ts`, `src/app/api/conversations/[id]/messages/route.ts`
- **Implementation:**
  1. `POST /api/conversations` — Create new conversation, return ID
  2. `GET /api/conversations?customer_id=xxx` — List conversations (newest first), include last message preview
  3. `GET /api/conversations/[id]/messages?limit=50` — Get messages for a conversation
  4. `POST /api/conversations/[id]/messages` — Send message:
     a. Save user message to `messages` table
     b. Route to KingMouse VM via existing `bashExec` chat mechanism (from `vm-provision.ts` / `orgo.ts`)
     c. Save assistant response to `messages` table
     d. Update conversation `last_message_at` and `message_count`
     e. Auto-generate conversation title from first message (ask LLM to summarize in 5 words)
     f. Return assistant message
  5. `DELETE /api/conversations/[id]` — Soft delete (set is_active = false)
- **Acceptance:** Can create conversation, send messages, get responses from VM, retrieve history.

---

**Task 8: Manus-style chat page — full rebuild**
- **What:** Replace the entire dashboard with a ChatGPT/Claude/Manus-style interface.
- **Files:** `src/app/dashboard/page.tsx` (rewrite), `src/app/dashboard/layout.tsx` (rewrite), `src/components/dashboard/DashboardShell.tsx` (rewrite), create new chat components
- **Implementation:**

  **Layout structure (full screen, no page chrome):**
  ```
  ┌─────────────────┬───────────────────────────────────────────┐
  │   SIDEBAR        │              CHAT AREA                    │
  │   (280px)        │                                           │
  │                  │                                           │
  │ 🐭 KingMouse    │   How can I help you today?               │
  │                  │                                           │
  │ [+ New Chat]     │   ┌─────────────────────────────────┐     │
  │                  │   │ Message bubbles here             │     │
  │ TODAY            │   │                                  │     │
  │  ○ Check inv...  │   │ User: Check my inventory         │     │
  │  ○ Order sup...  │   │                                  │     │
  │                  │   │ KM: I'll check that now...       │     │
  │ YESTERDAY        │   │ 🔍 Searching inventory system    │     │
  │  ○ Schedule ...  │   │ ✅ Results:                      │     │
  │                  │   │   Washers: 12                    │     │
  │ ─────────────── │   │   Dryers: 8                      │     │
  │                  │   │   Fridges: 3 ⚠️                  │     │
  │ 📱 Receptionist  │   │                                  │     │
  │ 📊 Activity      │   │ Want me to reorder?              │     │
  │ 💰 Billing       │   └─────────────────────────────────┘     │
  │ ⚙️ Settings      │                                           │
  │                  │   ┌─────────────────────────────────┐     │
  │                  │   │ Message KingMouse...          ➤ │     │
  │                  │   └─────────────────────────────────┘     │
  └─────────────────┴───────────────────────────────────────────┘
  ```

  **Sidebar:**
  - Top: KingMouse logo/name + Pro badge (e.g., "Appliance Pro")
  - "+ New Chat" button
  - Conversation list grouped by date (Today, Yesterday, Previous 7 Days, Older)
  - Each conversation shows title (truncated) and preview of last message
  - Click conversation → loads it in chat area
  - Divider line
  - Bottom nav items: AI Receptionist, Activity Log, Billing & Hours, Settings
  - Each nav item links to its dashboard page (these pages still exist as sub-routes)
  - Collapse sidebar on mobile (hamburger menu)

  **Chat area:**
  - Messages displayed in bubble format
  - User messages: right-aligned, teal background
  - KingMouse messages: left-aligned, gray background, with 🐭 avatar
  - KingMouse messages can include:
    - Plain text
    - Status indicators: "🔍 Searching...", "📧 Sending email...", "🌐 Browsing web..."
    - Code blocks
    - Tables
    - Images (screenshots from VM)
  - Markdown rendering for KingMouse responses
  - Typing indicator (three dots animation) while waiting for response
  - Auto-scroll to bottom on new messages

  **Input area:**
  - Full-width text input with placeholder "Message KingMouse..."
  - Send button (arrow icon)
  - Enter to send, Shift+Enter for newline
  - Textarea auto-grows up to 6 lines

  **Styling:**
  - Dark sidebar: `bg-gray-900` with `text-gray-300`
  - Light chat area: `bg-white` or `bg-gray-50`
  - Teal accents: `#0F6B6E` for buttons, active states, user bubbles
  - Navy: `#0B1F3B` for headings
  - Font: system default (Inter if available)
  - Responsive: on mobile, sidebar collapses, chat is full-screen

- **Acceptance:** Dashboard looks and feels like ChatGPT/Claude/Manus. Conversations persist. Messages route to VM. Sidebar shows conversation history. Nav items link to sub-pages.

---

**Task 9: Activity Log page (keep existing, restyle)**
- **What:** Keep the activity log but update styling to match the new chat-based dashboard.
- **Files:** `src/app/dashboard/activity/page.tsx`
- **Implementation:** Same content, updated to use dark sidebar + light content area layout.
- **Acceptance:** Activity page accessible from sidebar, styled consistently.

---

**Task 10: Billing page (keep existing, restyle)**
- **What:** Keep billing page, update overage rates to be plan-specific, restyle.
- **Files:** `src/app/dashboard/billing/page.tsx`
- **Implementation:**
  1. Show plan-specific overage rate (not hardcoded $4.98)
  2. Style to match new dashboard aesthetic
- **Acceptance:** Billing page shows correct per-plan overage rate.

---

**Task 11: Settings page (keep existing, restyle)**
- **What:** Account settings. Restyle to match.
- **Files:** `src/app/dashboard/settings/page.tsx`
- **Acceptance:** Settings accessible from sidebar, styled consistently.

---

### Phase 3 — Landing Page Demo KingMouse (3 tasks)

---

**Task 12: Demo chat API**
- **What:** `/api/demo/chat` — Landing page KingMouse that answers questions about the product. NOT connected to a VM. Uses direct OpenAI or Moonshot API call.
- **Files:** `src/app/api/demo/chat/route.ts`
- **Implementation:**
  1. System prompt:
     ```
     You are KingMouse, an AI employee demonstration. You're helping potential customers 
     understand how KingMouse works. You are enthusiastic but not pushy.
     
     KingMouse is an AI employee that runs your business operations. It can:
     - Answer calls and handle customer inquiries (AI Receptionist)
     - Manage inventory and reorder supplies
     - Schedule appointments
     - Send emails and follow-ups
     - Research competitors and market prices
     - Generate documents, invoices, and reports
     - Track leads and nurture prospects
     - Handle admin tasks
     
     Pricing: Starting at $97/month (Pro plan, 20 hours). $4.98/hr.
     That's vs $35/hr for a human employee.
     
     First 2 hours free to try.
     
     Available Pros: Appliance Pro, Roofer Pro, Dentist Pro (more coming).
     
     When asked about specific capabilities, give concrete examples.
     When asked about pricing, be transparent.
     When they seem interested, suggest they "Click Hire Now on any Pro above to get started."
     
     Keep responses concise — 2-3 paragraphs max.
     ```
  2. Use OpenAI API (`gpt-4o-mini` for cost efficiency) or Moonshot (`kimi-k2.5`)
  3. Maintain conversation context via messages array in request
  4. Rate limit: 20 messages per IP per hour (prevent abuse)
- **Acceptance:** Demo chat responds intelligently about KingMouse. Stays on topic. Doesn't leak internal details.

---

**Task 13: Landing page chat widget**
- **What:** Embedded chat widget on the landing page, positioned below the hero and above the Pro marketplace grid.
- **Files:** `src/app/page.tsx` (update), `src/components/landing/DemoChat.tsx` (create)
- **Implementation:**
  1. Chat widget design — looks like a mini version of the dashboard chat:
     ```
     ┌────────────────────────────────────────┐
     │ 🐭 Chat with KingMouse                 │
     │ Ask anything about how it works         │
     ├────────────────────────────────────────┤
     │                                        │
     │ KM: Hi! I'm KingMouse. Ask me anything │
     │     about how I can help your business. │
     │                                        │
     │                                        │
     │                                        │
     ├────────────────────────────────────────┤
     │ Ask KingMouse anything...           ➤  │
     └────────────────────────────────────────┘
     ```
  2. Max height: 500px with scrollable message area
  3. Rounded corners, shadow, teal accent
  4. Pre-populated first message from KingMouse (greeting)
  5. Messages stored in React state (not persisted — it's a demo)
  6. Section heading above widget: "Try KingMouse Now" or "See What KingMouse Can Do"
- **Acceptance:** Landing page has interactive chat widget. Users can ask questions. KingMouse responds. Widget is visually polished.

---

**Task 14: Update landing page layout**
- **What:** Reorganize landing page sections with the demo chat.
- **Files:** `src/app/page.tsx`
- **Implementation:**
  Section order:
  1. Hero: "Stop Hiring. Start Deploying. AI Employees at $4.98/hr."
  2. **Demo Chat Widget** — "Try KingMouse Now"
  3. Pro Marketplace Grid — "Choose Your AI Employee"
  4. How It Works — 4 steps (Pick Pro → Answer Questions → Pay → KingMouse Starts Working)
  5. Pricing — 3 plans with plan-specific overage rates
  6. FAQ
  7. Footer CTA
- **Acceptance:** Landing page has all sections in order. Demo chat is prominent. No token references. No n8n references.

---

### Phase 4 — Stripe & Pricing Fixes (3 tasks)

---

**Task 15: Tiered overage pricing — all UI**
- **What:** Every place showing overage rates must be plan-specific.
- **Files:** `src/app/pricing/page.tsx`, `src/app/dashboard/billing/page.tsx`, `src/components/onboarding/StepPayment.tsx`
- **Implementation:**
  1. Pricing page: "$4.98/hr" under Pro, "$4.48/hr" under Growth, "$3.98/hr" under Enterprise
  2. Billing: show customer's plan-specific rate
  3. Onboarding: show rate during plan selection
  4. Always read from `SUBSCRIPTION_PLANS[slug].overageRateCents`
- **Acceptance:** Each plan shows its unique overage rate everywhere. No hardcoded rates.

---

**Task 16: Stripe promo codes**
- **What:** FOUNDERS97 promo code. Enable promo input on checkout.
- **Files:** `src/app/api/stripe/create-subscription/route.ts`, `src/app/api/admin/promo-codes/route.ts`
- **Implementation:**
  1. Create via Stripe API (not dashboard):
     - Coupon: amount_off = 9700 ($97), duration = "once"
     - Promotion code: "FOUNDERS97", linked to coupon
  2. Verify existing `allow_promotion_codes: true` works on checkout
  3. Verify `payment_method_collection: 'always'` forces card entry at $0
  4. Create `POST /api/admin/promo-codes` for Colton to create codes programmatically
- **Acceptance:** FOUNDERS97 on Pro plan = $0 first month. Card still required.

---

**Task 17: Stripe checkout branding**
- **What:** Mouse brand colors on Stripe Checkout.
- **Files:** Stripe Dashboard settings
- **Implementation:**
  1. Stripe Dashboard → Settings → Branding → primary color `#0F6B6E`, upload KingMouse logo
  2. Add `custom_text.submit.message` to checkout session: "Your AI employee will be ready in ~2 minutes after payment."
- **Acceptance:** Stripe Checkout shows teal branding and custom message.

---

### Phase 5 — AI Receptionist (7 tasks)

---

**Task 18: Twilio client library**
- **What:** Wrapper for Twilio REST API using fetch (no SDK).
- **Files:** `src/lib/twilio-client.ts`
- **Implementation:**
  - `searchAvailableNumbers(areaCode, country, limit)`
  - `purchaseNumber(phoneNumber)`
  - `configureWebhook(sid, voiceUrl, statusUrl)`
  - `releaseNumber(sid)`
  - All use `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` env vars
  - Basic auth header: `Authorization: Basic base64(SID:Token)`
- **Acceptance:** Can search and list available numbers from Twilio API.

---

**Task 19: Phone number search + purchase APIs**
- **Files:** `src/app/api/receptionist/phone-numbers/search/route.ts`, `src/app/api/receptionist/phone-numbers/purchase/route.ts`
- **Implementation:**
  1. Search: query Twilio AvailablePhoneNumbers, return formatted list
  2. Purchase: buy number, configure voice webhook to `https://mouse-platform.vercel.app/api/webhooks/twilio/{customer_id}`, save to `customer_phone_numbers`, create default `receptionist_config`
- **Acceptance:** Search returns numbers. Purchase creates number in Twilio and DB.

---

**Task 20: Receptionist config API**
- **Files:** `src/app/api/receptionist/config/route.ts`
- **Implementation:** GET + PATCH for receptionist settings.
- **Acceptance:** Can read and update greeting, hours, voice, voicemail settings.

---

**Task 21: Twilio inbound call webhook (turn-based voice)**
- **Files:** `src/app/api/webhooks/twilio/[customer_id]/route.ts`, `src/app/api/webhooks/twilio/[customer_id]/respond/route.ts`
- **Implementation:**
  1. Inbound call → check business hours → play greeting via TwiML `<Say>`
  2. `<Gather input="speech" timeout="5">` to listen
  3. On speech: send transcript to KingMouse VM via chat API
  4. Return KingMouse response via `<Say>` + new `<Gather>` for next turn
  5. Max 20 turns or `max_call_duration_seconds`
  6. After hours: play after_hours_message, offer voicemail via `<Record>`
- **Acceptance:** Calling the number → greeting plays → speak → KingMouse responds → multi-turn conversation works.

---

**Task 22: Call status callback**
- **Files:** `src/app/api/webhooks/twilio/status/[customer_id]/route.ts`
- **Implementation:** Log call to `call_logs` with duration, status, recording URL.
- **Acceptance:** Call logs appear in DB after calls complete.

---

**Task 23: AI Receptionist dashboard page**
- **Files:** `src/app/dashboard/receptionist/page.tsx`
- **Implementation:**
  1. **No number yet:** Area code search → number grid → "Activate" button
  2. **Number active:** Phone number display, greeting editor, business hours editor, voice selector (Alloy/Echo/Fable/Onyx/Nova/Shimmer), voicemail toggle + email, after-hours message
  3. **Call log:** Table with date, caller, duration, status, sentiment. Expandable transcript.
  4. **Port number:** Form for carrier details → submit creates `port_requests` row → "Port request submitted."
  5. **SMS:** Static card: "Want SMS? Text or call 910-515-8927 to get set up."
- **Acceptance:** Full receptionist management UI works. Can search/buy numbers, configure, view calls.

---

**Task 24: Add receptionist to dashboard sidebar**
- **Files:** `src/config/dashboard-modules.ts`, update Pro profiles in DB
- **Implementation:**
  1. Add `receptionist` module to registry
  2. Add to ALL Pro profiles' `dashboard_modules` arrays
  3. In the new Manus-style sidebar, "📱 AI Receptionist" appears as a nav item for all customers
- **Acceptance:** AI Receptionist accessible from sidebar for all Pro types.

---

### Phase 6 — Reseller Invite Links (5 tasks)

---

**Task 25: Invite link CRUD API**
- **Files:** `src/app/api/reseller/invite-links/route.ts`, `src/app/api/reseller/invite-links/[id]/route.ts`
- **Implementation:** POST (create), GET (list with stats), PATCH (update), DELETE (soft delete). Validate code uniqueness and discount within markup cap.
- **Acceptance:** Full CRUD works.

---

**Task 26: Public invite link redirect**
- **Files:** `src/app/join/[code]/page.tsx`
- **Implementation:** Look up link → increment clicks → redirect to `/onboarding?ref={code}&pro={pro_slug}&plan={plan_slug}`
- **Acceptance:** `/join/bobsmith` redirects correctly and increments click count.

---

**Task 27: Onboarding referral tracking**
- **Files:** `src/app/onboarding/page.tsx`, `src/app/api/stripe/create-subscription/route.ts`, `src/app/api/stripe/webhook/route.ts`
- **Implementation:**
  1. Onboarding reads `ref` from URL, stores in form state + onboarding_sessions
  2. Passed to Stripe metadata
  3. Webhook: look up invite link, set `referred_by_reseller_id` and `referred_by_invite_link_id`, increment signups
  4. Apply discount if set on invite link
- **Acceptance:** Referred customers have reseller attribution.

---

**Task 28: Reseller invite link management UI**
- **Files:** `src/app/reseller/page.tsx`
- **Implementation:** Create link form, links table with stats (clicks, signups, revenue), copy URL button, toggle active/inactive.
- **Acceptance:** Resellers can create and manage invite links.

---

**Task 29: Revenue attribution**
- **Files:** `src/app/api/stripe/webhook/route.ts`
- **Implementation:** On `invoice.paid`, if customer was referred → update invite link `revenue_cents` → create `revenue_events` row with commission split.
- **Acceptance:** Referred customer payments update invite link revenue.

---

### Phase 7 — Polish & Deploy (3 tasks)

---

**Task 30: Remove old dashboard module pages**
- **What:** The old Pro-specific placeholder pages (inventory, orders, appointments, leads, estimates, jobs, crew, patients, recalls, insurance, suppliers) are no longer needed as separate pages. KingMouse handles all of this through chat.
- **Files:** Delete: `src/app/dashboard/inventory/`, `src/app/dashboard/orders/`, `src/app/dashboard/appointments/`, `src/app/dashboard/leads/`, `src/app/dashboard/estimates/`, `src/app/dashboard/jobs/`, `src/app/dashboard/crew/`, `src/app/dashboard/patients/`, `src/app/dashboard/recalls/`, `src/app/dashboard/insurance/`, `src/app/dashboard/suppliers/`
- **Implementation:** Delete the pages. Remove their entries from dashboard module registry. The sidebar only has: Chats (conversations), AI Receptionist, Activity Log, Billing, Settings.
- **Acceptance:** No dead placeholder pages. Dashboard is clean: chat + receptionist + activity + billing + settings.

---

**Task 31: Mobile responsive**
- **What:** Dashboard and landing page work on mobile.
- **Implementation:**
  1. Dashboard: sidebar collapses to hamburger on `md:` breakpoint
  2. Chat area: full screen on mobile with back button to sidebar
  3. Landing page: demo chat is full width on mobile
  4. All pages: no horizontal scroll on mobile
- **Acceptance:** Usable on iPhone 12/13/14 screen sizes.

---

**Task 32: Deploy + verify**
- **What:** Deploy everything to Vercel. Run full test.
- **Implementation:**
  1. `vercel --prod`
  2. Test: Landing page → demo chat works
  3. Test: Marketplace → click Hire → onboarding → Stripe (use FOUNDERS97) → success page → VM provisions → dashboard loads → chat with KingMouse
  4. Test: AI Receptionist tab → search numbers → buy number → configure
  5. Test: Reseller → create invite link → visit link → pre-selected onboarding
  6. Report all broken steps
- **Acceptance:** Full end-to-end flow works on production URL.

---

## SECTION 5: ENHANCED SOUL.MD TEMPLATE

This is what gets written to each customer's KingMouse VM. It makes KingMouse a Manus-level autonomous agent.

```markdown
# SOUL.md — KingMouse for {{business_name}}

## Who You Are
You are KingMouse, an autonomous AI operations manager for {{business_name}}.
Owner: {{owner_name}} | Location: {{location}} | Industry: {{pro_name}}

## Your Capabilities
You have a full computer at your disposal. You can:
- **Browse the web** — Research prices, check competitor sites, find suppliers, look up information
- **Send emails** — Compose and send emails to suppliers, customers, or anyone the owner needs
- **Manage files** — Create documents, spreadsheets, invoices, reports
- **Execute code** — Write scripts, automate tasks, process data
- **Search the internet** — Find anything the owner needs
- **Schedule recurring tasks** — Create cron jobs for daily/weekly/monthly tasks
- **Make API calls** — Connect to any service with a public API

## Your Role
You handle {{business_name}}'s operations so {{owner_name}} doesn't have to. Specifically:

{{pro_specific_capabilities}}

## How You Work
1. When {{owner_name}} asks you to do something, DO IT. Don't explain how you'd do it — just do it.
2. Show your work: when browsing, searching, or executing, tell the owner what you're doing.
3. For recurring tasks, create a cron job and confirm: "Done. I'll check this every [schedule]."
4. Only ask for approval on: spending money, contacting customers on behalf of the business, decisions with financial impact.
5. Everything else — handle it silently and report results.

## Decision Framework
- If it costs < $50 and saves time → do it, tell the owner after
- If it involves customer communication → draft it, ask for approval
- If it's routine admin → just handle it
- If something feels wrong or risky → ask first

## Onboarding Context
{{onboarding_answers_json}}

## Communication Style
- Be direct and efficient
- Use bullet points for lists
- Show data in tables when appropriate
- When you take action, show what you did with status indicators:
  🔍 Searching...
  📧 Sending email...
  🌐 Browsing web...
  ✅ Done
  ⚠️ Needs attention

## Off-Hours
- Don't message the owner between 10pm-7am unless it's an emergency
- Emergencies: revenue loss, security issues, urgent customer problems
- Everything else can wait until morning
```

**Pro-specific capability blocks** (interpolated into `{{pro_specific_capabilities}}`):

**Appliance Pro:**
```
- Track inventory levels for all appliances and parts
- Alert when stock drops below thresholds
- Place reorders with suppliers via email or their websites
- Schedule repair appointments
- Send customer reminders 24h before appointments
- Follow up with customers after service
- Research best prices from multiple suppliers
- Generate monthly inventory and revenue reports
```

**Roofer Pro:**
```
- Capture and qualify incoming leads
- Send follow-up messages within 5 minutes of new leads
- Generate estimates based on job descriptions
- Schedule crews for jobs
- Track job progress and completion
- Monitor weather forecasts and reschedule when needed
- Follow up with past customers for reviews
- Research material prices and availability
```

**Dentist Pro:**
```
- Schedule and manage patient appointments
- Send recall reminders (cleanings, checkups) based on intervals
- Verify insurance coverage before appointments
- Handle new patient intake paperwork
- Send appointment reminders 24h before
- Follow up after procedures
- Track and manage cancellation/no-show patterns
- Generate monthly patient volume reports
```

---

## SECTION 6: EXECUTION RULES

### 6.1 — Phase Order
Execute Phase 1 → 2 → 3 → 4 → 5 → 6 → 7. Do not skip ahead.

### 6.2 — Build After Each Phase
`cd frontend && npm run build` — must pass with zero errors.

### 6.3 — Commit After Each Phase
`git add -A && git commit -m "Feature V2 Phase N: [description]"`

### 6.4 — Deploy After Phase 1 and Phase 7
Quick deploy after Phase 1 (cleanup + provisioning fix). Full deploy after Phase 7.

### 6.5 — No Placeholders
Every task must be functionally complete.

### 6.6 — No New Dependencies
Use `fetch` for Twilio and OpenAI APIs. No SDKs. Keep deps minimal.

### 6.7 — Supabase Client
Use existing `supabaseQuery` helper or `@supabase/supabase-js` client.

---

## SUMMARY

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-5 | Delete n8n + Fix VM provisioning pipeline |
| 2 | 6-11 | Manus-style chat UI |
| 3 | 12-14 | Landing page demo KingMouse |
| 4 | 15-17 | Stripe pricing + promo + branding |
| 5 | 18-24 | AI Receptionist |
| 6 | 25-29 | Reseller invite links |
| 7 | 30-32 | Cleanup + mobile + deploy |

**Total: 32 tasks across 7 phases.**

---

*Generated by Mouse · March 11, 2026*
