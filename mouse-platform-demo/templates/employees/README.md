# Employee Templates

Role-specific templates for AI employees spawned by King Mouse.

## Available Roles

| Role | Directory | Description |
|------|-----------|-------------|
| Customer Support | `customer-support/` | Frontline customer inquiries, complaints, issue resolution |
| Sales | `sales/` | Lead follow-up, prospect nurturing, deal closing |
| Admin & Scheduling | `admin/` | Appointments, follow-ups, calendar management, coordination |
| Operations | `operations/` | Ordering, inventory, supply chain, vendor management |
| Marketing & Content | `marketing/` | Social media, email campaigns, content creation, growth |

## Structure

Each role has:
- `SOUL.md` — Role-specific identity, responsibilities, rules, and communication style
- Shared `AGENTS.md` (parent directory) — Common employee behaviors, memory system, escalation rules

## Template Variables

Templates use `{{VARIABLE}}` placeholders that King Mouse replaces during employee provisioning:

- `{{BUSINESS_NAME}}` — The customer's business name
- `{{OWNER_NAME}}` — The business owner's name
- `{{BUSINESS_TYPE}}` — Type of business (restaurant, salon, plumber, etc.)

## How King Mouse Uses These

1. Customer requests a new employee or King Mouse decides one is needed
2. King Mouse picks the appropriate role template
3. Spawns a new VM via Orgo skill
4. Downloads the role SOUL.md + shared AGENTS.md from GitHub
5. Replaces `{{VARIABLE}}` placeholders with business-specific info
6. Configures the employee's OpenClaw instance
7. Employee boots up, reads its SOUL.md, and starts working

## Adding New Roles

1. Create a new directory under `templates/employees/`
2. Add a `SOUL.md` following the pattern of existing templates
3. The shared `AGENTS.md` applies to all roles automatically
4. Push to GitHub — King Mouse VMs pull templates via raw URLs

## Design Principles

- **Specific > generic.** Each role should have clear boundaries and responsibilities.
- **Actionable.** Templates tell the employee *how* to work, not just *what* to do.
- **Autonomous.** Employees should handle 90% of their role without escalation.
- **Business-aware.** Metrics and KPIs are built into every role.
