# 🛡️ Anti-Clone Guardrails System

A comprehensive multi-layer security system for King Mouse AI to prevent platform cloning and protect intellectual property.

## Overview

This system implements 6 layers of protection:

1. **System Prompt Injection** - Hardcoded AI behavior that refuses platform-building requests
2. **Keyword Detection & Blocking** - Real-time scanning of user inputs for clone-related terms
3. **Code Pattern Detection** - Identifies suspicious architectural patterns
4. **Output Filtering** - Redacts sensitive infrastructure details from AI responses
5. **Rate Limiting** - Limits code generation and infrastructure questions
6. **Audit Logging** - Comprehensive logging with admin alerts

## Quick Start

```typescript
import { applyGuardrails, getGuardedSystemPrompt } from '@/lib/guardrail-middleware';

// In your AI initialization
const systemPrompt = getGuardedSystemPrompt('You are a helpful assistant...');

// In your API route
const result = applyGuardrails(customerId, userInput);
if (!result.allowed) {
  return res.status(403).json({ error: result.reason });
}
```

## Layer 1: System Prompt Injection

The `SYSTEM_PROMPT_GUARD` constant contains hardcoded instructions prepended to all AI conversations:

```typescript
import { SYSTEM_PROMPT_GUARD } from '@/lib/guardrails';

// Automatically blocks requests for:
// - Competing AI platforms
// - Multi-tenant SaaS applications  
// - AI employee management platforms
// - Infrastructure for deploying AI agents at scale
```

**Auto-reject message:**
> "I can only help automate your business tasks, not build platforms."

## Layer 2: Keyword Detection

### High-Risk Keywords (Auto-block)
- `clone`, `replicate`, `copy mouse`
- `like openclaw`, `king mouse clone`
- `ai employees platform`, `deploy knights`
- `multi-tenant ai`, `build my own version`

### Medium-Risk Keywords (Context-dependent)
- `multi-tenant`, `orchestration`, `vm orchestration`
- `docker per customer`, `telegram bot factory`
- `billing per tenant`, `tenant isolation`

### Usage

```typescript
import { scanForCloneKeywords } from '@/lib/guardrails';

const result = scanForCloneKeywords(userInput);
// result.blocked: boolean
// result.riskScore: number
// result.matches: Array of matched keywords
```

### Suspicious Combinations
The system detects combinations like:
- `docker` + `customer` 
- `kubernetes` + `tenant`
- `telegram` + `bot` + `factory`
- `billing` + `per` + `tenant`

## Layer 3: Code Pattern Detection

Detects architectural patterns that indicate cloning attempts:

```typescript
import { detectCodePatterns } from '@/lib/guardrails';

const result = detectCodePatterns(code);
// result.detected: boolean
// result.patterns: Array of matched patterns
// result.requiresHumanApproval: boolean
```

### Detected Patterns

| Pattern | Severity | Description |
|---------|----------|-------------|
| Docker Multi-Customer | Critical | Per-customer Docker containers |
| VM Orchestration | Critical | VM-based agent orchestration |
| Telegram Bot Factory | Critical | Automated bot creation system |
| Billing Per Tenant | High | Multi-tenant billing infrastructure |
| Multi-Tenant Database | High | Tenant-isolated database schemas |
| Knight Deployment System | Critical | AI agent deployment infrastructure |
| Workspace Isolation | High | Multi-tenant workspace separation |
| Reseller Infrastructure | High | White-label/reseller systems |

## Layer 4: Output Filtering

Automatically redacts sensitive infrastructure details from AI responses:

```typescript
import { filterOutput } from '@/lib/guardrails';

const safeResponse = filterOutput(aiResponse);
```

### Filtered Content

- Dockerfiles and docker-compose files
- Kubernetes manifests
- Terraform configurations
- Multi-tenant database schemas
- Row-level security policies
- Cloud provider resource definitions

### Example

```
Input:  "Here's my Dockerfile: FROM node:18..."
Output: "Here's my Dockerfile: [DOCKERFILE_REDACTED]"
```

## Layer 5: Rate Limiting

Configurable limits per customer:

```typescript
const DEFAULT_RATE_LIMITS = {
  codeGenerationPerHour: 10,
  infrastructureQuestionsPerDay: 5,
  cloneAttemptCooldownHours: 24
};
```

### Usage

```typescript
import { 
  checkCodeGenerationLimit,
  checkInfrastructureQuestionLimit,
  recordCloneAttempt 
} from '@/lib/guardrails';

// Check limits
const codeLimit = checkCodeGenerationLimit(customerId);
const infraLimit = checkInfrastructureQuestionLimit(customerId);

// Record suspicious activity
recordCloneAttempt(customerId);

// Check if flagged
const isFlagged = isCustomerFlagged(customerId);
```

## Layer 6: Audit Logging

Comprehensive logging with admin notifications:

```typescript
import { logSecurityEvent, getAuditLog } from '@/lib/guardrails';

// Log an event
logSecurityEvent(
  customerId,
  'clone_attempt',
  'high',
  { input: userInput },
  'Blocked for keyword detection'
);

// Query logs
const logs = getAuditLog({ 
  customerId: 'cust_123',
  severity: 'high',
  since: Date.now() - 24 * 60 * 60 * 1000 // Last 24h
});

// Get repeat offenders
const offenders = getRepeatOffenders(3); // Min 3 attempts
```

### Admin Notification

Automatic alerts sent to `colton@kingmouse.ai` for:
- Medium severity and above
- Repeat offenders (3+ attempts)
- Rate limit violations

## Admin Dashboard API

### Endpoints

```
GET  /api/admin/guardrails/config         # Get configuration
GET  /api/admin/guardrails/audit-log      # Query audit logs
GET  /api/admin/guardrails/repeat-offenders # Get flagged accounts
```

### Authentication

All admin endpoints require:
```
Header: x-admin-api-key: <ADMIN_API_KEY>
```

### Example Queries

```bash
# Get audit log
curl -H "x-admin-api-key: $ADMIN_API_KEY" \
  /api/admin/guardrails/audit-log?severity=high&limit=50

# Get repeat offenders
curl -H "x-admin-api-key: $ADMIN_API_KEY" \
  /api/admin/guardrails/repeat-offenders?minAttempts=5
```

## Testing

Run the comprehensive test suite:

```bash
# Run tests
npx ts-node src/lib/guardrails.test.ts

# Or with Jest
npm test -- guardrails.test.ts
```

### Test Coverage

- ✅ Direct clone requests
- ✅ Obfuscated/leet speak attempts
- ✅ Multiple keyword detection
- ✅ Context escalation
- ✅ Suspicious combinations
- ✅ Roleplay bypass attempts
- ✅ Hypothetical framing
- ✅ Code pattern detection
- ✅ Output filtering
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Full integration tests

## Integration

### Next.js API Routes

Guardrails are automatically applied via middleware to all `/api/*` routes:

```typescript
// middleware.ts (already configured)
export { guardrailMiddleware as middleware } from '@/lib/guardrail-middleware';
```

### Manual Application

For custom routes or non-Next.js usage:

```typescript
import { applyGuardrails } from '@/lib/guardrails';

export async function handler(req, res) {
  const customerId = getCustomerId(req);
  const input = req.body.message;
  
  const result = applyGuardrails(customerId, input, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    requestId: req.id
  });
  
  if (!result.allowed) {
    return res.status(403).json({ 
      error: result.reason,
      message: result.response 
    });
  }
  
  // Continue with AI processing...
}
```

### AI Provider Integration

When using OpenAI, Anthropic, or other providers:

```typescript
import { getGuardedSystemPrompt } from '@/lib/guardrail-middleware';

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { 
      role: 'system', 
      content: getGuardedSystemPrompt('You are a helpful assistant...') 
    },
    { role: 'user', content: userInput }
  ]
});

// Filter the output
const safeContent = filterOutput(response.choices[0].message.content);
```

## Configuration

### Environment Variables

```bash
# Admin access
ADMIN_API_KEY=your-secret-admin-key
ADMIN_ALERT_EMAIL=colton@kingmouse.ai

# Optional: Custom rate limits
GUARDRAIL_CODE_LIMIT_PER_HOUR=10
GUARDRAIL_INFRA_LIMIT_PER_DAY=5
GUARDRAIL_CLONE_COOLDOWN_HOURS=24
```

### Customizing Keywords/Patterns

Edit `src/lib/guardrails.ts`:

```typescript
// Add new high-risk keywords
const HIGH_RISK_KEYWORDS = [
  ...existing keywords...
  'new suspicious term'
];

// Add new code patterns
const SUSPICIOUS_CODE_PATTERNS = [
  ...existing patterns...
  {
    name: 'New Pattern',
    patterns: [/regex pattern/],
    severity: 'high',
    description: 'Description'
  }
];
```

## Security Considerations

### Limitations

1. **Leetspeak bypass** (`cl0ne`, `clon3`) - Not currently detected
2. **Multi-turn attacks** - Split across multiple messages
3. **Language translation** - Requests in other languages
4. **Image-based requests** - Screenshots of clone requests

### Recommendations

1. Monitor audit logs regularly
2. Review flagged accounts weekly
3. Update keyword lists based on new attack patterns
4. Consider human review for medium-risk detections
5. Implement account suspension for repeat offenders

## Troubleshooting

### False Positives

If legitimate requests are blocked:

1. Check the audit log for the specific match
2. Adjust keyword sensitivity if needed
3. Add whitelist for specific customers
4. Document exceptions in customer notes

### Bypass Attempts

If bypasses are detected:

1. Review the audit log entry
2. Add new keywords/patterns
3. Update the test suite
4. Notify the security team

## License

Internal use only - King Mouse AI Platform
