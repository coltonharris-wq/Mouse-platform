# V2 Future Ideas — Post-Launch Roadmap

> This folder contains features and enhancements planned for V2 and beyond. These are NOT part of the current MVP launch but represent the evolution of the platform.

---

## RESELLER PORTAL WIZARD

**Problem:** Resellers sign up and... then what? They have a powerful KingMouse but don't know how to use it to grow their business.

**Solution:** Guided reseller onboarding wizard:

1. **Welcome** — "You're now a KingMouse reseller. Here's how you make money."
2. **Set Your Brand** — Brand slug, display name, color, logo, tagline
3. **Set Your Pricing** — Default hourly rate ($4.98–$8.98), see profit calculator
4. **Connect Your Tools** — Email, calendar, phone (for YOUR KingMouse, not customers')
5. **First Lead** — Walk through adding a business manually or using Lead Finder
6. **Generate Your Link** — Copy `mouse.is/{your-brand}`, share it
7. **KingMouse Training** — "Ask your KingMouse to find you 10 leads in your area"

**Why V2:** Resellers can figure it out manually for now. The core attribution + brand slug system works without this.

---

## RESELLER PRO TEMPLATE

**Problem:** Resellers want to sell specific AI solutions, not just "KingMouse." They need a vertical they understand.

**Solution:** Allow resellers to create their own "Pro Templates" — essentially custom Pro profiles they can sell:

- Reseller picks a base Pro (e.g., Appliance Pro)
- Customizes the prompt, tools, onboarding questions
- Adds their own branding
- Sets their own pricing
- Gets a custom landing page: `mouse.is/{reseller-slug}/{custom-pro-slug}`

**Example:**
- ACME AI creates "ACME Appliance Pro"
- Custom prompt emphasizing their specific service area
- Custom pricing: $6.98/hr
- Landing page: `mouse.is/acme-ai/appliance-pro`

**Why V2:** Requires significant UI + backend work. The base 30 Pros cover most use cases for launch.

---

## CUSTOMER POST-ONBOARDING WIZARD

**Problem:** Customer pays, VM provisions, they land in dashboard... and stare at a chat box. 60-year-olds don't know what to ask.

**Solution:** Post-payment guided setup wizard (before they hit the dashboard):

1. **Welcome** — "Your AI employee is ready. Let's set it up for your business."
2. **Connect Your Tools:**
   - Google Calendar / Outlook (for scheduling)
   - Gmail / Email (for reading/sending)
   - Phone number (for AI Receptionist)
   - Website (for monitoring)
3. **Set Your Preferences:**
   - Work hours (when should KingMouse work?)
   - Notification preferences (text me when...)
   - Approval thresholds (auto-approve under $X)
4. **Try Your First Task:**
   - Guided example: "Ask KingMouse to check your email"
   - Hand-holding through the first interaction
   - Shows them the response, explains what happened
5. **You're All Set** → Drops into dashboard with confidence

**Why V2:** The current onboarding gets them to payment. This gets them to ACTUAL usage. Critical for retention but not for launch.

---

## COMMUNICATION CHANNELS (SMS, EMAIL, WHATSAPP)

**Problem:** Customer has to log into dashboard to talk to KingMouse. Real operations happen over phone/text/email.

**Solution:** Multi-channel access:

- **Phone Number:** AI Receptionist answers calls, routes to KingMouse
- **SMS:** Customer texts KingMouse, it responds
- **Email:** Customer emails their KingMouse (e.g., `kingmouse-{customer-id}@mouse.is`)
- **WhatsApp:** Business API integration
- **Telegram:** Bot per customer

**Why V2:** Dashboard chat works for MVP. These channels require Twilio setup, WhatsApp Business API approval, etc. — significant integration work.

---

## CALENDAR & EMAIL INTEGRATION

**Problem:** KingMouse can't actually DO scheduling or email management without connecting to customer's real calendar/email.

**Solution:** OAuth integrations:

- **Google Calendar** — read/write events, check availability, schedule appointments
- **Outlook Calendar** — same for Microsoft ecosystem
- **Gmail** — read emails, send responses, filter spam, flag important
- **Outlook Email** — same for Microsoft

**Why V2:** Core to "do anything" but requires OAuth flows, token management, privacy policies. Dashboard chat can simulate this for demo purposes until integrated.

---

## KINGMOUSE SKILLS DISCOVERY PANEL

**Problem:** Customer doesn't know what KingMouse CAN do. They ask basic questions when it could handle complex workflows.

**Solution:** Skills panel in dashboard showing:

- "I can help you with..." categorized by function
- Examples per Pro type (Appliance Pro → "Schedule service calls", "Order parts")
- Suggested prompts based on their business type
- "Try this:" one-click example tasks

**Why V2:** Nice-to-have for UX. Power users will figure it out; this helps casual users.

---

## ACTIVITY TRANSPARENCY & SCREENSHOTS

**Problem:** KingMouse says "I checked your supplier's website" — customer has no idea what it actually did.

**Solution:**

- Screenshot capture during web browsing tasks
- Step-by-step activity log (not just "task completed")
- "Show me what you did" button on any task
- Diff view for changes (e.g., "Inventory was 5, now it's 3")

**Why V2:** Trust feature. MVP can show text logs; screenshots add significant storage/complexity.

---

## HUMAN ESCALATION & SUPPORT

**Problem:** KingMouse gets stuck or customer is frustrated. No way to get human help.

**Solution:**

- "Get Help" button in dashboard
- Routes to: Reseller (if reseller customer) → Internal Support
- Context passed: conversation history, what KingMouse tried
- Reseller/internal can take over the VM temporarily

**Why V2:** Important for trust but requires support infrastructure. MVP can use email fallback.

---

## DOCUMENT & ASSET MANAGEMENT

**Problem:** KingMouse generates quotes, invoices, reports. Where do they go?

**Solution:**

- File storage panel in dashboard
- KingMouse can save files to customer's storage
- Download, share via email, or send to printer
- Templates: quote templates, invoice templates, report formats

**Why V2:** KingMouse can generate and email directly for MVP. Storage panel is convenience.

---

## CRM INTEGRATIONS

**Problem:** Customer uses HubSpot, Salesforce, Pipedrive. KingMouse can't interact with their existing workflows.

**Solution:**

- HubSpot API integration
- Salesforce API integration
- Pipedrive, Zoho, etc.
- KingMouse can: read contacts, create deals, update stages, log calls

**Why V2:** Significant integration work per CRM. The 30 Pros cover generic SMB use cases without CRM dependency.

---

## PAYMENT COLLECTION

**Problem:** KingMouse can generate invoices but can't actually collect payment.

**Solution:**

- Stripe payment links generated by KingMouse
- "Send payment link to customer" workflow
- Payment status tracking
- Automatic follow-up on unpaid invoices

**Why V2:** KingMouse can generate and email invoices for MVP. Payment collection requires careful Stripe integration.

---

## CUSTOMER SUPPORT SYSTEM

**Problem:** When KingMouse breaks or customer is confused, there's no way to get help. No chat widget, no support email, no docs.

**Solution:**

- **In-app support widget** (Crisp, Intercom, or custom) on dashboard
- Or simple "Contact Support" button → opens email to support@mouse.is
- Context passed: customer ID, VM status, recent activity
- For reseller customers: option to contact reseller first

**Why V2:** Email fallback works for MVP. In-app widget is UX polish.

---

## SYSTEM STATUS & VM HEALTH

**Problem:** Customer doesn't know if their KingMouse is running. Is it down? Is it working?

**Solution:**

- Dashboard status indicator: 🟢 Running / 🟡 Starting / 🔴 Offline
- "Restart KingMouse" button (triggers VM reboot via Orgo API)
- Recent uptime history
- "Test KingMouse" button — sends ping, expects response

**Why V2:** Nice-to-have. VM provisioning is reliable; if it's down, it's usually transient.

---

## BILLING TRANSPARENCY

**Problem:** Customer pays monthly but has no visibility into usage, overages, or invoice history.

**Solution:**

- Usage dashboard: hours used this month, remaining hours, overage charges
- Invoice history: past payments, download PDFs
- Usage alerts: "You're at 80% of your plan" → suggest upgrade
- Overage protection: auto-pause at $X overage (configurable)

**Why V2:** Stripe handles billing; this is transparency/UX improvement.

---

## MULTI-USER ACCESS

**Problem:** Business has owner + employees. Only owner can access KingMouse.

**Solution:**

- Invite team members by email
- Roles: Owner (full access), Manager (can use KingMouse, view billing), Viewer (read-only)
- Activity log shows WHO did WHAT
- KingMouse recognizes different users: "Hi Sarah, what can I do for you today?"

**Why V2:** Significant auth/permissions work. Single-user works for most small businesses.

---

## DATA EXPORT & PORTABILITY

**Problem:** Customer wants to leave. Can they take their data?

**Solution:**

- "Export My Data" button in settings
- Downloads: conversation history, files, settings, VM config
- Formats: JSON (machine-readable), PDF (human-readable)
- Time-limited export link (7 days)

**Why V2:** Important for trust but not needed for launch. GDPR compliance feature.

---

## NOTIFICATIONS & ALERTS

**Problem:** KingMouse works 24/7 but customer only checks dashboard occasionally. Important things get missed.

**Solution:**

- **Email notifications:** Daily summary, urgent alerts, weekly recap
- **SMS alerts:** For truly urgent items (configurable)
- **Notification preferences:** What to notify about, how often
- KingMouse can say: "I'll email you a summary every morning at 8am"

**Why V2:** Dashboard is the primary interface. Notifications are convenience layer.

---

## PRIORITIZATION NOTES

**Must-Have for Launch (Current Spec):**
- Domain strategy (mouse.is / mice.ink) ✓
- Reseller attribution lock ✓
- Brand slug system ✓
- VM provisioning ✓
- Dashboard chat ✓
- Basic reseller portal ✓

**V2 (3-6 months post-launch):**
1. Customer post-onboarding wizard (retention critical)
2. Calendar & email integration (core functionality)
3. Communication channels (SMS, WhatsApp)
4. Human escalation (support load)

**V3 (6-12 months):**
- Reseller Pro templates
- CRM integrations
- Activity transparency with screenshots
- Document management
- Payment collection

**Philosophy:** Ship the core attribution + domain system first. The platform works without calendar integration — KingMouse can tell the customer "I need access to your calendar" and they can grant it later. But if attribution is broken, the whole reseller channel collapses.
