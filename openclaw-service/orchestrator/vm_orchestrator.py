"""
VM Orchestrator
Manages Orgo VM lifecycle for tenant King Mouse instances and Knights
"""

import asyncio
import json
import logging
import os
from typing import Dict, Optional, List
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import aiohttp

logger = logging.getLogger("vm-orchestrator")

# Orgo API configuration
ORGO_API_KEY = os.getenv("ORGO_API_KEY", "")
ORGO_WORKSPACE_ID = os.getenv("ORGO_WORKSPACE_ID", "")
ORGO_BASE_URL = "https://api.orgo.ai"

@dataclass
class VMInstance:
    id: str
    tenant_id: str
    vm_type: str  # 'king_mouse' or 'knight'
    knight_id: Optional[str]
    orgo_vm_id: Optional[str]
    status: str  # 'pending', 'provisioning', 'running', 'stopping', 'stopped', 'error'
    ip_address: Optional[str]
    specs: Dict
    created_at: datetime
    started_at: Optional[datetime]
    error_message: Optional[str]

class OrgoClient:
    """Client for Orgo VM API"""
    
    def __init__(self):
        self.api_key = ORGO_API_KEY
        self.workspace_id = ORGO_WORKSPACE_ID
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
        return self._session
    
    async def create_computer(self, name: str, ram: int = 4, cpu: int = 2) -> Optional[Dict]:
        """Create a new Orgo VM"""
        session = await self._get_session()
        try:
            payload = {
                "name": name,
                "ram": ram,
                "cpu": cpu,
                "os": "linux",
                "workspaceId": self.workspace_id
            }
            async with session.post(
                f"{ORGO_BASE_URL}/computers",
                json=payload
            ) as resp:
                if resp.status in [200, 201]:
                    return await resp.json()
                else:
                    error = await resp.text()
                    logger.error(f"Orgo create failed: {error}")
                    return None
        except Exception as e:
            logger.error(f"Failed to create VM: {e}")
            return None
    
    async def get_computer(self, vm_id: str) -> Optional[Dict]:
        """Get VM details"""
        session = await self._get_session()
        try:
            async with session.get(f"{ORGO_BASE_URL}/computers/{vm_id}") as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.error(f"Failed to get VM: {e}")
            return None
    
    async def delete_computer(self, vm_id: str) -> bool:
        """Delete a VM"""
        session = await self._get_session()
        try:
            async with session.delete(f"{ORGO_BASE_URL}/computers/{vm_id}") as resp:
                return resp.status in [200, 204]
        except Exception as e:
            logger.error(f"Failed to delete VM: {e}")
            return False
    
    async def execute_python(self, vm_id: str, code: str, timeout: int = 60) -> Optional[Dict]:
        """Execute Python code on VM"""
        session = await self._get_session()
        try:
            payload = {"code": code, "timeout": timeout}
            async with session.post(
                f"{ORGO_BASE_URL}/computers/{vm_id}/exec",
                json=payload
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.error(f"Failed to execute code: {e}")
            return None
    
    async def upload_file(self, vm_id: str, file_content: bytes, remote_path: str) -> bool:
        """Upload file to VM"""
        session = await self._get_session()
        try:
            # First upload to Orgo storage
            data = aiohttp.FormData()
            data.add_field('file', file_content)
            
            async with session.post(
                f"{ORGO_BASE_URL}/workspaces/{self.workspace_id}/files",
                data=data
            ) as resp:
                if resp.status != 200:
                    return False
                
                upload_result = await resp.json()
                file_id = upload_result.get("id")
                
                # Then move to VM
                # This requires a Python script on the VM to download
                download_script = f'''
import urllib.request
import os

url = "{ORGO_BASE_URL}/workspaces/{self.workspace_id}/files/{file_id}/download"
headers = {{"Authorization": "Bearer {self.api_key}"}}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as response:
    os.makedirs(os.path.dirname("{remote_path}"), exist_ok=True)
    with open("{remote_path}", "wb") as f:
        f.write(response.read())
print("File downloaded successfully")
'''
                result = await self.execute_python(vm_id, download_script)
                return result and result.get("exitCode") == 0
                
        except Exception as e:
            logger.error(f"Failed to upload file: {e}")
            return False
    
    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()


class VMOrchestrator:
    """Orchestrates VM lifecycle for tenants and knights"""
    
    def __init__(self, redis_client=None):
        self.orgo = OrgoClient()
        self.instances: Dict[str, VMInstance] = {}  # instance_id -> VMInstance
        self.redis = redis_client
        self._running = False
        
        # VM specs by tier
        self.tier_specs = {
            "free": {"ram": 4, "cpu": 2, "max_knights": 1},
            "starter": {"ram": 4, "cpu": 2, "max_knights": 2},
            "pro": {"ram": 8, "cpu": 4, "max_knights": 5},
            "enterprise": {"ram": 16, "cpu": 8, "max_knights": 20}
        }
    
    async def start(self):
        """Start the orchestrator loop"""
        self._running = True
        logger.info("VM Orchestrator started")
        
        # Start queue processors
        asyncio.create_task(self._process_knight_queue())
        asyncio.create_task(self._process_message_queue())
        asyncio.create_task(self._heartbeat_loop())
    
    async def stop(self):
        """Stop the orchestrator"""
        self._running = False
        await self.orgo.close()
        logger.info("VM Orchestrator stopped")
    
    async def provision_king_mouse(self, tenant_id: str, tier: str = "free") -> VMInstance:
        """Provision a King Mouse VM for a tenant"""
        instance_id = f"km-{tenant_id[:8]}"
        specs = self.tier_specs.get(tier, self.tier_specs["free"])
        
        instance = VMInstance(
            id=instance_id,
            tenant_id=tenant_id,
            vm_type="king_mouse",
            knight_id=None,
            orgo_vm_id=None,
            status="pending",
            ip_address=None,
            specs=specs,
            created_at=datetime.utcnow(),
            started_at=None,
            error_message=None
        )
        
        self.instances[instance_id] = instance
        
        # Create VM
        vm_name = f"king-mouse-{tenant_id[:8]}"
        vm_result = await self.orgo.create_computer(
            name=vm_name,
            ram=specs["ram"],
            cpu=specs["cpu"]
        )
        
        if vm_result:
            instance.orgo_vm_id = vm_result.get("id")
            instance.status = "provisioning"
            
            # Bootstrap the VM with King Mouse
            asyncio.create_task(self._bootstrap_king_mouse(instance))
        else:
            instance.status = "error"
            instance.error_message = "Failed to create VM"
        
        return instance
    
    async def _bootstrap_king_mouse(self, instance: VMInstance):
        """Bootstrap King Mouse on VM"""
        logger.info(f"Bootstrapping King Mouse for tenant {instance.tenant_id}")
        
        # Wait for VM to be ready
        await asyncio.sleep(30)
        
        # Setup script for King Mouse
        setup_script = f'''
import subprocess
import os

# Create working directory
os.makedirs("/home/user/openclaw", exist_ok=True)
os.chdir("/home/user/openclaw")

# Install dependencies
subprocess.run(["pip", "install", "--user", "fastapi", "uvicorn", "redis", "asyncpg", "python-telegram-bot", "cryptography"], check=True)

# Create env file
with open(".env", "w") as f:
    f.write("TENANT_ID={instance.tenant_id}\\n")
    f.write("CONTROL_PLANE_URL={os.getenv('CONTROL_PLANE_URL', '')}\\n")
    f.write("REDIS_URL={os.getenv('REDIS_URL', '')}\\n")
    f.write("DATABASE_URL={os.getenv('DATABASE_URL', '')}\\n")

print("King Mouse setup complete")
'''
        
        result = await self.orgo.execute_python(instance.orgo_vm_id, setup_script, timeout=300)
        
        if result and result.get("exitCode") == 0:
            instance.status = "running"
            instance.started_at = datetime.utcnow()
            
            # Update DB
            if self.redis:
                await self.redis.publish(f"tenant:{instance.tenant_id}:events", json.dumps({
                    "type": "king_mouse_ready",
                    "tenant_id": instance.tenant_id
                }))
        else:
            instance.status = "error"
            instance.error_message = result.get("stderr", "Bootstrap failed")
    
    async def provision_knight(self, tenant_id: str, knight_id: str, 
                              task: str, specs: Dict) -> VMInstance:
        """Provision a Knight VM for a task"""
        instance_id = f"knight-{knight_id[:8]}"
        
        instance = VMInstance(
            id=instance_id,
            tenant_id=tenant_id,
            vm_type="knight",
            knight_id=knight_id,
            orgo_vm_id=None,
            status="pending",
            ip_address=None,
            specs=specs,
            created_at=datetime.utcnow(),
            started_at=None,
            error_message=None
        )
        
        self.instances[instance_id] = instance
        
        # Create VM
        vm_name = f"knight-{knight_id[:8]}"
        vm_result = await self.orgo.create_computer(
            name=vm_name,
            ram=specs.get("ram_gb", 4),
            cpu=specs.get("cpu_cores", 2)
        )
        
        if vm_result:
            instance.orgo_vm_id = vm_result.get("id")
            instance.status = "provisioning"
            
            # Bootstrap Knight
            asyncio.create_task(self._bootstrap_knight(instance, task))
        else:
            instance.status = "error"
            instance.error_message = "Failed to create VM"
        
        return instance
    
    async def _bootstrap_knight(self, instance: VMInstance, task: str):
        """Bootstrap a Knight VM"""
        logger.info(f"Bootstrapping Knight {instance.knight_id}")
        
        # Wait for VM to be ready
        await asyncio.sleep(30)
        
        # Setup Knight environment
        setup_script = f'''
import subprocess
import os

os.makedirs("/home/user/knight", exist_ok=True)
os.chdir("/home/user/knight")

# Install Python dependencies
subprocess.run(["pip", "install", "--user", "requests", "httpx", "beautifulsoup4", "selenium", "playwright", "openai", "anthropic"], check=False)

# Install Node.js for some tools
subprocess.run(["curl", "-fsSL", "https://deb.nodesource.com/setup_20.x", "|", "bash"], shell=True, check=False)
subprocess.run(["apt-get", "install", "-y", "nodejs"], check=False)

print("Knight setup complete")
print("Task: {task}")
'''
        
        result = await self.orgo.execute_python(instance.orgo_vm_id, setup_script, timeout=300)
        
        if result and result.get("exitCode") == 0:
            instance.status = "running"
            instance.started_at = datetime.utcnow()
            
            # Notify via Redis
            if self.redis:
                await self.redis.publish(f"tenant:{instance.tenant_id}:events", json.dumps({
                    "type": "knight_ready",
                    "knight_id": instance.knight_id,
                    "task": task
                }))
        else:
            instance.status = "error"
            instance.error_message = result.get("stderr", "Knight bootstrap failed")
    
    async def stop_instance(self, instance_id: str) -> bool:
        """Stop and delete a VM instance"""
        instance = self.instances.get(instance_id)
        if not instance:
            return False
        
        instance.status = "stopping"
        
        if instance.orgo_vm_id:
            success = await self.orgo.delete_computer(instance.orgo_vm_id)
            if success:
                instance.status = "stopped"
                del self.instances[instance_id]
                return True
        
        return False
    
    async def _process_knight_queue(self):
        """Process knight provisioning queue"""
        while self._running:
            try:
                if self.redis:
                    # Pop from queue (blocking with timeout)
                    result = await self.redis.brpop("queue:knight:provision", timeout=5)
                    if result:
                        _, data = result
                        job = json.loads(data)
                        
                        await self.provision_knight(
                            job["tenant_id"],
                            job["knight_id"],
                            job["task"],
                            {"ram_gb": job.get("ram_gb", 4), "cpu_cores": job.get("cpu_cores", 2)}
                        )
                else:
                    await asyncio.sleep(5)
            except Exception as e:
                logger.error(f"Knight queue error: {e}")
                await asyncio.sleep(5)
    
    async def _process_message_queue(self):
        """Process incoming messages for AI handling"""
        while self._running:
            try:
                if self.redis:
                    result = await self.redis.brpop("queue:message:process", timeout=5)
                    if result:
                        _, data = result
                        job = json.loads(data)
                        
                        # Route to appropriate King Mouse
                        await self._route_message(job)
                else:
                    await asyncio.sleep(5)
            except Exception as e:
                logger.error(f"Message queue error: {e}")
                await asyncio.sleep(5)
    
    async def _route_message(self, job: Dict):
        """Route message to tenant's King Mouse"""
        tenant_id = job["tenant_id"]
        
        # Find King Mouse instance
        km_instance = None
        for inst in self.instances.values():
            if inst.tenant_id == tenant_id and inst.vm_type == "king_mouse":
                km_instance = inst
                break
        
        if not km_instance or km_instance.status != "running":
            logger.warning(f"No running King Mouse for tenant {tenant_id}")
            return
        
        # Send processing command to King Mouse VM
        # In production, this would be a proper API call or message queue
        logger.info(f"Routing message to King Mouse {km_instance.id}")
    
    async def _heartbeat_loop(self):
        """Periodic health checks"""
        while self._running:
            try:
                # Check all running instances
                for instance in list(self.instances.values()):
                    if instance.status == "running" and instance.orgo_vm_id:
                        # Get VM status from Orgo
                        vm_info = await self.orgo.get_computer(instance.orgo_vm_id)
                        if not vm_info:
                            logger.warning(f"VM {instance.id} not found in Orgo")
                            instance.status = "error"
                
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
                await asyncio.sleep(60)


# Singleton
_orchestrator: Optional[VMOrchestrator] = None

def get_orchestrator(redis_client=None) -> VMOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = VMOrchestrator(redis_client)
    return _orchestrator
