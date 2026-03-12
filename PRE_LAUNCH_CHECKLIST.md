# PRE-LAUNCH CHECKLIST — What Makes This a Working Product

> This document defines the minimum viable product (MVP) criteria. Everything here must work before launch. Everything else goes to V2.

---

## THE PROMISE

**For Customers:**
> "Hire an AI employee for $4.98/hr. It handles your operations, scheduling, inventory, and customer communication — and only asks you to approve big decisions."

**For Resellers:**
> "Sell AI employees to businesses. Keep the customers you bring. Mark up from $4.98 to $8.98/hr and keep the spread."

---

## MVP CRITERIA — MUST WORK

### 1. DOMAIN STRATEGY (FEATURE_SPEC_V4)
- [ ] `mouse.is` serves customer portal
- [ ] `mice.ink` serves reseller portal (via middleware rewrite)
- [ ] `mouse.is/{brand-slug}` shows branded landing page
- [ ] Branded links carry attribution through signup
- [ ] Reseller attribution is permanent and locked

### 2. CUSTOMER SIGNUP & ONBOARDING
- [ ] Landing page explains value prop clearly
- [ ] 5-step onboarding wizard (business → needs → pro → details → payment)
- [ ] Stripe subscription checkout works
- [ ] VM provisions automatically after payment
- [ ] Customer lands in dashboard with working KingMouse chat

### 3. KINGMOUSE CORE CAPABILITIES
- [ ] Chat interface in dashboard
- [ ] KingMouse can browse web, search, send email
- [ ] KingMouse can execute code, manage files
- [ ] KingMouse can schedule cron jobs
- [ ] Pro-specific capabilities loaded (Appliance, Roofer, Dentist, etc.)

### 4. RESELLER PORTAL
- [ ] Reseller can sign up at `mice.ink`
- [ ] Reseller can set brand slug, display name, color
- [ ] Reseller can add businesses manually
- [ ] Reseller can generate invite links
- [ ] Reseller can use KingMouse chat for their own operations
- [ ] Reseller sees analytics (customers, revenue, profit)

### 5. ATTRIBUTION & BILLING
- [ ] Customer signed up via `mouse.is/{slug}` is locked to that reseller
- [ ] Reseller can set hourly rate ($4.98–$8.98)
- [ ] Profit calculation shows correctly in dashboard
- [ ] Stripe Connect accounts for resellers

### 6. INFRASTRUCTURE
- [ ] Vercel env vars set (OPENAI_API_KEY placeholder, MOONSHOT_API_KEY, etc.)
- [ ] Domains configured (mouse.is, mice.ink)
- [ ] Git repository initialized with commits
- [ ] Supabase database has all required tables

---

## WHAT'S NOT IN MVP (V2 IDEAS)

These are documented in `/v2-ideas/README.md` but NOT required for launch:

| Feature | Why It's V2 |
|---------|-------------|
| Customer post-onboarding wizard | Nice for 60-year-olds, but they can figure out chat |
| Calendar integration (Google/Outlook) | KingMouse can ask "what's your availability?" for now |
| Email READ integration | KingMouse can ask "forward me that email" for now |
| SMS/WhatsApp for customers | Dashboard chat works; channels are expansion |
| Phone AI Receptionist | Voice page exists but full integration is complex |
| Human escalation system | Email to support@ works for MVP |
| Activity screenshots | Text logs work; screenshots are trust enhancement |
| Multi-user access | Most SMBs are single-owner |
| Data export | Important for trust, not needed day one |
| In-app support widget | Email fallback works |

---

## E2E TEST SCENARIOS

### Scenario 1: Direct Customer (No Reseller)
1. Visit `mouse.is`
2. Click "Get Started"
3. Complete 5-step onboarding
4. Pay with Stripe test card
5. Wait for VM provisioning (2 min)
6. Land in dashboard
7. Ask KingMouse: "What can you do for my business?"
8. KingMouse responds with relevant capabilities

**Pass Criteria:** Customer has working KingMouse within 5 minutes of payment.

### Scenario 2: Reseller-Branded Customer
1. Reseller sets brand slug: `acme-ai`
2. Reseller shares: `mouse.is/acme-ai`
3. Customer visits branded landing page
4. Clicks "Get Started" → onboarding with co-branding
5. Completes signup and payment
6. Customer record shows `reseller_id` = ACME AI's ID
7. Reseller sees new customer in their dashboard

**Pass Criteria:** Attribution is locked; reseller sees customer; customer sees co-branding.

### Scenario 3: Reseller Workflow
1. Visit `mice.ink`
2. Sign up as reseller
3. Set brand slug and pricing
4. Copy branded link
5. Add a business manually
6. Use KingMouse chat to find leads
7. Check analytics dashboard

**Pass Criteria:** Reseller can operate their business using KingMouse.

### Scenario 4: Attribution Protection
1. Try to change customer's `reseller_id` via API
2. Without admin_override → 403 error
3. With admin_override + reason → succeeds + logs to attribution_log

**Pass Criteria:** Attribution is protected; changes are audited.

---

## LAUNCH DECISION

**Launch when:**
- All 6 MVP criteria sections are checked
- All 4 E2E scenarios pass
- No critical bugs (crashes, data loss, security issues)
- Reseller can sign up, brand, and sell
- Customer can sign up, pay, and use KingMouse

**Don't wait for:**
- Calendar integration
- SMS/WhatsApp
- Post-onboarding wizard
- Screenshots
- Multi-user
- Support widget

---

## POST-LAUNCH METRICS TO WATCH

1. **Activation:** % of customers who send 5+ messages to KingMouse in first week
2. **Retention:** % of customers still active at 30 days
3. **Reseller Success:** % of resellers who bring in 1+ customer
4. **Attribution Accuracy:** 0 cases of lost/wrong attribution
5. **VM Reliability:** Uptime %, provisioning success rate

If activation is low → prioritize post-onboarding wizard (V2 #1).
If retention is low → prioritize calendar/email integration (V2 #2).
If resellers struggle → prioritize reseller wizard (V2 #1).
