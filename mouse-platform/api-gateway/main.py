from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import asyncio
import os
import stripe
from datetime import datetime

# Import our modules
from orchestrator import MousePlatform
from supabase_client import SupabaseClient
from orgo_client import OrgoClient
from telegram_bot import TelegramBot
from token_pricing import TokenPricingConfig
from stripe_webhook_handler import StripeWebhookHandler
from async_queue import payment_queue, background_queue, TaskPriority
from cache_manager import vm_status_cache, screenshot_cache, general_cache

app = FastAPI(title="Mouse Platform API", version="2.1.0-performance")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
platform = MousePlatform()
supabase = SupabaseClient()
orgo = OrgoClient(api_key=os.getenv("ORGO_API_KEY"))
telegram = TelegramBot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
stripe_handler = StripeWebhookHandler(supabase)

# Stripe setup
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Connection managers
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
            self.active_connections[client_id].remove(websocket)

    async def broadcast(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                await connection.send_json(message)

manager = ConnectionManager()

# Pydantic Models
class CustomerCreate(BaseModel):
    company_name: str
    email: str
    plan: str = "token_based"  # Deprecated, kept for compatibility
    reseller_id: Optional[str] = None

class MessageRequest(BaseModel):
    message: str
    employee_id: Optional[str] = None

class EmployeeDeployRequest(BaseModel):
    role: str
    name: str
    task_description: str

class TokenPurchaseRequest(BaseModel):
    package_slug: str
    success_url: str
    cancel_url: str

class TokenUseRequest(BaseModel):
    amount: int
    description: str
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None

class TokenCreditRequest(BaseModel):
    amount: int
    description: str
    transaction_type: str = "adjustment"
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None

# Startup and Shutdown Events
@app.on_event("startup")
async def startup_event():
    """Initialize caches and queues on startup"""
    print("[Startup] Initializing performance optimizations...")
    
    # Start caches
    await vm_status_cache.start()
    await screenshot_cache.start()
    await general_cache.start()
    
    # Start queues
    await payment_queue.start()
    await background_queue.start()
    
    # Register webhook handler with queue
    async def process_stripe_event(payload):
        await stripe_handler.process_queued_event(payload)
    
    # Register handlers for all stripe event types
    stripe_events = [
        "stripe_checkout.session.completed",
        "stripe_checkout.session.expired",
        "stripe_payment_intent.succeeded",
        "stripe_payment_intent.payment_failed",
        "stripe_charge.succeeded",
        "stripe_charge.failed",
        "stripe_charge.refunded",
        "stripe_refund.created",
        "stripe_customer.created",
        "stripe_customer.deleted"
    ]
    for event_type in stripe_events:
        payment_queue.register_handler(event_type, process_stripe_event)
    
    print("[Startup] Performance optimizations initialized!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("[Shutdown] Cleaning up...")
    
    # Stop caches
    await vm_status_cache.stop()
    await screenshot_cache.stop()
    await general_cache.stop()
    
    # Stop queues
    await payment_queue.stop()
    await background_queue.stop()
    
    # Close HTTP client
    await orgo.close()
    
    print("[Shutdown] Cleanup complete!")

# Health Check
@app.get("/health")
async def health_check():
    """Enhanced health check with performance metrics"""
    return {
        "status": "healthy",
        "version": "2.1.0-performance",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "supabase": supabase.health(),
            "orgo": orgo.health(),
            "telegram": telegram.health()
        },
        "performance": {
            "caches": {
                "vm_status": vm_status_cache.get_stats(),
                "screenshots": screenshot_cache.get_stats(),
                "general": general_cache.get_stats()
            },
            "queues": {
                "payment": payment_queue.get_metrics(),
                "background": background_queue.get_metrics()
            }
        }
    }

# ============================================
# CUSTOMER ROUTES
# ============================================

@app.post("/api/v1/customers")
async def create_customer(customer: CustomerCreate):
    """Create a new customer and set up their King Mouse"""
    try:
        result = await platform.onboard_customer(customer.dict())
        return {
            "success": True,
            "customer": result["customer"],
            "king_mouse": result["king_mouse"],
            "qr_code_url": result["qr_code_url"],
            "token_balance": result.get("token_balance", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Get customer details"""
    customer = await supabase.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@app.get("/api/v1/customers/{customer_id}/dashboard")
async def get_customer_dashboard(customer_id: str):
    """Get complete dashboard data for customer including tokens, employees, and transactions - OPTIMIZED"""
    try:
        dashboard = await platform.get_customer_dashboard(customer_id)
        return dashboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/king-mouse")
async def get_king_mouse_status(customer_id: str):
    """Get King Mouse bot status - OPTIMIZED with caching"""
    try:
        status = await platform.get_king_mouse_status(customer_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# MESSAGING ROUTES
# ============================================

@app.post("/api/v1/customers/{customer_id}/message")
async def send_message(customer_id: str, request: MessageRequest):
    """Send message to customer's King Mouse"""
    try:
        response = await platform.handle_message(customer_id, request.message)
        return {
            "success": True,
            "response": response["message"],
            "actions": response.get("actions", []),
            "employee_deployed": response.get("employee_id"),
            "token_balance": response.get("token_balance", 0),
            "needs_tokens": response.get("needs_tokens", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# VM/EMPLOYEE ROUTES - OPTIMIZED
# ============================================

@app.get("/api/v1/customers/{customer_id}/vms")
async def list_vms(customer_id: str, fast: bool = True):
    """List all VMs for a customer - OPTIMIZED with concurrent fetching"""
    try:
        if fast:
            vms = await platform.list_customer_vms_fast(customer_id)
        else:
            vms = await platform.list_customer_vms(customer_id)
        return {"vms": vms, "count": len(vms)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/customers/{customer_id}/vms")
async def deploy_vm(customer_id: str, request: EmployeeDeployRequest):
    """Deploy a new AI employee VM"""
    try:
        result = await platform.deploy_employee(
            customer_id=customer_id,
            role=request.role,
            name=request.name,
            task=request.task_description
        )
        return {
            "success": True,
            "vm": result["vm"],
            "employee": result["employee"],
            "estimated_token_cost": result.get("estimated_token_cost", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot")
async def get_screenshot(customer_id: str, vm_id: str, quality: str = "medium"):
    """Get current VM screenshot - OPTIMIZED with caching and compression"""
    try:
        # Verify customer owns this VM
        employee = await supabase.get_employee_by_vm(vm_id)
        if not employee or employee["customer_id"] != customer_id:
            raise HTTPException(status_code=403, detail="Access denied - VM not found or unauthorized")
        
        result = await platform.stream_vm(customer_id, vm_id, quality=quality)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/customers/{customer_id}/vms/{vm_id}")
async def stop_vm(customer_id: str, vm_id: str):
    """Stop and delete a VM"""
    try:
        # Verify customer owns this VM
        employee = await supabase.get_employee_by_vm(vm_id)
        if not employee or employee["customer_id"] != customer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        await orgo.stop_computer(vm_id)
        await orgo.delete_computer(vm_id)
        await supabase.update_employee(employee["id"], {"status": "stopped", "vm_id": None})
        
        return {"success": True, "message": "VM stopped and deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# TOKEN PRICING ROUTES
# ============================================

@app.get("/api/v1/token-packages")
async def get_token_packages():
    """Get all available token packages"""
    try:
        packages = TokenPricingConfig.get_all_packages()
        return {
            "packages": [
                {
                    "slug": p.slug,
                    "name": p.name,
                    "price_cents": p.price_cents,
                    "price": p.display_price,
                    "price_per_1000": f"${p.price_per_1000_tokens:.2f}",
                    "token_amount": p.token_amount,
                    "bonus_tokens": getattr(p, 'bonus_tokens', 0),
                    "total_tokens": p.total_tokens,
                    "estimated_hours": getattr(p, 'estimated_hours', int(p.total_tokens / 100)),
                    "description": p.description,
                    "features": p.features,
                    "popular": p.slug == "growth"
                }
                for p in packages
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/tokens")
async def get_token_balance(customer_id: str):
    """Get customer's token balance and stats"""
    try:
        balance = await supabase.get_token_balance(customer_id)
        transactions = await supabase.get_token_transactions(customer_id, limit=10)
        
        current_balance = balance.get("balance", 0) if balance else 0
        
        return {
            "balance": current_balance,
            "lifetime_earned": balance.get("lifetime_earned", 0) if balance else 0,
            "lifetime_spent": balance.get("lifetime_spent", 0) if balance else 0,
            "last_updated": balance.get("last_updated") if balance else None,
            "is_low_balance": TokenPricingConfig.is_low_balance(current_balance),
            "low_balance_threshold": TokenPricingConfig.LOW_BALANCE_THRESHOLD,
            "recent_transactions": transactions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/tokens/transactions")
async def get_token_transactions(customer_id: str, limit: int = 50, offset: int = 0):
    """Get customer's token transaction history with pagination"""
    try:
        transactions = await supabase.get_token_transactions(customer_id, limit=limit)
        
        # Calculate usage stats
        usage_stats = {
            "total_purchases": sum(1 for t in transactions if t.get("type") == "purchase"),
            "total_usage": sum(1 for t in transactions if t.get("type") == "usage"),
            "total_bonus": sum(1 for t in transactions if t.get("type") == "bonus"),
        }
        
        return {
            "transactions": transactions,
            "stats": usage_stats,
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/customers/{customer_id}/tokens/purchase")
async def create_token_purchase(customer_id: str, request: TokenPurchaseRequest):
    """Create a Stripe checkout session for token purchase"""
    try:
        result = await platform.create_token_checkout_session(
            customer_id=customer_id,
            package_slug=request.package_slug,
            success_url=request.success_url,
            cancel_url=request.cancel_url
        )
        return {
            "success": True,
            "checkout_url": result["checkout_url"],
            "session_id": result["session_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/customers/{customer_id}/tokens/orders")
async def get_token_orders(customer_id: str):
    """Get customer's token purchase history"""
    try:
        orders = await supabase.get_customer_token_orders(customer_id)
        return {
            "orders": orders,
            "summary": {
                "total_orders": len(orders),
                "completed_orders": sum(1 for o in orders if o.get("status") == "completed"),
                "total_spent_cents": sum(o.get("price_cents", 0) for o in orders if o.get("status") == "completed"),
                "total_tokens_purchased": sum(o.get("token_amount", 0) for o in orders if o.get("status") == "completed")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/customers/{customer_id}/tokens/use")
async def use_tokens(customer_id: str, request: TokenUseRequest):
    """Use/deduct tokens from customer balance"""
    try:
        result = await supabase.use_tokens(
            customer_id=customer_id,
            amount=request.amount,
            description=request.description,
            reference_id=request.reference_id,
            reference_type=request.reference_type
        )
        
        if result and result[0].get("success"):
            return {
                "success": True,
                "transaction_id": result[0].get("transaction_id"),
                "new_balance": result[0].get("new_balance"),
                "amount_used": request.amount
            }
        else:
            error_msg = result[0].get("error", "Insufficient tokens") if result else "Transaction failed"
            current_balance = result[0].get("new_balance") if result else 0
            raise HTTPException(
                status_code=402,  # Payment Required
                detail={
                    "error": error_msg,
                    "required": request.amount,
                    "current_balance": current_balance,
                    "shortfall": request.amount - current_balance
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/customers/{customer_id}/tokens/credit")
async def credit_tokens(customer_id: str, request: TokenCreditRequest):
    """Credit tokens to customer (admin/manual use only)"""
    try:
        transaction_id = await supabase.credit_tokens(
            customer_id=customer_id,
            amount=request.amount,
            description=request.description,
            transaction_type=request.transaction_type,
            reference_id=request.reference_id,
            reference_type=request.reference_type
        )
        
        # Get updated balance
        balance = await supabase.get_token_balance(customer_id)
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "amount_credited": request.amount,
            "new_balance": balance.get("balance", 0) if balance else request.amount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/token-rates")
async def get_token_rates():
    """Get token usage rates"""
    try:
        rates = TokenPricingConfig.get_all_rates()
        return {
            "rates": [
                {
                    "action_type": r.action_type,
                    "tokens": r.tokens,
                    "description": r.description
                }
                for r in rates
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/token-calculator")
async def calculate_token_cost(
    vm_hours: Optional[float] = None,
    messages: Optional[int] = None,
    employees: Optional[int] = None,
    emails: Optional[int] = None,
    api_calls: Optional[int] = None
):
    """Calculate estimated token cost for usage"""
    try:
        costs = {}
        total = 0
        
        if vm_hours:
            costs["vm_runtime"] = {
                "hours": vm_hours,
                "tokens": TokenPricingConfig.calculate_vm_cost(vm_hours),
                "rate": "500 tokens/hour"
            }
            total += costs["vm_runtime"]["tokens"]
        
        if messages:
            costs["messages"] = {
                "count": messages,
                "tokens": TokenPricingConfig.calculate_message_cost(messages),
                "rate": "10 tokens/message"
            }
            total += costs["messages"]["tokens"]
        
        if employees:
            costs["employees"] = {
                "count": employees,
                "tokens": TokenPricingConfig.calculate_deploy_cost(employees),
                "rate": "100 tokens/deployment"
            }
            total += costs["employees"]["tokens"]
        
        if emails:
            costs["emails"] = {
                "count": emails,
                "tokens": TokenPricingConfig.calculate_email_cost(emails),
                "rate": "5 tokens/email"
            }
            total += costs["emails"]["tokens"]
        
        if api_calls:
            costs["api_calls"] = {
                "count": api_calls,
                "tokens": TokenPricingConfig.calculate_api_cost(api_calls),
                "rate": "1 token/call"
            }
            total += costs["api_calls"]["tokens"]
        
        return {
            "costs": costs,
            "total_tokens": total,
            "estimated_hours": total / 100,  # Rough estimate: 100 tokens = 1 hour of work
            "packages_needed": {
                "starter": max(1, (total + 3999) // 4000),
                "growth": max(1, (total + 11999) // 12000),
                "pro": max(1, (total + 29999) // 30000)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# WEBSOCKET FOR LIVE VM STREAMING - OPTIMIZED
# ============================================

@app.websocket("/ws/vms/{customer_id}/{vm_id}")
async def vm_websocket(websocket: WebSocket, customer_id: str, vm_id: str):
    """WebSocket for real-time VM screenshot streaming - OPTIMIZED with caching"""
    # Verify customer owns this VM before accepting connection
    employee = await supabase.get_employee_by_vm(vm_id)
    if not employee or employee["customer_id"] != customer_id:
        await websocket.close(code=4001, reason="Access denied")
        return
    
    client_id = f"{customer_id}:{vm_id}"
    await manager.connect(websocket, client_id)
    
    try:
        screenshot_count = 0
        while True:
            # Get screenshot every 2 seconds (reduced from 3 for smoother experience)
            # Use cache for most requests, fresh every 3rd request
            use_cache = screenshot_count % 3 != 0
            
            screenshot = await orgo.get_screenshot(vm_id, use_cache=use_cache)
            
            await manager.broadcast({
                "type": "screenshot",
                "data": screenshot,
                "timestamp": datetime.utcnow().isoformat(),
                "cached": use_cache
            }, client_id)
            
            screenshot_count += 1
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
        manager.disconnect(websocket, client_id)

# ============================================
# WEBHOOK ROUTES - OPTIMIZED WITH QUEUE
# ============================================

@app.post("/webhooks/telegram")
async def telegram_webhook(update: dict):
    """Handle incoming Telegram messages"""
    try:
        if "message" in update:
            message = update["message"]
            chat_id = message["chat"]["id"]
            text = message.get("text", "")
            
            # Find customer by Telegram chat ID
            customer = await supabase.get_customer_by_telegram_chat(chat_id)
            if customer:
                response = await platform.handle_message(customer["id"], text)
                await telegram.send_message(chat_id, response["message"])
        
        return {"ok": True}
    except Exception as e:
        print(f"Telegram webhook error: {e}")
        return {"ok": False}

@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks with signature verification - OPTIMIZED with async queue"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing stripe-signature header")
        
        # Verify webhook signature and construct event
        try:
            event = stripe_handler.construct_event(payload, sig_header)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Handle the event (queued for async processing)
        result = await stripe_handler.handle_event(event)
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stripe webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# DEMO ROUTES
# ============================================

@app.post("/api/v1/demo/run")
async def run_demo():
    """Run the full Clean Eats demo"""
    try:
        result = await platform.run_demo()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/demo/cleanup")
async def cleanup_demo():
    """Remove all demo data"""
    try:
        await platform.cleanup_demo()
        return {"success": True, "message": "Demo data cleaned up"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ADMIN ROUTES - OPTIMIZED
# ============================================

@app.get("/admin/vms/status")
async def get_all_vm_status(use_cache: bool = True):
    """Get status of all VMs (admin only) - OPTIMIZED with caching"""
    try:
        status = await orgo.list_all_vms(use_cache=use_cache)
        return {
            "vms": status,
            "count": len(status),
            "cached": use_cache
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/tokens/overview")
async def get_token_overview():
    """Get platform-wide token stats (admin only)"""
    try:
        # Query aggregate stats from database
        # This would use raw SQL or RPC for aggregates
        return {
            "total_tokens_issued": 0,
            "total_tokens_spent": 0,
            "active_customers": 0,
            "recent_purchases": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/customers/{customer_id}/token-history")
async def get_customer_token_history(customer_id: str):
    """Get complete token history for a customer (admin only)"""
    try:
        balance = await supabase.get_token_balance(customer_id)
        transactions = await supabase.get_token_transactions(customer_id, limit=100)
        orders = await supabase.get_customer_token_orders(customer_id)
        
        return {
            "customer_id": customer_id,
            "current_balance": balance.get("balance", 0) if balance else 0,
            "lifetime_earned": balance.get("lifetime_earned", 0) if balance else 0,
            "lifetime_spent": balance.get("lifetime_spent", 0) if balance else 0,
            "transactions": transactions,
            "orders": orders
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/performance/metrics")
async def get_performance_metrics():
    """Get detailed performance metrics (admin only)"""
    return {
        "caches": {
            "vm_status": vm_status_cache.get_stats(),
            "screenshots": screenshot_cache.get_stats(),
            "general": general_cache.get_stats()
        },
        "queues": {
            "payment": payment_queue.get_metrics(),
            "background": background_queue.get_metrics()
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/admin/cache/clear")
async def clear_all_caches():
    """Clear all caches (admin only)"""
    await vm_status_cache.clear()
    await screenshot_cache.clear()
    await general_cache.clear()
    return {"success": True, "message": "All caches cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
