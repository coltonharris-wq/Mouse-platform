"""
Mouse Platform API - Complete Integration
Production-ready API with all security fixes and features
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import asyncio
import os
import stripe
import secrets
from datetime import datetime

# Import our modules
try:
    from orchestrator import MousePlatform
    from supabase_client import SupabaseClient
    from orgo_client import OrgoClient
    from telegram_bot import TelegramBot
    from token_pricing import TokenPricingConfig, TOKEN_PACKAGES
    from stripe_webhook_handler import StripeWebhookHandler
    from rate_limiter import RateLimiter
    MODULES_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Some modules not available: {e}")
    MODULES_AVAILABLE = False

# Initialize FastAPI app
app = FastAPI(
    title="Mouse Platform API",
    version="3.0.0-complete",
    description="OpenClaw-as-a-Service Platform - Deploy AI employees in isolated VMs"
)

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# Security: CORS configuration
if IS_PRODUCTION:
    allowed_origins = os.getenv(
        "ALLOWED_ORIGINS", 
        "https://app.mouseplatform.com,https://admin.mouseplatform.com"
    ).split(",")
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Idempotency-Key", "X-Request-ID"],
)

# Initialize services
if MODULES_AVAILABLE:
    platform = MousePlatform()
    supabase = SupabaseClient()
    orgo = OrgoClient(api_key=os.getenv("ORGO_API_KEY"))
    telegram = TelegramBot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
    stripe_handler = StripeWebhookHandler(supabase)
    rate_limiter = RateLimiter()
else:
    platform = None
    supabase = None
    orgo = None
    telegram = None
    stripe_handler = None
    rate_limiter = None

# Stripe setup
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Security: Bearer token authentication
security = HTTPBearer(auto_error=False)

# ============================================================================
# Pydantic Models
# ============================================================================

class CustomerCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=100)
    email: str
    plan: str = Field(default="starter")
    reseller_id: Optional[str] = Field(default=None, max_length=50)

class MessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    employee_id: Optional[str] = None

class EmployeeDeployRequest(BaseModel):
    role: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=50)
    task_description: str = Field(..., min_length=10, max_length=2000)
    vm_spec: Optional[Dict[str, Any]] = None

class TokenPurchaseRequest(BaseModel):
    package_slug: str
    success_url: str
    cancel_url: str

class TokenUseRequest(BaseModel):
    amount: int = Field(..., gt=0, le=10000)
    description: str = Field(..., min_length=5, max_length=200)
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None

class VMCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    ram: int = Field(default=4, ge=2, le=64)
    cpu: int = Field(default=2, ge=1, le=16)
    role: Optional[str] = None

# ============================================================================
# Authentication
# ============================================================================

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify API key from Authorization header"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    api_key = credentials.credentials
    expected_key = os.getenv("API_SECRET_KEY")
    
    if not expected_key:
        if not IS_PRODUCTION:
            return {"role": "admin", "id": "dev_user"}
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API key not configured"
        )
    
    if not secrets.compare_digest(api_key, expected_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"role": "admin", "id": "api_user"}

# ============================================================================
# Connection Manager for WebSockets
# ============================================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            if websocket in self.active_connections[client_id]:
                self.active_connections[client_id].remove(websocket)
    
    async def broadcast(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[client_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.append(connection)
            for conn in disconnected:
                self.active_connections[client_id].remove(conn)

manager = ConnectionManager()

# ============================================================================
# Startup and Shutdown Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    print(f"🚀 Mouse Platform API v3.0.0 starting in {ENVIRONMENT} mode")
    if platform:
        print("✅ Platform orchestrator initialized")
    if supabase:
        print("✅ Supabase client initialized")
    if orgo:
        print("✅ Orgo client initialized")

@app.on_event("shutdown")
async def shutdown_event():
    print("👋 Mouse Platform API shutting down")

# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "3.0.0-complete",
        "environment": ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "platform": platform is not None,
            "supabase": supabase is not None,
            "orgo": orgo is not None,
            "telegram": telegram is not None,
        }
    }

@app.get("/")
async def root():
    return {
        "name": "Mouse Platform API",
        "version": "3.0.0-complete",
        "description": "OpenClaw-as-a-Service Platform",
        "docs": "/docs",
        "health": "/health"
    }

# ============================================================================
# Customer Endpoints
# ============================================================================

@app.post("/api/v1/customers")
async def create_customer(
    data: CustomerCreate,
    background_tasks: BackgroundTasks,
    user: Dict = Depends(verify_api_key)
):
    """Create a new customer with King Mouse AI bot"""
    try:
        if not platform:
            raise HTTPException(status_code=503, detail="Platform service not available")
        
        result = await platform.onboard_customer(data.dict())
        
        return {
            "success": True,
            "customer": result,
            "message": "Customer created successfully. King Mouse bot is ready."
        }
    except Exception as e:
        print(f"[CreateCustomer] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}")
async def get_customer(customer_id: str, user: Dict = Depends(verify_api_key)):
    """Get customer details"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        customer = await supabase.get_customer(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        return {"success": True, "customer": customer}
    except Exception as e:
        print(f"[GetCustomer] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/king-mouse")
async def get_king_mouse_status(customer_id: str, user: Dict = Depends(verify_api_key)):
    """Get King Mouse bot status"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        customer = await supabase.get_customer(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        bot_info = customer.get("king_mouse_bot", {})
        
        return {
            "success": True,
            "customer_id": customer_id,
            "bot": {
                "status": bot_info.get("status", "unknown"),
                "username": bot_info.get("username"),
                "qr_code": bot_info.get("qr_code"),
                "created_at": bot_info.get("created_at"),
            }
        }
    except Exception as e:
        print(f"[KingMouseStatus] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Messaging Endpoints
# ============================================================================

@app.post("/api/v1/customers/{customer_id}/message")
async def send_message(
    customer_id: str,
    data: MessageRequest,
    user: Dict = Depends(verify_api_key)
):
    """Send a message to customer's King Mouse bot"""
    try:
        if not platform:
            raise HTTPException(status_code=503, detail="Platform service not available")
        
        response = await platform.handle_message(
            customer_id=customer_id,
            message=data.message,
            employee_id=data.employee_id
        )
        
        return {
            "success": True,
            "response": response,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"[SendMessage] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Employee/VM Endpoints
# ============================================================================

@app.post("/api/v1/customers/{customer_id}/employees")
async def deploy_employee(
    customer_id: str,
    data: EmployeeDeployRequest,
    user: Dict = Depends(verify_api_key)
):
    """Deploy an AI employee for a customer"""
    try:
        if not platform:
            raise HTTPException(status_code=503, detail="Platform service not available")
        
        result = await platform.deploy_employee(
            customer_id=customer_id,
            role=data.role,
            name=data.name,
            task_description=data.task_description,
            vm_spec=data.vm_spec
        )
        
        return {
            "success": True,
            "employee": result,
            "message": f"AI employee '{data.name}' deployed successfully"
        }
    except Exception as e:
        print(f"[DeployEmployee] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/employees")
async def list_employees(customer_id: str, user: Dict = Depends(verify_api_key)):
    """List all AI employees for a customer"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        employees = await supabase.get_employees_by_customer(customer_id)
        
        return {
            "success": True,
            "employees": employees or [],
            "count": len(employees) if employees else 0
        }
    except Exception as e:
        print(f"[ListEmployees] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/employees/{employee_id}")
async def get_employee(customer_id: str, employee_id: str, user: Dict = Depends(verify_api_key)):
    """Get details of a specific AI employee"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        employee = await supabase.get_employee(employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        if employee.get("customer_id") != customer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {"success": True, "employee": employee}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[GetEmployee] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/customers/{customer_id}/vms")
async def create_vm(
    customer_id: str,
    data: VMCreateRequest,
    user: Dict = Depends(verify_api_key)
):
    """Create a new VM for a customer"""
    try:
        if not platform:
            raise HTTPException(status_code=503, detail="Platform service not available")
        
        result = await platform.create_vm(
            customer_id=customer_id,
            name=data.name,
            ram=data.ram,
            cpu=data.cpu,
            role=data.role
        )
        
        return {
            "success": True,
            "vm": result,
            "message": f"VM '{data.name}' created successfully"
        }
    except Exception as e:
        print(f"[CreateVM] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/vms")
async def list_vms(customer_id: str, user: Dict = Depends(verify_api_key)):
    """List all VMs for a customer"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        vms = await supabase.get_vms_by_customer(customer_id)
        
        return {
            "success": True,
            "vms": vms or [],
            "count": len(vms) if vms else 0
        }
    except Exception as e:
        print(f"[ListVMs] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/vms/{vm_id}")
async def get_vm(customer_id: str, vm_id: str, user: Dict = Depends(verify_api_key)):
    """Get details of a specific VM"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        vm = await supabase.get_vm(vm_id)
        if not vm:
            raise HTTPException(status_code=404, detail="VM not found")
        
        if vm.get("customer_id") != customer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {"success": True, "vm": vm}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[GetVM] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot")
async def get_screenshot(customer_id: str, vm_id: str, user: Dict = Depends(verify_api_key)):
    """Get a screenshot from a VM (with ownership verification)"""
    try:
        if not orgo or not supabase:
            raise HTTPException(status_code=503, detail="Service not available")
        
        # SECURITY: Verify VM ownership
        employee = await supabase.get_employee_by_vm(vm_id)
        if not employee:
            raise HTTPException(status_code=404, detail="VM not found")
        
        if employee.get("customer_id") != customer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        screenshot = await orgo.get_screenshot(vm_id)
        
        return {
            "success": True,
            "screenshot": screenshot,
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Screenshot] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# WebSocket for Live VM Streaming
# ============================================================================

@app.websocket("/ws/vms/{customer_id}/{vm_id}")
async def vm_websocket(websocket: WebSocket, customer_id: str, vm_id: str):
    """WebSocket endpoint for live VM screenshot streaming"""
    try:
        # SECURITY: Verify VM ownership
        if supabase:
            employee = await supabase.get_employee_by_vm(vm_id)
            if not employee:
                await websocket.close(code=4004, reason="VM not found")
                return
            
            if employee.get("customer_id") != customer_id:
                await websocket.close(code=4001, reason="Unauthorized")
                return
        
        client_id = f"{customer_id}:{vm_id}"
        await manager.connect(websocket, client_id)
        
        try:
            while True:
                if orgo:
                    try:
                        screenshot_data = await orgo.get_screenshot(vm_id)
                        await manager.broadcast({
                            "type": "screenshot",
                            "data": screenshot_data,
                            "timestamp": datetime.utcnow().isoformat()
                        }, client_id)
                    except Exception as e:
                        await manager.broadcast({
                            "type": "error",
                            "message": f"Failed to get screenshot: {str(e)}"
                        }, client_id)
                
                await asyncio.sleep(3)
        
        except WebSocketDisconnect:
            manager.disconnect(websocket, client_id)
    
    except Exception as e:
        print(f"[WebSocket] Error: {e}")
        try:
            await websocket.close(code=4000, reason="Internal error")
        except:
            pass

# ============================================================================
# Token Management Endpoints
# ============================================================================

@app.get("/api/v1/customers/{customer_id}/tokens/balance")
async def get_token_balance(customer_id: str, user: Dict = Depends(verify_api_key)):
    """Get customer's token balance"""
    try:
        if not platform:
            raise HTTPException(status_code=503, detail="Platform service not available")
        
        balance = await platform.get_token_balance(customer_id)
        
        return {
            "success": True,
            "customer_id": customer_id,
            "balance": balance
        }
    except Exception as e:
        print(f"[TokenBalance] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/customers/{customer_id}/tokens/purchase")
async def purchase_tokens(
    customer_id: str,
    data: TokenPurchaseRequest,
    user: Dict = Depends(verify_api_key)
):
    """Create a checkout session for token purchase"""
    try:
        if not platform:
            raise HTTPException(status_code=503, detail="Platform service not available")
        
        result = await platform.create_token_purchase(
            customer_id=customer_id,
            package_slug=data.package_slug,
            success_url=data.success_url,
            cancel_url=data.cancel_url
        )
        
        return {
            "success": True,
            "checkout_url": result["url"],
            "session_id": result["session_id"]
        }
    except Exception as e:
        print(f"[TokenPurchase] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/customers/{customer_id}/tokens/use")
async def use_tokens(
    customer_id: str,
    data: TokenUseRequest,
    user: Dict = Depends(verify_api_key)
):
    """Use tokens from customer's balance"""
    try:
        if not platform:
            raise HTTPException(status_code=503, detail="Platform service not available")
        
        result = await platform.use_tokens(
            customer_id=customer_id,
            amount=data.amount,
            description=data.description,
            reference_id=data.reference_id,
            reference_type=data.reference_type
        )
        
        return {
            "success": True,
            "transaction": result,
            "message": f"{data.amount} tokens used successfully"
        }
    except Exception as e:
        print(f"[UseTokens] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/tokens/transactions")
async def list_token_transactions(
    customer_id: str,
    limit: int = 50,
    offset: int = 0,
    user: Dict = Depends(verify_api_key)
):
    """List token transactions for a customer"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        transactions = await supabase.get_token_transactions(
            customer_id=customer_id,
            limit=limit,
            offset=offset
        )
        
        return {
            "success": True,
            "transactions": transactions or [],
            "count": len(transactions) if transactions else 0
        }
    except Exception as e:
        print(f"[TokenTransactions] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Webhook Endpoints
# ============================================================================

@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks with signature verification"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if not STRIPE_WEBHOOK_SECRET:
            raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        # Verify webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        if stripe_handler:
            await stripe_handler.handle_event(event)
        
        return {"success": True, "event": event["type"]}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[StripeWebhook] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhooks/telegram")
async def telegram_webhook(request: Request):
    """Handle incoming Telegram messages"""
    try:
        # Validate secret token if configured
        secret_token = os.getenv("TELEGRAM_WEBHOOK_SECRET")
        if secret_token:
            header_token = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
            if header_token != secret_token:
                return {"ok": False, "error": "Unauthorized"}
        
        data = await request.json()
        
        if telegram:
            response = await telegram.handle_update(data)
            return response
        
        return {"ok": True}
    except Exception as e:
        print(f"[TelegramWebhook] Error: {e}")
        return {"ok": False, "error": str(e)}

# ============================================================================
# Admin Endpoints
# ============================================================================

@app.get("/api/v1/admin/customers")
async def list_all_customers(
    limit: int = 100,
    offset: int = 0,
    user: Dict = Depends(verify_api_key)
):
    """List all customers (admin only)"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        customers = await supabase.list_customers(limit=limit, offset=offset)
        
        return {
            "success": True,
            "customers": customers or [],
            "count": len(customers) if customers else 0
        }
    except Exception as e:
        print(f"[ListAllCustomers] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/admin/stats")
async def get_platform_stats(user: Dict = Depends(verify_api_key)):
    """Get platform statistics (admin only)"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        stats = await supabase.get_platform_stats()
        
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        print(f"[PlatformStats] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
