"""
Telegram Bot Handler
Manages per-tenant Telegram bot instances
"""

import asyncio
import logging
import json
from typing import Dict, Optional
from dataclasses import dataclass
import aiohttp

logger = logging.getLogger("telegram-handler")

@dataclass
class TelegramBot:
    tenant_id: str
    tenant_slug: str
    bot_token: str
    webhook_url: str
    is_active: bool = False
    bot_info: Optional[Dict] = None

class TelegramBotManager:
    """Manages multiple Telegram bot instances per tenant"""
    
    def __init__(self):
        self.bots: Dict[str, TelegramBot] = {}  # tenant_slug -> TelegramBot
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        return self._session
    
    async def register_bot(self, tenant_id: str, tenant_slug: str, bot_token: str, 
                          base_webhook_url: str) -> Dict:
        """Register and configure a new Telegram bot"""
        
        webhook_url = f"{base_webhook_url}/webhooks/telegram/{tenant_slug}"
        
        bot = TelegramBot(
            tenant_id=tenant_id,
            tenant_slug=tenant_slug,
            bot_token=bot_token,
            webhook_url=webhook_url
        )
        
        # Verify bot token and get info
        bot_info = await self._get_bot_info(bot_token)
        if not bot_info:
            return {"success": False, "error": "Invalid bot token"}
        
        bot.bot_info = bot_info
        
        # Set webhook
        webhook_set = await self._set_webhook(bot_token, webhook_url)
        if not webhook_set:
            return {"success": False, "error": "Failed to set webhook"}
        
        # Store bot
        self.bots[tenant_slug] = bot
        bot.is_active = True
        
        logger.info(f"Registered Telegram bot for tenant {tenant_slug}: @{bot_info.get('username')}")
        
        return {
            "success": True,
            "bot_username": bot_info.get("username"),
            "bot_name": bot_info.get("first_name")
        }
    
    async def unregister_bot(self, tenant_slug: str) -> bool:
        """Remove webhook and unregister bot"""
        bot = self.bots.get(tenant_slug)
        if not bot:
            return False
        
        # Delete webhook
        await self._delete_webhook(bot.bot_token)
        
        del self.bots[tenant_slug]
        logger.info(f"Unregistered Telegram bot for tenant {tenant_slug}")
        return True
    
    async def _get_bot_info(self, token: str) -> Optional[Dict]:
        """Get bot information from Telegram API"""
        session = await self._get_session()
        try:
            async with session.get(f"https://api.telegram.org/bot{token}/getMe") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data.get("ok"):
                        return data.get("result")
                return None
        except Exception as e:
            logger.error(f"Failed to get bot info: {e}")
            return None
    
    async def _set_webhook(self, token: str, url: str) -> bool:
        """Set webhook for bot"""
        session = await self._get_session()
        try:
            payload = {
                "url": url,
                "max_connections": 100,
                "allowed_updates": ["message", "callback_query"]
            }
            async with session.post(
                f"https://api.telegram.org/bot{token}/setWebhook",
                json=payload
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("ok", False)
                return False
        except Exception as e:
            logger.error(f"Failed to set webhook: {e}")
            return False
    
    async def _delete_webhook(self, token: str) -> bool:
        """Delete bot webhook"""
        session = await self._get_session()
        try:
            async with session.post(
                f"https://api.telegram.org/bot{token}/deleteWebhook"
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("ok", False)
                return False
        except Exception as e:
            logger.error(f"Failed to delete webhook: {e}")
            return False
    
    async def send_message(self, tenant_slug: str, chat_id: int, text: str, 
                          parse_mode: str = "Markdown") -> bool:
        """Send message to Telegram chat"""
        bot = self.bots.get(tenant_slug)
        if not bot:
            logger.error(f"No bot found for tenant {tenant_slug}")
            return False
        
        session = await self._get_session()
        try:
            # Split long messages
            max_length = 4096
            chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]
            
            for chunk in chunks:
                payload = {
                    "chat_id": chat_id,
                    "text": chunk,
                    "parse_mode": parse_mode
                }
                async with session.post(
                    f"https://api.telegram.org/bot{bot.bot_token}/sendMessage",
                    json=payload
                ) as resp:
                    if resp.status != 200:
                        logger.error(f"Failed to send message: {await resp.text()}")
                        return False
            
            return True
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            return False
    
    async def send_typing_action(self, tenant_slug: str, chat_id: int) -> bool:
        """Send typing action to chat"""
        bot = self.bots.get(tenant_slug)
        if not bot:
            return False
        
        session = await self._get_session()
        try:
            payload = {
                "chat_id": chat_id,
                "action": "typing"
            }
            async with session.post(
                f"https://api.telegram.org/bot{bot.bot_token}/sendChatAction",
                json=payload
            ) as resp:
                return resp.status == 200
        except Exception as e:
            logger.error(f"Failed to send typing action: {e}")
            return False
    
    async def close(self):
        """Close all connections"""
        if self._session and not self._session.closed:
            await self._session.close()


# Singleton instance
_bot_manager: Optional[TelegramBotManager] = None

def get_bot_manager() -> TelegramBotManager:
    global _bot_manager
    if _bot_manager is None:
        _bot_manager = TelegramBotManager()
    return _bot_manager
