# FEATURE_SPEC_V3 — Reseller Dashboard Redesign

**Builds ON TOP of V2.** No rebuilding provisioning, chat, or core infra.
**Production URL:** https://mouse-platform.vercel.app
**Repo:** /Users/jewelsharris/Desktop/Mouse-platform

---

## Phase 1: Navigation Overhaul

### Task 1.1 — New Sidebar Navigation
Replace the current sidebar with:
1. **KingMouse** (top item, emoji status indicator — see Phase 2)
2. **Dashboard** (analytics home — see Phase 3)
3. **Marketplace** (30 vertical Pros — see Phase 4)
4. **Businesses** (customer management — see Phase 5)
5. **Lead Finder** (prospect search — see Phase 6)
6. **Task Log** (KingMouse activity — see Phase 7)
7. **Voice** (AI Receptionist — see Phase 8)

**Remove:** Old "AI Marketplace" and "Employees" nav items. Keep their underlying code if referenced elsewhere, but remove from navigation.

### Task 1.2 — Sidebar Styling
- Collapsed icon mode on mobile (<768px)
- Active state: teal highlight (#0F6B6E)
- Hover: subtle teal tint
- Dark sidebar (#0B1F3B navy background), white text
- Each item has an icon + label
- KingMouse item shows the animated emoji (Phase 2)

### Task 1.3 — Route Structure
Create/update routes:
- `/dashboard` → Analytics (Phase 3)
- `/marketplace` → Marketplace grid (Phase 4)
- `/businesses` → Customer management (Phase 5)
- `/lead-finder` → Lead search (Phase 6)
- `/task-log` → Task log (Phase 7)
- `/voice` → AI Receptionist (moved from current location)
- `/king-mouse` → KingMouse status/chat page

Redirect `/` to `/dashboard`.

---

## Phase 2: KingMouse Emoji Status System

### Task 2.1 — Status Component
Create a `KingMouseStatus` component that renders an animated emoji based on state:
- 🐭 **idle** — Default. Subtle breathing/pulse animation.
- 💭 **thinking** — Thought bubble appears, gentle bob.
- 🔨 **working** — Hammer swings, slight shake.
- 🎭 **orchestrating** — Masks alternate, smooth rotation.
- 😴 **sleeping** — Zzz floats up, slow drift.

Use CSS animations (keyframes). No heavy libraries.

### Task 2.2 — Site-Wide Integration
- Show in sidebar next to "KingMouse" nav item
- Show in top header bar (small, always visible)
- `/king-mouse` page shows large version + status label + current activity description

### Task 2.3 — Status State Management
Create a React context `KingMouseStatusProvider`:
- `status`: idle | thinking | working | orchestrating | sleeping
- `activity`: string describing what KingMouse is doing
- `setStatus(status, activity)` method
- Default to "idle" on load
- Later: wire to real VM status via API (not in this spec, just mock it)

For now, the `/king-mouse` page has buttons to simulate status changes (dev/demo mode).

---

## Phase 3: Dashboard Analytics

### Task 3.1 — Reseller Dashboard View
When logged in as reseller, show:
- **Revenue card** — Total revenue this month, trend arrow
- **Customers card** — Active customers count
- **Commission card** — Commission earned this month (40% of customer revenue)
- **Revenue chart** — Line chart, last 6 months (use recharts or similar lightweight lib)
- **Recent activity feed** — Last 10 events (customer signed up, payment received, etc.)

### Task 3.2 — Admin Dashboard View
When logged in as admin, show everything from 3.1 PLUS:
- **Total platform revenue** across all resellers
- **Active resellers count**
- **Top resellers leaderboard** (top 5 by revenue)
- **System health** — VM count, active chats

### Task 3.3 — Data Source
For now, use mock data with realistic numbers. Create a `lib/mock-dashboard-data.ts` file.
Structure the data fetching so it can later be replaced with real Supabase queries.
Use a `useDashboardData()` hook that returns the mock data.

---

## Phase 4: Marketplace (30 Verticals)

### Task 4.1 — Marketplace Grid
Display a grid of 30 industry-specific AI Pros. Each card shows:
- Industry icon (emoji)
- Industry name
- Short description (1 line)
- "Add to My Marketplace" button (reseller view)
- "Active" badge if already added

**The 30 verticals:**
1. 🏠 Real Estate — Property listings, showings, follow-ups
2. 🔧 Plumbing — Service scheduling, estimates, dispatch
3. ⚡ Electrical — Job booking, permit tracking, invoicing
4. 🌿 Landscaping — Seasonal scheduling, crew dispatch
5. 🏗️ Construction — Project management, subcontractor coordination
6. 🚗 Auto Repair — Appointment booking, parts ordering
7. 🦷 Dental — Patient scheduling, insurance verification
8. 👁️ Optometry — Appointment management, frame inventory
9. 🐾 Veterinary — Pet records, appointment scheduling
10. 💇 Hair Salon — Booking, client preferences, inventory
11. 💅 Nail Salon — Scheduling, service menus, loyalty
12. 🏋️ Gym/Fitness — Membership management, class scheduling
13. 🍕 Restaurant — Reservations, orders, inventory
14. ☕ Coffee Shop — Mobile orders, loyalty, inventory
15. 🛒 Retail — Inventory, POS, customer management
16. 🏨 Hotel — Reservations, housekeeping, guest services
17. 🧹 Cleaning — Job scheduling, crew assignment, billing
18. 📦 Moving — Quotes, scheduling, crew dispatch
19. 🔒 Locksmith — Emergency dispatch, key inventory
20. 🌡️ HVAC — Service calls, maintenance scheduling
21. 🎨 Painting — Estimates, scheduling, material ordering
22. 🚿 Pool Service — Route management, chemical tracking
23. 🐛 Pest Control — Route scheduling, treatment tracking
24. 🌳 Tree Service — Estimates, crew scheduling, equipment
25. ⚖️ Law Office — Case management, client intake, billing
26. 📊 Accounting — Client management, deadline tracking
27. 🏥 Medical Practice — Patient scheduling, records, billing
28. 💊 Pharmacy — Prescription management, inventory, refills
29. 🎓 Tutoring — Session scheduling, student tracking
30. 🐶 Pet Grooming — Appointment booking, pet profiles

### Task 4.2 — Marketplace State
- Store which verticals a reseller has "added" in local state (later: Supabase)
- Filter: "All" | "My Marketplace" | search by name
- Sort: alphabetical default

### Task 4.3 — Vertical Detail Modal
Clicking a card opens a modal with:
- Full description of what the AI Pro handles for that industry
- 5-6 bullet points of specific automations
- Pricing info (standard $4.98/hr)
- "Add to My Marketplace" / "Remove" button

---

## Phase 5: Businesses Tab

### Task 5.1 — Customer List View
Table showing reseller's customers:
| Business Name | Industry | Status | Monthly Spend | Actions |
Statuses: Invited, Active, Paused, Churned

### Task 5.2 — Add Customer Flow
Button: "Add Business" → Modal/page with:
1. Business name
2. Industry (dropdown of 30 verticals)
3. Owner name
4. Owner email
5. Owner phone
6. Custom price override (default: $4.98/hr, reseller can set higher to increase margin)
7. Notes

On submit: saves to state (later: Supabase), generates invite link.

### Task 5.3 — Invite Link System
Each customer gets a unique invite link: `https://mouse-platform.vercel.app/invite/[code]`
- Landing page shows: business name, industry, what they get, pricing
- CTA: "Get Started" → signup flow (existing V2 signup)
- Track: link generated, link clicked, signup completed

### Task 5.4 — Customer Detail View
Click a customer row → detail page:
- Business info (editable)
- Usage stats (hours used, tasks completed) — mock for now
- Billing history — mock for now
- KingMouse status for this customer
- "Pause" / "Resume" / "Remove" actions

---

## Phase 6: Lead Finder

### Task 6.1 — Search Interface
- Search bar: "Find businesses in [industry] near [location]"
- Industry dropdown (30 verticals)
- Location text input
- Results grid: business cards with name, address, phone, website

### Task 6.2 — Lead Actions
Each result card has:
- "Save Lead" → adds to saved leads list
- "Add as Customer" → pre-fills Add Customer form (Phase 5)
- Website link (external)
- Phone (click to call on mobile)

### Task 6.3 — Saved Leads
Tab within Lead Finder: "Saved Leads"
- List of saved leads with status: New, Contacted, Interested, Not Interested
- Notes field per lead
- "Convert to Customer" action

### Task 6.4 — Data Source
For now, use mock data (10-15 realistic businesses per search). Create `lib/mock-leads-data.ts`.
Structure for later integration with Google Places API or similar.

---

## Phase 7: Task Log

### Task 7.1 — Task Log View
Three tabs:
1. **Scheduled** — Upcoming cron jobs / scheduled tasks
2. **In Progress** — Currently executing tasks
3. **Completed** — Finished tasks with results

Each task shows:
- Task name/description
- Status emoji (⏰ scheduled, 🔄 in progress, ✅ completed, ❌ failed)
- Timestamp
- Duration (for completed)
- Related customer (if applicable)

### Task 7.2 — Task Detail
Click a task → expandable detail:
- Full description
- Log output (scrollable, monospace)
- Related entities (customer, employee, etc.)

### Task 7.3 — Mock Data
Create `lib/mock-task-data.ts` with 15-20 realistic tasks:
- "Process invoice for Johnson Plumbing" ✅
- "Schedule follow-up with Dr. Smith's office" ⏰
- "Generate monthly report for all customers" 🔄
- etc.

---

## Phase 8: Voice Tab

### Task 8.1 — Move AI Receptionist
Move the existing AI Receptionist feature to `/voice` route.
Keep all existing functionality (phone number search, Twilio integration, call handling).
Update any internal links/references.

### Task 8.2 — Voice Dashboard
Add a header section above the existing receptionist UI:
- Active phone numbers count
- Total calls this month (mock)
- Average call duration (mock)
- "Buy New Number" prominent button

---

## Phase 9: Polish & Deploy

### Task 9.1 — Emoji Animations
Ensure all KingMouse emoji animations are smooth:
- 60fps CSS animations
- No layout shift
- Reduced motion media query support

### Task 9.2 — Mobile Responsive
- Sidebar collapses to bottom nav on mobile
- All tables become card layouts on mobile
- Modals become full-screen on mobile
- Touch-friendly tap targets (min 44px)

### Task 9.3 — Loading States
- Skeleton loaders for all data-fetching views
- KingMouse emoji shows 💭 thinking during loads

### Task 9.4 — Deploy to Production
- `vercel --prod` deploy
- Verify all routes work
- Test on mobile viewport

---

## Infrastructure Tasks (From V2 Completion)

### Task INF.1 — Set Vercel Environment Variables
Add the following environment variables in the Vercel project settings using `vercel env add`:
- `OPENAI_API_KEY` — for demo chat (use value from local env or prompt)
- `TWILIO_ACCOUNT_SID` — for AI Receptionist phone number search/purchase
- `TWILIO_AUTH_TOKEN` — for AI Receptionist
- `MOONSHOT_API_KEY` — for VM OpenClaw configuration (value: `sk-fNNLY6aNRewMuDTKqvoIUPLcPyNJ9VEbDYNRuhgKdDjiT9SP`)

Use `vercel env ls` first to check what's already set. Only add missing ones.
For any keys you don't have the value for, check `.env.local` or `.env` in the project directory.

### Task INF.2 — Stripe Dashboard Branding
Use the Stripe API to update branding settings:
- Primary color: `#0F6B6E` (teal)
- Accent color: `#0B1F3B` (navy)
- Note: Logo upload requires manual action in Stripe Dashboard — just output a reminder.

### Task INF.3 — Git Repository
If `/Users/jewelsharris/Desktop/Mouse-platform` is not a git repo:
1. `git init`
2. Create `.gitignore` (node_modules, .env*, .next, etc.)
3. `git add -A && git commit -m "V2 complete — all 32 tasks deployed"`
4. Then create per-phase commits as you complete each phase of V3.

---

## Implementation Order
1. Phase 1 (Navigation) → commit
2. Phase 2 (KingMouse Status) → commit
3. INF.3 (Git setup — do this first if no git repo) → commit
4. Phase 3 (Dashboard) → commit
5. Phase 4 (Marketplace) → commit
6. Phase 5 (Businesses) → commit
7. Phase 6 (Lead Finder) → commit
8. Phase 7 (Task Log) → commit
9. Phase 8 (Voice) → commit
10. Phase 9 (Polish) → commit
11. INF.1 (Vercel env vars) → after deploy
12. INF.2 (Stripe branding) → after deploy
13. Final `vercel --prod` deploy

---

## Tech Stack (Existing — Don't Change)
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- Supabase (database)
- Stripe (payments)
- Vercel (hosting)
- Twilio (voice)

## Design System (Existing — Don't Change)
- Primary: #0F6B6E (teal)
- Secondary: #0B1F3B (navy)
- Background: white / slate-50
- Cards: white with subtle shadow
- Border radius: rounded-lg
- Font: Inter (or system default)
