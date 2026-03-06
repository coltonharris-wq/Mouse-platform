# 🐭 OVERNIGHT BUILD: Fix the Signup → VM → OpenClaw Flow

**Written by:** Mouse (Opus) — March 6, 2026, 2:05 AM
**For:** You (Kimi K2.5 running as Mouse)
**Repo:** `/Users/jewelsharris/.openclaw/workspace/mouse-platform-demo`
**Live:** https://mouse-platform-demo.vercel.app
**Deploy:** `vercel --prod` (from repo root)

---

## WHAT'S BROKEN AND WHY

### Evidence from Colton's Screenshots

Colton sent screenshots showing:
1. **King Mouse chat shows "AI error: 400"** — This is the Moonshot API error (we fixed the URL/model/temp tonight, but the first message after page load still intermittently fails)
2. **King Mouse responds in "cloud mode"** — The response says "I don't have access to a long-running memory file yet" which means it's hitting the fallback `/api/chat` route, NOT the VM chat. **No VM was created.**
3. **Work Hours page shows "VENDOR COST" and "MARGIN" columns** — These internal business metrics are visible to customers. Must be hidden.

### Bug #1: THE ROOT CAUSE — Wrong Customer ID (Critical)

The onboard page sends the **wrong ID** to the hire API.

**File:** `app/onboard/page.tsx` line 159
```typescript
customerId: user?.userId,  // ❌ This is the RAW AUTH UUID
```

But the `customers` table uses `cst_` prefixed IDs (e.g., `cst_abc12345`).

**Signup returns BOTH:**
```json
{ "userId": "raw-uuid-here", "customerId": "cst_abc12345", ... }
```

Both are stored in localStorage as `mouse_session`. The onboard page grabs `user?.userId` (raw UUID) instead of `user?.customerId` (the cst_ prefixed one that's actually in the database).

**What happens:** `marketplace/hire` calls `checkBalance("raw-uuid")` → queries `customers` table → no match → returns 402 "Insufficient work hours" → **no VM ever created**.

**The fix:**
```typescript
// app/onboard/page.tsx line 159
customerId: user?.customerId || user?.userId,
```

### Bug #2: Silent Error Swallowing (Critical)

**File:** `app/onboard/page.tsx` lines 186-192
```typescript
} catch (error) {
  console.error('Deployment error:', error);
  // Still move to completion (graceful degradation)
  setTimeout(() => {
    setCurrentStep(3);  // ← Pretends everything worked!
    setDeploying(false);
  }, 1000);
}
```

Even when marketplace/hire returns 402 or 500, the onboard page says "You're All Set!" and sends the user to the portal. The user never knows the VM wasn't created.

**The fix:** Show an error state instead of faking success. At minimum, log the API response and show the user what happened.

### Bug #3: Work Hours Page Shows Internal Costs (UI Fix)

**File:** `app/portal/work-hours/page.tsx`

The page shows "VENDOR COST" and "MARGIN" columns in the Usage History table. These are internal business metrics that customers should NEVER see.

**What Colton sees (from screenshots):**
- Usage History table with columns: DATE, SERVICE, VENDOR COST, HOURS CHARGED, MARGIN
- Example row: "Chat (Kimi) | $0.0014 | -1 min | 30x"

**What needs to happen:**
- Remove the "VENDOR COST" column entirely
- Remove the "MARGIN" column entirely
- Keep: DATE, SERVICE, HOURS CHARGED (maybe rename to "USED")

**Lines to find and fix:**
Search for these terms in `app/portal/work-hours/page.tsx`:
- `vendor_cost` — remove from table headers, cells, and CSV export
- `margin_multiplier` or `Margin` — remove from table headers, cells, and CSV export
- `VENDOR COST` — remove header
- `MARGIN` — remove header

The CSV export around line 508 also needs these columns removed.

**Screenshot evidence:** Colton sent screenshots showing the Usage History table with these internal columns visible. This is a privacy/business issue — customers shouldn't see our costs or margins.

---

## FULL TASK LIST (Do These In Order)

### Task 1: Fix the Customer ID Bug
1. Open `app/onboard/page.tsx`
2. Line 159: Change `user?.userId` to `user?.customerId || user?.userId`
3. Also check `app/portal/king-mouse/page.tsx` — it has a similar `getUserId()` function. Make sure it also tries `customerId` first.
4. Search the ENTIRE portal directory for any other places that use `userId` where they should use `customerId`:
   ```bash
   grep -rn "userId" app/portal/ app/onboard/ --include="*.tsx" --include="*.ts"
   ```

### Task 2: Fix Error Handling in Onboard
1. Open `app/onboard/page.tsx`
2. In the catch block (~line 186), don't fake success. Instead:
   - Show an error message to the user
   - Add a "Retry" button
   - Log the actual API error response
3. Also check the `try` block — if `response.ok` is false, it currently still sets progress to 100% and moves on. Fix that too.

### Task 3: Hide Vendor Cost / Margin from Work Hours Page
1. Open `app/portal/work-hours/page.tsx`
2. Remove all "Vendor Cost" and "Margin" columns from:
   - The CSV export (around line 508)
   - The table headers (around line 536-538)
   - The table cells (around line 560-564)
3. Don't remove the data from the API response — just hide it from the UI.

### Task 4: Verify Supabase Table Schemas
Before testing the hire flow, confirm the tables have the right columns:
```bash
cd /Users/jewelsharris/.openclaw/workspace/mouse-platform-demo
```
Check what columns `hired_employees` and `employee_vms` tables expect vs what the code inserts. Tonight we found `customers` had mismatched columns — the same issue likely exists in these tables.

Look at what `marketplace/hire` inserts into `hired_employees`:
- `id`, `customer_id`, `employee_name`, `status`

And into `employee_vms`:
- `customer_id`, `employee_id`, `employee_name`, `computer_id`, `status`, `ram`, `cpu`, `gpu`, `orgo_url`, `vnc_password`

Query the actual schemas:
```bash
# Use the Supabase REST API or check for migration files
find . -name "*.sql" | head -20
```

If there's a mismatch, fix the code to match the table (don't alter the table).

### Task 5: Verify the Tarball URL
Open `lib/mouse-os-provision.ts` and find the tarball download URL in `generateProvisionScript()`. Test it:
```bash
# Find the URL
grep -n "tar.gz\|tarball\|TARBALL_URL\|github.*releases" lib/mouse-os-provision.ts
# Test it downloads
curl -I <THE_URL>
```
If it 404s, that's a blocker. Note it in progress and move on to other tasks.

### Task 6: Test the Full Flow
After fixing bugs 1-3:
```bash
git add -A && git commit -m "fix: customer ID mismatch, error handling, hide vendor costs" && git push origin main && vercel --prod
```

Then test:
```bash
# 1. Create test user
curl -s -X POST https://mouse-platform-demo.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e-test-overnight@test.com","password":"Test123!","company":"Overnight Test Co"}' | jq .

# 2. Use the customerId (cst_ prefix!) to hire King Mouse
curl -s -X POST https://mouse-platform-demo.vercel.app/api/marketplace/hire \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "PASTE_CST_ID_HERE",
    "isOnboarding": true,
    "interviewAnswers": {
      "primary-role": "Handle customer inquiries and schedule appointments",
      "playbook": "Check messages every hour, respond within 5 minutes",
      "red-lines": "Never give refunds over $100 without approval",
      "voice": "Professional but friendly",
      "authority": "Can handle decisions up to $50",
      "heartbeat": "Daily summary at 5 PM",
      "active-access": "Email, calendar",
      "hand-off": "Text me for urgent issues",
      "restricted-zones": "No financial accounts"
    }
  }' | jq .

# 3. Check if VM was created (look for computer_id in response)
# 4. Poll provision status
curl -s "https://mouse-platform-demo.vercel.app/api/vm/provision-status?computer_id=PASTE_COMPUTER_ID" | jq .

# 5. If provisioning isn't started, trigger it
curl -s -X POST https://mouse-platform-demo.vercel.app/api/vm/provision-trigger \
  -H "Content-Type: application/json" \
  -d '{"computerId": "PASTE_COMPUTER_ID"}' | jq .

# 6. Once status is 'ready', test chat
curl -s -X POST https://mouse-platform-demo.vercel.app/api/vm/chat \
  -H "Content-Type: application/json" \
  -d '{"customerId":"PASTE_CST_ID","message":"Hello, what can you do?"}' | jq .
```

### Task 7: Cleanup
- Delete any test VMs from Orgo (they charge per hour)
- Delete test customer records from Supabase (or mark them)
- Note what works and what doesn't in `memory/overnight-progress.md`

---

## CRITICAL GOTCHAS

### Supabase NEVER throws on error
```typescript
const { data, error } = await supabase.from('table').insert({...});
// error is populated but NO exception thrown
// You MUST check: if (error) { ... }
```
This is how every bug tonight started. Silent failures.

### Vercel 10-second timeout
API routes timeout after 10s. `createComputer()` returns quickly (just the API call), but `waitForReady()` takes 30-60s. NEVER call `waitForReady()` in an API route. The existing code handles this correctly — don't change it.

### The cst_ prefix
- `customers.id` = `cst_abc12345`
- `auth.users.id` = raw UUID `abc12345-...`
- When talking to the customers table, use `cst_` prefix
- When talking to Supabase Auth, use raw UUID

### Moonshot / Kimi K2.5
- Base URL: `https://api.moonshot.ai/v1` (NOT .cn)
- Model: `kimi-k2.5`
- Temperature: MUST be 1 (reasoning model rejects other values)
- API Key: in Vercel env as `MOONSHOT_API_KEY`

### Orgo API
- API Key: in Vercel env as `ORGO_API_KEY`
- Workspace ID: in Vercel env as `ORGO_WORKSPACE_ID`
- VMs need 8GB RAM / 4CPU for OpenClaw (smaller VMs run out of disk)
- Mouse OS tarball is ~496MB, expands to ~1.3GB

---

## PROGRESS TRACKING

After completing each task, update:
```
/Users/jewelsharris/.openclaw/workspace/memory/overnight-progress.md
```

Format:
```markdown
## [HH:MM] Task N: <name>
- Status: ✅ Done / ❌ Failed / ⚠️ Partial
- What happened: ...
- Files changed: ...
- Next: ...
```

Also update the daily log:
```
/Users/jewelsharris/.openclaw/workspace/memory/2026-03-06.md
```

---

## WHAT SUCCESS LOOKS LIKE

1. ✅ Fix the customer ID mismatch so marketplace/hire actually gets called with the right ID
2. ✅ Fix error handling so users see real errors instead of fake success
3. ✅ Hide vendor cost / margin from the work hours page
4. ✅ Verify (or fix) Supabase schemas for hired_employees and employee_vms
5. ✅ Test the hire API with a real customer ID and confirm a VM gets created
6. ✅ If VM provisions successfully, confirm OpenClaw launches and chat works
7. ✅ Deploy all fixes to production

If you can't complete everything (Orgo API issues, tarball problems), get as far as you can and document what's blocking in the progress file.

---

## IMPORTANT: How to Manage Your Session

- You have a 256k token context window. This task should fit in one session.
- Commit and push frequently — small commits with clear messages.
- If you get stuck on one task for more than 15 minutes, document it and move to the next one.
- Write your findings to files, not just in chat. Files persist across sessions.

---

*The code is 90% there. The root cause (#1) is a one-line fix. The rest is verification and polish. Ship it. — Mouse 🐭*
