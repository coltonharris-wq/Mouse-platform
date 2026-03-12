# FEATURE_SPEC_V5: Customer Portal Onboarding Flow

> **Status:** LOCKED — This is the definitive customer onboarding flow.
> **Author:** Colton Harris (founder) · March 12, 2026
> **Principle:** Experience value → Sign up → Guided setup → Paywall. The chat is the hook.

---

## Overview

Mouse sells AI operations managers (King Mouse instances) to SMBs. This spec defines the customer-facing conversion funnel:

1. **Industry/Niche Selection** — Landing page toggles
2. **Pre-Auth Chat** — Live conversation with a demo King Mouse (cloud mode, no VM)
3. **Account Creation** — Sign up after experiencing value
4. **Provisioning** — VM spins up with their specific pro template
5. **Onboarding Wizard** — Guided dashboard setup, then hard paywall

No free service after the onboarding wizard. Period.

---

## Existing Codebase Reference

All paths relative to `mouse-platform/frontend/`.

### What Already Exists (build on these, don't rewrite)
- **Landing page:** `src/app/page.tsx` — has ProGrid + DemoChat already
- **Demo chat API:** `src/app/api/demo/chat/route.ts` — generic system prompt, needs niche-specific upgrade
- **Demo chat component:** `src/components/landing/DemoChat.tsx` — basic chat UI
- **Onboarding flow:** `src/app/onboarding/page.tsx` — 5-step wizard (BusinessInfo → NeedsGoals → ProSelection → IndustryQuestions → Payment)
- **Onboarding components:** `src/components/onboarding/Step*.tsx`
- **Marketplace:** `src/app/marketplace/page.tsx` + `src/components/marketplace/ProGrid.tsx`, `ProCard.tsx`
- **Dashboard:** `src/app/dashboard/page.tsx` + `src/app/dashboard/layout.tsx` (DashboardShell)
- **VM provisioning:** `src/lib/vm-provision.ts` + `src/app/api/vm/provision/route.ts`
- **Plans:** `src/lib/plans.ts` — Pro $97, Growth $497, Enterprise $997
- **Stripe:** `src/lib/stripe.ts` + `src/app/api/stripe/` routes
- **Auth:** `src/lib/auth.ts` + Supabase Auth
- **Orgo VM:** `src/lib/orgo.ts` — createComputer, bashExec, getComputer
- **Pro capabilities:** Defined in `src/lib/vm-provision.ts` (`PRO_CAPABILITIES` map)
- **Brand slugs/reseller:** V4 spec complete — `src/app/[slug]/`, middleware.ts, `src/lib/urls.ts`

### What Needs to Change
The current flow is: Landing → Marketplace → Pick Pro → 5-step onboarding → Payment → Provisioning → Dashboard.

The NEW flow is: Landing (industry toggles) → Pick niche → **Chat with King Mouse first** → Sign up after value demo → Provisioning → Dashboard wizard → Paywall.

The key difference: **chat happens BEFORE signup**, not after. The chat IS the hook.

---

## User Flow — Step by Step

### Stage 1: Landing Page — Industry & Niche Selection

**Route:** `src/app/page.tsx` (modify existing) or `src/app/get-started/page.tsx` (new)

**Design:**
- Clean hero: "Hire Your AI Operations Manager"
- **Industry toggle buttons** — large, visual, easy to tap on mobile
- Industries: Restaurant, Auto Shop, Salon/Barbershop, Real Estate, Plumbing/HVAC, Medical/Dental, Legal, Retail, Construction, Landscaping
- Selecting an industry **reveals niche/pro options** below it with smooth animation

**Example:**
```
[🍕 Restaurant]  [🔧 Auto Shop]  [💇 Salon]  [🏠 Real Estate]  ...

  ↓ (user taps Restaurant)

  [Pizza Shop]  [Fine Dining]  [Catering]  [Food Truck]  [Café]  [Bar/Brewery]
```

**Behavior:**
- Industry = toggle group (one active at a time)
- Niche buttons appear with animation
- Clicking a niche → navigates to `/chat/{industry}/{niche}`
- **No auth required. No account needed. Zero friction.**

**New components:**
- `src/components/landing/IndustrySelector.tsx` — toggle grid with icons
- `src/components/landing/NicheGrid.tsx` — sub-options, appear on industry select

**Data source:** `pro_templates` table (new, see DB schema below)

---

### Stage 2: Pre-Auth Chat with King Mouse

**Route:** `src/app/chat/[industry]/[niche]/page.tsx` (new)

**Design:**
- Full-screen chat interface (mobile-first)
- King Mouse avatar + niche title at top (e.g., "🐭 King Mouse — Pizza Shop Pro")
- Chat bubbles with typing indicators
- Small "← Back" to return to selection
- **NO sign-in/signup visible yet**

**Chat Flow — exactly 4 exchanges before signup prompt:**

| Turn | Who | What |
|------|-----|------|
| 1 | **King Mouse** | Opens with niche-specific pitch. Example for Pizza Shop: *"I'm Mouse, your AI operations manager. For pizza shops like yours, I handle order tracking, supplier coordination, staff scheduling, and customer follow-ups — so you can focus on making great pizza instead of drowning in admin."* Then asks: *"What's the name of your shop, and roughly how many orders do you handle per day?"* |
| 2 | **User** | Answers (e.g., "Tony's Pizza, about 150 orders a day") |
| 3 | **King Mouse** | Takes their answer, gives a **SPECIFIC tailored example**: *"150 orders/day at Tony's Pizza means you're probably losing 2-3 hours daily on supplier calls and inventory counts. I'd set up automated inventory tracking — when your dough or cheese hits reorder level, I handle the supplier order automatically. I'd also track your peak hours and suggest staffing changes."* Then asks: *"Want me to do something for you right now — like draft a supplier reorder email or set up an inventory tracker?"* |
| 4 | **User** | Responds to the action prompt |
| 5 | **King Mouse** | *"I'd love to get that started for you. To save your progress and set up your AI operations dashboard, let's create your account — it only takes 30 seconds."* → **Signup modal slides up** |

**Technical — API upgrade:**
- Modify `src/app/api/demo/chat/route.ts`:
  - Accept `industry` and `niche` params
  - Look up `pro_templates` table for that combo
  - Use the template's `demo_prompt` as system prompt instead of the generic one
  - Track message count per session
  - Return `{ reply, messageCount, promptSignup: boolean }` — `promptSignup=true` after Turn 4
  - Rate limit: 6 messages per session (covers the 4 turns + 1 buffer + signup trigger)

**Technical — Component:**
- New: `src/components/landing/NicheDemoChat.tsx` — enhanced DemoChat with:
  - Industry/niche-aware system prompt
  - Message counter
  - Signup modal trigger after Turn 4
  - Stores conversation in localStorage (sent to backend on signup)

**Pro Template Demo Prompt Structure:**
```
You are King Mouse, an AI operations manager for {niche} businesses.

Your first message MUST:
1. Introduce yourself briefly
2. Explain specifically how you help {niche} businesses (use industry-specific examples)
3. Ask ONE question about their business (name + a key operational metric)

After they answer, you MUST:
1. Reference their specific answer (use their business name, their numbers)
2. Give a concrete example of what you'd automate for THEIR business
3. Ask if they want you to take a specific action right now (draft email, set up tracker, etc.)

After they respond to the action prompt, say you'd love to help and suggest creating an account to save progress.

Rules: Stay concise. No fluff. Be impressive, not salesy. Max 3 paragraphs per message.
```

---

### Stage 3: Account Creation

**Trigger:** King Mouse's Turn 5 → signup modal slides up over chat

**Signup Modal:** `src/components/landing/SignupModal.tsx` (new)
- Email + password
- Google OAuth button
- Business name (pre-filled from chat if mentioned)
- Phone (optional)
- "Create Account" button
- ToS checkbox

**On Submit:**
1. Create user via Supabase Auth
2. Create/update `customers` row: `industry`, `niche`, `pro_template_id`, `demo_chat_transcript` (from localStorage)
3. Save `business_name`, `owner_name` from chat context
4. Redirect to `/provisioning`

**API:** Extend existing `src/app/api/onboarding/save/route.ts` or create `src/app/api/auth/signup/route.ts`

---

### Stage 4: Provisioning Screen

**Route:** `src/app/provisioning/page.tsx` (new)

**Design:**
- Full-screen with Mouse branding
- **Stepped progress bar** (not a spinner):
  1. ✅ "Setting up your workspace..."
  2. ⏳ "Installing your AI operations manager..."
  3. ○ "Configuring for {niche}..."
  4. ○ "Loading your dashboard..."
- "About 60 seconds" estimate
- Fun industry-specific tips while they wait

**Behind the scenes** (uses existing `src/lib/vm-provision.ts`):
1. `createComputer()` via Orgo API — 4GB RAM, 2 CPU
2. Upload + extract Mouse OS tarball
3. Generate `SOUL.md` from pro template + chat transcript (personalized)
4. Generate `USER.md` from signup data
5. Configure `gateway.yaml` with Kimi K2.5
6. Start OpenClaw gateway
7. Health check → mark provisioned

**Polling:** `GET /api/vm/status?customer_id={id}` (existing) — frontend polls every 3s

**On complete:** Redirect to `/dashboard?onboarding=true`

**On failure:** "We hit a small snag — retrying..." + auto-retry once

---

### Stage 5: Dashboard + Onboarding Wizard

**Route:** `src/app/dashboard/page.tsx` (modify existing)

**Trigger:** `?onboarding=true` query param → show wizard overlay

**Keep the existing dashboard design.** Just add a wizard overlay on first visit.

**Wizard — 4 steps (modal/overlay):**

**Step 1: "Connect Your Tools"**
- Email (Gmail/Outlook OAuth)
- Phone/SMS (Twilio or existing number)
- POS system (Square, Toast, Clover — niche-dependent from `wizard_config`)
- Inventory system (if applicable)
- Calendar (Google Calendar)
- Each: "Connect" button → OAuth → ✅ checkmark
- "Skip for now" on each

**Step 2: "Your Dashboard Tour"**
- Tooltip-based guided tour highlighting:
  - King Mouse chat panel
  - Task queue / pending approvals
  - Employee roster
  - Work hours / billing
  - Niche-specific widgets
- "Next" advances through highlights

**Step 3: "Meet Your King Mouse"**
- Shows chat panel
- King Mouse sends welcome referencing demo chat: *"Welcome back! I remember you mentioned {business detail}. Your dashboard is set up. Once you're on a plan, I'll get to work on {action they asked about}."*
- **Read-only preview.** Can see message, can't reply without a plan.

**Step 4: "Build Your Team"**
- Preview employee marketplace
- 2-3 recommended employees for their niche
- "Your King Mouse manages these. Hire them anytime."
- "Finish Setup" button

**On wizard complete:**
- Set `onboarding_completed_at` timestamp
- Dashboard loads normally
- **All interactive features locked behind paywall**
- "Choose Your Plan" CTA in dashboard header

**New components:**
- `src/components/dashboard/OnboardingWizard.tsx`
- `src/components/dashboard/WizardStep.tsx`
- `src/components/dashboard/ConnectionCard.tsx`
- `src/components/dashboard/DashboardTour.tsx`

---

### Stage 6: Paywall

**Trigger:** Any attempt to:
- Chat with King Mouse
- Hire an employee
- Create a task
- Use any operational feature

**Shows plan selection modal:**

| Plan | Price | Hours |
|------|-------|-------|
| Pro | $97/mo | 20 hrs |
| Growth | $497/mo | 125 hrs |
| Enterprise | $997/mo | 300 hrs |

Uses existing Stripe checkout flow (`src/lib/stripe.ts`).

**New component:**
- `src/components/dashboard/PaywallModal.tsx` — plan cards + Stripe redirect
- `src/components/dashboard/FeatureLock.tsx` — HOC wrapper, shows PaywallModal on click if no active plan

---

## Database Schema

### New: `pro_templates` table

```sql
CREATE TABLE pro_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  niche TEXT NOT NULL,
  display_name TEXT NOT NULL,        -- 'Pizza Shop'
  industry_display TEXT NOT NULL,    -- 'Restaurant'
  icon TEXT,                         -- emoji
  demo_prompt TEXT NOT NULL,         -- system prompt for pre-auth chat
  soul_template TEXT NOT NULL,       -- SOUL.md content for VM
  dashboard_config JSONB DEFAULT '{}',
  wizard_config JSONB DEFAULT '{}',  -- which connections to show, wizard steps
  tools_config JSONB DEFAULT '{}',   -- available integrations
  capabilities TEXT,                 -- markdown list of what this pro can do
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_pro_templates_industry_niche ON pro_templates(industry, niche);
```

### Modify: `customers` table (add columns)

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pro_template_id UUID REFERENCES pro_templates(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS demo_chat_transcript JSONB DEFAULT '[]';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS provisioning_status TEXT DEFAULT 'pending';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS provisioning_started_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS provisioning_completed_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
```

### New: `demo_sessions` table (analytics + rate limiting)

```sql
CREATE TABLE demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL,
  industry TEXT NOT NULL,
  niche TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  message_count INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  customer_id TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_demo_sessions_token ON demo_sessions(session_token);
```

---

## API Endpoints

### New

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/pro-profiles` | List all active industries + niches (grouped) |
| `POST` | `/api/demo/chat` | **Modify existing** — add industry/niche params, use template demo_prompt |
| `POST` | `/api/auth/signup` | Create account with industry/niche/transcript |
| `GET` | `/api/vm/status` | **Already exists** — used for provisioning poll |
| `POST` | `/api/onboarding/wizard-complete` | Mark wizard done, activate paywall state |

### Modified

| Method | Path | Change |
|--------|------|--------|
| `POST` | `/api/vm/provision` | Accept `pro_template_id`, generate niche SOUL.md from template + transcript |
| `POST` | `/api/vm/chat` | Add paywall check — require active subscription after onboarding |

---

## New Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/get-started` or modify `/` | Landing with IndustrySelector | Entry point |
| `/chat/[industry]/[niche]` | NicheDemoChat + SignupModal | Pre-auth value demo |
| `/provisioning` | ProvisioningScreen | VM setup loading |
| `/dashboard` (modify) | Add OnboardingWizard overlay | Guided setup |

---

## Implementation Priority

### Sprint 1: Landing + Demo Chat (Days 1-3)
1. `pro_templates` table + seed 5 templates (pizza shop, auto repair, hair salon, contractor, real estate)
2. `GET /api/pro-profiles` endpoint
3. `IndustrySelector` + `NicheGrid` components
4. Landing page update with industry/niche toggles
5. Upgrade `/api/demo/chat` to use niche-specific prompts from `pro_templates`
6. `NicheDemoChat` component at `/chat/[industry]/[niche]`

### Sprint 2: Signup + Provisioning (Days 4-6)
7. `SignupModal` component (in-chat signup)
8. `POST /api/auth/signup` with transcript storage
9. `ProvisioningScreen` component
10. Enhance `vm-provision.ts` to use pro template SOUL.md + transcript
11. Provisioning polling + redirect

### Sprint 3: Wizard + Paywall (Days 7-9)
12. `OnboardingWizard` (4-step overlay)
13. `ConnectionCard` for OAuth integrations
14. `DashboardTour` tooltip highlights
15. `PaywallModal` + `FeatureLock` wrapper
16. Lock all features post-onboarding without active plan

### Sprint 4: Polish (Days 10-12)
17. Mobile optimization (all screens)
18. Demo session analytics (conversion tracking)
19. Error handling + retry logic
20. E2E test: landing → chat → signup → provision → wizard → paywall → pay → chat works

---

## Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Demo chat | Cloud mode (direct Kimi K2.5) | No VM cost for tire-kickers |
| Demo model | Kimi K2.5 | Matches real product — no bait-and-switch |
| Provision time | ~60s (Mouse OS tarball) | V12 proven |
| Keep existing dashboard | Yes | Just add wizard overlay + paywall |
| Pro templates in DB | Yes | Editable without deploys, API-accessible |

---

## Sprint 2: Signup Modal + Provisioning Screen

### 2A: Signup Modal

**Trigger:** After turn 4 in the demo chat, when `/api/demo/chat` returns `promptSignup: true`

**Component:** `src/components/landing/SignupModal.tsx` (new)

**Behavior:**
- Slides up as an overlay OVER the chat (chat stays visible behind it, dimmed)
- NOT a full-page redirect — they stay in context

**Fields:**
- Email (required)
- Password (required, min 8 chars)
- Google OAuth button ("Continue with Google")
- Business name (pre-filled from chat if King Mouse extracted it)
- Phone number (optional)
- ToS checkbox
- "Create Account" button

**On Submit:**
1. Create user via Supabase Auth (`supabase.auth.signUp()` or Google OAuth)
2. Create `customers` row with: `industry`, `niche`, `pro_template_id`, `demo_chat_transcript` (pulled from NicheDemoChat localStorage), `business_name`, `owner_name`, `email`
3. Link `demo_sessions` row: set `converted = true`, `customer_id`
4. Store `customer_id` in sessionStorage (existing pattern)
5. Redirect to `/provisioning`

**API:** `POST /api/auth/signup` (new) — handles user creation + customer row + demo session linkage

**Error states:**
- "Email already exists" → show "Log in instead?" link
- Validation errors inline
- Network failure → retry button

---

### 2B: Provisioning Screen

**Route:** `src/app/provisioning/page.tsx` (new)

**Design:**
- Full-screen, dark background with Mouse branding
- Centered card with **stepped progress bar** (NOT a spinner)
- Steps:
  1. ✅ "Setting up your workspace..."
  2. ⏳ "Installing your AI operations manager..."
  3. ○ "Configuring for {niche}..."
  4. ○ "Loading your dashboard..."
- Time estimate: "About 60 seconds"
- Below progress: Fun industry-specific tips that rotate (e.g., "Did you know? The average pizza shop owner spends 12 hours/week on admin tasks.")

**Behind the scenes** (uses existing `src/lib/vm-provision.ts`):
1. Page loads → calls `POST /api/vm/provision` with customer_id
2. `vm-provision.ts` does: `createComputer()` → upload Mouse OS → generate SOUL.md from pro template + chat transcript → generate USER.md → configure gateway.yaml with Kimi K2.5 → start gateway → health check
3. On success: updates `customers.provisioning_status = 'ready'`, sets `provisioning_completed_at`

**Polling:**
- Frontend polls `GET /api/vm/status?customer_id={id}` every 3 seconds
- Response: `{ status: 'provisioning' | 'ready' | 'failed', step?: number, message?: string }`
- Progress bar updates based on `step` value

**On complete:** Redirect to `/dashboard?onboarding=true`

**On failure:**
- Show: "We hit a small snag — retrying..."
- Auto-retry once
- After second failure: "Something went wrong. Our team has been notified." + "Contact Support" link + "Try Again" button

---

## Sprint 2.5: Dashboard Overhaul (UX + Accessibility)

These changes apply to the existing dashboard at `src/app/dashboard/` and `src/components/dashboard/DashboardShell.tsx`. **Do NOT rewrite these files from scratch — modify them in place.**

### 2.5A: Global Font Size Increase

**Problem:** All text on the portal is too small for the target audience (SMB owners aged 35-65).

**Solution:** Increase ALL text across the entire portal by 100% (double size).

**Implementation:**
- In `src/app/globals.css` or the dashboard layout, set base font size: `html { font-size: 20px; }` (up from default 16px) — scoped to dashboard routes only
- OR create a wrapper class `.dashboard-portal` with `font-size: 1.25rem` base and scale all child elements proportionally
- Sidebar text: bump from `text-sm` to `text-base` or `text-lg`
- Chat messages: bump from `text-sm`/`text-base` to `text-lg`/`text-xl`
- Buttons: increase padding and font size
- Nav items: larger touch targets (min 48px height)
- **Test on mobile** — ensure nothing overflows

### 2.5B: Sidebar Changes

**Modify:** `src/components/dashboard/DashboardShell.tsx`

**Changes to `NAV_ITEMS`:**
1. **Rename** "Activity Log" → "Tasks"
2. **Add** new item: "Connections" (with `Link2` or `Plug` icon) — route: `/dashboard/connections`
3. **Keep** everything else (AI Receptionist, Billing & Hours, Settings)

**New nav order:**
```typescript
const NAV_ITEMS = [
  { slug: 'receptionist', name: 'AI Receptionist', icon: Phone, route: '/dashboard/receptionist' },
  { slug: 'tasks', name: 'Tasks', icon: CheckSquare, route: '/dashboard/tasks' },
  { slug: 'connections', name: 'Connections', icon: Plug, route: '/dashboard/connections' },
  { slug: 'billing', name: 'Billing & Hours', icon: Clock, route: '/dashboard/billing' },
  { slug: 'settings', name: 'Settings', icon: Settings, route: '/dashboard/settings' },
];
```

### 2.5C: Tasks Page (replaces Activity Log)

**Route:** `src/app/dashboard/tasks/page.tsx` (rename from `activity`)

**Design:**
- Three toggle tabs at the top: **Working** | **Scheduled** | **Completed**
- Each tab shows a list of tasks with: title, timestamp, status badge, brief description
- **Working:** Tasks King Mouse is currently doing
- **Scheduled:** Tasks queued or scheduled for later
- **Completed:** Done tasks with completion timestamp
- Default tab: "Working"
- Large text, high contrast, simple layout

**API:** `GET /api/task-log?customer_id={id}&status={working|scheduled|completed}` (existing or extend)

### 2.5D: Connections Page

**Route:** `src/app/dashboard/connections/page.tsx` (new)

**Design:**
- Grid of connection cards, grouped by category
- Each card shows: icon, name, status indicator (🟢 Connected / 🔴 Not Connected), "Connect" or "Disconnect" button

**Groups + Integrations:**

| Group | Integrations |
|-------|-------------|
| **Communication** | Gmail, Outlook, iMessage, Slack, Discord |
| **Social Media** | Instagram, Facebook, Twitter/X, LinkedIn, TikTok |
| **Productivity** | Google Calendar, Apple Notes, Notion, Google Sheets |
| **Business Tools** | Square POS, Toast, Clover, QuickBooks, Stripe |
| **Phone/SMS** | Twilio, RingCentral, Google Voice |
| **Storage** | Google Drive, Dropbox, OneDrive |

**Card states:**
- **Not connected (red):** Red dot + "Not Connected" text + "Connect" button (teal)
- **Connected (green):** Green dot + "Connected" text + "Disconnect" button (gray) + connection details (e.g., "john@gmail.com")

**Component:** `src/components/dashboard/ConnectionCard.tsx`

**API:** `GET /api/connections?customer_id={id}` — returns list of connections with status
**API:** `POST /api/connections/connect` — initiates OAuth or API key flow
**API:** `DELETE /api/connections/{id}` — disconnects

**Note:** Most integrations will be "Coming Soon" initially. Show the card but gray out the button with "Coming Soon" badge. Launch with: Gmail, Google Calendar, Slack, Twilio at minimum.

### 2.5E: Single Continuous Chat (No Multiple Conversations)

**Problem:** The current dashboard shows multiple conversations in the sidebar (Today, Yesterday, Previous 7 Days, Older). A 60-year-old SMB owner won't understand context windows, compaction, or why they need to start new chats.

**Solution:** One continuous chat thread. Always.

**Changes to `DashboardShell.tsx`:**
- **Remove** the conversation list from the sidebar (no more grouped conversations)
- **Remove** the "New Chat" button
- **Remove** the delete conversation buttons
- Each customer gets ONE conversation that persists forever
- When context window fills up, auto-compaction happens silently in the background
- Compacted messages stay visible in the UI (loaded from DB), even if the LLM context was trimmed
- User sees: an infinite scrolling chat history, oldest at top, newest at bottom

**How it works technically:**
- On first visit: auto-create a single conversation for this customer (if none exists)
- All messages always go to this one conversation
- `GET /api/conversations/{id}/messages?limit=100&offset=0` — paginated loading for scroll-back
- Auto-compaction on the VM side (OpenClaw handles this) — but the raw messages are NEVER deleted from the DB
- Frontend loads last 100 messages on page load, lazy-loads older ones on scroll-up

**Sidebar after this change:**
- Top: KingMouse avatar + name + pro badge + status indicator
- Middle: (empty — no conversation list needed)
- Bottom: Nav items (AI Receptionist, Tasks, Connections, Billing, Settings)

### 2.5F: King Mouse Chat — LLM-Standard Layout

**Problem:** The chat area doesn't match the standard LLM chat layout that users are familiar with from ChatGPT, Claude, etc.

**Modify:** `src/app/dashboard/page.tsx`

**Layout spec:**
- Chat container: max-width `768px`, centered horizontally (like ChatGPT/Claude)
- **Empty state:** Input box centered vertically in the middle of the screen with placeholder "Message King Mouse..."
- **With messages:** Messages flow top-to-bottom, input box fixed at the bottom
- Input box: full-width within the container, rounded, with send button on the right
- Messages: left-aligned for King Mouse, right-aligned for user
- Auto-scroll to bottom on new messages
- Large text (consistent with 2.5A font size increase)

---

## Sprint 3: Dashboard Operational Features

### 3A: Customer Support System

**What customers need:** When things break, they need a way to get help.

**Implementation (minimal viable):**
- Add "Help & Support" to sidebar nav (bottom, above Settings)
- Route: `/dashboard/help`
- Page content:
  - "Contact Support" button → opens `mailto:support@automio.com` with pre-filled subject line including customer_id
  - FAQ section with common questions
  - "Restart King Mouse" button (calls `POST /api/vm/restart?customer_id={id}`)
- **Phase 2 (later):** Add Crisp or Intercom widget for live chat

### 3B: System Health / VM Status

**Location:** Dashboard header bar or in Settings page

**Design:**
- Small status indicator next to KingMouse name in sidebar: 🟢 Running / 🟡 Starting / 🔴 Offline
- Already partially exists: `KingMouseAvatar` has status prop, `fetchStatus` polls every 10s
- **Add:** "Restart King Mouse" button on the Settings page (or Help page)
- **Add:** Simple status card on Settings showing: VM status, uptime, last active

**API:** `GET /api/vm/status?customer_id={id}` (existing) — ensure it returns meaningful status
**API:** `POST /api/vm/restart?customer_id={id}` (new) — restarts the OpenClaw gateway on the VM

### 3C: Billing Transparency (Enhance Existing)

**Existing:** `src/app/dashboard/billing/page.tsx` — already shows plan, hours used/remaining, overage

**Enhance:**
- Add **invoice history** section: list of past invoices with date, amount, status (paid/pending), download PDF link
- Add **usage graph**: simple bar chart showing daily hours over the billing period
- Add **overage warning**: yellow banner when >80% of hours used, red when exceeded
- All text large and clear per 2.5A

**API:** `GET /api/billing/invoices?customer_id={id}` (new) — returns Stripe invoice list
**API:** `GET /api/billing/usage-daily?customer_id={id}` (new) — returns daily breakdown

### 3D: Notifications System

**How King Mouse reaches customers outside the dashboard:**

**Email notifications** (priority 1):
- Urgent tasks needing approval → immediate email
- Daily summary email (what King Mouse did today)
- Weekly report email (hours used, tasks completed, money saved)

**SMS notifications** (priority 2):
- Only for truly urgent items (e.g., payment failed, critical system error)
- Requires Twilio connection from Connections page

**In-dashboard notifications:**
- Bell icon in dashboard header with unread count badge
- Dropdown showing recent notifications
- Each notification: icon, title, description, timestamp, read/unread state

**Settings:**
- Notification preferences on Settings page: toggle email/SMS for each category
- Frequency options for summaries: daily, weekly, none

**DB:**
```sql
CREATE TABLE customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  type TEXT NOT NULL,           -- 'task_approval', 'daily_summary', 'system_alert', etc.
  title TEXT NOT NULL,
  body TEXT,
  channel TEXT DEFAULT 'in_app', -- 'in_app', 'email', 'sms'
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3E: Data Export / Portability

**Location:** Settings page → "Your Data" section

**Options:**
- "Export Conversations" → downloads all chat history as JSON or CSV
- "Export Documents" → downloads any files/documents King Mouse created
- "Export Settings" → downloads configuration as JSON
- "Delete My Account" → confirmation modal → deletes account + schedules VM termination

**API:** `GET /api/export/conversations?customer_id={id}&format=csv` (new)
**API:** `GET /api/export/documents?customer_id={id}` (new)
**API:** `DELETE /api/customers/{id}` (new, with confirmation token)

### 3F: Multi-User Access (Future — Design Now, Build Later)

**Concept:** Business owner invites team members with role-based access.

**Roles:**
- **Owner** — full access, billing, can add/remove users
- **Manager** — can chat with King Mouse, view tasks, manage connections
- **Viewer** — read-only access to dashboard and chat history

**For now:** Just add a placeholder "Team" section in Settings with "Coming Soon — Invite team members to access your dashboard." This sets the stage without building the full RBAC system.

---

## Updated Implementation Priority

### Sprint 1: Landing + Demo Chat ✅ COMPLETE
1. ✅ `pro_templates` + `demo_sessions` tables
2. ✅ 5 seeded templates
3. ✅ `GET /api/pro-profiles`
4. ✅ Upgrade `POST /api/demo/chat`
5. ✅ `IndustrySelector` + `NicheGrid`
6. ✅ `/chat/[industry]/[niche]` + `NicheDemoChat`

### Sprint 2: Signup + Provisioning (Days 4-6)
7. `SignupModal` component (slides over chat)
8. `POST /api/auth/signup` with transcript + customer creation
9. `ProvisioningScreen` with stepped progress bar
10. Wire provisioning to use pro template SOUL.md + transcript
11. Provisioning polling + redirect to dashboard

### Sprint 2.5: Dashboard UX Overhaul (Days 6-8)
12. Global font size increase (2x) across all dashboard pages
13. Sidebar: rename Activity Log → Tasks, add Connections nav item
14. Single continuous chat (remove multi-conversation, remove New Chat button)
15. King Mouse chat → LLM-standard centered layout (768px max-width, centered input)
16. Tasks page with Working/Scheduled/Completed toggles
17. Connections page with grouped integration cards (green/red status)

### Sprint 3: Operational Features (Days 9-12)
18. Help & Support page with "Restart King Mouse" + FAQ
19. VM status indicator in sidebar + restart button
20. Billing enhancements (invoice history, usage graph, overage warnings)
21. Notification bell + in-app notifications
22. Email notification system (urgent + daily summary)
23. Data export (conversations, documents, settings)

### Sprint 4: Wizard + Paywall (Days 13-15)
24. `OnboardingWizard` (4-step overlay)
25. `DashboardTour` tooltip highlights
26. `PaywallModal` + `FeatureLock` wrapper
27. Lock all features post-onboarding without active plan

### Sprint 5: Polish + Launch (Days 16-18)
28. Mobile optimization (all screens)
29. Demo session analytics (conversion tracking)
30. Error handling + retry logic across all flows
31. E2E test: landing → chat → signup → provision → wizard → paywall → pay → chat works

---

> **This is V5. Every PR references this doc. If the flow changes, update here first.**
