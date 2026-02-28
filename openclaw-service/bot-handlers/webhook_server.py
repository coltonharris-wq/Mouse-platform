"""
Webhook server - dedicated process for handling webhooks at scale
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import asyncio
import json
import logging
import os
import redis.asyncio as redis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("webhook-server")

app = FastAPI(title="OpenClaw Webhook Handler")

# Redis connection
redis_client = None

@app.on_event("startup")
async def startup():
    global redis_client
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.from_url(redis_url, decode_responses=True)
    logger.info("Webhook server started")

@app.on_event("shutdown")
async def shutdown():
    if redis_client:
        await redis_client.close()

@app.post("/webhooks/telegram/{tenant_slug}")
async def telegram_webhook(tenant_slug: str, request: Request):
    """Handle Telegram webhook"""
    data = await request.json()
    
    # Queue for processing
    await redis_client.lpush("webhook:telegram:queue", json.dumps({
        "tenant_slug": tenant_slug,
        "data": data
    }))
    
    return {"ok": True}

@app.post("/webhooks/whatsapp/{tenant_slug}")
async def whatsapp_webhook(tenant_slug: str, request: Request):
    """Handle WhatsApp webhook"""
    data = await request.json()
    
    await redis_client.lpush("webhook:whatsapp:queue", json.dumps({
        "tenant_slug": tenant_slug,
        "data": data
    }))
    
    return {"status": "ok"}

@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    await redis_client.lpush("webhook:stripe:queue", json.dumps({
        "payload": payload.decode(),
        "signature": sig_header
    }))
    
    return {"received": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
