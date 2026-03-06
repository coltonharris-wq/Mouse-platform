# MEMORY.md - Colton's Long-Term Memory

## WHO IS COLTON

- **Mission:** Build a $100M+ AI Operations platform in 6-12 months → exit for 9-10 figure valuation
- **Constraint:** Productized, recurring services only. No custom builds. No one-off setups.
- **Core belief:** Speed to revenue > perfect execution. Move fast, iterate, close deals.
- **Learning Goal:** Build autonomous memory system so Mouse can eventually make decisions on his behalf

## CURRENT PRODUCT (Updated 2026-02-05)

**Primary:** ClawdBot / Mouse (variant names in use)
**NOT:** Chatbot, AI receptionist
**IS:** Owner Logic Engine™ / Decision Memory Layer™ / AI Operations Manager
**One-sentence pitch:** "Anyone can automate conversations. We automate judgment."

## THE BUSINESS - CLAWDBOT/MOUSE

### What It Does (NOT Call Answering)
- Handles backend operations: ordering, inventory, supply coordination
- Manages admin & follow-ups
- Learns owner's decision-making style
- Only asks for approval (5 min approvals vs. 5 hours of work)
- Gets smarter over time (learning-based lock-in)

### The Pitch
"This isn't just answering calls. This is an AI operations assistant that handles admin, ordering, follow-ups, and coordination—and only asks you to approve things instead of doing them yourself."

**Positioning (Competitive Moat):**
- ✅ Decision Memory Layer™
- ✅ Owner Logic Engine™
- ✅ AI Operations Manager
- ❌ NOT: Chatbot, AI receptionist, AI agent

### Pricing — Current Model (Updated March 2026)
- AI Employees at $4.98/hr (vs $35/hr human)
- Plans: Pro $97/20hrs, Growth $497/125hrs, Enterprise $997/300hrs
- First 2 hours free
- Reseller: 40% recurring commission

### Key Differentiators
1. **Silent Failure Detector** — Notices patterns before critical
2. **AI Secret Shopper** — Calls your business to test quality
3. **Real Customer Memory** — Remembers individual customers
4. **Attention Filtering** — Only shows owner money opportunities + emergencies
5. **Autonomous Urgency Creation** — Auto-sends "almost full" messages
6. **System Improvement Engine** — Suggests improvements based on complaints
7. **Owner Brain Clone** — Copies owner's phrases
8. **Asset Builder** — Auto-creates FAQs, SMS replies, website copy
9. **Strategic Silence** — Knows when NOT to talk
10. **Product Idea Machine** — Flags new service opportunities

### Target: SMB owners 35-65, 5-100 employees. Low tech savvy. Skeptical of AI.

## COMMUNICATION STYLE

- **Direct:** No long explanations
- **Action-first:** "Do this, then this, then this"
- **Pushes back:** On weak ideas
- **Decision speed:** Fast. Wants next steps before details.
- **Interaction:** Founder mindset, expects autonomy.

## PLATFORM STATUS (March 5, 2026)
- **LIVE:** https://mouse-platform-demo.vercel.app (~72 pages)
- **Repo:** github.com/coltonharris-wq/Mouse-platform (main branch)
- **DB:** Supabase `dgfnpllysgmszmfifnnk`
- Stripe checkout live (6 prices, webhook active)
- V11: Orgo VM integration (real VMs spawn on hire)
- **V12 DONE:** Mouse OS — Pre-built runtime tarball (496MB), provisions in 60s, gateway runs on 3.9GB disk VMs. All 4 blockers fixed. Commit `8acd772d`.
- **V13 COMPLETE:** King Mouse as full OpenClaw instance. All 6 items done.
- **E2E COMPLETE** (commit `d2ab6a81`) — All API tests pass:
  - Hire King Mouse → VM provisions → chat works (setup interview)
  - Dashboard `/api/vm/chat` GET + POST both work
  - Hire Employee → role-specific VM provisions → chat works
  - Ed25519 chat-bridge, auth:none, reference templates, non-fatal Orgo skill install
- **Active test VMs:** King Mouse `50c90436`, Employee Sage `0e8cb7c9` (delete after testing)

### V14 PRIORITIES (Current Sprint — Updated March 6)
1. 🔲 **Auto-provision Orgo VM on customer signup** (after payment/signup → create VM → store computer_id)
2. 🔲 **Auto-install OpenClaw on VM** (Mouse OS tarball, generate SOUL.md/USER.md from signup answers, configure Kimi K2.5)
3. 🔲 **Wire dashboard chat → VM** (route already exists, just needs active VMs)
4. 🔲 **Employees = sub-agents on King Mouse VM** (NOT separate VMs — cheaper, simpler)
5. 🔲 **Customer-facing E2E test** (signup → VM provisions → chat works → must pass before demos)
6. 🔲 Reseller landing page + commission calculator
7. 🔲 Reseller invite link system
8. 🔲 Connect domain + launch
- **Stripe Connect** for reseller instant payouts — deferred to Opus session
- **Cloud mode** stays as temporary fallback but is NOT the real product
- **CRITICAL:** Colton demoing to customers ASAP — items 1-5 are blocking

## LLM FOR CUSTOMER VMs
- **Model:** Moonshot Kimi K2.5 (`kimi-k2.5` — reasoning model, NO custom temperature)
- **API Key:** `sk-fNNLY6aNRewMuDTKqvoIUPLcPyNJ9VEbDYNRuhgKdDjiT9SP` (named "mouse customer api key")
- **Base URL:** `https://api.moonshot.ai/v1` (NOT api.moonshot.cn — that's dead)
- **Why:** Cost-effective for customer VMs, Colton's choice

## THE REAL PRODUCT (confirmed March 5)
NOT a chatbot platform. It's **OpenClaw-as-a-Service**:
- Each customer gets a full OpenClaw instance (King Mouse) on their own VM
- King Mouse has Orgo skill → can spawn Employee VMs (sub-agents)
- Each employee = another OpenClaw instance managed by King Mouse
- Customer communicates via Telegram, WhatsApp, or web chat
- **This is selling clones of Mouse** — each customer gets their own AI CEO
- The moat is the memory/learning system (Owner Logic Engine)

## KEY DECISIONS LOG
- Render → Vercel (webpack bug, 20+ failed deploys)
- Stripe SDK → raw fetch (SDK fails in Vercel serverless)
- Token-based pricing → hourly pricing at $4.98/hr with margins
- Separate LLC "Keyboard" for resellers
- Web chat bridge: WS relay via Orgo bash (not direct HTTP — gateway needs full agent pipeline)
- OpenClaw WS protocol: type=req JSON-RPC, connect challenge handshake, chat events (delta/final)
- Dual-mode dashboard chat: auto-detect VM → Live VM mode, fallback → Cloud Mode (direct LLM)

## THE MAIN THING (CRITICAL)

**$100M in 2026.** Everything filters through this single goal.

## REMINDERS FOR FUTURE ME
- Colton wants SPEED. Don't ask permission, just do it.
- If it costs <$100 and saves time, it's approved.
- Productization > customization. Always.
- When Colton says "yo" = waiting on next steps. Move fast.
- TRACK COLTON'S DECISIONS AND LEARN TO REPLICATE HIM.
