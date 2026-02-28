# Mouse Platform API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.mouseplatform.com`  
**Content-Type:** `application/json`

---

## Authentication

### API Endpoints
Most endpoints require no authentication for customer-facing operations. Admin endpoints require a Bearer token.

```
Authorization: Bearer <admin_token>
```

### Webhooks
Webhooks use signature verification:
- **Stripe:** HMAC-SHA256 signature in `Stripe-Signature` header
- **Telegram:** Secret token in `X-Telegram-Bot-Api-Secret-Token` header (optional)

---

## Endpoints

### Health Check

#### GET `/health`
Check API and service health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-27T21:00:00Z",
  "services": {
    "supabase": true,
    "orgo": true,
    "telegram": true
  }
}
```

---

### Customer Management

#### POST `/api/v1/customers`
Create a new customer and set up their King Mouse AI assistant.

**Request Body:**
```json
{
  "company_name": "Clean Eats",
  "email": "owner@cleaneats.com",
  "plan": "growth",
  "reseller_id": "automio_default"
}
```

**Validation Rules:**
- `company_name`: 2-100 characters
- `email`: Valid email format
- `plan`: One of `starter`, `growth`, `enterprise`
- `reseller_id`: Optional, alphanumeric with underscores/hyphens

**Response (201):**
```json
{
  "success": true,
  "customer": {
    "id": "cst_a1b2c3d4e5f6",
    "company_name": "Clean Eats",
    "email": "owner@cleaneats.com",
    "plan_tier": "growth",
    "status": "active",
    "created_at": "2026-02-27T21:00:00Z"
  },
  "king_mouse": {
    "bot_token": "...",
    "bot_username": "cleaneats_king_mouse_bot",
    "bot_link": "https://t.me/cleaneats_king_mouse_bot"
  },
  "qr_code_url": "data:image/png;base64,iVBORw0..."
}
```

**Errors:**
- `400` - Invalid input data
- `409` - Email already registered
- `422` - Validation error

---

#### GET `/api/v1/customers/{customer_id}`
Get customer details.

**Response (200):**
```json
{
  "id": "cst_a1b2c3d4e5f6",
  "company_name": "Clean Eats",
  "email": "owner@cleaneats.com",
  "plan_tier": "growth",
  "status": "active",
  "created_at": "2026-02-27T21:00:00Z"
}
```

**Errors:**
- `404` - Customer not found

---

#### GET `/api/v1/customers/{customer_id}/king-mouse`
Get King Mouse bot status and connection info.

**Response (200):**
```json
{
  "status": "active",
  "bot_username": "cleaneats_king_mouse_bot",
  "bot_link": "https://t.me/cleaneats_king_mouse_bot",
  "qr_code_url": "data:image/png;base64,...",
  "total_interactions": 42
}
```

---

### Messaging

#### POST `/api/v1/customers/{customer_id}/message`
Send a message to the customer's King Mouse AI.

**Request Body:**
```json
{
  "message": "I need a website built for my business",
  "employee_id": null
}
```

**Validation Rules:**
- `message`: 1-5000 characters
- `employee_id`: Optional, must match pattern `emp_<alphanumeric>`

**Response (200):**
```json
{
  "success": true,
  "response": "I'll deploy a web developer for you right away!",
  "actions": ["deploy_employee"],
  "employee_deployed": "emp_web123abc",
  "vm_id": "vm_vm123abc"
}
```

**Triggered Actions:**
- Keywords like "website", "web dev" → Deploy Web Developer
- Keywords like "social media", "Instagram" → Deploy Social Media Manager
- Keywords like "sales", "leads" → Deploy Sales Rep
- Keywords like "bookkeeping" → Deploy Bookkeeper

---

### VM / Employee Management

#### GET `/api/v1/customers/{customer_id}/vms`
List all VMs for a customer.

**Response (200):**
```json
{
  "vms": [
    {
      "id": "vm_abc123",
      "employee_id": "emp_web123",
      "employee_name": "Alex (Web Dev)",
      "role": "Web Developer",
      "status": "active",
      "url": "https://vm.orgo.com/abc123",
      "vm_status": "running",
      "current_task": "Build Shopify website"
    }
  ]
}
```

---

#### POST `/api/v1/customers/{customer_id}/vms`
Deploy a new AI employee VM.

**Request Body:**
```json
{
  "role": "Web Developer",
  "name": "Alex",
  "task_description": "Build a landing page with contact form"
}
```

**Validation Rules:**
- `role`: 1-50 characters
- `name`: 2-50 characters
- `task_description`: 10-1000 characters

**Plan Limits:**
- Starter: 2 VMs max
- Growth: 5 VMs max
- Enterprise: 20 VMs max

**Response (200):**
```json
{
  "success": true,
  "vm": {
    "id": "vm_abc123",
    "url": "https://vm.orgo.com/abc123",
    "status": "running"
  },
  "employee": {
    "id": "emp_web123",
    "name": "Alex",
    "role": "Web Developer",
    "status": "active"
  }
}
```

**Errors:**
- `403` - VM limit reached for plan

---

#### GET `/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot`
Get current VM screenshot. **Requires VM ownership verification.**

**Response (200):**
```json
{
  "screenshot_base64": "iVBORw0KGgoAAAANS...",
  "timestamp": "2026-02-27T21:05:00Z"
}
```

**Errors:**
- `403` - Access denied (VM doesn't belong to customer)
- `404` - VM not found

---

### WebSocket Streaming

#### WS `/ws/vms/{customer_id}/{vm_id}`
Real-time VM screenshot streaming. **Requires VM ownership verification.**

**Connection:**
```javascript
const ws = new WebSocket('wss://api.mouseplatform.com/ws/vms/cst_123/vm_abc123');
```

**Messages:**
```json
{
  "type": "screenshot",
  "data": "iVBORw0KGgoAAAANS...",
  "timestamp": "2026-02-27T21:05:00Z"
}
```

**Error Messages:**
```json
{
  "type": "error",
  "message": "Stream error"
}
```

**Connection Close Codes:**
- `4000` - Server error
- `4001` - Unauthorized (VM doesn't belong to customer)

---

### Webhooks

#### POST `/webhooks/telegram`
Receive Telegram bot updates. **Signature verified if secret configured.**

**Security:**
- Set `X-Telegram-Bot-Api-Secret-Token` header
- Secret configured via `TELEGRAM_WEBHOOK_SECRET` env var

**Response:**
```json
{"ok": true}
```

---

#### POST `/webhooks/stripe`
Receive Stripe events. **Signature REQUIRED.**

**Security:**
- Signature in `Stripe-Signature` header
- Verified using `STRIPE_WEBHOOK_SECRET`

**Handled Events:**
- `customer.subscription.created` - Activate customer
- `invoice.payment_succeeded` - Log revenue
- `invoice.payment_failed` - Mark past due
- `customer.subscription.deleted` - Deactivate customer

**Response:**
```json
{"received": true}
```

**Errors:**
- `400` - Invalid signature or payload

---

### Demo

#### POST `/api/v1/demo/run`
Run the full Clean Eats demo. Creates test customer with 2 AI employees.

**Response (200):**
```json
{
  "success": true,
  "customer": {...},
  "king_mouse": {...},
  "qr_code_url": "...",
  "employees": [...],
  "dashboard_url": "/portal?id=cst_demo123"
}
```

---

#### DELETE `/api/v1/demo/cleanup`
Remove all demo data and stop VMs.

**Response (200):**
```json
{
  "success": true,
  "message": "Demo data cleaned up"
}
```

---

### Admin

#### GET `/admin/vms/status`
Get status of all VMs. **Admin authentication required.**

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "vms": [
    {
      "id": "vm_abc123",
      "status": "running",
      "ram": 4,
      "cpu": 2
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 422 | Validation Error | Input validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST `/api/v1/customers` | 10/hour |
| POST `/api/v1/customers/{id}/message` | 60/minute |
| POST `/api/v1/customers/{id}/vms` | 10/hour |
| WebSocket connections | 5 concurrent |

---

## Data Models

### Customer
```json
{
  "id": "cst_<12-char-hex>",
  "company_name": "string",
  "email": "string",
  "plan_tier": "starter|growth|enterprise",
  "status": "active|inactive|past_due",
  "created_at": "ISO-8601 timestamp"
}
```

### Employee
```json
{
  "id": "emp_<12-char-hex>",
  "customer_id": "cst_<id>",
  "name": "string",
  "role": "string",
  "status": "deploying|starting|active|stopped",
  "vm_id": "vm_<id>",
  "current_task": "string",
  "created_at": "ISO-8601 timestamp",
  "started_at": "ISO-8601 timestamp"
}
```

### VM
```json
{
  "id": "vm_<id>",
  "url": "string",
  "status": "running|stopped|error",
  "ram": 4,
  "cpu": 2,
  "os": "linux"
}
```