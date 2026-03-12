# Sprint 3 — Commit, Push, Deploy & E2E Test

> **Status:** READY FOR EXECUTION
> **Author:** Mouse (AI CEO)
> **Date:** March 12, 2026
> **Repo:** `/Users/jewelsharris/Desktop/Mouse-platform/mouse-platform/frontend/`
> **Live URL:** https://mouse-platform-demo.vercel.app

---

## PHASE 1: Commit & Push

1. `cd /Users/jewelsharris/Desktop/Mouse-platform/mouse-platform/frontend/`
2. Run `git add -A`
3. Commit with message: `feat: Sprint 3 complete — billing, data export, engagement engine, screen replay, help, notifications, receptionist, workspace, live VM viewer`
4. Push to `origin main`
5. **Verify push succeeded** — `git log origin/main --oneline -1` should match your commit

---

## PHASE 2: Deploy to Vercel

1. Run `vercel --prod` from the frontend directory
2. Wait for deployment to complete
3. Verify the live URL loads: `curl -s -o /dev/null -w "%{http_code}" https://mouse-platform-demo.vercel.app`
4. If deploy fails, read the build log, fix the error, commit, push, and redeploy

---

## PHASE 3: E2E Testing

Test every new feature from Sprint 3 (all 3 phases). For each test, verify the page loads without errors and the API returns valid data.

### 3A: Help & Support Page
- [ ] `GET /dashboard/help` — page loads, no console errors
- [ ] "Restart King Mouse" button renders
- [ ] FAQ accordion sections render and expand/collapse
- [ ] Contact support mailto link present

### 3B: Billing Enhancements
- [ ] `GET /dashboard/billing` — page loads
- [ ] `GET /api/billing/invoices` — returns JSON (even if empty array)
- [ ] `GET /api/billing/usage-daily` — returns JSON array
- [ ] Daily usage bar chart renders (CSS bars visible)
- [ ] Invoice history table renders
- [ ] Overage banners logic: check component handles 80% and 100% thresholds

### 3C: Notification System
- [ ] NotificationBell component renders in DashboardShell header
- [ ] `GET /api/notifications` — returns JSON
- [ ] Bell icon click opens dropdown panel
- [ ] Mark all as read functionality present

### 3D: Data Export & Settings
- [ ] `GET /dashboard/settings` — page loads
- [ ] "Your Data" section with 3 export buttons visible
- [ ] `GET /api/export/conversations` — returns CSV or valid response
- [ ] `GET /api/export/documents` — returns JSON or valid response
- [ ] `GET /api/export/settings` — returns JSON or valid response
- [ ] "Danger Zone" section renders with red border
- [ ] Cancel subscription modal opens on button click
- [ ] Delete account modal opens, requires typing "DELETE"

### 3E: Live VM Viewer — "King Mouse's Computer"
- [ ] `GET /dashboard/computer` — page loads
- [ ] `GET /api/vm/screenshot` — returns response (even if no active VM)
- [ ] Viewer component renders with refresh/fullscreen controls

### 3F: Screen Replay
- [ ] `GET /api/vm/replay/test` — returns response (even if empty)
- [ ] ScreenReplay.tsx component exists and imports cleanly
- [ ] `/dashboard/tasks` — page loads, completed tasks show "Watch Replay" button
- [ ] Replay viewer: play/pause, timeline, skip controls, speed selector all render

### 3G: AI Receptionist Overhaul
- [ ] `GET /dashboard/receptionist` — page loads
- [ ] Wizard flow renders (step indicators visible)
- [ ] Voice preview cards render
- [ ] Helper chat component present

### 3H: Your Workspace Tab
- [ ] `GET /dashboard/workspace` — page loads
- [ ] Integration cards render (Gmail, CRM, social, files sections)
- [ ] Connected/Not Connected states display correctly

### 3I: Engagement Engine
- [ ] `GET /api/engagement/suggestions` — returns JSON array
- [ ] `GET /api/engagement/report-card` — returns JSON object
- [ ] Dashboard empty state shows dynamic suggestions
- [ ] "View monthly report card" link opens modal
- [ ] Report card modal shows hours, tasks, calls, emails, money saved

### Navigation & Shell
- [ ] All new sidebar items present: Tasks, Connections, Computer, Workspace, Help
- [ ] Sidebar links navigate to correct routes
- [ ] DashboardShell header overage banner renders conditionally
- [ ] No broken imports or missing components across all pages

---

## PHASE 4: Bug Fixing

For every failure found in Phase 3:
1. Identify the root cause
2. Fix it in the source code
3. Run `next build` to verify no compile errors
4. Continue testing

After all fixes:
1. `git add -A`
2. `git commit -m "fix: Sprint 3 E2E bug fixes"`
3. `git push origin main`
4. Redeploy: `vercel --prod`
5. Re-verify the fixes are live

---

## PHASE 5: Final Report

When done, output a summary:
```
SPRINT 3 E2E REPORT
====================
Deployment: [URL]
Commit: [hash]
Tests passed: X/Y
Bugs found: N
Bugs fixed: N
Remaining issues: [list or "none"]
```

---

## RULES
- Do NOT rewrite files from scratch — fix in place
- Do NOT add heavy dependencies (no chart libraries, no component libraries)
- If an API needs auth and you can't test authenticated, test that the route responds (even 401 is fine — means it exists)
- If Vercel env vars are missing, note them in the report — do NOT hardcode secrets
- `next build` must pass with zero errors before every push
