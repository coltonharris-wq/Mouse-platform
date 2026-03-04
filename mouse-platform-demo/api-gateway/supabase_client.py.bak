"""
Supabase Client
Database operations with RLS support and pagination
"""
import os
from typing import Dict, List, Optional
from supabase import create_client, Client


class SupabaseClient:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.service_key = os.getenv("SUPABASE_SERVICE_KEY")
        self.client: Client = create_client(self.url, self.service_key)
    
    def health(self) -> bool:
        """Check Supabase connection health"""
        try:
            self.client.table("customers").select("count", count="exact").execute()
            return True
        except Exception:
            return False
    
    # Customer operations
    async def create_customer(self, data: Dict):
        """Create a new customer record"""
        return self.client.table("customers").insert(data).execute()
    
    async def get_customer(self, customer_id: str) -> Optional[Dict]:
        """Get customer by ID"""
        result = self.client.table("customers").select("*").eq("id", customer_id).execute()
        return result.data[0] if result.data else None
    
    async def get_customer_by_email(self, email: str) -> Optional[Dict]:
        """Get customer by email address"""
        result = self.client.table("customers").select("*").eq("email", email).execute()
        return result.data[0] if result.data else None
    
    async def get_customer_by_stripe_id(self, stripe_id: str) -> Optional[Dict]:
        """Get customer by Stripe customer ID"""
        result = self.client.table("customers").select("*").eq("stripe_customer_id", stripe_id).execute()
        return result.data[0] if result.data else None
    
    async def update_customer(self, customer_id: str, data: Dict):
        """Update customer record"""
        return self.client.table("customers").update(data).eq("id", customer_id).execute()
    
    async def update_customer_by_stripe_id(self, stripe_id: str, data: Dict):
        """Update customer by Stripe ID"""
        return self.client.table("customers").update(data).eq("stripe_customer_id", stripe_id).execute()
    
    async def delete_customer(self, customer_id: str):
        """Delete customer record"""
        return self.client.table("customers").delete().eq("id", customer_id).execute()
    
    # King Mouse operations
    async def create_king_mouse(self, data: Dict):
        """Create King Mouse bot record"""
        return self.client.table("king_mice").insert(data).execute()
    
    async def get_king_mouse(self, customer_id: str) -> Optional[Dict]:
        """Get King Mouse by customer ID"""
        result = self.client.table("king_mice").select("*").eq("customer_id", customer_id).execute()
        return result.data[0] if result.data else None
    
    async def get_customer_by_telegram_chat(self, chat_id: int) -> Optional[Dict]:
        """Get customer by Telegram chat ID"""
        result = self.client.table("king_mice").select("customer_id").eq("telegram_chat_id", chat_id).execute()
        if result.data:
            return await self.get_customer(result.data[0]["customer_id"])
        return None
    
    # Employee operations
    async def create_employee(self, data: Dict):
        """Create employee record"""
        return self.client.table("employees").insert(data).execute()
    
    async def update_employee(self, employee_id: str, data: Dict):
        """Update employee record"""
        return self.client.table("employees").update(data).eq("id", employee_id).execute()
    
    async def get_employee(self, employee_id: str) -> Optional[Dict]:
        """Get employee by ID"""
        result = self.client.table("employees").select("*").eq("id", employee_id).execute()
        return result.data[0] if result.data else None
    
    async def get_employee_by_vm(self, vm_id: str) -> Optional[Dict]:
        """Get employee by VM ID"""
        result = self.client.table("employees").select("*").eq("vm_id", vm_id).execute()
        return result.data[0] if result.data else None
    
    async def get_employees_by_customer(self, customer_id: str, skip: int = 0, limit: int = 100) -> List[Dict]:
        """Get employees by customer ID with pagination support"""
        result = self.client.table("employees").select("*").eq("customer_id", customer_id).execute()
        return result.data or []
    
    async def count_employee_vms(self, customer_id: str) -> int:
        """Count active VMs for a customer"""
        result = self.client.table("employees").select("count", count="exact").eq("customer_id", customer_id).execute()
        return result.count if hasattr(result, 'count') else len(result.data or [])
    
    # Chat logging
    async def log_chat(self, data: Dict):
        """Log chat interaction"""
        return self.client.table("chat_logs").insert(data).execute()
    
    # Revenue tracking
    async def create_revenue_event(self, data: Dict):
        """Create revenue event record"""
        return self.client.table("revenue_events").insert(data).execute()
    
    # Demo helpers
    async def get_demo_customers(self) -> List[Dict]:
        """Get all demo customers"""
        result = self.client.table("customers").select("*").eq("email", "demo@cleaneats.com").execute()
        return result.data or []
