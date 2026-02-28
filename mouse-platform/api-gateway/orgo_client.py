"""
Orgo Client
VM management via Orgo API with proper timeout handling, caching, and concurrent operations
"""
import os
import asyncio
import httpx
from typing import Dict, List, Optional

# Default timeout values
DEFAULT_TIMEOUT = 30.0  # seconds
SCREENSHOT_TIMEOUT = 10.0  # seconds
HEALTH_TIMEOUT = 5.0  # seconds
BATCH_SIZE = 10  # Max concurrent requests


class OrgoClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.orgo.ai"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        # Shared client for connection pooling
        self._client = None
        
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create shared HTTP client with connection pooling"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=DEFAULT_TIMEOUT,
                limits=httpx.Limits(max_connections=50, max_keepalive_connections=20)
            )
        return self._client
        
    async def close(self):
        """Close the HTTP client"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None
    
    def health(self) -> bool:
        """Check Orgo API health with short timeout"""
        try:
            # Use sync client for health check
            response = httpx.get(
                f"{self.base_url}/health", 
                headers=self.headers,
                timeout=HEALTH_TIMEOUT
            )
            return response.status_code == 200
        except Exception:
            return False
    
    async def create_computer(self, workspace_id: str, config: Dict) -> Dict:
        """Create a new VM with timeout"""
        client = await self._get_client()
        response = await client.post(
            f"{self.base_url}/v1/workspaces/{workspace_id}/computers",
            headers=self.headers,
            json={
                "name": config["name"],
                "os": config.get("os", "linux"),
                "ram": config.get("ram", 4),
                "cpu": config.get("cpu", 2)
            }
        )
        response.raise_for_status()
        data = response.json()
        return {
            "id": data["id"],
            "name": data["name"],
            "url": data["url"],
            "status": data["status"]
        }
    
    async def get_computer(self, computer_id: str, use_cache: bool = True) -> Dict:
        """Get VM details with caching support"""
        # Check cache first
        if use_cache:
            from cache_manager import vm_status_cache
            cached = await vm_status_cache.get_vm_status(computer_id)
            if cached:
                return cached
        
        # Fetch from API
        client = await self._get_client()
        response = await client.get(
            f"{self.base_url}/v1/computers/{computer_id}",
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        
        # Update cache
        if use_cache:
            from cache_manager import vm_status_cache
            await vm_status_cache.cache_vm_status(computer_id, data)
        
        return data
    
    async def get_computer_status(self, computer_id: str, use_cache: bool = True) -> Dict:
        """Get VM status with caching"""
        from cache_manager import vm_status_cache
        
        # Check cache first
        if use_cache:
            cached = await vm_status_cache.get_vm_status(computer_id)
            if cached:
                return cached
        
        # Fetch fresh data
        try:
            computer = await self.get_computer(computer_id, use_cache=False)
            status_data = {
                "status": computer["status"],
                "url": computer.get("url"),
                "created_at": computer.get("created_at")
            }
            await vm_status_cache.cache_vm_status(computer_id, status_data)
            return status_data
        except Exception:
            return {"status": "unknown"}
    
    async def get_computers_batch(self, computer_ids: List[str], 
                                   use_cache: bool = True) -> List[Dict]:
        """Fetch multiple VMs concurrently with semaphore-controlled batching"""
        from cache_manager import vm_status_cache
        
        if not computer_ids:
            return []
        
        # Check cache for all IDs first
        if use_cache:
            cached_results = []
            ids_to_fetch = []
            
            for cid in computer_ids:
                cached = await vm_status_cache.get_vm_status(cid)
                if cached:
                    cached_results.append({"id": cid, **cached})
                else:
                    ids_to_fetch.append(cid)
        else:
            ids_to_fetch = computer_ids
            cached_results = []
        
        if not ids_to_fetch:
            return cached_results
        
        # Fetch remaining IDs with concurrency limit
        semaphore = asyncio.Semaphore(BATCH_SIZE)
        
        async def fetch_one(cid: str) -> Dict:
            async with semaphore:
                try:
                    data = await self.get_computer(cid, use_cache=False)
                    return {"id": cid, **data}
                except Exception as e:
                    return {"id": cid, "error": str(e), "status": "error"}
        
        # Run all fetches concurrently
        fetched_results = await asyncio.gather(
            *[fetch_one(cid) for cid in ids_to_fetch],
            return_exceptions=True
        )
        
        # Combine cached and fetched results
        all_results = cached_results + [
            r for r in fetched_results 
            if not isinstance(r, Exception)
        ]
        
        return all_results
    
    async def stop_computer(self, computer_id: str):
        """Stop a VM and invalidate cache"""
        from cache_manager import vm_status_cache, screenshot_cache
        
        client = await self._get_client()
        response = await client.post(
            f"{self.base_url}/v1/computers/{computer_id}/stop",
            headers=self.headers
        )
        
        # Invalidate caches
        await vm_status_cache.invalidate_vm_status(computer_id)
        await screenshot_cache.delete(f"screenshot:{computer_id}")
        
        return response.json()
    
    async def start_computer(self, computer_id: str):
        """Start a VM and invalidate cache"""
        from cache_manager import vm_status_cache
        
        client = await self._get_client()
        response = await client.post(
            f"{self.base_url}/v1/computers/{computer_id}/start",
            headers=self.headers
        )
        
        # Invalidate cache
        await vm_status_cache.invalidate_vm_status(computer_id)
        
        return response.json()
    
    async def delete_computer(self, computer_id: str):
        """Delete a VM and invalidate cache"""
        from cache_manager import vm_status_cache, screenshot_cache
        
        client = await self._get_client()
        response = await client.delete(
            f"{self.base_url}/v1/computers/{computer_id}",
            headers=self.headers
        )
        
        # Invalidate caches
        await vm_status_cache.invalidate_vm_status(computer_id)
        await screenshot_cache.delete(f"screenshot:{computer_id}")
        
        return response.json()
    
    async def get_screenshot(self, computer_id: str, quality: str = "medium",
                            use_cache: bool = True) -> str:
        """Get VM screenshot with caching and compression"""
        from cache_manager import screenshot_cache
        
        # Check cache first
        if use_cache:
            cached = await screenshot_cache.get_screenshot(computer_id)
            if cached:
                return cached["data"]
        
        # Fetch from API
        client = await self._get_client()
        response = await client.get(
            f"{self.base_url}/v1/computers/{computer_id}/screenshot",
            headers=self.headers,
            timeout=SCREENSHOT_TIMEOUT
        )
        response.raise_for_status()
        data = response.json()
        screenshot_base64 = data.get("screenshot_base64", "")
        
        # Cache with compression
        if screenshot_base64:
            compressed = await screenshot_cache.cache_screenshot(
                computer_id, screenshot_base64, quality
            )
            return compressed
        
        return screenshot_base64
    
    async def get_screenshots_batch(self, computer_ids: List[str],
                                     quality: str = "medium") -> Dict[str, str]:
        """Fetch screenshots for multiple VMs concurrently"""
        from cache_manager import screenshot_cache
        
        if not computer_ids:
            return {}
        
        # Check cache first
        results = {}
        ids_to_fetch = []
        
        for cid in computer_ids:
            cached = await screenshot_cache.get_screenshot(cid)
            if cached:
                results[cid] = cached["data"]
            else:
                ids_to_fetch.append(cid)
        
        if not ids_to_fetch:
            return results
        
        # Fetch remaining with concurrency limit
        semaphore = asyncio.Semaphore(BATCH_SIZE)
        
        async def fetch_one(cid: str) -> tuple:
            async with semaphore:
                try:
                    screenshot = await self.get_screenshot(cid, quality, use_cache=False)
                    return (cid, screenshot)
                except Exception as e:
                    return (cid, "")
        
        fetched = await asyncio.gather(
            *[fetch_one(cid) for cid in ids_to_fetch],
            return_exceptions=True
        )
        
        for item in fetched:
            if isinstance(item, tuple):
                cid, screenshot = item
                if screenshot:
                    results[cid] = screenshot
        
        return results
    
    async def execute_python(self, computer_id: str, code: str, timeout: int = 30):
        """Execute Python code on VM with configurable timeout"""
        client = await self._get_client()
        response = await client.post(
            f"{self.base_url}/v1/computers/{computer_id}/exec",
            headers=self.headers,
            json={"code": code, "timeout": timeout},
            timeout=timeout + 10  # Add buffer for network
        )
        response.raise_for_status()
        return response.json()
    
    async def execute_bash(self, computer_id: str, command: str, timeout: int = 30):
        """Execute bash command on VM with configurable timeout"""
        client = await self._get_client()
        response = await client.post(
            f"{self.base_url}/v1/computers/{computer_id}/bash",
            headers=self.headers,
            json={"command": command, "timeout": timeout},
            timeout=timeout + 10
        )
        response.raise_for_status()
        return response.json()
    
    async def click(self, computer_id: str, x: int, y: int, double: bool = False):
        """Send mouse click with timeout"""
        client = await self._get_client()
        response = await client.post(
            f"{self.base_url}/v1/computers/{computer_id}/click",
            headers=self.headers,
            json={"x": x, "y": y, "double": double}
        )
        return response.json()
    
    async def type_text(self, computer_id: str, text: str):
        """Type text with timeout"""
        client = await self._get_client()
        response = await client.post(
            f"{self.base_url}/v1/computers/{computer_id}/type",
            headers=self.headers,
            json={"text": text}
        )
        return response.json()
    
    async def press_key(self, computer_id: str, key: str):
        """Press a key with timeout"""
        client = await self._get_client()
        response = await client.post(
            f"{self.base_url}/v1/computers/{computer_id}/key",
            headers=self.headers,
            json={"key": key}
        )
        return response.json()
    
    async def list_all_vms(self, use_cache: bool = True) -> List[Dict]:
        """List all VMs with optional caching"""
        from cache_manager import general_cache, vm_status_cache
        
        cache_key = "all_vms"
        
        if use_cache:
            cached = await general_cache.get(cache_key)
            if cached:
                return cached
        
        client = await self._get_client()
        response = await client.get(
            f"{self.base_url}/v1/computers",
            headers=self.headers
        )
        response.raise_for_status()
        vms = response.json().get("computers", [])
        
        # Cache individual VM statuses
        for vm in vms:
            vm_id = vm.get("id")
            if vm_id:
                await vm_status_cache.cache_vm_status(vm_id, vm)
        
        # Cache full list briefly
        if use_cache:
            await general_cache.set(cache_key, vms, ttl=5)
        
        return vms
