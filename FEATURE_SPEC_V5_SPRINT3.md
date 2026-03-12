# FEATURE_SPEC_V5 — Sprint 3: Operational Features + Live VM + Workspace Hub

> **Status:** LOCKED
> **Author:** Colton Harris (founder) · March 12, 2026
> **Repo:** `mouse-platform/frontend/` (NOT mouse-platform-demo)
> **Builds on:** Sprint 1 ✅, Sprint 2 ✅, Sprint 2.5 ✅
> **Rule:** MODIFY existing files in place. Do NOT rewrite from scratch.

---

## Table of Contents

1. [3A: Help & Support Page](#3a-help--support-page)
2. [3B: Billing Enhancements](#3b-billing-enhancements)
3. [3C: Notification System](#3c-notification-system)
4. [3D: Data Export](#3d-data-export)
5. [3E: Live VM Viewer — "King Mouse's Computer"](#3e-live-vm-viewer--king-mouses-computer)
6. [3F: Screen Replay Archive](#3f-screen-replay-archive)
7. [3G: AI Receptionist Overhaul — Dead Simple + Wizard](#3g-ai-receptionist-overhaul--dead-simple--wizard)
8. [3H: Your Workspace Tab — Everything in One Place](#3h-your-workspace-tab--everything-in-one-place)
9. [3I: Engagement Engine — Value Delivery Loop](#3i-engagement-engine--value-delivery-loop)
10. [DB Schema Additions](#db-schema-additions)
11. [API Endpoints](#api-endpoints)
12. [Implementation Priority](#implementation-priority)

---

## 3A: Help & Support Page

**Route:** `src/app/dashboard/help/page.tsx` (new)

**Add to sidebar:** In `DashboardShell.tsx`, add "Help" nav item with `LifeBuoy` icon, route `/dashboard/help`. Place it between Billing and Settings.

**Page layout:**
- **"Restart King Mouse" button** — big, obvious, top of page
  - Calls `POST /api/vm/restart?customer_id={id}`
  - Shows spinner during restart, success confirmation after
  - This is the #1 thing customers will look for when something breaks
- **FAQ section** — accordion-style, large text
  - "How do I talk to King Mouse?" → "Just type in the chat on your dashboard"
  - "What can King Mouse do?" → List of capabilities for their pro
  - "How do I check my hours?" → "Go to Billing & Hours"
  - "How do I cancel?" → "Go to Settings → Your Data → Cancel Account"
  - "What if King Mouse makes a mistake?" → "Tell him in chat. He learns from corrections."
- **Contact Support** — "Email us at support@automio.com" with pre-filled mailto link containing customer_id in subject
- **Phase 2 placeholder:** "Live chat coming soon" badge

**API:** `POST /api/vm/restart` (new) — calls Orgo API to restart the VM's OpenClaw gateway

---

## 3B: Billing Enhancements

**Modify:** `src/app/dashboard/billing/page.tsx` (existing — build on it, don't rewrite)

**Add to existing page:**

### Invoice History Section
- Below the current usage cards
- Table: Date | Amount | Status (Paid ✅ / Pending ⏳) | Download PDF link
- Pulls from Stripe invoice API
- Large text, clear status badges

### Usage Graph
- Simple horizontal bar chart showing daily hours over current billing period
- X-axis: dates, Y-axis: hours
- Use a lightweight chart (plain CSS bars or a tiny lib — NOT a heavy charting dependency)
- Color: teal fill

### Overage Warning Banners
- **80% used:** Yellow banner: "You've used {X} of your {Y} hours this month. Consider upgrading to save on overage."
- **100% exceeded:** Red banner: "You've exceeded your plan hours. Overage charges of $4.98/hr apply. Upgrade to save money."
- Show at top of billing page AND as a subtle banner in the dashboard header

### APIs:
- `GET /api/billing/invoices?customer_id={id}` (new) — returns Stripe invoice list
- `GET /api/billing/usage-daily?customer_id={id}` (new) — returns `[{date, hours}]` for current period

---

## 3C: Notification System

### In-Dashboard Notifications
**Location:** Dashboard header bar (right side)

- Bell icon with unread count badge (red circle with number)
- Click → dropdown panel showing recent notifications
- Each notification: icon, title, description, timestamp, read/unread dot
- "Mark all as read" link at top
- Clicking a notification navigates to relevant page (e.g., billing, tasks)

**Component:** `src/components/dashboard/NotificationBell.tsx` (new)
**Add to:** `DashboardShell.tsx` header area

### Email Notifications
- **Urgent:** Task needing approval → immediate email
- **Daily summary:** What King Mouse did today (tasks completed, calls handled, messages sent)
- **Weekly report:** Hours used, tasks completed, estimated money saved, top activities

### Notification Preferences
**Location:** Settings page (replace "Coming Soon" placeholder)

- Toggle switches for each notification type:
  - Email for urgent items: ON/OFF
  - Daily summary email: ON/OFF
  - Weekly report email: ON/OFF
  - SMS for critical alerts: ON/OFF (requires Twilio connection)
- Email address for notifications (default: account email)
- Phone number for SMS (from Connections or manual entry)

### DB Table:
```sql
CREATE TABLE customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  channel TEXT DEFAULT 'in_app',
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notifications_customer ON customer_notifications(customer_id, read);
```

### APIs:
- `GET /api/notifications?customer_id={id}&unread=true` — list notifications
- `PATCH /api/notifications/{id}/read` — mark as read
- `POST /api/notifications/mark-all-read?customer_id={id}` — bulk mark read
- `GET /api/notifications/preferences?customer_id={id}` — get prefs
- `PATCH /api/notifications/preferences` — update prefs

---

## 3D: Data Export

**Location:** Settings page → "Your Data" section (replace current placeholder)

**Rebuild Settings page with sections:**

### Account Info
- Business name, email, phone (editable)
- Plan info (link to billing)

### Notification Preferences
- (from 3C above)

### Your Data
- **"Export Conversations"** button → `GET /api/export/conversations?customer_id={id}&format=csv` → downloads CSV
- **"Export Documents"** button → `GET /api/export/documents?customer_id={id}` → downloads ZIP of all files King Mouse created
- **"Export Settings"** button → `GET /api/export/settings?customer_id={id}` → downloads JSON config

### Danger Zone (red bordered section at bottom)
- **"Cancel Subscription"** → confirmation modal → cancels Stripe subscription, keeps account active until period ends
- **"Delete My Account"** → double confirmation modal ("Type DELETE to confirm") → schedules account + VM deletion

### Team (placeholder)
- "Coming Soon — Invite team members to your dashboard"

---

## 3E: Live VM Viewer — "King Mouse's Computer"

**Concept:** Like [manus.im](https://manus.im) — customers can click a button and watch King Mouse working on his virtual computer in real time. This is the wow factor. This makes it REAL.

**Sidebar addition:** Add "King Mouse's Computer" nav item in `DashboardShell.tsx` with `Monitor` icon, route `/dashboard/computer`

**Route:** `src/app/dashboard/computer/page.tsx` (new)

**Design:**
- Full-width page showing a live screenshot stream of King Mouse's VM desktop
- Header: "🐭 King Mouse's Computer" + status indicator (🟢 Working / 😴 Idle / 🔴 Offline)
- **Live view area:** 
  - Centered, max-width 1024px, 16:9 aspect ratio
  - Shows real-time screenshots from Orgo API, refreshed every 2-3 seconds
  - Dark border/frame to look like a monitor
  - When King Mouse is idle: show last screenshot with "King Mouse is idle — waiting for your next task" overlay
  - When offline: show "King Mouse is offline" with restart button

**How it works technically:**
- Orgo API already has `takeScreenshot(computerId)` in `src/lib/orgo.ts`
- Frontend polls `GET /api/vm/screenshot?customer_id={id}` every 2-3 seconds
- API calls `takeScreenshot()` and returns the image (base64 or URL)
- Display in an `<img>` tag that updates on each poll
- Optional: Use a canvas element for smoother transitions (crossfade between frames)

**Activity indicator:**
- Below the screen: "Currently working on: {task description}" pulled from latest active task
- Or "Idle since {time}" if no active task

**Controls (below the screen):**
- "Send a Task" button → navigates to main chat
- "Restart" button → same as help page restart
- "Full Screen" button → makes the viewer take over the browser window

**API:**
- `GET /api/vm/screenshot?customer_id={id}` (new) — returns `{ image: base64string, status: 'working'|'idle'|'offline', current_task?: string, last_active?: string }`

**Performance note:** Screenshots are lightweight (Orgo captures them server-side). 2-3 second polling is fine. Don't stream video — too expensive and unnecessary. Screenshots give the same "watching him work" feeling at 1/100th the cost.

---

## 3F: Screen Replay Archive

**Concept:** Record King Mouse's screen activity and let customers replay it later. "Watch what King Mouse did while you were away."

**Location:** Tab within the Computer page, or linked from Tasks

**Design:**
- Each completed task gets a "Watch Replay" button
- Replay is a sequence of screenshots played back at ~2fps with a timeline scrubber
- NOT video — just a slideshow of the screenshots captured during that task

**How it works:**
- When King Mouse starts a task, begin capturing screenshots every 5 seconds → store in `task_screenshots` table
- When task completes, stop capturing
- Replay page loads all screenshots for that task and plays them in sequence
- Timeline scrubber at bottom (like a video player) lets them jump to any point
- Playback speed controls: 1x, 2x, 4x

**DB:**
```sql
CREATE TABLE task_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  screenshot_data TEXT NOT NULL,     -- base64 or Orgo URL
  captured_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_task_screenshots ON task_screenshots(task_id, captured_at);
```

**API:**
- `GET /api/vm/replay/{task_id}?customer_id={id}` — returns ordered list of screenshots for playback
- Screenshot capture happens server-side (cron or triggered by task start/end)

**Component:** `src/components/dashboard/ScreenReplay.tsx` (new)

**Phase 1:** Build the viewer component + DB schema. Screenshot capture during tasks is Phase 2 (needs VM-side integration).

---

## 3G: AI Receptionist Overhaul — Dead Simple + Always-On Wizard

**Problem:** The current receptionist page has 4 tabs (Phone Number, Settings, Call Log, Port Number), raw form fields, and expects the customer to know what they're doing. Our target customer is a 60-year-old business owner who doesn't want to configure anything — they want it to just work.

**Modify:** `src/app/dashboard/receptionist/page.tsx` (rewrite the UI, keep the API integrations)

### New Design: Wizard-First Approach

**When receptionist is NOT set up (no phone number):**
- Show a friendly, full-page setup wizard — NOT the current tab UI
- The wizard is a conversational flow, almost like chatting with King Mouse:

**Step 1: "Let's set up your AI receptionist"**
- Big friendly heading
- "Your AI receptionist will answer your business phone 24/7, take messages, book appointments, and handle common questions."
- "Ready to get started?" → Big green button

**Step 2: "What's your area code?"**
- Single input field, big, centered
- "We'll get you a local phone number your customers will recognize"
- Helper: "Your area code is the first 3 digits of your phone number (e.g., 910)"

**Step 3: "Pick your number"**
- Show 3-4 available numbers as big cards (not a grid of 10+)
- Each card: the phone number in large text + city/state
- "Pick this one" button on each

**Step 4: "How should your receptionist answer?"**
- Pre-filled with a smart default: "Thanks for calling {business_name}! How can I help you today?"
- They can edit it or keep the default
- Voice preview: "Tap to hear how it sounds" → plays a TTS sample of the greeting
- Voice selector: 3 big cards with voice names + "Play Sample" button (not a dropdown)
  - "Nova" (warm, friendly) — RECOMMENDED badge
  - "Onyx" (professional, deep)
  - "Shimmer" (energetic, upbeat)

**Step 5: "You're all set!"**
- Confetti animation
- Shows their new number prominently
- "Your receptionist is live and ready to answer calls"
- "Tell your customers to call {number} — or forward your existing number to it"
- "Need to port your existing number? Ask King Mouse in chat and he'll handle it for you."

### When receptionist IS set up:
- Clean status page (NOT the current 4-tab layout)
- Top section: Big card showing their phone number + "🟢 Active" status
- Below: Simple settings (greeting text, voice, voicemail toggle) — ALL on one page, no tabs
- Below that: Recent calls (last 10) with "View All" link
- **Always-on wizard helper:** Floating help button (bottom-right corner) with a 🐭 icon
  - Click → opens a mini chat overlay
  - This is King Mouse helping with receptionist setup
  - "Need to change your greeting? Just tell me what you want it to say."
  - "Want to forward your business number here? I can walk you through it."
  - "Want me to set up after-hours voicemail? Just say yes."
  - This mini-chat sends to the same King Mouse VM but with a receptionist-context system prompt

### Voice Toggle
- Prominent on the settings section
- 3 voice cards (not a dropdown), each with:
  - Voice name
  - Description (e.g., "Warm and friendly, great for customer service")
  - "▶ Preview" button that plays a 5-second sample
  - Radio/check state showing which is selected
- Save is automatic (on selection change)

### Port Number Flow
- Remove the current port form entirely
- Replace with: "Want to use your existing business number? Ask King Mouse in the main chat and he'll handle the paperwork."
- King Mouse on the VM can handle the port request via a guided conversation

---

## 3H: Your Workspace Tab — Everything in One Place

**Concept:** The customer should never need to leave mouse.is. Their entire business lives here. Email, CRM, social media, files — everything accessible from one tab.

**Sidebar addition:** Add "Your Workspace" nav item in `DashboardShell.tsx` with `LayoutGrid` or `Briefcase` icon, route `/dashboard/workspace`. Place it ABOVE "AI Receptionist" — this is a primary feature.

**Route:** `src/app/dashboard/workspace/page.tsx` (new)

### Design: App Launcher Grid

**Layout:**
- Header: "Your Workspace" + subheading "Everything you need, in one place"
- Grid of app tiles — each tile is a card that either:
  - Opens the connected app in an embedded iframe
  - Opens the app in a new tab (for apps that block iframing)
  - Shows "Connect first" if not connected (links to Connections page)

**App Grid — Grouped:**

**Communication:**
| App | Icon | Behavior |
|-----|------|----------|
| Gmail | 📧 | Embedded iframe of Gmail (if connected via OAuth) or link |
| Outlook | 📨 | Link to Outlook web |
| Slack | 💬 | Link to Slack workspace |
| Discord | 🎮 | Link to Discord server |

**Social Media:**
| App | Icon | Behavior |
|-----|------|----------|
| Instagram | 📸 | Link to Instagram (business account) |
| Facebook | 📘 | Link to Facebook business page |
| Twitter/X | 🐦 | Link to Twitter profile |
| LinkedIn | 💼 | Link to LinkedIn page |
| TikTok | 🎵 | Link to TikTok profile |
| Google Business | 📍 | Link to Google Business Profile |

**Business Tools:**
| App | Icon | Behavior |
|-----|------|----------|
| Google Calendar | 📅 | Embedded calendar widget or link |
| QuickBooks | 📊 | Link to QuickBooks |
| Square POS | 💳 | Link to Square dashboard |
| Stripe Dashboard | 💰 | Link to Stripe dashboard |
| Google Sheets | 📋 | Link to Sheets |
| Google Drive | 📁 | Link to Drive |

**Your Files (King Mouse created):**
| Item | Icon | Behavior |
|------|------|----------|
| Documents | 📄 | Opens file browser showing docs King Mouse created |
| Reports | 📊 | Opens reports section |
| Templates | 📝 | Opens templates created by King Mouse |

### How Connected Apps Work:
1. User connects an app on the Connections page (OAuth flow)
2. Once connected, the app tile on Workspace becomes active
3. Clicking opens an embedded view or direct link
4. Green border/badge on connected tiles, gray on unconnected

### The Key Insight:
The Workspace page is NOT doing the actual work — King Mouse is. The Workspace is just a **window into everything King Mouse has access to**. When the customer sees their Gmail, Calendar, and CRM all in one place, they realize:
- "I don't need to open 5 tabs anymore"
- "King Mouse can see everything I see"
- "This IS my office now"

### Social Media Quick View:
- If social accounts are connected, show recent post stats (likes, comments, reach) as small cards
- "Ask King Mouse to post for you" button on each social tile

### Component:** `src/components/dashboard/WorkspaceGrid.tsx` (new)

---

## 3I: Engagement Engine — Value Delivery Loop

**Concept:** King Mouse should proactively deliver so much value that the customer can't imagine going back to doing things manually. This is about making the product genuinely indispensable through constant, visible value delivery.

### Proactive Task Suggestions
When the customer opens the dashboard and there's no active task, King Mouse suggests things it can do:

**Chat empty state suggestions (enhance existing):**
- "📦 I noticed you haven't checked inventory this week. Want me to run a stock check?"
- "📞 You had 3 missed calls yesterday. Want me to follow up with those callers?"
- "📧 You have 12 unread business emails. Want me to summarize them?"
- "📊 It's Monday — want me to generate your weekly revenue report?"
- "⭐ You got 2 new Google reviews. Want me to respond to them?"

These suggestions are **context-aware** based on:
- Connected integrations (only suggest email if Gmail is connected)
- Day of week (weekly reports on Monday)
- Time since last activity
- Industry-specific triggers (inventory for retail, appointments for salons)

**Implementation:**
- `GET /api/suggestions?customer_id={id}` — returns 3-5 contextual suggestions
- Displayed as clickable chips/buttons in the chat empty state
- Clicking a suggestion sends it as a message to King Mouse

### Daily Wins Notification
Every morning (or when they first open the dashboard), show a "Yesterday's Wins" card:
- "🐭 King Mouse saved you an estimated 2.5 hours yesterday"
- "✅ 4 tasks completed"
- "📞 7 calls answered"
- "📧 12 emails handled"
- This reinforces the value EVERY. SINGLE. DAY.

**Component:** `src/components/dashboard/DailyWins.tsx` — dismissible card, shown at top of dashboard

### Smart Follow-Up Timing
King Mouse doesn't just wait for commands — it reaches out when there's something to do:
- Sends in-app notification: "I found 3 suppliers with better prices on your top ingredients. Want me to compare?"
- Sends email: "Quick heads up — your busiest day is coming up (Saturday). I pre-scheduled your crew and confirmed all appointments."
- These are triggered by business logic rules, not timers

### Progress Tracking — "King Mouse Report Card"
Monthly summary (email + in-dashboard):
- Hours saved this month
- Tasks completed
- Calls handled
- Estimated money saved (hours × $35/hr human equivalent)
- "You've been using King Mouse for {X} months. Here's how much he's saved you total: ${Y}"
- This makes the ROI undeniable and self-evident

**API:**
- `GET /api/engagement/daily-wins?customer_id={id}` — yesterday's metrics
- `GET /api/engagement/suggestions?customer_id={id}` — contextual task suggestions
- `GET /api/engagement/report-card?customer_id={id}&period=monthly` — monthly summary

---

## DB Schema Additions

```sql
-- Notifications (3C)
CREATE TABLE IF NOT EXISTS customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  channel TEXT DEFAULT 'in_app',
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON customer_notifications(customer_id, read);

-- Notification Preferences (3C)
CREATE TABLE IF NOT EXISTS notification_preferences (
  customer_id TEXT PRIMARY KEY,
  email_urgent BOOLEAN DEFAULT true,
  email_daily_summary BOOLEAN DEFAULT true,
  email_weekly_report BOOLEAN DEFAULT true,
  sms_critical BOOLEAN DEFAULT false,
  notification_email TEXT,
  notification_phone TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task Screenshots / Replay (3F)
CREATE TABLE IF NOT EXISTS task_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_screenshots ON task_screenshots(task_id, captured_at);

-- Workspace App Links (3H)
CREATE TABLE IF NOT EXISTS workspace_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  app_slug TEXT NOT NULL,
  app_name TEXT NOT NULL,
  category TEXT NOT NULL,
  connected BOOLEAN DEFAULT false,
  app_url TEXT,
  oauth_token_id TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_apps ON workspace_apps(customer_id, app_slug);

-- Engagement Metrics (3I)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  date DATE NOT NULL,
  hours_worked NUMERIC(10,4) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  calls_handled INTEGER DEFAULT 0,
  emails_handled INTEGER DEFAULT 0,
  estimated_hours_saved NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_metrics ON daily_metrics(customer_id, date);
```

---

## API Endpoints

### New Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/vm/restart` | Restart King Mouse VM gateway |
| `GET` | `/api/vm/screenshot` | Live screenshot from VM |
| `GET` | `/api/vm/replay/{task_id}` | Screenshot sequence for task replay |
| `GET` | `/api/billing/invoices` | Stripe invoice history |
| `GET` | `/api/billing/usage-daily` | Daily hours breakdown |
| `GET` | `/api/notifications` | List notifications (with unread filter) |
| `PATCH` | `/api/notifications/{id}/read` | Mark notification as read |
| `POST` | `/api/notifications/mark-all-read` | Bulk mark read |
| `GET` | `/api/notifications/preferences` | Get notification prefs |
| `PATCH` | `/api/notifications/preferences` | Update notification prefs |
| `GET` | `/api/export/conversations` | Export chat history (CSV/JSON) |
| `GET` | `/api/export/documents` | Export King Mouse documents (ZIP) |
| `GET` | `/api/export/settings` | Export config (JSON) |
| `DELETE` | `/api/customers/{id}` | Delete account (with confirmation) |
| `GET` | `/api/workspace/apps` | List workspace apps + connection status |
| `GET` | `/api/engagement/daily-wins` | Yesterday's value metrics |
| `GET` | `/api/engagement/suggestions` | Contextual task suggestions |
| `GET` | `/api/engagement/report-card` | Monthly summary report |

### Modified Endpoints

| Method | Path | Change |
|--------|------|--------|
| `GET` | `/api/vm/status` | Add `current_task` field to response |
| `GET` | `/api/receptionist/config` | Returns simplified config for new wizard UI |

---

## Sidebar Order Update

Update `NAV_ITEMS` in `DashboardShell.tsx`:

```typescript
const NAV_ITEMS = [
  { slug: 'workspace', name: 'Your Workspace', icon: Briefcase, route: '/dashboard/workspace' },
  { slug: 'computer', name: "King Mouse's Computer", icon: Monitor, route: '/dashboard/computer' },
  { slug: 'receptionist', name: 'AI Receptionist', icon: Phone, route: '/dashboard/receptionist' },
  { slug: 'tasks', name: 'Tasks', icon: CheckSquare, route: '/dashboard/tasks' },
  { slug: 'connections', name: 'Connections', icon: Plug, route: '/dashboard/connections' },
  { slug: 'billing', name: 'Billing & Hours', icon: Clock, route: '/dashboard/billing' },
  { slug: 'help', name: 'Help', icon: LifeBuoy, route: '/dashboard/help' },
  { slug: 'settings', name: 'Settings', icon: Settings, route: '/dashboard/settings' },
];
```

---

## Implementation Priority

### Phase 1 — High Impact, Core Infrastructure (Days 1-4)
1. **Live VM Viewer** (3E) — This is the WOW feature. Build it first.
   - `GET /api/vm/screenshot` endpoint
   - `/dashboard/computer` page with polling screenshot viewer
   - Activity indicator + current task display
2. **Your Workspace** (3H) — Makes the platform feel like home
   - Workspace grid with app tiles
   - Connected/not-connected states (reads from Connections data)
   - Links to external apps + "Connect first" states
3. **Sidebar update** — Add workspace + computer + help nav items
4. **Daily Wins** (3I) — Shows value immediately
   - `daily_metrics` table + API
   - `DailyWins.tsx` component on dashboard
   - Task suggestions in chat empty state

### Phase 2 — Trust & Polish (Days 5-7)
5. **AI Receptionist Overhaul** (3G) — Full wizard rewrite of the UI
   - Conversational setup wizard
   - Voice preview cards (not dropdown)
   - Simplified post-setup view
   - Always-on wizard helper (mini-chat)
6. **Help Page** (3A) — Restart button + FAQ
7. **Notification Bell** (3C) — In-app notifications
   - Bell component in header
   - Notification dropdown
   - Mark as read

### Phase 3 — Monetization & Retention (Days 8-10)
8. **Billing Enhancements** (3B) — Invoice history, usage graph, overage warnings
9. **Settings Overhaul** (3D) — Account info, notification prefs, data export, danger zone
10. **Engagement Engine** (3I) — Suggestions API, proactive follow-ups, monthly report card
11. **Screen Replay** (3F) — Phase 1: viewer component + DB schema (capture integration later)

---

## Key Technical Notes

- **VM screenshots** are already supported: `takeScreenshot()` exists in `src/lib/orgo.ts`. This is NOT new infrastructure — it's just a new frontend for existing capabilities.
- **The Workspace page** is mostly links + iframes. Low engineering effort, high perceived value. Don't over-engineer it.
- **AI Receptionist wizard** keeps ALL existing API integrations (search numbers, purchase, config, calls). Only the UI changes.
- **Engagement features** need the `daily_metrics` table populated. Phase 1: manually seed or compute from existing task logs. Phase 2: real-time tracking from VM activity.
- All text must remain at the increased font sizes from Sprint 2.5. Target audience: 35-65 year old SMB owners.

---

> **This is the Sprint 3 spec. Build in the order listed. Reference this doc in every PR.**
