"""
King Mouse Runtime
This runs inside each tenant's VM and handles AI processing
"""

import asyncio
import json
import logging
import os
from typing import Optional, Dict, List
import redis.asyncio as redis
import asyncpg
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("king-mouse")

class KingMouseRuntime:
    """AI Agent runtime for tenant VMs"""
    
    def __init__(self):
        self.tenant_id = os.getenv("TENANT_ID")
        self.control_plane_url = os.getenv("CONTROL_PLANE_URL")
        self.redis_url = os.getenv("REDIS_URL")
        self.db_url = os.getenv("DATABASE_URL")
        
        self.redis: Optional[redis.Redis] = None
        self.db: Optional[asyncpg.Connection] = None
        self._running = False
        
        # Skill registry
        self.skills: Dict[str, any] = {}
    
    async def start(self):
        """Start the King Mouse runtime"""
        logger.info(f"Starting King Mouse for tenant {self.tenant_id}")
        
        # Connect to Redis
        self.redis = redis.from_url(self.redis_url, decode_responses=True)
        await self.redis.ping()
        logger.info("Connected to Redis")
        
        # Connect to database
        self.db = await asyncpg.connect(self.db_url)
        await self.db.execute("SELECT set_tenant_context($1)", self.tenant_id)
        logger.info("Connected to database")
        
        # Load skills
        await self._load_skills()
        
        self._running = True
        
        # Start processing loops
        await asyncio.gather(
            self._process_message_queue(),
            self._heartbeat_loop()
        )
    
    async def stop(self):
        """Stop the runtime"""
        self._running = False
        if self.db:
            await self.db.close()
        if self.redis:
            await self.redis.close()
    
    async def _load_skills(self):
        """Load available skills for this tenant"""
        # Query enabled skills from database
        rows = await self.db.fetch(
            "SELECT skill_name, config FROM tenant_skills WHERE is_enabled = TRUE"
        )
        
        for row in rows:
            skill_name = row["skill_name"]
            try:
                # Import and initialize skill
                # This would dynamically load skill modules
                self.skills[skill_name] = {
                    "name": skill_name,
                    "config": json.loads(row["config"])
                }
                logger.info(f"Loaded skill: {skill_name}")
            except Exception as e:
                logger.error(f"Failed to load skill {skill_name}: {e}")
    
    async def _process_message_queue(self):
        """Process incoming messages from Redis queue"""
        queue_name = f"tenant:{self.tenant_id}:messages"
        
        while self._running:
            try:
                # Pop message from queue
                result = await self.redis.brpop(queue_name, timeout=5)
                if result:
                    _, data = result
                    message = json.loads(data)
                    await self._handle_message(message)
            except Exception as e:
                logger.error(f"Message processing error: {e}")
                await asyncio.sleep(1)
    
    async def _handle_message(self, message: Dict):
        """Handle a single message"""
        conversation_id = message.get("conversation_id")
        content = message.get("content")
        channel = message.get("channel")
        
        logger.info(f"Processing message from {channel}: {content[:50]}...")
        
        # Get conversation history for context
        history = await self._get_conversation_history(conversation_id)
        
        # Generate AI response
        response = await self._generate_response(content, history)
        
        # Store response
        await self._store_response(conversation_id, response)
        
        # Send response via appropriate channel
        await self._send_response(channel, message, response)
    
    async def _get_conversation_history(self, conversation_id: str, limit: int = 10) -> List[Dict]:
        """Get recent conversation history"""
        rows = await self.db.fetch(
            """SELECT role, content, created_at 
               FROM messages 
               WHERE conversation_id = $1
               ORDER BY created_at DESC LIMIT $2""",
            conversation_id, limit
        )
        return [dict(r) for r in reversed(rows)]
    
    async def _generate_response(self, content: str, history: List[Dict]) -> str:
        """Generate AI response using configured LLM"""
        # This would integrate with OpenAI, Anthropic, or local models
        # For now, return a placeholder
        
        # Check if a Knight should be deployed
        if any(kw in content.lower() for kw in ["build", "code", "create", "develop", "script"]):
            # Queue Knight deployment
            await self.redis.lpush("queue:knight:deploy", json.dumps({
                "tenant_id": self.tenant_id,
                "task": content
            }))
            return "I'll deploy a Knight to handle this task. You can watch the progress on your dashboard."
        
        # Simple response for other queries
        return f"I'm your AI assistant. I received your message: '{content[:50]}...' How can I help you further?"
    
    async def _store_response(self, conversation_id: str, response: str):
        """Store AI response in database"""
        await self.db.execute(
            """INSERT INTO messages (tenant_id, conversation_id, role, content)
               VALUES ($1, $2, 'assistant', $3)""",
            self.tenant_id, conversation_id, response
        )
    
    async def _send_response(self, channel: str, original_message: Dict, response: str):
        """Send response back to user"""
        if channel == "telegram":
            await self._send_telegram_response(original_message, response)
        elif channel == "whatsapp":
            await self._send_whatsapp_response(original_message, response)
        
        # Also publish to real-time websocket
        await self.redis.publish(f"tenant:{self.tenant_id}:events", json.dumps({
            "type": "new_message",
            "conversation_id": original_message.get("conversation_id"),
            "role": "assistant",
            "content": response
        }))
    
    async def _send_telegram_response(self, message: Dict, response: str):
        """Send response via Telegram"""
        chat_id = message.get("telegram_chat_id")
        # This would call Telegram API via control plane
        logger.info(f"Would send Telegram response to {chat_id}")
    
    async def _send_whatsapp_response(self, message: Dict, response: str):
        """Send response via WhatsApp"""
        phone = message.get("whatsapp_number")
        logger.info(f"Would send WhatsApp response to {phone}")
    
    async def _heartbeat_loop(self):
        """Send periodic heartbeat to control plane"""
        while self._running:
            try:
                await self.redis.setex(
                    f"king_mouse:{self.tenant_id}:heartbeat",
                    60,  # 60 second TTL
                    datetime.utcnow().isoformat()
                )
                await asyncio.sleep(30)
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
                await asyncio.sleep(5)


async def main():
    runtime = KingMouseRuntime()
    
    try:
        await runtime.start()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        await runtime.stop()


if __name__ == "__main__":
    asyncio.run(main())
