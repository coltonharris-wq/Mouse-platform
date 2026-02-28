"""
Orgo Client
VM management via Orgo API with proper timeout handling
"""
import os
import httpx
from typing import Dict, List, Optional

# Default timeout values
DEFAULT_TIMEOUT = 30.0  # seconds
SCREENSHOT_TIMEOUT = 10.0  # seconds
HEALTH_TIMEOUT = 5.0  # seconds


class OrgoClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.orgo.ai"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def health(self) -> bool:
        """Check Orgo API health with short timeout"""
        try:
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
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
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
    
    async def get_computer(self, computer_id: str) -> Dict:
        """Get VM details with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.get(
                f"{self.base_url}/v1/computers/{computer_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_computer_status(self, computer_id: str) -> Dict:
        """Get VM status with timeout"""
        try:
            computer = await self.get_computer(computer_id)
            return {
                "status": computer["status"],
                "url": computer.get("url"),
                "created_at": computer.get("created_at")
            }
        except Exception:
            return {"status": "unknown"}
    
    async def stop_computer(self, computer_id: str):
        """Stop a VM with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(
                f"{self.base_url}/v1/computers/{computer_id}/stop",
                headers=self.headers
            )
            return response.json()
    
    async def start_computer(self, computer_id: str):
        """Start a VM with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(
                f"{self.base_url}/v1/computers/{computer_id}/start",
                headers=self.headers
            )
            return response.json()
    
    async def delete_computer(self, computer_id: str):
        """Delete a VM with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.delete(
                f"{self.base_url}/v1/computers/{computer_id}",
                headers=self.headers
            )
            return response.json()
    
    async def get_screenshot(self, computer_id: str) -> str:
        """Get VM screenshot as base64 with shorter timeout"""
        async with httpx.AsyncClient(timeout=SCREENSHOT_TIMEOUT) as client:
            response = await client.get(
                f"{self.base_url}/v1/computers/{computer_id}/screenshot",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return data.get("screenshot_base64", "")
    
    async def execute_python(self, computer_id: str, code: str, timeout: int = 30):
        """Execute Python code on VM with configurable timeout"""
        async with httpx.AsyncClient(timeout=timeout + 5) as client:  # Add buffer for network
            response = await client.post(
                f"{self.base_url}/v1/computers/{computer_id}/exec",
                headers=self.headers,
                json={"code": code, "timeout": timeout}
            )
            response.raise_for_status()
            return response.json()
    
    async def execute_bash(self, computer_id: str, command: str, timeout: int = 30):
        """Execute bash command on VM with configurable timeout"""
        async with httpx.AsyncClient(timeout=timeout + 5) as client:
            response = await client.post(
                f"{self.base_url}/v1/computers/{computer_id}/bash",
                headers=self.headers,
                json={"command": command, "timeout": timeout}
            )
            response.raise_for_status()
            return response.json()
    
    async def click(self, computer_id: str, x: int, y: int, double: bool = False):
        """Send mouse click with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(
                f"{self.base_url}/v1/computers/{computer_id}/click",
                headers=self.headers,
                json={"x": x, "y": y, "double": double}
            )
            return response.json()
    
    async def type_text(self, computer_id: str, text: str):
        """Type text with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(
                f"{self.base_url}/v1/computers/{computer_id}/type",
                headers=self.headers,
                json={"text": text}
            )
            return response.json()
    
    async def press_key(self, computer_id: str, key: str):
        """Press a key with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(
                f"{self.base_url}/v1/computers/{computer_id}/key",
                headers=self.headers,
                json={"key": key}
            )
            return response.json()
    
    async def list_all_vms(self) -> List[Dict]:
        """List all VMs with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.get(
                f"{self.base_url}/v1/computers",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json().get("computers", [])
