# OpenClaw Handoff — Run After Cursor Finishes

Cursor has pushed the schema/code fixes. Here’s what you need to do.

---

## 1. Run migrations in Supabase (in this order)

In **Supabase Dashboard → SQL Editor**, run each migration file in order:

1. **010_hired_employees_config.sql** — if not already run
2. **012_usage_events_customer_id_text.sql** — aligns usage_events with cst_xxx customer IDs (truncates usage_events)
3. **013_payments_table.sql** — creates payments table with unique index on stripe_session_id
4. **014_customers_user_id_resellers.sql** — adds user_id to customers; **adds columns to existing resellers table** (no CREATE — table already exists with 4 rows)

**Skip 011** — 013 creates the payments table with the unique index already.

**Resellers fix:** Migration 014 no longer creates a new resellers table. It only ALTERs the existing one to add: user_id, company_name, invite_code, pricing_config, commission_rate, total_customers, total_revenue, total_commissions, status. Your 4 existing rows are preserved.

---

## 2. Vercel

- Enable the provision-retry cron for `/api/cron/provision-retry` (every 2 min)
- Add `CRON_SECRET` env var (any long random string)

---

## 3. Re-run E2E

Full flow: signup → onboard → deploy → dashboard chat. You should have increased the timeout and added Orgo env vars already.

---

## 4. Manual QA

- **Customer:** Signup → onboard → portal → chat with King Mouse
- **Reseller:** Signup at /signup/reseller → login → dashboard. Generate invite link. Have a test customer use the invite → checkout → onboard
- **For Resellers page:** Visit /for-resellers — should show reseller landing and link to signup

---

## 5. Deploy

Push and deploy to production when QA passes.
