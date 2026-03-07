# Your checklist (do while OpenClaw works)

Do these in Supabase and Vercel. None of them depend on OpenClaw.

---

## 1. Run migrations in Supabase

In **Supabase Dashboard → SQL Editor**, run these **in order** (only if you haven’t already):

**A. Hired employees config** (for employee config/state):
```sql
-- From: supabase/migrations/010_hired_employees_config.sql
-- Run the contents of that file (adds config JSONB to hired_employees if missing).
```
Open `010_hired_employees_config.sql`, copy the whole file, paste in SQL Editor, Run.

**B. Payments unique constraint** (for Stripe webhook idempotency):
```sql
-- From: supabase/migrations/011_payments_stripe_session_unique.sql
CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_session_id_key ON payments(stripe_session_id);
```
Only run this if you have a `payments` table with a `stripe_session_id` column. If you don’t have `payments` yet, skip.

---

## 2. Confirm `customers.id` type (quick check)

In **Supabase → Table Editor → `customers`**:

- Check the type of the `id` column (UUID vs TEXT/VARCHAR).
- Look at a few `id` values (UUIDs like `a1b2c3d4-...` vs strings like `cst_xxx`).

If `id` is **UUID** and you’re creating customers with UUIDs everywhere, you’re good.  
If `id` is **TEXT** and you use values like `cst_xxx`, then `usage_events` (which expects `customer_id UUID REFERENCES customers(id)`) will break when you record usage. In that case you’ll need to either:
- change `customers.id` to UUID and migrate data, or  
- change `usage_events.customer_id` to TEXT and fix the migration (and any RPCs that use it).

No code change from you right now — just confirm and note it so we can fix if needed.

---

## 3. Turn on the provision-retry cron (Vercel)

If the app is deployed on **Vercel**:

1. **Vercel project → Settings → Crons** (or **Functions → Cron Jobs**): make sure the cron for `/api/cron/provision-retry` is **enabled** (schedule: every 2 minutes).
2. **Settings → Environment Variables**: add `CRON_SECRET` (any long random string) for Production (and Preview if you want). The route will then require `Authorization: Bearer <CRON_SECRET>` so only Vercel Cron (or you with the secret) can call it.

If you’re not on Vercel, you can skip or run the retry logic on a schedule elsewhere (e.g. another cron service calling `GET /api/cron/provision-retry` with the same header).

---

## 4. (Optional) Test portal + Stripe locally

- Hit **/portal/king-mouse** and send a message (with a customer that has a VM vs one that doesn’t) to confirm VM vs fallback.
- Trigger a **Stripe checkout** and complete it; then in Supabase check `payments` for one row per session and no double-credit on `customers.work_hours_balance`.

---

**Summary:** Run migrations 010 + 011 (011 only if you have `payments`), confirm `customers.id` type, enable the cron and set `CRON_SECRET`. Optional: quick smoke test of portal and Stripe. That’s everything on your side while OpenClaw handles E2E timeout, Orgo env, and re-running tests.
