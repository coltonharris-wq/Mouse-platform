"""
WhatsApp Business API Handler
Manages per-tenant WhatsApp Business API connections
"""

import asyncio
import logging
import json
from typing import Dict, Optional, List
from dataclasses import dataclass
import aiohttp

logger = logging.getLogger("whatsapp-handler")

@dataclass
class WhatsAppConfig:
    tenant_id: str
    tenant_slug: str
    phone_number_id: str
    business_account_id: str
    access_token: str
    webhook_verify_token: str
    is_active: bool = False

class WhatsAppManager:
    """Manages WhatsApp Business API connections per tenant"""
    
    API_BASE = "https://graph.facebook.com/v18.0"
    
    def __init__(self):
        self.configs: Dict[str, WhatsAppConfig] = {}
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        return self._session
    
    async def register_config(self, tenant_id: str, tenant_slug: str, 
                             phone_number_id: str, access_token: str,
                             webhook_verify_token: str) -> Dict:
        """Register WhatsApp Business API configuration"""
        
        config = WhatsAppConfig(
            tenant_id=tenant_id,
            tenant_slug=tenant_slug,
            phone_number_id=phone_number_id,
            business_account_id="",  # Will be fetched
            access_token=access_token,
            webhook_verify_token=webhook_verify_token
        )
        
        # Verify token and get business account info
        business_info = await self._get_business_info(access_token)
        if not business_info:
            return {"success": False, "error": "Invalid access token"}
        
        config.business_account_id = business_info.get("id", "")
        config.is_active = True
        
        self.configs[tenant_slug] = config
        
        logger.info(f"Registered WhatsApp config for tenant {tenant_slug}")
        
        return {
            "success": True,
            "business_name": business_info.get("name"),
            "phone_number": await self._get_phone_number_info(config)
        }
    
    async def _get_business_info(self, access_token: str) -> Optional[Dict]:
        """Get WhatsApp Business account info"""
        session = await self._get_session()
        try:
            async with session.get(
                f"{self.API_BASE}/me",
                params={"access_token": access_token}
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.error(f"Failed to get business info: {e}")
            return None
    
    async def _get_phone_number_info(self, config: WhatsAppConfig) -> Optional[str]:
        """Get phone number information"""
        session = await self._get_session()
        try:
            async with session.get(
                f"{self.API_BASE}/{config.phone_number_id}",
                params={"access_token": config.access_token}
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("display_phone_number")
                return None
        except Exception as e:
            logger.error(f"Failed to get phone number info: {e}")
            return None
    
    async def send_message(self, tenant_slug: str, to_number: str, 
                          message: str, preview_url: bool = True) -> bool:
        """Send WhatsApp text message"""
        config = self.configs.get(tenant_slug)
        if not config:
            logger.error(f"No WhatsApp config for tenant {tenant_slug}")
            return False
        
        session = await self._get_session()
        try:
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": to_number,
                "type": "text",
                "text": {
                    "preview_url": preview_url,
                    "body": message
                }
            }
            
            async with session.post(
                f"{self.API_BASE}/{config.phone_number_id}/messages",
                headers={"Authorization": f"Bearer {config.access_token}"},
                json=payload
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("messages") is not None
                else:
                    error_text = await resp.text()
                    logger.error(f"WhatsApp send failed: {error_text}")
                    return False
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message: {e}")
            return False
    
    async def send_template_message(self, tenant_slug: str, to_number: str,
                                    template_name: str, language_code: str = "en",
                                    components: List[Dict] = None) -> bool:
        """Send WhatsApp template message"""
        config = self.configs.get(tenant_slug)
        if not config:
            return False
        
        session = await self._get_session()
        try:
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": to_number,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": language_code}
                }
            }
            
            if components:
                payload["template"]["components"] = components
            
            async with session.post(
                f"{self.API_BASE}/{config.phone_number_id}/messages",
                headers={"Authorization": f"Bearer {config.access_token}"},
                json=payload
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("messages") is not None
                return False
        except Exception as e:
            logger.error(f"Failed to send template message: {e}")
            return False
    
    async def verify_webhook(self, tenant_slug: str, mode: str, token: str,
                            challenge: str) -> Optional[str]:
        """Verify webhook subscription"""
        config = self.configs.get(tenant_slug)
        if not config:
            return None
        
        if mode == "subscribe" and token == config.webhook_verify_token:
            return challenge
        return None
    
    async def mark_as_read(self, tenant_slug: str, message_id: str) -> bool:
        """Mark message as read"""
        config = self.configs.get(tenant_slug)
        if not config:
            return False
        
        session = await self._get_session()
        try:
            payload = {
                "messaging_product": "whatsapp",
                "status": "read",
                "message_id": message_id
            }
            
            async with session.post(
                f"{self.API_BASE}/{config.phone_number_id}/messages",
                headers={"Authorization": f"Bearer {config.access_token}"},
                json=payload
            ) as resp:
                return resp.status == 200
        except Exception as e:
            logger.error(f"Failed to mark as read: {e}")
            return False
    
    async def get_templates(self, tenant_slug: str) -> List[Dict]:
        """Get available message templates"""
        config = self.configs.get(tenant_slug)
        if not config:
            return []
        
        session = await self._get_session()
        try:
            async with session.get(
                f"{self.API_BASE}/{config.business_account_id}/message_templates",
                params={"access_token": config.access_token}
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("data", [])
                return []
        except Exception as e:
            logger.error(f"Failed to get templates: {e}")
            return []
    
    async def close(self):
        """Close connections"""
        if self._session and not self._session.closed:
            await self._session.close()


# Singleton
_whatsapp_manager: Optional[WhatsAppManager] = None

def get_whatsapp_manager() -> WhatsAppManager:
    global _whatsapp_manager
    if _whatsapp_manager is None:
        _whatsapp_manager = WhatsAppManager()
    return _whatsapp_manager
