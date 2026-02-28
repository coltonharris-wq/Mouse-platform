"""
Mouse Platform Orchestrator
Core business logic connecting all components - PERFORMANCE OPTIMIZED
"""
import os
import uuid
import qrcode
import io
import base64
from typing import Dict, List, Optional
from datetime import datetime

from supabase_client import SupabaseClient
from orgo_client import OrgoClient
from telegram_bot import TelegramBot
from ai_agents import KingMouseAgent, KnightAgent
from token_pricing import TokenPricingConfig
from async_queue import TaskPriority, payment_queue, background_queue
from cache_manager import vm_status_cache, screenshot_cache, general_cache


class MousePlatform:
    """Main platform orchestrator - optimized for performance"""
    
    def __init__(self):
        self.supabase = SupabaseClient()
        self.orgo = OrgoClient(api_key=os.getenv("ORGO_API_KEY"))
        self.telegram = TelegramBot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
        self.workspace_id = os.getenv("ORGO_WORKSPACE_ID")
        self.stripe = None  # Will be initialized when needed
        
        # Initialize queues
        self._init_queues()
        
    def _init_queues(self):
        """Initialize async queues"""
        # Register payment handlers
        payment_queue.register_handler("payment_checkout_completed", self._handle_payment_async)
        payment_queue.register_handler("payment_webhook", self._handle_webhook_async)
        
        # Register background handlers
        background_queue.register_handler("analytics", self._handle_analytics_async)
        background_queue.register_handler("cleanup", self._handle_cleanup_async)
        
        # Start queues
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if not loop.is_closed():
                loop.create_task(payment_queue.start())
                loop.create_task(background_queue.start())
                loop.create_task(vm_status_cache.start())
                loop.create_task(screenshot_cache.start())
                loop.create_task(general_cache.start())
        except RuntimeError:
            pass  # No event loop running yet
    
    async def _handle_payment_async(self, payload: Dict):
        """Async handler for payment processing"""
        try:
            session_id = payload.get("session_id")
            if session_id:
                await self.handle_token_purchase_completed(session_id)
        except Exception as e:
            print(f"[PaymentAsync] Error processing payment: {e}")
    
    async def _handle_webhook_async(self, payload: Dict):
        """Async handler for webhook events"""
        # Webhook events are processed asynchronously
        pass
    
    async def _handle_analytics_async(self, payload: Dict):
        """Async handler for analytics"""
        # Process analytics in background
        pass
    
    async def _handle_cleanup_async(self, payload: Dict):
        """Async handler for cleanup tasks"""
        # Cleanup tasks
        pass
        
    async def onboard_customer(self, data: Dict) -> Dict:
        """
        Complete customer onboarding flow:
        1. Create database entry
        2. Initialize token balance
        3. Generate Telegram bot
        4. Create QR code
        5. Send welcome email
        """
        customer_id = f"cst_{uuid.uuid4().hex[:12]}"
        
        # 1. Create customer record (plan_tier deprecated, using token system)
        customer = {
            "id": customer_id,
            "company_name": data["company_name"],
            "email": data["email"],
            "plan_tier": "token_based",  # Deprecated field, keeping for compatibility
            "reseller_id": data.get("reseller_id", "automio_default"),
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
        await self.supabase.create_customer(customer)
        
        # 2. Initialize token balance (0 tokens on signup - must purchase)
        await self.supabase.create_token_balance(customer_id, initial_balance=0)
        
        # 3. Create King Mouse bot for this customer
        king_mouse = await self._create_king_mouse(customer_id, data["company_name"])
        
        # 4. Generate QR code for Telegram
        qr_code_url = await self._generate_qr_code(king_mouse["bot_link"])
        
        # 5. Save King Mouse config
        await self.supabase.create_king_mouse({
            "customer_id": customer_id,
            "bot_token": king_mouse["bot_token"],
            "bot_username": king_mouse["bot_username"],
            "bot_link": king_mouse["bot_link"],
            "qr_code_url": qr_code_url,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        })
        
        return {
            "customer": customer,
            "king_mouse": king_mouse,
            "qr_code_url": qr_code_url,
            "token_balance": 0
        }
    
    async def handle_message(self, customer_id: str, message: str) -> Dict:
        """
        Process customer message through King Mouse AI:
        1. Get customer's King Mouse AI
        2. Check token balance
        3. Process message
        4. If deploy request → check tokens → spin up Orgo VM
        5. Start knight on VM
        6. Report back to customer
        """
        # Get customer and their King Mouse
        customer = await self.supabase.get_customer(customer_id)
        king_mouse = await self.supabase.get_king_mouse(customer_id)
        token_balance = await self.supabase.get_token_balance(customer_id)
        
        if not customer:
            return {"message": "Customer not found", "actions": []}
        
        # Check if customer has tokens for AI interactions
        current_balance = token_balance.get("balance", 0) if token_balance else 0
        
        # Initialize King Mouse AI
        king = KingMouseAgent(
            company_name=customer["company_name"],
            plan="token_based"
        )
        
        # Process message
        result = await king.process_message(message)
        
        # Charge tokens for AI message processing
        message_cost = 1  # 1 token per message
        if current_balance >= message_cost:
            debit_result = await self.supabase.debit_tokens(
                customer_id=customer_id,
                amount=message_cost,
                description="AI message processing",
                reference_type="ai_message"
            )
            if debit_result and debit_result[0].get("success"):
                current_balance = debit_result[0].get("new_balance", current_balance)
        
        # Check if we need to deploy an employee
        if result.get("action") == "deploy_employee":
            # Check if customer has enough tokens for VM deployment
            # Minimum 100 tokens required to start a VM
            if current_balance < 100:
                return {
                    "message": f"Insufficient tokens to deploy an AI employee. You have {current_balance} tokens. Please purchase more tokens to continue.",
                    "actions": [],
                    "needs_tokens": True,
                    "token_balance": current_balance
                }
            
            deploy_result = await self.deploy_employee(
                customer_id=customer_id,
                role=result["role"],
                name=result.get("employee_name", f"AI {result['role']}"),
                task=result["task_description"]
            )
            result["employee_id"] = deploy_result["employee"]["id"]
            result["vm_id"] = deploy_result["vm"]["id"]
            result["estimated_cost"] = deploy_result.get("estimated_token_cost", 0)
        
        # Log the interaction (async - don't block response)
        await background_queue.submit(
            task_type="analytics",
            payload={
                "customer_id": customer_id,
                "message": message,
                "response": result["message"],
                "action_taken": result.get("action"),
                "timestamp": datetime.utcnow().isoformat()
            },
            priority=TaskPriority.LOW
        )
        
        # Add token balance to response
        result["token_balance"] = current_balance
        
        return result
    
    async def deploy_employee(self, customer_id: str, role: str, name: str, task: str) -> Dict:
        """
        Deploy an AI employee:
        1. Check token balance
        2. Reserve tokens for VM
        3. Create employee record
        4. Spin up Orgo VM
        5. Initialize knight agent
        6. Start task execution
        """
        # Check token balance
        token_balance = await self.supabase.get_token_balance(customer_id)
        current_balance = token_balance.get("balance", 0) if token_balance else 0
        
        # Estimate cost: 1 token per minute, minimum 60 minutes (1 hour)
        estimated_minutes = 60
        estimated_cost = TokenPricingConfig.calculate_vm_cost(estimated_minutes)
        
        if current_balance < estimated_cost:
            raise Exception(f"Insufficient tokens. Need {estimated_cost} tokens, have {current_balance}")
        
        employee_id = f"emp_{uuid.uuid4().hex[:12]}"
        
        # 1. Create employee record
        employee = {
            "id": employee_id,
            "customer_id": customer_id,
            "name": name,
            "role": role,
            "status": "deploying",
            "current_task": task,
            "created_at": datetime.utcnow().isoformat()
        }
        await self.supabase.create_employee(employee)
        
        # 2. Spin up Orgo VM
        vm_config = {
            "name": f"knight-{employee_id}",
            "ram": 4,  # GB
            "cpu": 2,  # Cores
            "os": "linux"
        }
        
        vm = await self.orgo.create_computer(
            workspace_id=self.workspace_id,
            config=vm_config
        )
        
        # 3. Update employee with VM info
        await self.supabase.update_employee(employee_id, {
            "vm_id": vm["id"],
            "vm_url": vm["url"],
            "status": "starting"
        })
        
        # 4. Initialize knight agent on VM
        knight = KnightAgent(vm_id=vm["id"], role=role)
        await knight.initialize()
        await knight.start_task(task)
        
        # 5. Update status to active
        await self.supabase.update_employee(employee_id, {
            "status": "active",
            "started_at": datetime.utcnow().isoformat()
        })
        
        # Update employee object for response
        employee["status"] = "active"
        employee["vm_id"] = vm["id"]
        employee["vm_url"] = vm["url"]
        
        return {
            "employee": employee,
            "vm": vm,
            "estimated_token_cost": estimated_cost,
            "token_balance_after": current_balance
        }
    
    async def charge_vm_usage(self, customer_id: str, employee_id: str, minutes: int) -> Dict:
        """
        Charge tokens for VM usage
        Called periodically while VM is running
        """
        cost = TokenPricingConfig.calculate_vm_cost(minutes)
        
        debit_result = await self.supabase.debit_tokens(
            customer_id=customer_id,
            amount=cost,
            description=f"VM usage: {minutes} minutes",
            reference_id=employee_id,
            reference_type="vm_usage"
        )
        
        if debit_result and not debit_result[0].get("success"):
            # Insufficient balance - should trigger VM shutdown
            return {
                "success": False,
                "error": "Insufficient tokens",
                "required": cost,
                "action": "shutdown_vm"
            }
        
        return {
            "success": True,
            "charged": cost,
            "new_balance": debit_result[0].get("new_balance") if debit_result else None
        }
    
    async def stream_vm(self, customer_id: str, vm_id: str, quality: str = "medium"):
        """
        Stream VM screenshots to customer dashboard:
        1. Verify customer owns this VM
        2. Charge for screenshot request
        3. Send to customer's dashboard
        4. Update every 3 seconds
        """
        # Verify customer owns this VM
        employee = await self.supabase.get_employee_by_vm(vm_id)
        if not employee or employee["customer_id"] != customer_id:
            raise Exception("VM not found or access denied")
        
        # Charge for screenshot (0.5 tokens per request)
        screenshot_cost = TokenPricingConfig.calculate_screenshot_cost(1)
        await self.supabase.debit_tokens(
            customer_id=customer_id,
            amount=screenshot_cost,
            description="Screenshot capture",
            reference_id=vm_id,
            reference_type="screenshot"
        )
        
        # Get screenshot with caching and compression
        screenshot = await self.orgo.get_screenshot(vm_id, quality=quality)
        
        return {
            "screenshot_base64": screenshot,
            "vm_status": employee["status"],
            "current_task": employee.get("current_task"),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def list_customer_vms(self, customer_id: str) -> List[Dict]:
        """
        List all VMs for a customer - OPTIMIZED with concurrent fetching
        """
        employees = await self.supabase.get_employees_by_customer(customer_id)
        
        if not employees:
            return []
        
        # Collect VM IDs
        vm_ids = [emp.get("vm_id") for emp in employees if emp.get("vm_id")]
        
        if not vm_ids:
            return []
        
        # Fetch all VM statuses concurrently
        vm_statuses = await self.orgo.get_computers_batch(vm_ids, use_cache=True)
        
        # Build status lookup
        status_map = {vm.get("id"): vm for vm in vm_statuses}
        
        # Build result list
        vms = []
        for emp in employees:
            vm_id = emp.get("vm_id")
            if vm_id:
                vm_status = status_map.get(vm_id, {})
                vms.append({
                    "id": vm_id,
                    "employee_id": emp["id"],
                    "employee_name": emp["name"],
                    "role": emp["role"],
                    "status": emp["status"],
                    "url": emp.get("vm_url"),
                    "vm_status": vm_status.get("status", "unknown"),
                    "current_task": emp.get("current_task")
                })
        
        return vms
    
    async def list_customer_vms_fast(self, customer_id: str) -> List[Dict]:
        """
        Fast version using cache only - for dashboard loading
        Falls back to API if cache miss
        """
        cache_key = f"customer_vms:{customer_id}"
        
        # Try cache first
        cached = await general_cache.get(cache_key)
        if cached:
            # Refresh in background
            await background_queue.submit(
                task_type="cleanup",
                payload={"action": "refresh_vms", "customer_id": customer_id},
                priority=TaskPriority.LOW
            )
            return cached
        
        # Fetch fresh data
        vms = await self.list_customer_vms(customer_id)
        
        # Cache for 10 seconds
        await general_cache.set(cache_key, vms, ttl=10)
        
        return vms
    
    async def get_king_mouse_status(self, customer_id: str) -> Dict:
        """Get King Mouse bot status"""
        cache_key = f"king_mouse:{customer_id}"
        
        # Check cache
        cached = await general_cache.get(cache_key)
        if cached:
            return cached
        
        king_mouse = await self.supabase.get_king_mouse(customer_id)
        if not king_mouse:
            return {"status": "not_found"}
        
        # Get token balance
        token_balance = await self.supabase.get_token_balance(customer_id)
        
        result = {
            "status": king_mouse["status"],
            "bot_username": king_mouse["bot_username"],
            "bot_link": king_mouse["bot_link"],
            "qr_code_url": king_mouse.get("qr_code_url"),
            "total_interactions": king_mouse.get("total_interactions", 0),
            "token_balance": token_balance.get("balance", 0) if token_balance else 0
        }
        
        # Cache for 30 seconds
        await general_cache.set(cache_key, result, ttl=30)
        
        return result
    
    async def run_demo(self) -> Dict:
        """
        Run the full Clean Eats demo:
        1. Create test customer
        2. Set up King Mouse
        3. Give demo tokens
        4. Deploy 2 AI employees
        5. Show them working
        """
        # 1. Create Clean Eats customer
        customer = await self.onboard_customer({
            "company_name": "Clean Eats",
            "email": "demo@cleaneats.com",
            "plan": "token_based"
        })
        
        customer_id = customer["customer"]["id"]
        
        # 2. Give demo tokens (Growth pack amount)
        await self.supabase.credit_tokens(
            customer_id=customer_id,
            amount=6500,
            description="Demo tokens - Growth Pack",
            transaction_type="bonus",
            reference_type="demo"
        )
        
        # 3. Deploy Web Developer
        web_dev = await self.deploy_employee(
            customer_id=customer_id,
            role="Web Developer",
            name="Alex (Web Dev)",
            task="Build a Shopify website for Clean Eats meal prep company with menu, ordering, and about page"
        )
        
        # 4. Deploy Social Media Manager
        social_manager = await self.deploy_employee(
            customer_id=customer_id,
            role="Social Media Manager",
            name="Sam (Social Media)",
            task="Create Instagram content strategy and 5 posts for Clean Eats launch"
        )
        
        # Get updated token balance
        token_balance = await self.supabase.get_token_balance(customer_id)
        
        return {
            "success": True,
            "customer": customer["customer"],
            "king_mouse": customer["king_mouse"],
            "qr_code_url": customer["qr_code_url"],
            "employees": [
                {
                    "id": web_dev["employee"]["id"],
                    "name": web_dev["employee"]["name"],
                    "role": web_dev["employee"]["role"],
                    "vm_url": web_dev["vm"]["url"]
                },
                {
                    "id": social_manager["employee"]["id"],
                    "name": social_manager["employee"]["name"],
                    "role": social_manager["employee"]["role"],
                    "vm_url": social_manager["vm"]["url"]
                }
            ],
            "dashboard_url": f"/portal?id={customer_id}",
            "token_balance": token_balance.get("balance", 0) if token_balance else 0
        }
    
    async def cleanup_demo(self):
        """Remove all demo data"""
        # Get all demo customers
        demo_customers = await self.supabase.get_demo_customers()
        
        for customer in demo_customers:
            # Stop all VMs
            employees = await self.supabase.get_employees_by_customer(customer["id"])
            for emp in employees:
                if emp.get("vm_id"):
                    await self.orgo.stop_computer(emp["vm_id"])
                    await self.orgo.delete_computer(emp["vm_id"])
            
            # Delete customer data
            await self.supabase.delete_customer(customer["id"])
    
    # Token Purchase Methods
    
    async def create_token_checkout_session(self, customer_id: str, package_slug: str, success_url: str, cancel_url: str) -> Dict:
        """
        Create a Stripe checkout session for token purchase
        """
        import stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        
        # Get package details
        package = TokenPricingConfig.get_package(package_slug)
        if not package:
            raise Exception(f"Invalid package: {package_slug}")
        
        # Get or create customer
        customer = await self.supabase.get_customer(customer_id)
        if not customer:
            raise Exception("Customer not found")
        
        # Get or create Stripe customer
        stripe_customer_id = customer.get("stripe_customer_id")
        if not stripe_customer_id:
            stripe_customer = stripe.Customer.create(
                email=customer["email"],
                name=customer["company_name"]
            )
            stripe_customer_id = stripe_customer.id
            await self.supabase.update_customer(customer_id, {"stripe_customer_id": stripe_customer_id})
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": package.name,
                        "description": f"{package.total_tokens:,} tokens - {package.description}"
                    },
                    "unit_amount": package.price_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "customer_id": customer_id,
                "package_slug": package_slug,
                "token_amount": str(package.total_tokens)
            }
        )
        
        # Create order record
        await self.supabase.create_token_order({
            "customer_id": customer_id,
            "token_amount": package.total_tokens,
            "price_cents": package.price_cents,
            "stripe_checkout_session_id": session.id,
            "status": "pending"
        })
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }
    
    async def handle_token_purchase_completed(self, session_id: str) -> Dict:
        """
        Handle completed token purchase from Stripe webhook - OPTIMIZED with queue
        """
        import stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        
        # Get session details
        session = stripe.checkout.Session.retrieve(session_id)
        
        customer_id = session.metadata.get("customer_id")
        package_slug = session.metadata.get("package_slug")
        token_amount = int(session.metadata.get("token_amount", 0))
        
        # Credit tokens to customer
        transaction_id = await self.supabase.credit_tokens(
            customer_id=customer_id,
            amount=token_amount,
            description=f"Token purchase - {package_slug}",
            transaction_type="purchase",
            reference_id=session.payment_intent,
            reference_type="stripe_payment"
        )
        
        # Update order status
        # Note: In production, you'd want to look up and update the specific order
        
        return {
            "success": True,
            "customer_id": customer_id,
            "tokens_credited": token_amount,
            "transaction_id": transaction_id
        }
    
    async def queue_token_purchase_processing(self, session_id: str) -> str:
        """
        Queue token purchase for async processing
        Returns immediately, processes in background
        """
        task_id = await payment_queue.submit_payment(
            payment_type="checkout_completed",
            event_data={"session_id": session_id},
            priority=TaskPriority.HIGH
        )
        return task_id or "already_processed"
    
    async def get_customer_dashboard(self, customer_id: str) -> Dict:
        """
        Get complete dashboard data for customer - OPTIMIZED with caching
        """
        cache_key = f"dashboard:{customer_id}"
        
        # Try cache
        cached = await general_cache.get(cache_key)
        if cached:
            # Refresh in background
            await background_queue.submit(
                task_type="analytics",
                payload={"action": "refresh_dashboard", "customer_id": customer_id},
                priority=TaskPriority.LOW
            )
            return cached
        
        customer = await self.supabase.get_customer(customer_id)
        if not customer:
            raise Exception("Customer not found")
        
        # Get token balance
        token_balance = await self.supabase.get_token_balance(customer_id)
        
        # Get recent transactions
        transactions = await self.supabase.get_token_transactions(customer_id, limit=10)
        
        # Get employees
        employees = await self.supabase.get_employees_by_customer(customer_id)
        
        # Get available packages
        packages = TokenPricingConfig.get_all_packages()
        
        dashboard = {
            "customer": {
                "id": customer["id"],
                "company_name": customer["company_name"],
                "email": customer["email"],
                "status": customer["status"]
            },
            "tokens": {
                "balance": token_balance.get("balance", 0) if token_balance else 0,
                "lifetime_earned": token_balance.get("lifetime_earned", 0) if token_balance else 0,
                "lifetime_spent": token_balance.get("lifetime_spent", 0) if token_balance else 0
            },
            "recent_transactions": transactions,
            "employees": employees,
            "packages": [
                {
                    "slug": p.slug,
                    "name": p.name,
                    "price": p.display_price,
                    "tokens": p.total_tokens,
                    "estimated_hours": p.estimated_hours,
                    "features": p.features,
                    "popular": p.slug == "growth"
                }
                for p in packages
            ]
        }
        
        # Cache for 5 seconds
        await general_cache.set(cache_key, dashboard, ttl=5)
        
        return dashboard
    
    # Private helpers
    
    async def _create_king_mouse(self, customer_id: str, company_name: str) -> Dict:
        """Create Telegram bot for customer"""
        # In production, this would use Telegram Bot API to create a bot
        # For demo, we generate simulated bot credentials
        bot_username = f"{company_name.lower().replace(' ', '')}_king_mouse_bot"
        bot_token = f"demo_token_{uuid.uuid4().hex}"
        
        return {
            "bot_token": bot_token,
            "bot_username": bot_username,
            "bot_link": f"https://t.me/{bot_username}"
        }
    
    async def _generate_qr_code(self, bot_link: str) -> str:
        """Generate QR code for Telegram bot"""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(bot_link)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="#0F6B6E", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
    
    # Stripe webhook handlers (legacy - kept for compatibility)
    
    async def handle_subscription_created(self, payload: Dict):
        """Handle new subscription (legacy - token system doesn't use subscriptions)"""
        # This is now handled by token purchases instead
        pass
    
    async def handle_payment_success(self, payload: Dict):
        """Handle successful payment"""
        # Check if this is a token purchase
        payment_intent = payload["data"]["object"]
        metadata = payment_intent.get("metadata", {})
        
        if metadata.get("type") == "token_purchase":
            await self.handle_token_purchase_completed(payment_intent["id"])
        else:
            # Legacy revenue tracking
            await self.supabase.create_revenue_event({
                "type": "payment",
                "stripe_event_id": payload["id"],
                "amount": payload["data"]["object"]["amount_paid"],
                "timestamp": datetime.utcnow().isoformat()
            })
    
    async def handle_payment_failure(self, payload: Dict):
        """Handle failed payment"""
        customer_id = payload["data"]["object"]["customer"]
        await self.supabase.update_customer_by_stripe_id(customer_id, {
            "stripe_subscription_status": "past_due"
        })
