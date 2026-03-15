# CLAUDE.md — Mouse Platform

## Repo Structure

This repo has THREE separate Next.js apps that share one Supabase backend.
Each build has its own territory. **Do NOT touch files outside your build.**

| # | Build | Directory | Domain | Orgo Workspace |
|---|-------|-----------|--------|----------------|
| 1 | **Customer Portal** | root `src/` | mouse.is | `ORGO_WORKSPACE_ID` |
| 2 | **Reseller Portal** | `mouse-platform/frontend/src/` | TBD | `ORGO_RESELLER_WORKSPACE_ID` |
| 3 | **Employee Portal** | `mouse-platform/employee/src/` | TBD | `ORGO_EMPLOYEE_WORKSPACE_ID` |

### Shared Infrastructure (read-only for builds 2 & 3)
- `src/lib/` — Supabase clients, Orgo client, types, config loader
- `.env.local` — All env vars (Supabase, Orgo, Stripe, API keys)
- `public/install.sh` — VM install script for King Mouse fork

If you need something from `src/lib/`, import it. Do NOT duplicate or rewrite it.
If `src/lib/` is missing something you need, request the change — don't fork it.

---

## Build 1: Customer Portal (root `src/`)

**Owner:** Customer portal Claude instance
**What it is:** The customer-facing product at mouse.is — signup, onboarding, King Mouse chat, VM provisioning, billing, dashboard.

### Off-limits files — DO NOT TOUCH

#### Pages
- `src/app/(portal)/` — All portal pages (king-mouse, dashboard, billing, tasks, etc.)
- `src/app/(auth)/` — Auth pages (signup, provisioning, login, questionnaire)
- `src/app/layout.tsx` — Root layout
- `src/app/(portal)/layout.tsx` — Portal layout (sidebar + topbar)

#### API Routes
- `src/app/api/vm/chat/route.ts` — Chat route (VM proxy, **NO API FALLBACK**)
- `src/app/api/vm/provision/route.ts` — VM provisioning via Orgo
- `src/app/api/vm/status/route.ts` — VM status polling + install trigger
- `src/app/api/vm/voice-to-text/` — Whisper STT proxy
- `src/app/api/billing/` — Stripe billing routes
- `src/app/api/auth/` — Auth callback
- `src/app/api/connections/` — Third-party connections
- `src/app/api/research/` — Business intel crawl
- `src/app/api/receptionist/` — AI receptionist
- `src/app/api/cron/` — Health check and meta-agent crons
- `src/app/api/trial-chat/` — Landing page trial chat

#### Components
- `src/components/portal/` — OnboardingWizard, OnboardingWrapper, TopBar
- `src/components/` — Any other customer portal components

#### Config & Middleware
- `src/middleware.ts` — Auth middleware
- `public/install.sh` — VM install script
- `next.config.js` — Root Next.js config
- `vercel.json` — Root Vercel config
- `package.json` — Root dependencies

---

## Build 2: Reseller Portal (`mouse-platform/frontend/src/`)

**Owner:** Reseller portal Claude instance
**What it is:** White-label reseller dashboard — resellers sell Mouse AI employees to their own customers.

### Territory — ONLY work in these directories

#### Pages
- `mouse-platform/frontend/src/app/reseller/` — All reseller dashboard pages
- `mouse-platform/frontend/src/app/reseller-signup/` — Reseller signup flow
- `mouse-platform/frontend/src/app/reseller-welcome/` — Reseller welcome
- `mouse-platform/frontend/src/app/for-resellers/` — Reseller landing page
- `mouse-platform/frontend/src/app/admin/` — Admin panel (reseller management)
- `mouse-platform/frontend/src/app/dashboard/` — Customer dashboard (reseller's customers)
- `mouse-platform/frontend/src/app/marketplace/` — Template marketplace
- `mouse-platform/frontend/src/app/onboarding/` — Reseller onboarding flow
- `mouse-platform/frontend/src/app/join/` — Invite link join page

#### API Routes
- `mouse-platform/frontend/src/app/api/reseller/` — All reseller API routes
- `mouse-platform/frontend/src/app/api/admin/` — Admin API routes
- `mouse-platform/frontend/src/app/api/stripe/` — Reseller Stripe routes
- `mouse-platform/frontend/src/app/api/onboarding/` — Onboarding API
- `mouse-platform/frontend/src/app/api/templates/` — Template API
- `mouse-platform/frontend/src/app/api/demo/` — Demo chat
- `mouse-platform/frontend/src/app/api/vm/` — Reseller VM routes (configure, retry-provision, etc.)

#### Components
- `mouse-platform/frontend/src/components/reseller/` — ResellerShell, FunnelBuilder, VoiceAgentBuilder
- `mouse-platform/frontend/src/components/` — Any other reseller components

#### Types & Config
- `mouse-platform/frontend/src/types/` — Reseller type definitions
- `mouse-platform/frontend/next.config.js` — Reseller Next.js config
- `mouse-platform/frontend/package.json` — Reseller dependencies

### DO NOT TOUCH from this build
- Anything in root `src/` (customer portal)
- Anything in `mouse-platform/employee/` (employee portal)
- Root `package.json`, `vercel.json`, `next.config.js`

---

## Build 3: Employee Portal (`mouse-platform/employee/src/`)

**Owner:** Employee portal Claude instance
**What it is:** Internal employee dashboard — Mouse team members manage customer VMs, monitor health, handle support escalations, view analytics.

### Territory — ONLY work in these directories

#### New directory (create if it doesn't exist)
- `mouse-platform/employee/src/app/` — Employee portal pages
- `mouse-platform/employee/src/app/api/` — Employee API routes
- `mouse-platform/employee/src/components/` — Employee components
- `mouse-platform/employee/src/types/` — Employee type definitions
- `mouse-platform/employee/package.json` — Employee dependencies
- `mouse-platform/employee/next.config.js` — Employee Next.js config

### Suggested features (not yet built)
- Customer VM health dashboard (uses `ORGO_EMPLOYEE_WORKSPACE_ID`)
- Support ticket queue (when customers call 910-515-8927, tickets land here)
- VM restart/reinstall controls
- Customer account management
- Usage analytics and billing oversight
- King Mouse performance monitoring

### DO NOT TOUCH from this build
- Anything in root `src/` (customer portal)
- Anything in `mouse-platform/frontend/` (reseller portal)
- Root `package.json`, `vercel.json`, `next.config.js`

---

## CRITICAL BUSINESS RULES (all builds must follow)

1. **NO API FALLBACK in chat.** If King Mouse VM isn't running, the user gets a message to call (910) 515-8927 for human support. We do NOT fall back to Kimi, Anthropic, OpenAI, or any other LLM API. The King Mouse fork on the VM IS the product. This applies to ALL builds.

2. **VM provisioning** uses Orgo.ai at `https://www.orgo.ai/api/computers`. The install script (`public/install.sh`) installs the King Mouse fork from `github.com/coltonharris-wq/mouse`. The status endpoint triggers install via exec API after VM boots.

3. **Brand colors:** Navy (#1e2a3a) sidebar, Orange (#F07020) CTAs, Cream (#FAF8F4) backgrounds, Green (#1D9E75) status only, Teal (#5DCAA5) active sidebar.

4. **Auth:** Supabase SSR with `@supabase/ssr`. Cookie-based sessions for pages, Bearer tokens for API routes.

5. **Orgo Workspace IDs:**
   - `ORGO_WORKSPACE_ID` — Customer VMs (Build 1 only)
   - `ORGO_RESELLER_WORKSPACE_ID` — Reseller-provisioned VMs (Build 2 only)
   - `ORGO_EMPLOYEE_WORKSPACE_ID` — Internal/employee VMs (Build 3 only)

6. **Shared Supabase.** All three builds use the same Supabase project. Table schemas must be coordinated. If you need a new table or column, document it clearly in your commit message so the other builds can adapt.

7. **No file conflicts.** Each build stays in its own directory. If two builds need the same utility, it goes in `src/lib/` and the customer portal owner makes that change.
