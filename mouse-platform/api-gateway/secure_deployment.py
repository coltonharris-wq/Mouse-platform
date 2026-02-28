"""
Secure Employee Deployment Extension for MousePlatform
Adds idempotency and race condition protection
"""
import uuid
import hashlib
from datetime import datetime
from typing import Dict, Optional

class SecureEmployeeDeployment:
    """Handles secure employee deployment with idempotency keys"""
    
    def __init__(self, supabase, orgo, workspace_id):
        self.supabase = supabase
        self.orgo = orgo
        self.workspace_id = workspace_id
        self._idempotency_cache = {}  # In-memory cache for idempotency keys
    
    def _generate_idempotency_key(self, customer_id: str, role: str, name: str, task: str) -> str:
        """Generate a deterministic idempotency key"""
        data = f"{customer_id}:{role}:{name}:{task}"
        return hashlib.sha256(data.encode()).hexdigest()[:32]
    
    async def deploy_employee_secure(
        self,
        customer_id: str,
        role: str,
        name: str,
        task: str,
        idempotency_key: Optional[str] = None
    ) -> Dict:
        """
        Deploy an AI employee with idempotency protection
        
        Args:
            customer_id: Customer ID
            role: Employee role
            name: Employee name
            task: Task description
            idempotency_key: Optional unique key to prevent duplicate deployments
            
        Returns:
            Dict with employee and VM info
        """
        # Generate idempotency key if not provided
        if not idempotency_key:
            idempotency_key = self._generate_idempotency_key(customer_id, role, name, task)
        
        # Check if we've already processed this idempotency key
        if idempotency_key in self._idempotency_cache:
            cached_result = self._idempotency_cache[idempotency_key]
            # Return cached result if within 5 minutes
            if (datetime.utcnow() - cached_result.get("timestamp", datetime.utcnow())).seconds < 300:
                return cached_result["result"]
        
        # Check for existing employee with same idempotency key in database
        existing = await self._check_existing_deployment(idempotency_key)
        if existing:
            return existing
        
        # Acquire lock for this customer to prevent concurrent deployments
        lock_key = f"deploy:{customer_id}"
        if not await self._acquire_lock(lock_key, timeout=30):
            raise Exception("Another deployment is in progress. Please try again in a moment.")
        
        try:
            # Check token balance
            from token_pricing import TokenPricingConfig
            token_balance = await self.supabase.get_token_balance(customer_id)
            current_balance = token_balance.get("balance", 0) if token_balance else 0
            
            # Estimate cost: 1 token per minute, minimum 60 minutes (1 hour)
            estimated_minutes = 60
            estimated_cost = TokenPricingConfig.calculate_vm_cost(estimated_minutes)
            
            if current_balance < estimated_cost:
                raise Exception(f"Insufficient tokens. Need {estimated_cost} tokens, have {current_balance}")
            
            employee_id = f"emp_{uuid.uuid4().hex[:12]}"
            
            # 1. Create employee record with idempotency key
            employee = {
                "id": employee_id,
                "customer_id": customer_id,
                "name": name,
                "role": role,
                "status": "deploying",
                "current_task": task,
                "idempotency_key": idempotency_key,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Use insert with conflict check for idempotency
            try:
                await self.supabase.create_employee(employee)
            except Exception as e:
                # Check if employee already exists with this idempotency key
                existing = await self._check_existing_deployment(idempotency_key)
                if existing:
                    return existing
                raise
            
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
            
            # 4. Initialize knight agent on VM (async)
            from ai_agents import KnightAgent
            knight = KnightAgent(vm_id=vm["id"], role=role)
            await knight.initialize()
            await knight.start_task(task)
            
            # 5. Update status to active
            await self.supabase.update_employee(employee_id, {
                "status": "active",
                "started_at": datetime.utcnow().isoformat()
            })
            
            result = {
                "employee": employee,
                "vm": vm,
                "estimated_token_cost": estimated_cost,
                "token_balance_after": current_balance
            }
            
            # Cache the result for idempotency
            self._idempotency_cache[idempotency_key] = {
                "result": result,
                "timestamp": datetime.utcnow()
            }
            
            return result
            
        finally:
            # Always release the lock
            await self._release_lock(lock_key)
    
    async def _check_existing_deployment(self, idempotency_key: str) -> Optional[Dict]:
        """Check if deployment already exists with this idempotency key"""
        try:
            # Query database for existing employee with this idempotency key
            result = await self.supabase.get_employee_by_idempotency_key(idempotency_key)
            if result:
                return {
                    "employee": result,
                    "vm": {"id": result.get("vm_id"), "url": result.get("vm_url")},
                    "estimated_token_cost": 0,  # Already charged
                    "token_balance_after": 0,
                    "from_cache": True
                }
        except Exception:
            pass
        return None
    
    async def _acquire_lock(self, key: str, timeout: int = 30) -> bool:
        """Acquire a distributed lock using database"""
        try:
            # Use database advisory lock if available, otherwise use simple flag
            lock_value = f"{key}:{datetime.utcnow().timestamp()}"
            # This is a simple in-process lock - for distributed systems, use Redis or similar
            if hasattr(self, '_locks') and key in self._locks:
                return False
            if not hasattr(self, '_locks'):
                self._locks = {}
            self._locks[key] = lock_value
            return True
        except Exception:
            return False
    
    async def _release_lock(self, key: str):
        """Release the distributed lock"""
        try:
            if hasattr(self, '_locks') and key in self._locks:
                del self._locks[key]
        except Exception:
            pass


# Monkey-patch method into MousePlatform
def deploy_employee_secure(self, customer_id: str, role: str, name: str, task: str, idempotency_key: str = None) -> Dict:
    """Secure deployment with idempotency protection"""
    deployer = SecureEmployeeDeployment(self.supabase, self.orgo, self.workspace_id)
    return deployer.deploy_employee_secure(customer_id, role, name, task, idempotency_key)
