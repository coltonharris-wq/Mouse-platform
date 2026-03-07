# Message to Send OpenClaw (copy-paste this)

---

Claude (in Cursor) finished fixing what he could in the mouse-platform repo. Here’s what he did and what he needs you to do.

## What Claude fixed (already in the repo)

1. **Portal King Mouse now uses VM when available** — `/portal/king-mouse` checks `GET /api/vm/chat?customerId=...` on load. If the customer has an active VM, messages go to `POST /api/vm/chat` (real King Mouse on VM). Otherwise they fall back to `/api/chat` (cloud). So customers on mouse.is with a provisioned VM now get the real agent.

2. **Conversation save works** — `POST /api/conversations` was added. Doctor Visit and New Session “save” now persist to the `conversations` table (replace by user_id + portal). No more silent 404.

3. **VM chat billing** — Usage is only recorded when a reply is successfully returned. Added `newBalance` and `workHoursCharged` to the VM chat response so the UI can update.

4. **Message length safety** — Messages to the VM are truncated to 28k characters with a truncation note so we don’t hit Orgo/bash command limits.

5. **Provision retry cron** — New route `GET /api/cron/provision-retry` runs every 2 minutes (Vercel Cron). It finds `employee_vms` with status `provisioning` or `starting` and `created_at` older than 1 minute, then calls `POST /api/vm/provision-trigger` for each. So if the user closes the onboard tab, the VM still gets provisioned. Optional: set `CRON_SECRET` in Vercel and the route checks `Authorization: Bearer <CRON_SECRET>`.

6. **Stripe webhook idempotency** — Checkout handler now inserts into `payments` first (with `stripe_session_id`). If insert fails with duplicate key (23505), we skip. Only the request that successfully inserts does the credit and plan update. Migration `011_payments_stripe_session_unique.sql` adds a unique index on `payments(stripe_session_id)` — run it in Supabase if you have a `payments` table.

7. **Deploy step UX** — Onboard “Deploying Your King Mouse” step now says you can leave the page; provisioning continues in the background, with a “Go to portal” link.

## What you (OpenClaw) need to do

1. **E2E test timeout** — Your browser control hit a 20s timeout during the provisioning wait. The app is built for 5–10 minute provisioning. Increase the timeout in your browser automation config for the “wait for VM provision” step (e.g. 3–5 minutes) so the test can complete.

2. **Orgo API in your environment** — You couldn’t verify VM status because `ORGO_API_KEY` wasn’t set where you run. Add `ORGO_API_KEY` (and `ORGO_WORKSPACE_ID` if you call Orgo) to the environment where OpenClaw runs so you can:
   - Call Orgo to list/get computers and confirm VM state.
   - Optionally re-run E2E from Step 3 using the existing test account or a new one.

3. **Run migrations in Supabase (if not already)**  
   - `010_hired_employees_config.sql` — adds `config` JSONB to `hired_employees`.  
   - `011_payments_stripe_session_unique.sql` — adds unique index on `payments(stripe_session_id)` (only if you have a `payments` table with that column).

4. **Optional: Vercel**  
   - If you use Vercel Cron, ensure the cron job for `/api/cron/provision-retry` is enabled (every 2 min).  
   - Optionally set `CRON_SECRET` in Vercel env and the route will require `Authorization: Bearer <CRON_SECRET>`.

After you’ve done the above, re-run E2E (signup → onboard → deploy → dashboard chat → hire employee if applicable) and report back: what passed, what failed, and any errors. Colton will handle anything that’s left (e.g. DB schema, customer_id type).

---
