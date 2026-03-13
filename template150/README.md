# Template 150 — Mouse Platform Pro Templates

150 industry-specific business templates powering the Mouse Platform onboarding experience. Each template pre-configures the entire platform for a specific business type so a non-technical business owner can go from signup to a working system in under 10 minutes.

## Structure

```
template150/
├── schema.ts                          # TypeScript interfaces (ProTemplate, FAQ, etc.)
├── index.ts                           # Aggregated exports + lookup helpers
├── seed.sql                           # PostgreSQL seed file for pro_templates table
├── README.md                          # This file
└── verticals/
    ├── food-restaurant.ts             # 12 templates
    ├── real-estate.ts                 #  8 templates
    ├── pets-animals.ts                #  7 templates
    ├── automotive.ts                  # 10 templates
    ├── beauty-personal-care.ts        # 12 templates
    ├── home-services.ts              # 15 templates
    ├── healthcare.ts                  # 12 templates
    ├── legal.ts                       # 10 templates
    ├── fitness-wellness.ts            # 10 templates
    ├── professional-services.ts       # 12 templates
    ├── construction-trades.ts         # 12 templates
    ├── education-training.ts          # 10 templates
    ├── retail.ts                      # 10 templates
    ├── events-entertainment.ts        # 10 templates
    └── specialty-services.ts          # 10 templates
                                        ───
                                        150 templates total
```

## Template Anatomy

Every template follows the `ProTemplate` interface and includes:

| Section | Purpose |
|---------|---------|
| `identity` | Business name, tagline, colors, tone, personality |
| `demoExperience` | First-impression landing page content |
| `kingMousePersonality` | AI business advisor persona + sample advice |
| `aiReceptionist` | Virtual receptionist with FAQs, transfer triggers, escalation rules |
| `onboardingWizard` | 4-step setup wizard with typed fields |
| `dashboardWidgets` | Pre-configured dashboard cards |
| `sampleTasks` | Automated and approval-based tasks |
| `kpis` | Key performance indicators with targets |
| `integrations` | Third-party tools (essential / recommended / nice-to-have) |
| `emailTemplates` | Pre-written email templates with merge fields |
| `smsTemplates` | Pre-written SMS templates with merge fields |
| `metadata` | Version, tags, required plan |

## Design Principles

1. **Human language** — No jargon. Written for a 60-year-old business owner who has never used software like this.
2. **Zero tech knowledge assumed** — Every field has a placeholder showing exactly what to type.
3. **Show value in 10 seconds** — Demo experience hooks the user before they sign up.
4. **Pre-fill everything** — Templates provide sensible defaults so the wizard feels nearly complete.
5. **4 wizard steps max** — 2-4 fields each. Nobody wants a 20-question form.
6. **Natural receptionist scripts** — Contractions, warmth, personality. Not a robot.
7. **Industry-specific safety** — Healthcare templates never diagnose, legal templates never give legal advice, financial templates never recommend investments, funeral home templates never upsell.

## Usage

```typescript
import { allTemplates, getTemplateById, getTemplatesByVertical } from './template150';

// Get all 150 templates
console.log(allTemplates.length); // 150

// Find a specific template
const pizzaShop = getTemplateById('pizza-shop');

// Get all templates for a vertical
const legalTemplates = getTemplatesByVertical('legal');
console.log(legalTemplates.length); // 10
```

## Template Placeholders

Templates use `{{variable_name}}` syntax for dynamic content that gets filled in during onboarding. Common placeholders:

- `{{business_name}}` — The business name
- `{{phone}}` — Business phone number
- `{{hours}}` — Operating hours
- `{{address}}` — Business address
- `{{customer_name}}` — Customer's name (in email/SMS templates)
- `{{next_open}}` — Next opening time (in after-hours messages)
- `{{booking_link}}` — Online booking URL

## Verticals Summary

| Vertical | Count | Examples |
|----------|-------|---------|
| Food & Restaurant | 12 | Pizza, Sushi, BBQ, Coffee Shop, Food Truck |
| Real Estate | 8 | Agent, Property Management, Mortgage Broker |
| Pets & Animals | 7 | Vet Clinic, Dog Grooming, Pet Boarding |
| Automotive | 10 | Auto Repair, Body Shop, Detailing, Towing |
| Beauty & Personal Care | 12 | Hair Salon, Barbershop, Med Spa, Tattoo |
| Home Services | 15 | Plumber, Electrician, HVAC, Landscaping |
| Healthcare | 12 | Dental, Chiropractic, Mental Health, Pharmacy |
| Legal | 10 | Personal Injury, Family Law, Immigration, DUI |
| Fitness & Wellness | 10 | Gym, Yoga, CrossFit, Martial Arts, Swim School |
| Professional Services | 12 | CPA, Insurance, Marketing Agency, IT Support |
| Construction & Trades | 12 | General Contractor, Solar, Concrete, Cabinets |
| Education & Training | 10 | Tutoring, Driving School, Daycare, Music Lessons |
| Retail | 10 | Boutique, Jewelry, Pet Store, Bookstore |
| Events & Entertainment | 10 | DJ, Wedding Venue, Photo Booth, Live Band |
| Specialty Services | 10 | Storage, Moving, Phone Repair, Funeral Home |
