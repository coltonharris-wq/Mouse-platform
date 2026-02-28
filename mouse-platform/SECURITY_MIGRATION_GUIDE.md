# Security Migration Guide
## Mouse Platform API Security Fixes

### Overview
This document describes all security fixes implemented to address authentication, data isolation, rate limiting, and API key rotation vulnerabilities.

---

## 1. Authentication System (FIXED)

### Problem
- No authentication on customer endpoints
- Admin endpoints accessible without credentials
- No session management

### Solution Implemented

#### JWT-Based Authentication
```python
# New endpoints added:
POST /api/v1/auth/login       # Get JWT token
POST /api/v1/auth/logout      # Revoke token
POST /api/v1/auth/refresh     # Refresh token
```

#### Authentication Flow
1. Customer logs in with email → receives JWT token
2. Token valid for 24 hours
3. Include token in Authorization header: `Bearer <token>`
4. Server validates JWT on every protected request

#### Protected Endpoints (Require Authentication)
- `GET /api/v1/customers/{customer_id}`
- `GET /api/v1/customers/{customer_id}/dashboard`
- `GET /api/v1/customers/{customer_id}/king-mouse`
- `POST /api/v1/customers/{customer_id}/message`
- `GET /api/v1/customers/{customer_id}/vms/*`
- `POST /api/v1/customers/{customer_id}/vms`
- `GET /api/v1/customers/{customer_id}/tokens/*`
- `POST /api/v1/customers/{customer_id}/tokens/*`
- WebSocket connections

#### Admin Endpoints (Require Admin API Key)
- `POST /api/v1/customers/{customer_id}/tokens/credit`
- `GET /admin/vms/status`
- `GET /admin/tokens/overview`

---

## 2. Rate Limiting (FIXED)

### Problem
- No rate limiting on any endpoints
- Vulnerable to brute force and DDoS attacks

### Solution Implemented

#### Rate Limit Tiers
| Endpoint Type | Limit | Examples |
|--------------|-------|----------|
| health | 1000/min | /health |
| public | 30/min | /api/v1/token-packages |
| customer_create | 5/min | POST /api/v1/customers |
| auth | 10/min | /api/v1/auth/* |
| sensitive | 10/min | token use/credit |
| webhook | 100/min | /webhooks/* |
| vm_operation | 20/min | VM screenshot, deploy |
| token_purchase | 5/min | Create checkout session |
| admin | 60/min | Admin endpoints |

#### Implementation
```python
@app.get("/api/v1/customers/{customer_id}")
@app.state.limiter.limit(RATE_LIMITS["public"])
async def get_customer(...):
    ...
```

---

## 3. Data Isolation (FIXED)

### Problem
- No verification that customers own the VMs they access
- Potential for cross-customer data access

### Solution Implemented

#### VM Ownership Verification
Every VM-related endpoint now verifies ownership:

```python
@app.get("/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot")
async def get_screenshot(customer_id: str, vm_id: str, auth: Dict = Depends(verify_customer_or_admin)):
    # Verify customer owns this VM
    employee = await supabase.get_employee_by_vm(vm_id)
    if not employee or employee["customer_id"] != customer_id:
        raise HTTPException(status_code=403, detail="Access denied")
    ...
```

#### Customer ID Sanitization
Prevents SQL injection and XSS:

```python
# Validates format: cst_[alphanumeric]
# Rejects SQL keywords: DROP, DELETE, INSERT, etc.
# Rejects XSS patterns: <script>, etc.
customer_id = RequestValidator.sanitize_customer_id(customer_id)
```

---

## 4. CORS Security (FIXED)

### Problem
- CORS allowed all origins (`["*"]`) in all environments
- Security risk in production

### Solution Implemented

#### Environment-Based CORS
```python
def get_cors_origins():
    if production:
        return os.getenv("ALLOWED_ORIGINS", "").split(",")
    else:
        return ["http://localhost:3000", "http://localhost:5173"]
```

#### Configuration
```bash
# Development
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000

# Production  
ENVIRONMENT=production
ALLOWED_ORIGINS=https://app.mouseplatform.com,https://admin.mouseplatform.com
```

---

## 5. Webhook Security (FIXED)

### Problem
- Telegram webhook had no secret validation
- Anyone could send fake webhook requests

### Solution Implemented

#### Telegram Webhook Secret
```python
@app.post("/webhooks/telegram")
async def telegram_webhook(request: Request, update: dict):
    secret_token = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
    expected_secret = os.getenv("TELEGRAM_WEBHOOK_SECRET")
    
    if not secrets.compare_digest(secret_token, expected_secret):
        raise HTTPException(status_code=403, detail="Invalid webhook secret")
```

#### Set Telegram Webhook with Secret
```bash
curl -X POST "https://api.telegram.org/bot<token>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.mouseplatform.com/webhooks/telegram",
    "secret_token": "your-secret-token-here"
  }'
```

---

## 6. Input Validation (FIXED)

### Problem
- No validation on email format
- Company names could contain XSS payloads
- No length limits on fields

### Solution Implemented

#### Pydantic Models with Validation
```python
class CustomerCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., max_length=254)
    
    @validator('email')
    def validate_email(cls, v):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v.lower()
```

#### Field Sanitization
- Company names: Strip `< > ' "` characters
- Customer IDs: Validate format, block SQL keywords
- URLs: Must start with http:// or https://

---

## 7. Security Headers (FIXED)

### Problem
- Missing security headers
- XSS and clickjacking vulnerabilities

### Solution Implemented

#### Added Headers
```python
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
}
```

---

## 8. Error Handling (FIXED)

### Problem
- Error messages leaked internal details
- Stack traces exposed to clients

### Solution Implemented

#### Generic Error Messages
```python
try:
    result = await platform.onboard_customer(...)
except Exception as e:
    # Log internally
    print(f"Customer creation error: {e}")
    # Generic message to client
    raise HTTPException(status_code=500, detail="Failed to create customer")
```

---

## Environment Variables Required

Add these to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-please

# Admin API Key
ADMIN_API_KEY=your-secure-admin-api-key-min-32-chars

# Telegram Webhook Secret
TELEGRAM_WEBHOOK_SECRET=your-telegram-webhook-secret

# CORS Configuration
ENVIRONMENT=production  # or development
ALLOWED_ORIGINS=https://app.mouseplatform.com,https://admin.mouseplatform.com
ALLOWED_HOSTS=app.mouseplatform.com,api.mouseplatform.com

# Redis (for distributed rate limiting)
REDIS_URL=redis://localhost:6379
```

---

## Testing Security Fixes

Run the security test suite:

```bash
cd mouse-platform/api-gateway
pip install pytest pytest-asyncio PyJWT slowapi redis
python -m pytest tests/test_security_fixes.py -v
```

---

## Deployment Checklist

- [ ] Set all required environment variables
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Generate strong ADMIN_API_KEY
- [ ] Set TELEGRAM_WEBHOOK_SECRET and update Telegram webhook
- [ ] Configure ALLOWED_ORIGINS for production
- [ ] Configure ALLOWED_HOSTS for production
- [ ] Set ENVIRONMENT=production
- [ ] Install Redis for rate limiting (optional but recommended)
- [ ] Run security tests
- [ ] Test authentication flow end-to-end
- [ ] Verify admin endpoints require API key
- [ ] Verify VM access is isolated per customer
- [ ] Test rate limiting is working

---

## Security Contact

If you discover any security issues, please report them immediately.
