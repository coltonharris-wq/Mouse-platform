"""
Telegram Bot Client
Handle Telegram messaging with proper timeout handling
"""
import os
import httpx
from typing import Optional

# Default timeout values
DEFAULT_TIMEOUT = 30.0  # seconds
HEALTH_TIMEOUT = 5.0  # seconds


class TelegramBot:
    def __init__(self, token: str):
        self.token = token
        self.base_url = f"https://api.telegram.org/bot{token}"
    
    def health(self) -> bool:
        """Check Telegram Bot API health with short timeout"""
        try:
            response = httpx.get(
                f"{self.base_url}/getMe",
                timeout=HEALTH_TIMEOUT
            )
            return response.status_code == 200 and response.json().get("ok")
        except Exception:
            return False
    
    async def send_message(self, chat_id: int, text: str, parse_mode: str = "HTML"):
        """Send message to chat with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(
                f"{self.base_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": parse_mode
                }
            )
            return response.json()
    
    async def send_photo(self, chat_id: int, photo_url: str, caption: Optional[str] = None):
        """Send photo to chat with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            payload = {
                "chat_id": chat_id,
                "photo": photo_url
            }
            if caption:
                payload["caption"] = caption
            
            response = await client.post(
                f"{self.base_url}/sendPhoto",
                json=payload
            )
            return response.json()
    
    async def set_webhook(self, url: str, secret_token: Optional[str] = None):
        """Set webhook URL with optional secret token for security"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            payload = {"url": url}
            if secret_token:
                payload["secret_token"] = secret_token
            
            response = await client.post(
                f"{self.base_url}/setWebhook",
                json=payload
            )
            return response.json()
    
    async def delete_webhook(self):
        """Delete webhook with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(f"{self.base_url}/deleteWebhook")
            return response.json()
    
    async def get_updates(self, offset: Optional[int] = None):
        """Get pending updates with timeout"""
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            payload = {}
            if offset:
                payload["offset"] = offset
            
            response = await client.post(
                f"{self.base_url}/getUpdates",
                json=payload
            )
            return response.json()
