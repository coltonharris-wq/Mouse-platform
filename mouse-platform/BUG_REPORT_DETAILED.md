# 🐛 Mouse Platform - Comprehensive Bug Report

**Test Date:** February 27, 2026  
**Tester:** TEST USER 1 (Subagent Simulation)  
**Test Coverage:** Complete signup & usage flow

---

## 🎯 Executive Summary

| Category | Count |
|----------|-------|
| **Critical Bugs** | 3 |
| **High Priority Bugs** | 5 |
| **Medium Priority Bugs** | 4 |
| **Low Priority Issues** | 8 |
| **Total** | **20** |

---

## 🔴 CRITICAL BUGS (Must Fix Before Launch)

### CRITICAL-1: Stripe Webhook Signature Not Validated
**Location:** `main.py` - `stripe_webhook()` function  
**Severity:** 🔴 CRITICAL - SECURITY VULNERABILITY

**Problem:**
```python
@app.post("/webhooks/stripe")
async def stripe_webhook(payload: dict, signature: str):
    # Signature is received but NEVER validated!
    event_type = payload.get("type")
    # ... processes payment events without verification
```

**Impact:** 
- Anyone can send fake webhook requests to manipulate customer subscriptions
- Attackers can create fake payment confirmations
- Could result in unauthorized service access

**Fix:**
```python
import stripe

@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Process verified event
```

---

### CRITICAL-2: Screenshot Endpoint Missing Customer Verification
**Location:** `main.py` - `get_screenshot()` function  
**Severity:** 🔴 CRITICAL - DATA LEAK

**Problem:**
```python
@app.get("/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot")
async def get_screenshot(customer_id: str, vm_id: str):
    # NO VERIFICATION that customer owns this VM!
    screenshot = await orgo.get_screenshot(vm_id)
    return {"screenshot_base64": screenshot, ...}
```

**Impact:**
- Any customer can view screenshots from ANY VM by changing the vm_id
- Complete data leak between customers
- Privacy violation, potential legal issues

**Fix:**
```python
@app.get("/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot")
async def get_screenshot(customer_id: str, vm_id: str):
    # Verify VM belongs to customer
    employee = await supabase.get_employee_by_vm(vm_id)
    if not employee or employee["customer_id"] != customer_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    screenshot = await orgo.get_screenshot(vm_id)
    return {"screenshot_base64": screenshot, "timestamp": datetime.utcnow().isoformat()}
```

---

### CRITICAL-3: WebSocket Missing Authentication & Authorization
**Location:** `main.py` - `vm_websocket()` function  
**Severity:** 🔴 CRITICAL - DATA LEAK

**Problem:**
```python
@app.websocket("/ws/vms/{customer_id}/{vm_id}")
async def vm_websocket(websocket: WebSocket, customer_id: str, vm_id: str):
    # Anyone can connect to any VM stream!
    await manager.connect(websocket, client_id)
```

**Impact:**
- No authentication on WebSocket connections
- No verification that caller owns the VM
- Real-time stream hijacking possible

**Fix:**
- Add WebSocket authentication (token-based)
- Verify customer owns the VM before streaming
- Implement rate limiting

---

## 🟠 HIGH PRIORITY BUGS

### HIGH-1: CORS Allows All Origins
**Location:** `main.py` - lines 16-22  
**Severity:** 🟠 HIGH

**Problem:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # DANGEROUS - allows any website to call your API
    allow_credentials=True,  # Even worse with credentials
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Impact:**
- Any website can make authenticated requests on behalf of logged-in users
- Cross-Site Request Forgery (CSRF) attacks possible

**Fix:**
```python
allow_origins=["https://app.mouseplatform.com", "https://admin.mouseplatform.com"]
```

---

### HIGH-2: No Input Validation on Customer Creation
**Location:** `main.py` - `CustomerCreate` model  
**Severity:** 🟠 HIGH

**Problem:**
```python
class CustomerCreate(BaseModel):
    company_name: str  # No length limit, no sanitization
    email: str         # No email format validation
    plan: str = "starter"  # No enum validation
    reseller_id: Optional[str] = None
```

**Issues:**
- `company_name` can be 1MB of text → database bloat
- `email` accepts "not-an-email" → delivery failures
- `plan` accepts any string → invalid plan types

**Fix:**
```python
from pydantic import Field, EmailStr
from typing import Literal

class CustomerCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    plan: Literal["starter", "growth", "enterprise"] = "starter"
    reseller_id: Optional[str] = Field(None, pattern=r'^[a-zA-Z0-9_-]+$')
```

---

### HIGH-3: No Rate Limiting on API Endpoints
**Location:** All API routes  
**Severity:** 🟠 HIGH

**Problem:**
- No rate limiting on customer creation (spam account creation)
- No rate limiting on message sending (API abuse)
- No rate limiting on VM deployment (resource exhaustion)

**Impact:**
- DDoS vulnerability
- Resource exhaustion attacks
- Abuse of paid services

**Fix:**
Add FastAPI rate limiting middleware:
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/v1/customers")
@limiter.limit("10/hour")  # Max 10 customers per IP per hour
async def create_customer(...):
```

---

### HIGH-4: Telegram Webhook Has No Secret Validation
**Location:** `main.py` - `telegram_webhook()`  
**Severity:** 🟠 HIGH

**Problem:**
```python
@app.post("/webhooks/telegram")
async def telegram_webhook(update: dict):
    # Anyone can POST fake Telegram updates!
```

**Impact:**
- Fake messages can trigger AI deployments
- Unauthorized bot interactions
- Resource waste from fake deployments

**Fix:**
- Add webhook secret token validation
- Or use Telegram's getUpdates polling instead

---

### HIGH-5: Generic Exception Handlers Hide Errors
**Location:** Multiple locations  
**Severity:** 🟠 HIGH

**Problem:**
```python
try:
    result = await platform.onboard_customer(customer.dict())
    # ...
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))  # Leaks internal errors!
```

**Issues:**
- Returns raw exception strings to clients (information leak)
- No logging of actual errors for debugging
- No differentiation between user errors and system errors

**Fix:**
```python
import logging

logger = logging.getLogger(__name__)

try:
    result = await platform.onboard_customer(customer.dict())
except ValueError as e:
    # User error - safe to show
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    # System error - log internally, generic message externally
    logger.exception("Failed to create customer")
    raise HTTPException(status_code=500, detail="Internal server error")
```

---

## 🟡 MEDIUM PRIORITY BUGS

### MEDIUM-1: No VM Resource Limits Validation
**Location:** `orchestrator.py` - `deploy_employee()`  
**Severity:** 🟡 MEDIUM

**Problem:**
```python
vm_config = {
    "name": f"knight-{employee_id}",
    "ram": 4,  # Hardcoded, no validation
    "cpu": 2,  # No limits checked
    "os": "linux"
}
```

**Issues:**
- No validation of VM resource limits
- Could exceed Orgo workspace quotas
- No cost controls

**Fix:**
Add validation against plan limits:
```python
PLAN_LIMITS = {
    "starter": {"max_vms": 2, "ram_per_vm": 4},
    "growth": {"max_vms": 5, "ram_per_vm": 8},
    "enterprise": {"max_vms": 20, "ram_per_vm": 16}
}
```

---

### MEDIUM-2: Employee ID Not Returned After Deployment
**Location:** `orchestrator.py` - `deploy_employee()`  
**Severity:** 🟡 MEDIUM

**Problem:**
```python
await self.supabase.update_employee(employee_id, {
    "status": "active",
    "started_at": datetime.utcnow().isoformat()
})

return {
    "employee": employee,  # Returns OLD employee object without updates!
    "vm": vm
}
```

**Issue:**
- Returns employee object BEFORE status update
- Status in response shows "deploying" not "active"

**Fix:**
Return updated employee data or refresh from database.

---

### MEDIUM-3: No Timeout on HTTP Requests
**Location:** `orgo_client.py` - All methods  
**Severity:** 🟡 MEDIUM

**Problem:**
```python
async with httpx.AsyncClient() as client:
    response = await client.post(...)  # No timeout!
```

**Impact:**
- Requests can hang indefinitely
- Resource exhaustion under load

**Fix:**
```python
async with httpx.AsyncClient(timeout=30.0) as client:
    response = await client.post(...)
```

---

### MEDIUM-4: Chat Logs Don't Capture Employee ID
**Location:** `orchestrator.py` - `handle_message()`  
**Severity:** 🟡 MEDIUM

**Problem:**
```python
await self.supabase.log_chat({
    "customer_id": customer_id,
    "message": message,
    "response": result["message"],
    "action_taken": result.get("action"),
    # MISSING: employee_id when deployment happens!
    "timestamp": datetime.utcnow().isoformat()
})
```

**Impact:**
- Can't track which employee was deployed from chat history
- Debugging difficult

---

## 🟢 LOW PRIORITY ISSUES

### LOW-1: Missing Response Models (13 endpoints)
**Location:** All API routes  
**Severity:** 🟢 LOW

All 13 API endpoints lack Pydantic response models. This means:
- No automatic API documentation
- No response validation
- Client SDKs can't be auto-generated

**Fix:**
Add response models:
```python
class CustomerResponse(BaseModel):
    id: str
    company_name: str
    email: str
    plan_tier: str
    status: str
    created_at: datetime

@app.get("/api/v1/customers/{customer_id}", response_model=CustomerResponse)
```

---

### LOW-2: No Pagination on List Endpoints
**Location:** `list_customer_vms()` and similar  
**Severity:** 🟢 LOW

Lists could grow unbounded. Add pagination:
```python
@app.get("/api/v1/customers/{customer_id}/vms")
async def list_vms(customer_id: str, skip: int = 0, limit: int = 100):
```

---

### LOW-3: QR Code Uses Demo Token
**Location:** `orchestrator.py` - `_create_king_mouse()`  
**Severity:** 🟢 LOW

```python
bot_token = f"demo_token_{uuid.uuid4().hex}"  # Not a real token!
```

This needs real Telegram Bot API integration.

---

### LOW-4: No Email Validation on Duplicate Check
**Location:** `supabase_client.py`  
**Severity:** 🟢 LOW

No check if email already exists before creating customer.

---

### LOW-5: Datetime Uses UTC Not Timezone-Aware
**Location:** Throughout codebase  
**Severity:** 🟢 LOW

Using `datetime.utcnow()` is deprecated in Python 3.12+. Use:
```python
from datetime import datetime, timezone
datetime.now(timezone.utc)
```

---

### LOW-6: No Health Check for Moonshot API
**Location:** `health_check()` endpoint  
**Severity:** 🟢 LOW

Health check doesn't verify AI service availability.

---

### LOW-7: WebSocket Doesn't Handle VM Deletion
**Location:** `vm_websocket()`  
**Severity:** 🟢 LOW

If VM is deleted while streaming, WebSocket loops infinitely with errors.

---

### LOW-8: Missing API Versioning Strategy
**Location:** API design  
**Severity:** 🟢 LOW

Current: `/api/v1/customers`  
Need strategy for v2 without breaking changes.

---

## 📝 ADDITIONAL FINDINGS

### Incomplete Implementations (Not Bugs, But Noted)

1. **King Mouse AI is Rule-Based, Not AI**: The `KingMouseAgent` uses keyword matching, not actual LLM calls despite having Moonshot API key configured.

2. **Knight Agent Code Execution**: The `_execute_on_vm()` method makes HTTP calls but doesn't verify the code executed successfully.

3. **No Billing Integration**: The Stripe integration is webhook-only; no actual subscription creation logic exists in the onboarding flow.

4. **Telegram Bot Not Actually Created**: The `_create_king_mouse()` method generates fake bot credentials instead of calling Telegram Bot API.

5. **Demo Cleanup Incomplete**: The `cleanup_demo()` method doesn't delete Stripe customers or Telegram bots.

---

## ✅ RECOMMENDED PRIORITY ORDER

### Week 1 (Critical - Block Launch):
1. CRITICAL-1: Stripe webhook validation
2. CRITICAL-2: Screenshot authorization
3. CRITICAL-3: WebSocket authentication
4. HIGH-1: CORS restriction

### Week 2 (High Priority):
5. HIGH-2: Input validation
6. HIGH-3: Rate limiting
7. HIGH-4: Telegram webhook security
8. HIGH-5: Exception handling

### Week 3 (Medium Priority):
9. MEDIUM-1: VM resource limits
10. MEDIUM-2: Employee ID fix
11. MEDIUM-3: HTTP timeouts
12. MEDIUM-4: Chat logging fix

### Week 4 (Polish):
13. LOW items and response models

---

## 🧪 TEST ARTIFACTS

- **Test Script:** `/Users/jewelsharris/.openclaw/workspace/mouse-platform/test_user_flow.py`
- **Report File:** `/Users/jewelsharris/.openclaw/workspace/mouse-platform/TEST_REPORT.md`

---

*Report generated by TEST USER 1 - Subagent Testing Session*
