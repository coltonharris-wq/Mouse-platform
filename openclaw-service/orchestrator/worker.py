"""
Worker process for VM orchestration
Runs as a background worker to handle VM lifecycle
"""

import asyncio
import json
import logging
import os
import redis.asyncio as redis
import asyncpg

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orchestrator-worker")

from vm_orchestrator import get_orchestrator

async def main():
    """Main worker loop"""
    # Connect to Redis
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.from_url(redis_url, decode_responses=True)
    
    # Connect to database
    db_url = os.getenv("DATABASE_URL", "postgresql://localhost/openclaw")
    db = await asyncpg.connect(db_url)
    
    # Get orchestrator
    orchestrator = get_orchestrator(redis_client)
    await orchestrator.start()
    
    logger.info("Orchestrator worker started")
    
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        await orchestrator.stop()
        await db.close()
        await redis_client.close()

if __name__ == "__main__":
    asyncio.run(main())
