#!/usr/bin/env python3
"""
Mock Mouse Platform API Server for Stress Testing
Simulates the real API with intentional bugs to test the stress test framework
"""

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import random
import asyncio
import time
from datetime import datetime

app = FastAPI(title="Mouse Platform API (Mock)")

# Add CORS middleware - intentionally wide open (BUG: HIGH-1)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
customers: Dict[str, dict] = {}
vms: Dict[str, dict] = {}
employees: Dict[str, dict] = {}
chat_logs: List[dict] = []
token_packages = [
    {"id": "pkg_starter", "name": "Starter", "price": 19, "tokens": 2000},
    {"id": "pkg_growth", "name": "Growth", "price": 49, "tokens": 6000},
    {"id": "pkg_pro", "name": "Pro", "price": 99, "tokens": 15000}
]

# Request models
class CustomerCreate(BaseModel):
    company_name: str
    email: str
    plan: str = "starter"
    reseller_id: Optional[str] = None

class MessageRequest(BaseModel):
    message: str
    employee_id: Optional[str] = None

class VMDeployRequest(BaseModel):
    role: str
    name: str
    task_description: str

# ======== API ENDPOINTS ========

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "supabase": True,
            "orgo": True,
            "telegram": True
        }
    }

@app.get("/api/v1/token-packages")
async def get_token_packages():
    """Get available token packages"""
    return token_packages

@app.post("/api/v1/customers")
async def create_customer(customer: CustomerCreate):
    """Create a new customer - BUG: No rate limiting, weak validation"""
    
    # BUG: HIGH-2 - No proper input validation
    # Allowing very long strings without validation
    
    # Check for duplicate email
    for c in customers.values():
        if c["email"] == customer.email:
            raise HTTPException(status_code=409, detail="Email already registered")
    
    customer_id = f"cst_{uuid.uuid4().hex[:12]}"
    
    new_customer = {
        "id": customer_id,
        "company_name": customer.company_name,
        "email": customer.email,
        "plan_tier": customer.plan,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    
    customers[customer_id] = new_customer
    
    # Create King Mouse bot
    bot_username = f"{customer.company_name.lower().replace(' ', '_')}_king_mouse_bot"
    king_mouse = {
        "bot_token": f"demo_token_{uuid.uuid4().hex}",
        "bot_username": bot_username,
        "bot_link": f"https://t.me/{bot_username}",
        "total_interactions": 0
    }
    
    # Simulate random delay (VM creation simulation)
    await asyncio.sleep(random.uniform(0.1, 0.5))
    
    return {
        "success": True,
        "customer": new_customer,
        "king_mouse": king_mouse,
        "qr_code_url": f"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9aw=="
    }

@app.get("/api/v1/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Get customer details"""
    if customer_id not in customers:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customers[customer_id]

@app.get("/api/v1/customers/{customer_id}/king-mouse")
async def get_king_mouse_status(customer_id: str):
    """Get King Mouse bot status"""
    if customer_id not in customers:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = customers[customer_id]
    bot_username = f"{customer['company_name'].lower().replace(' ', '_')}_king_mouse_bot"
    
    return {
        "status": "active",
        "bot_username": bot_username,
        "bot_link": f"https://t.me/{bot_username}",
        "qr_code_url": f"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9aw==",
        "total_interactions": random.randint(0, 100)
    }

@app.post("/api/v1/customers/{customer_id}/message")
async def send_message(customer_id: str, request: MessageRequest):
    """Send message to King Mouse AI"""
    if customer_id not in customers:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    message = request.message.lower()
    
    # Simple keyword matching (rule-based AI)
    response = "I'm here to help! What do you need?"
    action = None
    employee_deployed = None
    vm_id = None
    
    if any(word in message for word in ["website", "web", "site", "landing page"]):
        response = "I'll deploy a web developer for you right away! They'll start building your website."
        action = "deploy_employee"
        employee_deployed = f"emp_{uuid.uuid4().hex[:12]}"
        vm_id = f"vm_{uuid.uuid4().hex[:12]}"
    elif any(word in message for word in ["social media", "instagram", "facebook", "marketing"]):
        response = "I'll deploy a social media manager to handle your marketing!"
        action = "deploy_employee"
        employee_deployed = f"emp_{uuid.uuid4().hex[:12]}"
        vm_id = f"vm_{uuid.uuid4().hex[:12]}"
    elif any(word in message for word in ["sales", "leads", "prospecting"]):
        response = "I'll deploy a sales rep to find new leads for your business!"
        action = "deploy_employee"
        employee_deployed = f"emp_{uuid.uuid4().hex[:12]}"
        vm_id = f"vm_{uuid.uuid4().hex[:12]}"
    elif any(word in message for word in ["bookkeeping", "accounting", "books"]):
        response = "I'll deploy a bookkeeper to organize your finances!"
        action = "deploy_employee"
        employee_deployed = f"emp_{uuid.uuid4().hex[:12]}"
        vm_id = f"vm_{uuid.uuid4().hex[:12]}"
    
    # Log chat
    chat_logs.append({
        "customer_id": customer_id,
        "message": request.message,
        "response": response,
        "action_taken": action,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    result = {
        "success": True,
        "response": response,
        "actions": [action] if action else []
    }
    
    if employee_deployed:
        result["employee_deployed"] = employee_deployed
        result["vm_id"] = vm_id
        
        # Store the employee and VM
        employees[employee_deployed] = {
            "id": employee_deployed,
            "customer_id": customer_id,
            "name": "Alex",
            "role": "Web Developer" if "website" in message else "Assistant",
            "status": "deploying",
            "vm_id": vm_id,
            "current_task": "Just deployed",
            "created_at": datetime.utcnow().isoformat(),
            "started_at": datetime.utcnow().isoformat()
        }
        
        vms[vm_id] = {
            "id": vm_id,
            "employee_id": employee_deployed,
            "customer_id": customer_id,
            "status": "running",
            "url": f"https://vm.orgo.com/{vm_id}",
            "ram": 4,
            "cpu": 2,
            "os": "linux"
        }
    
    return result

@app.get("/api/v1/customers/{customer_id}/vms")
async def list_vms(customer_id: str):
    """List all VMs for a customer"""
    if customer_id not in customers:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer_vms = [
        {
            "id": vm["id"],
            "employee_id": vm["employee_id"],
            "employee_name": employees.get(vm["employee_id"], {}).get("name", "Unknown"),
            "role": employees.get(vm["employee_id"], {}).get("role", "Unknown"),
            "status": "active",
            "url": vm["url"],
            "vm_status": vm["status"],
            "current_task": employees.get(vm["employee_id"], {}).get("current_task", "Idle")
        }
        for vm in vms.values()
        if vm.get("customer_id") == customer_id
    ]
    
    return {"vms": customer_vms}

@app.post("/api/v1/customers/{customer_id}/vms")
async def deploy_vm(customer_id: str, request: VMDeployRequest):
    """Deploy a new AI employee VM"""
    if customer_id not in customers:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = customers[customer_id]
    
    # Check plan limits
    customer_vms = [v for v in vms.values() if v.get("customer_id") == customer_id]
    plan_limits = {"starter": 2, "growth": 5, "enterprise": 20}
    if len(customer_vms) >= plan_limits.get(customer["plan_tier"], 2):
        raise HTTPException(status_code=403, detail="VM limit reached for plan")
    
    employee_id = f"emp_{uuid.uuid4().hex[:12]}"
    vm_id = f"vm_{uuid.uuid4().hex[:12]}"
    
    # Simulate deployment delay
    await asyncio.sleep(random.uniform(0.5, 1.5))
    
    employee = {
        "id": employee_id,
        "customer_id": customer_id,
        "name": request.name,
        "role": request.role,
        "status": "deploying",  # BUG: Should be "active" after deployment
        "vm_id": vm_id,
        "current_task": request.task_description,
        "created_at": datetime.utcnow().isoformat(),
        "started_at": datetime.utcnow().isoformat()
    }
    
    vm = {
        "id": vm_id,
        "employee_id": employee_id,
        "customer_id": customer_id,
        "url": f"https://vm.orgo.com/{vm_id}",
        "status": "running",
        "ram": 4,
        "cpu": 2,
        "os": "linux"
    }
    
    employees[employee_id] = employee
    vms[vm_id] = vm
    
    # BUG: MEDIUM-2 - Returns employee before status update
    return {
        "success": True,
        "vm": vm,
        "employee": employee
    }

@app.get("/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot")
async def get_screenshot(customer_id: str, vm_id: str):
    """Get VM screenshot - BUG: CRITICAL-2 - No customer ownership verification!"""
    
    # BUG: CRITICAL-2 - No verification that customer owns this VM!
    # This allows any customer to view any VM's screenshot
    
    if vm_id not in vms:
        raise HTTPException(status_code=404, detail="VM not found")
    
    # Generate fake screenshot (1x1 pixel PNG)
    fake_screenshot = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9aw=="
    
    return {
        "screenshot_base64": fake_screenshot,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/webhooks/stripe")
async def stripe_webhook(payload: dict):
    """Stripe webhook - BUG: CRITICAL-1 - No signature validation!"""
    
    # BUG: CRITICAL-1 - Signature is NOT validated!
    # Anyone can send fake webhook requests
    
    event_type = payload.get("type")
    
    if event_type == "customer.subscription.created":
        pass  # Activate customer
    elif event_type == "invoice.payment_succeeded":
        pass  # Log revenue
    elif event_type == "invoice.payment_failed":
        pass  # Mark past due
    elif event_type == "customer.subscription.deleted":
        pass  # Deactivate customer
    
    return {"received": True}

@app.post("/webhooks/telegram")
async def telegram_webhook(update: dict):
    """Telegram webhook - BUG: HIGH-4 - No secret validation!"""
    
    # BUG: HIGH-4 - No secret token validation
    # Anyone can POST fake Telegram updates
    
    return {"ok": True}

@app.websocket("/ws/vms/{customer_id}/{vm_id}")
async def vm_websocket(websocket, customer_id: str, vm_id: str):
    """WebSocket for VM streaming - BUG: CRITICAL-3 - No auth!"""
    
    # BUG: CRITICAL-3 - No WebSocket authentication!
    # Anyone can connect to any VM stream
    
    await websocket.accept()
    
    try:
        while True:
            # Send fake screenshot every second
            fake_screenshot = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9aw=="
            await websocket.send_json({
                "type": "screenshot",
                "data": fake_screenshot,
                "timestamp": datetime.utcnow().isoformat()
            })
            await asyncio.sleep(1)
    except:
        pass  # Client disconnected

# Error handlers that leak internal info - BUG: HIGH-5
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return {"detail": str(exc)}  # Leaks internal error details

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Mock Mouse Platform API Server...")
    print("📍 URL: http://localhost:8000")
    print("📖 Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
