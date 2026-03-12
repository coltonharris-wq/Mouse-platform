# FEATURE_SPEC_V4 — Domain Strategy, Reseller Attribution Lock & Infrastructure Setup

> **Purpose:** This spec implements the dual-domain strategy (mouse.is for customers, mice.ink for resellers), permanent reseller attribution for customer signups, and completes the remaining infrastructure items (Vercel env vars, Stripe branding, git init). Execute top-to-bottom, phase by phase. Every task has acceptance criteria.

> **Repo:** `/Users/jewelsharris/Desktop/Mouse-platform/mouse-platform`  
> **Frontend:** `/Users/jewelsharris/Desktop/Mouse-platform/mouse-platform/frontend`  
> **Stack:** Next.js 15 · React 19 · TypeScript · Supabase · Stripe · Orgo VM · Vercel  
> **Live URL:** https://mouse-platform.vercel.app  
> **Supabase Project:** `dgfnpllysgmszmfifnnk`

---

## CRITICAL CONTEXT

### The Problem
Resellers bring in customers. If those customers can sign up through `mouse.is` directly, they can cancel with the reseller and go direct — cutting out the reseller. This destroys reseller trust and kills our channel strategy. Resellers who bring in a customer **must keep that customer forever**.

### The Solution — Two Domains, One Codebase
| Domain | Purpose | Who Uses It |
|--------|---------|-------------|
| `mouse.is` | Customer portal — landing page, onboarding, customer dashboard | Direct customers (from ads/internal sales) AND reseller-attributed customers |
| `mice.ink` | Reseller portal — reseller dashboard, business management, analytics, KingMouse chat | Resellers only |

### How Reseller Attribution Works
1. Reseller signs up at `mice.ink` → gets a **brand slug** (e.g., `acme-ai`)
2. Reseller shares their branded link: `mouse.is/acme-ai`
3. Customer clicks `mouse.is/acme-ai` → sees the same onboarding flow, but with reseller branding and **permanent attribution**
4. Customer record is locked to that reseller forever. The `reseller_id` column is immutable after creation.
5. Direct customers (no slug) go to `mouse.is` root → no reseller attribution → internal sale.

### What Already Exists (Don't Rebuild)
- Reseller dashboard at `/reseller/*` (7 pages + chat) — **working**
- Customer dashboard at `/dashboard/*` — **working**
- Landing page at `/` with ProGrid, DemoChat, pricing — **working**
- Onboarding flow at `/onboarding` — **working**
- Invite link system at `/join/[code]` → redirects to `/onboarding?ref=code` — **working**
- Stripe subscription checkout — **working**
- VM provisioning on payment — **working**
- 30 Pro profiles in database — **working**
- Stripe Connect for resellers — **working**

### What This Spec Adds
1. **Brand slug system** — resellers get `mouse.is/{slug}` instead of just invite codes
2. **Branded landing pages** — `mouse.is/acme-ai` shows a co-branded version of the landing page
3. **Attribution lock** — `reseller_id` on customer record is permanent and immutable
4. **Vercel multi-domain setup** — both `mouse.is` and `mice.ink` serve the same deployment
5. **Domain-based routing middleware** — `mice.ink` → reseller portal, `mouse.is` → customer portal
6. **Vercel env vars** via CLI
7. **Git initialization** with proper `.gitignore`

---

## PHASE 1: DATABASE MIGRATIONS (2 tasks)

### Task 1.1 — Add Brand Slug to Resellers Table

The `resellers` table needs a unique brand slug that becomes the URL path.

```sql
-- Add brand_slug column to resellers
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS brand_slug TEXT UNIQUE;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS brand_display_name TEXT;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#0F6B6E';
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS brand_tagline TEXT;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_resellers_brand_slug ON resellers(brand_slug) WHERE brand_slug IS NOT NULL;
```

**Acceptance:**
- `SELECT column_name FROM information_schema.columns WHERE table_name = 'resellers' AND column_name = 'brand_slug'` returns a row
- `brand_slug` has a UNIQUE constraint
- Index exists on `brand_slug`

### Task 1.2 — Add Reseller Attribution to Customers Table

The `customers` table needs a permanent, immutable reseller link.

```sql
-- Add reseller attribution columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES resellers(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS reseller_brand_slug TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS attribution_source TEXT DEFAULT 'direct';
-- attribution_source: 'direct' | 'reseller_link' | 'reseller_invite' | 'admin_assigned'
ALTER TABLE customers ADD COLUMN IF NOT EXISTS attributed_at TIMESTAMPTZ;

-- Create index for reseller lookups
CREATE INDEX IF NOT EXISTS idx_customers_reseller_id ON customers(reseller_id) WHERE reseller_id IS NOT NULL;

-- RLS policy: resellers can only see their own customers
-- (Add this if RLS is enabled on the customers table)
```

**Important:** Do NOT create an UPDATE trigger to make `reseller_id` immutable in the database — we'll enforce immutability at the application layer (API routes). The reason: we may need admin overrides for edge cases (disputes, reseller account closures). Instead, we log every attribution change.

```sql
-- Attribution audit log
CREATE TABLE IF NOT EXISTS attribution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  old_reseller_id UUID,
  new_reseller_id UUID,
  changed_by TEXT NOT NULL, -- 'system' | 'admin' | admin user id
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Acceptance:**
- `customers.reseller_id` column exists and is a FK to `resellers.id`
- `customers.attribution_source` column exists with default `'direct'`
- `attribution_log` table exists
- Index on `customers.reseller_id` exists

---

## PHASE 2: BRAND SLUG API (3 tasks)

### Task 2.1 — Brand Slug Validation & Registration API

Create `/api/reseller/brand` endpoint.

**File:** `frontend/src/app/api/reseller/brand/route.ts`

```typescript
// GET /api/reseller/brand?slug=acme-ai — Check if slug is available
// POST /api/reseller/brand — Register/update brand slug
// Body: { reseller_id, slug, display_name?, logo_url?, color?, tagline? }

// Slug rules:
// - 3-30 characters
// - Lowercase alphanumeric + hyphens only
// - Cannot start/end with hyphen
// - Cannot be a reserved word (see RESERVED_SLUGS below)
// - Must be unique

const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'dashboard', 'demo', 'help', 'join',
  'login', 'logout', 'marketplace', 'mouse', 'mice', 'onboarding',
  'pricing', 'register', 'reseller', 'settings', 'signup', 'support',
  'terms', 'privacy', 'billing', 'status', 'health', 'docs',
  'king-mouse', 'kingmouse', 'receptionist', 'voice', 'lead-finder',
  'task-log', 'businesses', 'analytics', 'invite', 'ref',
];
```

**GET response:**
```json
{ "available": true, "slug": "acme-ai" }
// or
{ "available": false, "slug": "acme-ai", "reason": "Already taken" }
```

**POST response:**
```json
{
  "success": true,
  "brand": {
    "slug": "acme-ai",
    "display_name": "ACME AI Solutions",
    "url": "https://mouse.is/acme-ai",
    "color": "#0F6B6E"
  }
}
```

**Acceptance:**
- `GET /api/reseller/brand?slug=admin` returns `{ available: false }`
- `GET /api/reseller/brand?slug=my-cool-brand` returns `{ available: true }` (if not taken)
- `POST` with valid data creates/updates the reseller's brand slug
- Invalid slugs (too short, special chars, reserved) return 400 with clear error

### Task 2.2 — Brand Slug Lookup API

Create `/api/brand/[slug]` endpoint for the public-facing branded landing page.

**File:** `frontend/src/app/api/brand/[slug]/route.ts`

```typescript
// GET /api/brand/acme-ai — Returns public brand info for landing page rendering
// This is a PUBLIC endpoint (no auth required)

// Response:
{
  "found": true,
  "brand": {
    "slug": "acme-ai",
    "display_name": "ACME AI Solutions",
    "logo_url": null,
    "color": "#0F6B6E",
    "tagline": "AI-powered operations for your business"
  }
}
// or
{ "found": false }
```

**Acceptance:**
- Returns brand info for valid slugs
- Returns `{ found: false }` for unknown slugs (not 404 — we handle gracefully in UI)
- Does NOT expose `reseller_id` or any private data

### Task 2.3 — Reseller Settings Page Update

Update the existing reseller settings page at `frontend/src/app/reseller/settings/page.tsx` to include brand management.

Add a **"Your Brand"** section at the top of settings:
- Brand slug input with real-time availability check (debounced 500ms)
- Display name input
- Brand color picker (default: #0F6B6E)
- Tagline input (optional, max 100 chars)
- Logo upload (optional — just the URL input for now, file upload later)
- Preview card showing how `mouse.is/{slug}` will look
- **"Your Link"** display: `mouse.is/{slug}` with copy button
- Save button

**Acceptance:**
- Reseller can set their brand slug from settings
- Slug availability shows green check / red X in real-time
- Copy button copies `mouse.is/{slug}` to clipboard
- Settings save successfully to database

---

## PHASE 3: BRANDED LANDING PAGES (3 tasks)

### Task 3.1 — Dynamic Branded Route

Create a catch-all route at `frontend/src/app/[slug]/page.tsx` that serves branded landing pages.

**Logic:**
1. Receive `slug` param from URL
2. Call `/api/brand/{slug}` to check if it's a valid reseller brand
3. If valid → render branded landing page (Task 3.2)
4. If invalid → `notFound()` (Next.js 404)

**Important:** This route must NOT conflict with existing routes. Next.js resolves static routes (`/dashboard`, `/reseller`, `/onboarding`, etc.) before dynamic `[slug]`. Verify this works by testing both `/acme-ai` (should show brand page) and `/dashboard` (should show dashboard).

**File:** `frontend/src/app/[slug]/page.tsx`

```typescript
import { notFound } from 'next/navigation';
import BrandedLanding from '@/components/branded/BrandedLanding';

// Server component — fetches brand data at request time
export default async function BrandedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Skip if it looks like a known route (safety net)
  const KNOWN_ROUTES = ['dashboard', 'reseller', 'onboarding', 'admin', 'marketplace', 'pricing', 'join', 'api'];
  if (KNOWN_ROUTES.includes(slug)) {
    notFound();
  }
  
  // Fetch brand info
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mouse-platform.vercel.app';
  const res = await fetch(`${baseUrl}/api/brand/${slug}`, { cache: 'no-store' });
  const data = await res.json();
  
  if (!data.found) {
    notFound();
  }
  
  return <BrandedLanding brand={data.brand} slug={slug} />;
}
```

**Acceptance:**
- `mouse.is/acme-ai` renders the branded landing page
- `mouse.is/dashboard` still renders the dashboard (not the brand page)
- `mouse.is/nonexistent-slug` returns 404
- No existing routes break

### Task 3.2 — BrandedLanding Component

Create `frontend/src/components/branded/BrandedLanding.tsx` — a co-branded version of the main landing page.

**Differences from the main landing page (`/`):**
1. **Header:** Shows reseller's brand name + "Powered by KingMouse" subtext
2. **Brand color:** Uses reseller's `color` instead of default teal where appropriate (CTA buttons, accents)
3. **Logo:** If reseller has a logo, show it next to KingMouse logo
4. **Tagline:** If reseller has a tagline, show it under the hero headline
5. **CTA buttons:** "Get Started" links to `/onboarding?ref={slug}` (attribution!)
6. **Pricing section:** Same pricing, but adds "through {brand_display_name}" text
7. **Footer:** "Powered by KingMouse" + reseller brand name

**What stays the same:**
- ProGrid marketplace section
- DemoChat section
- How It Works section
- FAQ section
- Pricing numbers (resellers don't set custom pricing on the landing page — that's in their invite link system)

```typescript
interface BrandedLandingProps {
  brand: {
    slug: string;
    display_name: string;
    logo_url: string | null;
    color: string;
    tagline: string | null;
  };
  slug: string;
}
```

**Acceptance:**
- Branded landing page renders with reseller's name and color
- All CTAs include `?ref={slug}` parameter
- Page looks professional, not like a cheap white-label
- "Powered by KingMouse" is always visible (we want brand awareness too)

### Task 3.3 — Attribution on Onboarding

Update the onboarding flow to capture and persist reseller attribution.

**File to modify:** `frontend/src/app/onboarding/page.tsx`

**Changes:**
1. Read `ref` query parameter on page load
2. If `ref` exists, look up the reseller by brand slug: `GET /api/brand/{ref}`
3. If valid reseller, store in onboarding state:
   - `reseller_brand_slug` = the slug
   - `attribution_source` = `'reseller_link'`
4. Show subtle co-branding during onboarding: "{Brand Name} × KingMouse" in the header
5. Pass `reseller_brand_slug` and `attribution_source` through to the onboarding save API

**File to modify:** `frontend/src/app/api/onboarding/save/route.ts`

**Changes:**
1. Accept `reseller_brand_slug` and `attribution_source` in the request body
2. If `reseller_brand_slug` is provided, look up `reseller_id` from `resellers` table
3. Save both to the `onboarding_sessions` table

**File to modify:** `frontend/src/app/api/onboarding/complete/route.ts`

**Changes:**
1. When creating the customer record, copy `reseller_id`, `reseller_brand_slug`, and `attribution_source` from the onboarding session
2. Set `attributed_at` to `NOW()`
3. After customer creation, insert a row into `attribution_log`

**File to modify:** `frontend/src/app/api/stripe/create-subscription/route.ts`

**Changes:**
1. Accept `reseller_brand_slug` in the request body
2. Pass it through as Stripe checkout session metadata: `metadata.reseller_brand_slug`
3. This ensures the webhook can also pick up attribution if the backup `/onboarding/complete` path is used

**Acceptance:**
- `mouse.is/acme-ai` → "Get Started" → onboarding shows co-branding
- Customer created via this flow has `reseller_id` set correctly
- `attribution_log` has a row for the new customer
- Direct signup (no `ref`) has `reseller_id = NULL` and `attribution_source = 'direct'`

---

## PHASE 4: DOMAIN ROUTING MIDDLEWARE (2 tasks)

### Task 4.1 — Next.js Middleware for Domain-Based Routing

Create `frontend/src/middleware.ts` that routes based on the incoming hostname.

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Normalize: strip port for local dev
  const host = hostname.split(':')[0];
  
  // mice.ink → Reseller portal
  // Only redirect if they're NOT already on a /reseller/* or /api/* path
  if (host === 'mice.ink' || host === 'www.mice.ink') {
    // Allow API routes to pass through (reseller APIs need to work)
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    // Allow /reseller/* paths to pass through
    if (pathname.startsWith('/reseller')) {
      return NextResponse.next();
    }
    
    // Root of mice.ink → reseller portal
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/reseller', request.url));
    }
    
    // Any other path on mice.ink → rewrite to /reseller/{path}
    // e.g., mice.ink/dashboard → /reseller/dashboard
    // e.g., mice.ink/businesses → /reseller/businesses
    const resellerPath = `/reseller${pathname}`;
    return NextResponse.rewrite(new URL(resellerPath, request.url));
  }
  
  // mouse.is → Customer portal (default behavior, no rewrite needed)
  // The [slug] route handles branded pages automatically
  
  return NextResponse.next();
}

export const config = {
  // Run middleware on all paths except static files and images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
```

**Key behavior:**
| URL | What Happens |
|-----|-------------|
| `mice.ink` | Rewrites to `/reseller` → reseller chat/dashboard |
| `mice.ink/dashboard` | Rewrites to `/reseller/dashboard` → reseller analytics |
| `mice.ink/businesses` | Rewrites to `/reseller/businesses` → business management |
| `mice.ink/marketplace` | Rewrites to `/reseller/marketplace` → pro marketplace |
| `mice.ink/api/reseller/*` | Passes through (API routes work normally) |
| `mouse.is` | Normal landing page (no rewrite) |
| `mouse.is/acme-ai` | Hits `[slug]` route → branded landing page |
| `mouse.is/onboarding?ref=acme-ai` | Normal onboarding with attribution |
| `mouse.is/dashboard` | Normal customer dashboard |

**Acceptance:**
- Middleware file exists and exports correctly
- No existing routes break
- API routes work on both domains

### Task 4.2 — Update NEXT_PUBLIC_SITE_URL References

Search the codebase for hardcoded URLs and `NEXT_PUBLIC_SITE_URL` references. Update them to be domain-aware.

**Find all references:**
```bash
grep -r "mouse-platform-demo.vercel.app\|mouse-platform.vercel.app\|NEXT_PUBLIC_SITE_URL" frontend/src/ --include="*.ts" --include="*.tsx"
```

**Rules:**
1. Customer-facing URLs (onboarding success, Stripe redirect) → use `mouse.is` as the base
2. Reseller-facing URLs (Stripe Connect return, reseller invite links) → use `mice.ink` as the base
3. API URLs → use relative paths where possible (they work on both domains)
4. For invite links generated by resellers, the URL should be `mouse.is/{brand_slug}` (NOT `mouse-platform.vercel.app/join/code`)

**Create a helper:**
```typescript
// frontend/src/lib/urls.ts
export function getCustomerUrl(path: string = ''): string {
  if (process.env.NEXT_PUBLIC_CUSTOMER_DOMAIN) {
    return `https://${process.env.NEXT_PUBLIC_CUSTOMER_DOMAIN}${path}`;
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mouse-platform.vercel.app'}${path}`;
}

export function getResellerUrl(path: string = ''): string {
  if (process.env.NEXT_PUBLIC_RESELLER_DOMAIN) {
    return `https://${process.env.NEXT_PUBLIC_RESELLER_DOMAIN}${path}`;
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mouse-platform.vercel.app'}/reseller${path}`;
}

export function getBrandedUrl(slug: string): string {
  return getCustomerUrl(`/${slug}`);
}
```

**Acceptance:**
- No hardcoded `mouse-platform-demo.vercel.app` remains in source code
- `getCustomerUrl()`, `getResellerUrl()`, `getBrandedUrl()` are used throughout
- Invite link generation creates `mouse.is/{slug}` URLs (not `/join/code` URLs)
- Stripe redirect URLs use the correct domain

---

## PHASE 5: RESELLER ATTRIBUTION PROTECTION (2 tasks)

### Task 5.1 — API-Level Attribution Lock

Update the customer update API to prevent reseller_id changes.

**File to modify/create:** `frontend/src/app/api/admin/customers/route.ts` (the PATCH handler)

**Rule:** If a PATCH request includes `reseller_id` and the customer already has a `reseller_id` set, reject the change UNLESS the request includes `admin_override: true` and a `reason` field.

```typescript
// In the PATCH handler:
if (body.reseller_id !== undefined && existing.reseller_id !== null && body.reseller_id !== existing.reseller_id) {
  if (!body.admin_override || !body.reason) {
    return NextResponse.json(
      { error: 'Cannot change reseller attribution. Use admin_override with reason.' },
      { status: 403 }
    );
  }
  
  // Log the override
  await supabaseQuery('attribution_log', 'POST', {
    customer_id: existing.id,
    old_reseller_id: existing.reseller_id,
    new_reseller_id: body.reseller_id,
    changed_by: 'admin', // TODO: use actual admin user id when auth is implemented
    reason: body.reason,
  });
}
```

**Acceptance:**
- PATCH `/api/admin/customers` with `reseller_id` change on an attributed customer → 403
- Same request with `admin_override: true` and `reason` → succeeds + logs to `attribution_log`
- PATCH on a customer with no reseller → works normally (first attribution)

### Task 5.2 — Stripe Webhook Attribution

Update the Stripe webhook handler to capture reseller attribution from checkout metadata.

**File to modify:** `frontend/src/app/api/stripe/webhook/route.ts`

**Changes to the `checkout.session.completed` handler:**
1. Read `metadata.reseller_brand_slug` from the session
2. If present, look up the reseller by brand slug
3. Set `reseller_id`, `reseller_brand_slug`, `attribution_source = 'reseller_link'`, and `attributed_at` on the customer record
4. Insert into `attribution_log`

**Acceptance:**
- Customer created via webhook from a reseller-attributed checkout has correct `reseller_id`
- `attribution_log` has a corresponding entry
- Direct checkouts (no reseller metadata) create customers with `attribution_source = 'direct'`

---

## PHASE 6: RESELLER MARKUP PRICING (2 tasks)

### How Resellers Make Money
Resellers do NOT earn commissions. There is no percentage split. Instead:

- **Our base rate:** $4.98/hr (what we charge the reseller)
- **Reseller markup range:** $4.98/hr to $8.98/hr (what the reseller charges their customer)
- **Reseller keeps the difference.** If they charge $7.00/hr, they keep $2.02/hr per work hour.

This is cleaner than commission tracking. The reseller sets their own price, collects payment from their customer via their own Stripe Connect account, and we bill the reseller at our base rate. No commission calculations, no payout delays.

### Task 6.1 — Reseller Markup Configuration

Add markup pricing columns to the resellers table and update the business management flow.

```sql
-- Add markup pricing to resellers
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS default_markup_cents INTEGER DEFAULT 498;
-- default_markup_cents = what they charge per hour in cents (default: $4.98 = no markup)
-- Min: 498 ($4.98), Max: 898 ($8.98)

-- Per-customer markup override (on the reseller_businesses table)
ALTER TABLE reseller_businesses ADD COLUMN IF NOT EXISTS custom_hourly_rate_cents INTEGER;
-- If NULL, use reseller's default_markup_cents
-- Min: 498, Max: 898
```

**Update reseller settings page** (`frontend/src/app/reseller/settings/page.tsx`):
- Add "Default Hourly Rate" slider/input: $4.98 to $8.98
- Show projected profit per hour: `(rate - $4.98) × hours`
- Example: "At $6.98/hr, you earn $2.00/hr per customer work hour"

**Update business add flow** (`frontend/src/app/reseller/businesses/page.tsx`):
- The existing "Custom price override" field should be renamed to "Hourly Rate for This Customer"
- Default: reseller's default rate
- Range: $4.98 – $8.98
- Show: "Your profit: ${rate - 4.98}/hr"

**Acceptance:**
- Reseller can set default hourly rate between $4.98 and $8.98
- Per-customer rate override works
- UI shows profit calculation clearly
- Rates below $4.98 or above $8.98 are rejected (400 error)

### Task 6.2 — Reseller Revenue Dashboard

Update the reseller analytics to show markup-based revenue instead of commission-based.

**File to modify:** `frontend/src/app/api/reseller/analytics/route.ts`

**Replace any commission logic with markup revenue:**
```json
{
  "revenue": {
    "total_customers": 12,
    "avg_hourly_rate_cents": 698,
    "avg_profit_per_hour_cents": 200,
    "total_customer_hours_this_month": 340,
    "estimated_monthly_profit_cents": 68000,
    "base_rate_cents": 498
  }
}
```

**The math:**
- `profit_per_hour = customer_hourly_rate - 498`
- `monthly_profit = sum(profit_per_hour × hours_used)` for each customer
- Show this clearly on the reseller dashboard

**Acceptance:**
- Analytics shows markup-based revenue (not commission %)
- Revenue cards on dashboard show: Total Customers, Avg Rate, Monthly Profit
- No mention of "commission" anywhere in the codebase

---

## PHASE 7: VERCEL & INFRASTRUCTURE (3 tasks)

### Task 7.1 — Set Vercel Environment Variables

Use the Vercel CLI to set the required environment variables.

```bash
cd /Users/jewelsharris/Desktop/Mouse-platform/mouse-platform/frontend

# Domain config
vercel env add NEXT_PUBLIC_CUSTOMER_DOMAIN production <<< "mouse.is"
vercel env add NEXT_PUBLIC_RESELLER_DOMAIN production <<< "mice.ink"
vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://mouse.is"

# AI — placeholder until real key obtained
vercel env add OPENAI_API_KEY production <<< "sk-placeholder-get-real-key"

# Moonshot (already in .env.local, ensure it's in Vercel)
vercel env add MOONSHOT_API_KEY production <<< "sk-fNNLY6aNRewMuDTKqvoIUPLcPyNJ9VEbDYNRuhgKdDjiT9SP"

# Twilio — placeholders until accounts are set up
vercel env add TWILIO_ACCOUNT_SID production <<< "AC_placeholder_get_real_sid"
vercel env add TWILIO_AUTH_TOKEN production <<< "placeholder_get_real_token"
```

**Also update `.env.local` for local development:**
```
NEXT_PUBLIC_CUSTOMER_DOMAIN=localhost:3000
NEXT_PUBLIC_RESELLER_DOMAIN=localhost:3001
```

**Acceptance:**
- `vercel env ls` shows all new variables
- `.env.local` updated with local dev values
- Build succeeds with new env vars

### Task 7.2 — Add Domains to Vercel Project

```bash
cd /Users/jewelsharris/Desktop/Mouse-platform/mouse-platform/frontend

# Add custom domains
vercel domains add mouse.is
vercel domains add www.mouse.is
vercel domains add mice.ink
vercel domains add www.mice.ink
```

**Note:** This will output DNS configuration instructions. The actual DNS records need to be configured at the domain registrar. Output the DNS records needed so Colton can configure them.

**Acceptance:**
- `vercel domains ls` shows all 4 domains (or pending verification)
- DNS instructions are clearly output for manual configuration

### Task 7.3 — Git Initialization

```bash
cd /Users/jewelsharris/Desktop/Mouse-platform/mouse-platform

# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/

# Build
build/
dist/

# Environment
.env
.env.local
.env.production
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel

# IDE
.idea/
.vscode/
*.swp
*.swo

# Misc
*.tsbuildinfo
next-env.d.ts
EOF

# Initial commit
git add -A
git commit -m "feat: initial commit — KingMouse platform with reseller system, 30 Pro profiles, domain strategy"

# Set up remote (if not exists)
git remote add origin https://github.com/coltonharris-wq/Mouse-platform.git 2>/dev/null || true
git branch -M main
```

**Acceptance:**
- `.git` directory exists in `/Users/jewelsharris/Desktop/Mouse-platform/mouse-platform`
- `.gitignore` properly excludes node_modules, .env files, .next
- At least one commit exists
- Remote points to GitHub repo

---

## PHASE 8: CLEANUP & POLISH (2 tasks)

### Task 8.1 — Update Landing Page Links

The main landing page at `/` (customer-facing on `mouse.is`) should:
1. Remove any "Reseller" links from the navbar
2. Add a tiny footer link: "Become a Reseller" → links to `mice.ink`
3. Ensure all "Get Started" CTAs go to `/onboarding` (no ref = direct customer)

The reseller portal at `/reseller` (on `mice.ink`) should:
1. Update the "New Chat" and nav items to use relative paths (they already do, just verify)
2. Add a "Share Your Link" CTA in the sidebar or dashboard that shows `mouse.is/{slug}`

**Acceptance:**
- Customer landing page has no reseller portal links (except tiny footer)
- Reseller portal has a prominent way to copy/share their branded link

### Task 8.2 — Update Invite Link System

The existing `/join/[code]` system still works, but update the reseller's invite link generation to prefer brand slugs.

**Changes to `frontend/src/app/api/reseller/invite-links/route.ts`:**
1. When generating a new invite link, if the reseller has a `brand_slug`, generate the URL as `mouse.is/{brand_slug}` instead of `mouse-platform.vercel.app/join/{code}`
2. The old `/join/[code]` system continues to work as a fallback (backwards compatible)
3. If the reseller wants custom invite links with specific Pro/plan presets, those still use the `/join/[code]` system with query params

**The hierarchy:**
- `mouse.is/{brand_slug}` — Default reseller link (branded landing page → onboarding)
- `mouse.is/{brand_slug}?pro=appliance-pro&plan=growth` — Branded link with pre-selected Pro/plan
- `/join/{code}` — Legacy invite codes (still work, redirect to onboarding with ref)

**Acceptance:**
- New invite links prefer `mouse.is/{brand_slug}` format
- Old `/join/{code}` links continue to work
- Invite link table in reseller dashboard shows the correct URLs

---

## VERIFICATION CHECKLIST

After all phases complete, verify:

| # | Test | Expected |
|---|------|----------|
| 1 | `mouse.is/` | Landing page with no reseller branding |
| 2 | `mouse.is/acme-ai` (with test brand) | Branded landing page with reseller name/color |
| 3 | `mouse.is/acme-ai` → Get Started | Onboarding with `ref=acme-ai` in URL |
| 4 | Complete onboarding from branded link | Customer has `reseller_id` set |
| 5 | `mice.ink/` | Reseller chat portal |
| 6 | `mice.ink/dashboard` | Reseller analytics |
| 7 | `mice.ink/businesses` | Business management |
| 8 | Reseller settings → set brand slug | Slug saves, link shows correctly |
| 9 | Try to change customer's `reseller_id` via API | 403 without admin override |
| 10 | `attribution_log` has entries | Logged for every attribution event |
| 11 | `vercel env ls` | All env vars present |
| 12 | `git log --oneline` | At least initial commit |
| 13 | Direct signup (no ref) | `attribution_source = 'direct'`, no reseller_id |
| 14 | `/join/{old-code}` | Still works, redirects to onboarding |

---

## NOTES FOR CLAUDE CODE

1. **Don't rebuild what works.** The reseller dashboard, customer dashboard, onboarding, Stripe checkout, VM provisioning — all working. This spec ADDS to them.
2. **The middleware is the key piece.** It makes the dual-domain strategy work without deploying two apps.
3. **Attribution is sacred.** Once a customer is attributed to a reseller, it stays. The audit log is your paper trail.
4. **Test with `vercel dev`** if possible — middleware runs locally with `vercel dev` but not `next dev`.
5. **The `[slug]` route is a catch-all at the root level.** Be very careful it doesn't swallow existing routes. The `KNOWN_ROUTES` safety net is critical.
6. **Env vars:** Use `vercel env add` via CLI, not the dashboard. The CLI is faster and scriptable.
7. **For Stripe Connect:** Resellers collect payment from their customers via their own Stripe Connect account at their marked-up rate. We bill the reseller at our base rate ($4.98/hr). No commission tracking — the reseller keeps the spread.
