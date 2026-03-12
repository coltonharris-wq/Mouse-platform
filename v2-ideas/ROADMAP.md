# V2 Ideas — Future Product Evolution

## 1. Natural Language Automation Creation (Phase 2)

**Status:** Next major feature after core platform stable

**Concept:** Customer describes what they want in plain English. KingMouse generates n8n workflows automatically and deploys them. No manual configuration. Customer never sees n8n.

**Example Flow:**
```
Customer: "When my washer inventory drops below 5, email my supplier to order 15 units"
↓
KingMouse parses intent:
- Trigger: inventory.washer < 5
- Action: send_email(to: supplier, subject: "Reorder Request", body: "15 washers")
↓
KingMouse generates n8n JSON workflow
↓
Deploys via n8n API
↓
"Done. I'll monitor your inventory and email Acme Supply when you hit 5 washers."
```

**Technical Approach:**
- Use LLM (Kimi K2.5 or Claude) to parse natural language → structured intent
- Map intent to n8n node types (Webhook, Schedule, HTTP Request, Email, etc.)
- Generate valid n8n workflow JSON
- Deploy via n8n REST API: `POST /workflows`
- Activate workflow: `POST /workflows/{id}/activate`
- Store workflow config in `automation_workflows` table

**Acceptance Criteria:**
- Customer can create 5 common automation types via chat
- Zero manual n8n configuration required
- Workflows deploy and execute correctly
- Customer can view/edit/delete automations via dashboard

---

## 2. Full Agent Orchestration (Phase 3)

**Status:** 2027+ — after Phase 2 proven and revenue stable

**Concept:** Replace n8n entirely with native agent orchestration. KingMouse plans, delegates, executes, and verifies autonomously. No workflow builder — pure agent-to-agent collaboration.

**Architecture:**
```
KingMouse (Planner Agent)
    ↓
Sub-agents on same VM:
- Research Agent (finds info)
- Action Agent (executes APIs, sends emails)
- Verification Agent (checks results)
- Memory Agent (updates customer knowledge)
```

**Why This Wins:**
- No JSON workflows to maintain
- Dynamic adaptation — agents handle edge cases
- True "just tell me what you want" experience
- Vertical-specific agent teams per Pro

**Example:**
```
Customer: "Find me the best price on 15 Whirlpool washers and place the order"
↓
Research Agent: scrapes 3 supplier sites, compares prices
↓
Action Agent: drafts purchase order, sends for approval
↓
KingMouse: "Found $299/unit at Midwest Appliance. Total $4,485. Approve?"
↓
Customer: "Yes"
↓
Action Agent: submits order, logs confirmation
↓
Verification Agent: confirms order received, updates inventory
```

**Technical Requirements:**
- Sub-agent framework (OpenClaw sub-agents or custom)
- Tool use (web search, APIs, browser automation)
- Planning and verification loops
- Cost management (agent calls add up)

---

## 3. Vertical-Specific Agent Teams

**Status:** Part of Phase 3

**Concept:** Each Pro has pre-built agent teams specialized for that industry.

**Appliance Pro Agents:**
- Inventory Agent (tracks stock, predicts demand)
- Supplier Agent (manages vendor relationships, negotiates)
- Scheduling Agent (optimizes technician routes)
- Customer Agent (handles inquiries, follow-ups)

**Roofer Pro Agents:**
- Lead Agent (qualifies, nurtures, converts)
- Estimator Agent (generates quotes from photos/descriptions)
- Crew Agent (schedules teams, tracks progress)
- Weather Agent (monitors forecasts, reschedules)

**Dentist Pro Agents:**
- Patient Agent (scheduling, reminders, recalls)
- Insurance Agent (verifies coverage, submits claims)
- Hygiene Agent (tracks recall intervals, books cleanings)
- Review Agent (requests reviews, manages reputation)

---

## 4. Autonomous Business Operations

**Status:** Long-term vision

**Concept:** KingMouse doesn't just assist — it operates. Makes decisions, spends money, hires/fire within parameters.

**Examples:**
- Auto-orders inventory when stock < threshold (no approval)
- Auto-adjusts pricing based on demand/competition
- Auto-hires temp staff during busy seasons
- Auto-responds to reviews and complaints

**Safety Guardrails:**
- Spending limits per transaction/day
- Approval required for new vendor relationships
- Weekly summary reports to owner
- Kill switch — owner can pause autonomy anytime

---

## 5. Multi-Location Expansion

**Status:** Post-100 customers

**Concept:** One KingMouse manages multiple business locations.

**Features:**
- Location-specific inventory, staff, customers
- Cross-location reporting and optimization
- Transfer inventory between locations
- Consolidated billing per owner

---

## 6. White-Label Platform for Resellers

**Status:** After core product stable

**Concept:** Resellers get their own branded KingMouse platform.

**Features:**
- Custom domain (kingmouse.resellerdomain.com)
- Custom branding (colors, logo)
- Custom Pro profiles (reseller's verticals)
- Reseller dashboard (customer management, commissions)

---

## Decision Log

**2026-03-11:** Chose Option A (NL → n8n) for immediate build. Phase 2 before Phase 3. Validate market with n8n, then migrate to full agent orchestration once revenue and patterns are proven.

**Rationale:**
- Faster to market (2-3 months vs 6-12 months)
- n8n is proven, debuggable, maintainable
- Can generate revenue while building Phase 3
- Customer feedback informs agent design

**Trigger for Phase 3:**
- 50+ customers
- $50K+ MRR
- Clear automation patterns emerging
- Team bandwidth for major platform rewrite
