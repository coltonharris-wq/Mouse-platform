# Deep Research Personalization System

## Overview

The Deep Research Personalization system automatically researches prospects and generates personalized outreach emails with specific AI employee recommendations. It integrates with Apollo.io for data enrichment and provides a sales rep approval workflow.

## Features

### 🔍 Multi-Source Research
- **Website Analysis**: Scrapes and analyzes company websites to understand products, services, value proposition, and target audience
- **LinkedIn Research**: Analyzes company LinkedIn presence, followers, recent posts, and hiring activity
- **News Monitoring**: Finds recent news articles, funding announcements, and company updates
- **Apollo.io Integration**: Enriches data with company size, revenue, industry classification, and contact information

### 🎯 Pain Point Analysis
- Identifies operational, sales, marketing, and technical pain points
- Analyzes tech stack gaps (missing chat, booking, CRM, etc.)
- Detects automation opportunities specific to the company
- Scores pain points by severity with supporting evidence

### 🤖 AI Employee Recommendations
- Recommends specific AI employee roles based on identified needs
- Calculates estimated hourly value for each recommendation
- Explains why each role would benefit the prospect
- Ranks recommendations by potential impact

### 📧 Personalized Email Generation
- Generates custom cold emails referencing specific research findings
- Includes relevant AI employee recommendations
- Creates compelling subject lines
- Professional but conversational tone
- Editable by sales reps before sending

### 👨‍💼 Sales Rep Workflow
- Interactive research dashboard
- Expandable sections for detailed findings
- Email preview with inline editing
- Send approval workflow
- Save research for later
- Confidence scoring

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Sales Rep Dashboard                       │
│              (ProspectResearchPanel.tsx)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (FastAPI)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ /research/*  │  │ /customers/* │  │  /webhooks/*    │   │
│  │   Routes     │  │    Routes    │  │    Routes       │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘   │
│         └─────────────────┼─────────────────────┘            │
│                           ▼                                  │
│              ┌────────────────────────┐                     │
│              │  ProspectResearchEngine │                     │
│              │   (prospect_research.py)│                     │
│              └───────┬────────────────┘                     │
└──────────────────────┼──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Company  │   │ LinkedIn │   │  News    │
│ Website  │   │   API    │   │  RSS/API │
└──────────┘   └──────────┘   └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
              ┌──────────────┐
              │  Apollo.io   │
│             │    API       │
              └──────────────┘
```

## API Endpoints

### Research Endpoints

```http
POST /api/v1/research/company
```
Conduct comprehensive research on a single company.

**Request:**
```json
{
  "domain": "example.com",
  "company_name": "Example Inc"  // optional
}
```

**Response:**
```json
{
  "domain": "example.com",
  "company_name": "Example Inc",
  "industry": "Technology",
  "employee_count": 150,
  "website_summary": "Cloud infrastructure platform...",
  "pain_points": [
    {
      "category": "operational",
      "description": "Manual customer onboarding",
      "severity": "high",
      "evidence": "No self-service signup flow"
    }
  ],
  "recommended_employees": [
    {
      "role": "AI Customer Success Manager",
      "reason": "Scale onboarding for growing customer base",
      "estimated_impact": "high",
      "hourly_value": 55
    }
  ],
  "email_subject": "Quick question about Example's growth",
  "personalized_email": "Hi there...",
  "confidence_score": 0.85
}
```

---

```http
POST /api/v1/research/batch
```
Research multiple companies in parallel (max 50).

**Request:**
```json
{
  "domains": ["stripe.com", "notion.so", "linear.app"]
}
```

---

```http
POST /api/v1/research/company/async
```
Start async research job (for long-running research).

**Response:**
```json
{
  "job_id": "research_example_com_123456",
  "status": "started"
}
```

---

```http
GET /api/v1/research/status/{job_id}
```
Check async research status.

---

```http
POST /api/v1/research/generate-email
```
Quick endpoint to generate email without full research.

---

```http
POST /api/v1/research/enrich-apollo
```
Fast enrichment from Apollo.io only.

---

```http
GET /api/v1/research/templates/employees
```
Get available AI employee role templates.

## Frontend Component

### ProspectResearchPanel

The main React component for sales reps to conduct research and review findings.

```tsx
import ProspectResearchPanel from "@/components/ProspectResearchPanel";

export default function SalesPage() {
  const handleSendEmail = async (research, editedEmail) => {
    // Send the approved email
    await fetch("/api/send-email", {
      method: "POST",
      body: JSON.stringify({
        to: research.contact_email,
        subject: research.email_subject,
        body: editedEmail || research.personalized_email
      })
    });
  };

  const handleSaveResearch = async (research) => {
    // Save to CRM/Supabase
    await supabase.from("prospect_research").insert(research);
  };

  return (
    <ProspectResearchPanel
      onSendEmail={handleSendEmail}
      onSaveResearch={handleSaveResearch}
    />
  );
}
```

### Component Features

1. **Search Interface**
   - Domain input (required)
   - Company name override (optional)
   - One-click research initiation

2. **Company Overview Section**
   - Industry, size, revenue, location
   - Website summary
   - Products/services
   - Value proposition
   - External links (LinkedIn, website)

3. **Pain Points Section**
   - Categorized pain points (operational, sales, marketing, technical)
   - Severity indicators (high/medium/low)
   - Supporting evidence
   - Automation opportunities
   - Tech stack gaps

4. **AI Recommendations Section**
   - Recommended roles with hourly value
   - Impact estimation
   - Detailed reasoning

5. **Email Preview Section**
   - Generated subject line
   - Email body preview
   - Inline editing capability
   - Send button with status
   - Save research button

## Environment Variables

```bash
# Moonshot AI for research analysis
MOONSHOT_API_KEY=your_moonshot_key

# Apollo.io for company enrichment
APOLLO_API_KEY=your_apollo_key

# Orgo for VM management (existing)
ORGO_API_KEY=your_orgo_key
ORGO_WORKSPACE_ID=your_workspace_id
```

## Usage Examples

### Python SDK

```python
from prospect_research import ProspectResearchEngine

# Initialize
engine = ProspectResearchEngine()

# Research a company
result = await engine.research_company(
    domain="stripe.com",
    company_name="Stripe"
)

# Access findings
print(result.website_summary)
print(result.pain_points)
print(result.recommended_employees)
print(result.personalized_email)

# Batch research
results = await engine.batch_research([
    "notion.so",
    "figma.com",
    "linear.app"
])
```

### cURL Examples

```bash
# Research a company
curl -X POST http://localhost:8000/api/v1/research/company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"domain": "stripe.com"}'

# Batch research
curl -X POST http://localhost:8000/api/v1/research/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"domains": ["notion.so", "figma.com"]}'

# Get employee templates
curl http://localhost:8000/api/v1/research/templates/employees
```

## Data Flow

1. **Research Initiation**
   - Sales rep enters domain in dashboard
   - Frontend calls POST /research/company
   - API returns job ID or waits for completion

2. **Research Execution**
   - Website scraping and analysis (AI-powered)
   - LinkedIn data retrieval
   - News feed parsing
   - Apollo.io enrichment
   - Pain point analysis (AI)
   - Recommendation generation (AI)
   - Email composition (AI)

3. **Results Presentation**
   - Dashboard displays findings in organized sections
   - Sales rep reviews pain points and recommendations
   - Email preview shown with editing option
   - Rep can regenerate or edit before sending

4. **Approval & Sending**
   - Rep clicks "Send Email"
   - Email sent via email provider
   - Research saved to CRM
   - Activity logged

## AI Employee Templates

Available role templates for recommendations:

| Role | Hourly Value | Best For |
|------|-------------|----------|
| Sales Development Rep | $65 | B2B, high-volume sales |
| Customer Success Manager | $55 | SaaS, subscriptions |
| Appointment Scheduler | $35 | Services, healthcare |
| Social Media Manager | $50 | B2C, e-commerce |
| Bookkeeper | $45 | Growing businesses |
| Customer Support | $35 | High volume, 24/7 needs |
| Data Entry Specialist | $30 | High paperwork |
| Executive Assistant | $60 | Busy executives |

## Performance & Caching

- Results cached for 24 hours by domain
- Async mode for long-running research
- Batch processing up to 50 domains
- Confidence score indicates data completeness

## Security

- All endpoints require authentication
- Rate limiting applied
- VM access verified before streaming
- Webhook signature validation

## Future Enhancements

- [ ] Real-time LinkedIn API integration
- [ ] Crunchbase funding data
- [ ] G2/Capterra review analysis
- [ ] Competitor analysis
- [ ] Intent data integration (Bombora, etc.)
- [ ] A/B testing for email templates
- [ ] Automatic follow-up sequences
