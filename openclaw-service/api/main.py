"""
OpenClaw-as-a-Service API Core
FastAPI application with multi-tenant support
"""

from fastapi import FastAPI, Depends, HTTPException, Security, BackgroundTasks, Request, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncpg
import redis.asyncio as redis
import os
import json
import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import uuid
import hashlib
import hmac

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("openclaw-api")

# ============================================
# CONFIGURATION
# ============================================

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/openclaw")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
    API_KEY_SECRET = os.getenv("API_KEY_SECRET", "api-key-secret")
    TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", "")
    WHATSAPP_WEBHOOK_SECRET = os.getenv("WHATSAPP_WEBHOOK_SECRET", "")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    ORGO_API_KEY = os.getenv("ORGO_API_KEY", "")
    ORGO_WORKSPACE_ID = os.getenv("ORGO_WORKSPACE_ID", "")
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")
    ENV = os.getenv("ENV", "development")
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

# ============================================
# DATABASE & REDIS CONNECTION
# ============================================

pool: Optional[asyncpg.Pool] = None
redis_client: Optional[redis.Redis] = None

async def get_db() -> asyncpg.Connection:
    async with pool.acquire() as conn:
        yield conn

async def get_redis() -> redis.Redis:
    return redis_client

# ============================================
# AUTHENTICATION
# ============================================

security = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

class TenantContext:
    def __init__(self, tenant_id: str, user_id: Optional[str] = None, scopes: List[str] = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.scopes = scopes or ["read"]

async def verify_jwt_token(token: str) -> Optional[TenantContext]:
    """Verify JWT token and return tenant context"""
    try:
        import jwt
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        return TenantContext(
            tenant_id=payload.get("tenant_id"),
            user_id=payload.get("user_id"),
            scopes=payload.get("scopes", ["read"])
        )
    except Exception as e:
        logger.warning(f"JWT verification failed: {e}")
        return None

async def verify_api_key(api_key: str) -> Optional[TenantContext]:
    """Verify API key and return tenant context"""
    try:
        # Hash the provided key
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """SELECT tenant_id, scopes FROM tenant_api_keys 
                   WHERE key_hash = $1 AND revoked_at IS NULL 
                   AND (expires_at IS NULL OR expires_at > NOW())""",
                key_hash
            )
            if row:
                # Update last_used_at
                await conn.execute(
                    "UPDATE tenant_api_keys SET last_used_at = NOW() WHERE key_hash = $1",
                    key_hash
                )
                return TenantContext(
                    tenant_id=str(row["tenant_id"]),
                    scopes=json.loads(row["scopes"]) if isinstance(row["scopes"], str) else row["scopes"]
                )
        return None
    except Exception as e:
        logger.error(f"API key verification failed: {e}")
        return None

async def get_current_tenant(
    credentials: HTTPAuthorizationCredentials = Security(security),
    api_key: str = Security(api_key_header)
) -> TenantContext:
    """Dependency to get current tenant from JWT or API key"""
    
    # Try JWT first
    if credentials and credentials.credentials:
        context = await verify_jwt_token(credentials.credentials)
        if context:
            return context
    
    # Try API key
    if api_key:
        context = await verify_api_key(api_key)
        if context:
            return context
    
    raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def require_scope(scope: str):
    """Dependency factory to require specific scope"""
    async def checker(tenant: TenantContext = Depends(get_current_tenant)):
        if scope not in tenant.scopes and "admin" not in tenant.scopes:
            raise HTTPException(status_code=403, detail=f"Required scope: {scope}")
        return tenant
    return checker

# ============================================
# PYDANTIC MODELS
# ============================================

class CreateTenantRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    company_name: Optional[str] = None
    subscription_tier: str = Field(default="free", pattern=r'^(free|starter|pro|enterprise)$')

class TenantResponse(BaseModel):
    id: str
    name: str
    email: str
    subscription_tier: str
    subscription_status: str
    created_at: datetime
    
class CreateConversationRequest(BaseModel):
    channel: str = Field(..., pattern=r'^(telegram|whatsapp|web|api)$')
    external_id: Optional[str] = None
    title: Optional[str] = None

class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)
    channel: str = Field(default="api", pattern=r'^(telegram|whatsapp|web|api)$')
    conversation_id: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime

class DeployKnightRequest(BaseModel):
    task_description: str = Field(..., min_length=1, max_length=5000)
    name: Optional[str] = None
    ram_gb: int = Field(default=4, ge=4, le=32)
    cpu_cores: int = Field(default=2, ge=2, le=16)
    priority: int = Field(default=0, ge=0, le=10)

class KnightResponse(BaseModel):
    id: str
    name: Optional[str]
    status: str
    task_description: str
    vm_id: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

class WebhookPayload(BaseModel):
    update_id: Optional[int] = None
    message: Optional[Dict[str, Any]] = None
    callback_query: Optional[Dict[str, Any]] = None

# ============================================
# BUSINESS LOGIC
# ============================================

class TenantManager:
    @staticmethod
    async def create_tenant(data: CreateTenantRequest) -> dict:
        """Create new tenant with isolated resources"""
        tenant_id = str(uuid.uuid4())
        slug = data.name.lower().replace(" ", "-")[:50]
        
        async with pool.acquire() as conn:
            # Check for duplicate slug
            existing = await conn.fetchval("SELECT 1 FROM tenants WHERE slug = $1", slug)
            if existing:
                slug = f"{slug}-{uuid.uuid4().hex[:8]}"
            
            await conn.execute(
                """INSERT INTO tenants (id, name, slug, email, subscription_tier)
                   VALUES ($1, $2, $3, $4, $5)""",
                tenant_id, data.name, slug, data.email, data.subscription_tier
            )
            
            # Log audit event
            await conn.execute(
                "SELECT log_audit_event($1, NULL, 'tenant_created', 'tenant', $1::uuid, $2::jsonb)",
                tenant_id, json.dumps({"name": data.name, "tier": data.subscription_tier})
            )
        
        # Trigger async provisioning
        await redis_client.publish("tenant:provision", json.dumps({
            "tenant_id": tenant_id,
            "action": "provision"
        }))
        
        return {"id": tenant_id, "slug": slug}
    
    @staticmethod
    async def get_tenant(tenant_id: str) -> Optional[dict]:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM tenants WHERE id = $1 AND deleted_at IS NULL",
                tenant_id
            )
            return dict(row) if row else None

class ConversationManager:
    @staticmethod
    async def create_conversation(tenant_id: str, data: CreateConversationRequest) -> dict:
        conv_id = str(uuid.uuid4())
        
        async with pool.acquire() as conn:
            # Set tenant context for RLS
            await conn.execute("SELECT set_tenant_context($1)", tenant_id)
            
            await conn.execute(
                """INSERT INTO conversations (id, tenant_id, channel, external_id, title)
                   VALUES ($1, $2, $3, $4, $5)""",
                conv_id, tenant_id, data.channel, data.external_id, data.title
            )
        
        return {"id": conv_id, "channel": data.channel}
    
    @staticmethod
    async def get_or_create_conversation(tenant_id: str, channel: str, external_id: str) -> dict:
        async with pool.acquire() as conn:
            await conn.execute("SELECT set_tenant_context($1)", tenant_id)
            
            # Try to find existing conversation
            row = await conn.fetchrow(
                """SELECT id FROM conversations 
                   WHERE tenant_id = $1 AND channel = $2 AND external_id = $3
                   AND status = 'active' ORDER BY created_at DESC LIMIT 1""",
                tenant_id, channel, external_id
            )
            
            if row:
                return {"id": str(row["id"]), "exists": True}
            
            # Create new conversation
            conv_id = str(uuid.uuid4())
            await conn.execute(
                """INSERT INTO conversations (id, tenant_id, channel, external_id)
                   VALUES ($1, $2, $3, $4)""",
                conv_id, tenant_id, channel, external_id
            )
            
            return {"id": conv_id, "exists": False}
    
    @staticmethod
    async def add_message(tenant_id: str, conversation_id: str, role: str, content: str, 
                         metadata: dict = None) -> dict:
        msg_id = str(uuid.uuid4())
        
        async with pool.acquire() as conn:
            await conn.execute("SELECT set_tenant_context($1)", tenant_id)
            
            await conn.execute(
                """INSERT INTO messages (id, tenant_id, conversation_id, role, content, metadata)
                   VALUES ($1, $2, $3, $4, $5, $6)""",
                msg_id, tenant_id, conversation_id, role, content, json.dumps(metadata or {})
            )
        
        return {"id": msg_id}
    
    @staticmethod
    async def get_conversation_history(tenant_id: str, conversation_id: str, limit: int = 50) -> List[dict]:
        async with pool.acquire() as conn:
            await conn.execute("SELECT set_tenant_context($1)", tenant_id)
            
            rows = await conn.fetch(
                """SELECT id, role, content, created_at, metadata 
                   FROM messages WHERE conversation_id = $1
                   ORDER BY created_at DESC LIMIT $2""",
                conversation_id, limit
            )
            
            return [dict(r) for r in rows]

class KnightManager:
    @staticmethod
    async def deploy_knight(tenant_id: str, data: DeployKnightRequest) -> dict:
        knight_id = str(uuid.uuid4())
        
        async with pool.acquire() as conn:
            # Check tenant limits
            tenant = await conn.fetchrow(
                "SELECT max_knights FROM tenants WHERE id = $1", tenant_id
            )
            
            current_count = await conn.fetchval(
                """SELECT COUNT(*) FROM knights 
                   WHERE tenant_id = $1 AND status IN ('pending', 'provisioning', 'running')""",
                tenant_id
            )
            
            if current_count >= tenant["max_knights"]:
                raise HTTPException(status_code=402, detail="Knight limit reached for subscription tier")
            
            await conn.execute("SELECT set_tenant_context($1)", tenant_id)
            
            await conn.execute(
                """INSERT INTO knights (id, tenant_id, name, task_description, ram_gb, cpu_cores, priority, status)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')""",
                knight_id, tenant_id, data.name or f"Knight-{knight_id[:8]}",
                data.task_description, data.ram_gb, data.cpu_cores, data.priority
            )
        
        # Queue VM provisioning
        await redis_client.lpush("queue:knight:provision", json.dumps({
            "knight_id": knight_id,
            "tenant_id": tenant_id,
            "ram_gb": data.ram_gb,
            "cpu_cores": data.cpu_cores,
            "task": data.task_description
        }))
        
        return {"id": knight_id, "status": "pending"}
    
    @staticmethod
    async def get_knights(tenant_id: str, status: Optional[str] = None) -> List[dict]:
        async with pool.acquire() as conn:
            await conn.execute("SELECT set_tenant_context($1)", tenant_id)
            
            query = "SELECT * FROM knights WHERE tenant_id = $1"
            params = [tenant_id]
            
            if status and status != "all":
                query += " AND status = $2"
                params.append(status)
            
            query += " ORDER BY created_at DESC"
            
            rows = await conn.fetch(query, *params)
            return [dict(r) for r in rows]

# ============================================
# LIFESPAN & APP SETUP
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global pool, redis_client
    
    logger.info("Connecting to database...")
    pool = await asyncpg.create_pool(
        Config.DATABASE_URL,
        min_size=5,
        max_size=20,
        command_timeout=60
    )
    
    logger.info("Connecting to Redis...")
    redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
    await redis_client.ping()
    
    logger.info("OpenClaw API started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await pool.close()
    await redis_client.close()

app = FastAPI(
    title="OpenClaw-as-a-Service",
    description="Multi-tenant AI agent platform",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=Config.ALLOWED_HOSTS)

# ============================================
# HEALTH & STATUS
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health = {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
    
    try:
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        health["database"] = "connected"
    except Exception as e:
        health["database"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    try:
        await redis_client.ping()
        health["redis"] = "connected"
    except Exception as e:
        health["redis"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    return health

# ============================================
# TENANT APIs
# ============================================

@app.post("/api/v1/tenants", response_model=dict)
async def create_tenant(data: CreateTenantRequest, background: BackgroundTasks):
    """Create a new tenant (public endpoint with rate limiting)"""
    result = await TenantManager.create_tenant(data)
    return {"success": True, "data": result}

@app.get("/api/v1/tenants/me")
async def get_current_tenant_info(tenant: TenantContext = Depends(get_current_tenant)):
    """Get current tenant details"""
    tenant_data = await TenantManager.get_tenant(tenant.tenant_id)
    if not tenant_data:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Remove sensitive fields
    safe_data = {k: v for k, v in tenant_data.items() if k not in [
        'telegram_bot_token_encrypted', 'whatsapp_credentials_encrypted'
    ]}
    return {"success": True, "data": safe_data}

# ============================================
# CONVERSATION APIs
# ============================================

@app.post("/api/v1/conversations")
async def create_conversation(
    data: CreateConversationRequest,
    tenant: TenantContext = Depends(get_current_tenant)
):
    """Create a new conversation"""
    result = await ConversationManager.create_conversation(tenant.tenant_id, data)
    return {"success": True, "data": result}

@app.post("/api/v1/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    data: SendMessageRequest,
    background: BackgroundTasks,
    tenant: TenantContext = Depends(get_current_tenant)
):
    """Send a message and get AI response"""
    # Store user message
    await ConversationManager.add_message(
        tenant.tenant_id, conversation_id, "user", data.content,
        {"channel": data.channel}
    )
    
    # Queue for AI processing
    await redis_client.lpush("queue:message:process", json.dumps({
        "tenant_id": tenant.tenant_id,
        "conversation_id": conversation_id,
        "content": data.content,
        "channel": data.channel
    }))
    
    return {"success": True, "message": "Message queued for processing"}

@app.get("/api/v1/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    limit: int = 50,
    tenant: TenantContext = Depends(get_current_tenant)
):
    """Get conversation history"""
    messages = await ConversationManager.get_conversation_history(
        tenant.tenant_id, conversation_id, limit
    )
    return {"success": True, "data": messages}

# ============================================
# KNIGHT APIs
# ============================================

@app.post("/api/v1/knights")
async def deploy_knight(
    data: DeployKnightRequest,
    tenant: TenantContext = Depends(require_scope("write"))
):
    """Deploy a new Knight VM"""
    result = await KnightManager.deploy_knight(tenant.tenant_id, data)
    return {"success": True, "data": result}

@app.get("/api/v1/knights")
async def list_knights(
    status: Optional[str] = "all",
    tenant: TenantContext = Depends(get_current_tenant)
):
    """List all Knights for tenant"""
    knights = await KnightManager.get_knights(tenant.tenant_id, status)
    return {"success": True, "data": knights}

@app.get("/api/v1/knights/{knight_id}")
async def get_knight(
    knight_id: str,
    tenant: TenantContext = Depends(get_current_tenant)
):
    """Get Knight details"""
    async with pool.acquire() as conn:
        await conn.execute("SELECT set_tenant_context($1)", tenant.tenant_id)
        row = await conn.fetchrow(
            "SELECT * FROM knights WHERE id = $1", knight_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Knight not found")
        return {"success": True, "data": dict(row)}

@app.delete("/api/v1/knights/{knight_id}")
async def stop_knight(
    knight_id: str,
    background: BackgroundTasks,
    tenant: TenantContext = Depends(require_scope("write"))
):
    """Stop and remove a Knight"""
    await redis_client.lpush("queue:knight:stop", json.dumps({
        "knight_id": knight_id,
        "tenant_id": tenant.tenant_id
    }))
    return {"success": True, "message": "Knight stop queued"}

# ============================================
# WEBHOOKS
# ============================================

@app.post("/webhooks/telegram/{tenant_slug}")
async def telegram_webhook(tenant_slug: str, request: Request):
    """Receive Telegram bot updates"""
    body = await request.body()
    data = await request.json()
    
    # Verify webhook signature if configured
    if Config.TELEGRAM_WEBHOOK_SECRET:
        signature = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
        # TODO: Implement signature verification
    
    # Find tenant by slug
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, telegram_bot_token_encrypted FROM tenants WHERE slug = $1",
            tenant_slug
        )
        if not row:
            return {"ok": True}  # Silently ignore unknown tenants
        
        tenant_id = str(row["id"])
    
    # Process Telegram update
    message = data.get("message")
    if message:
        chat_id = message.get("chat", {}).get("id")
        text = message.get("text", "")
        from_user = message.get("from", {})
        
        # Get or create conversation
        conv = await ConversationManager.get_or_create_conversation(
            tenant_id, "telegram", str(chat_id)
        )
        
        # Store message
        await ConversationManager.add_message(
            tenant_id, conv["id"], "user", text,
            {
                "telegram_message_id": message.get("message_id"),
                "telegram_user": from_user
            }
        )
        
        # Queue for processing
        await redis_client.lpush("queue:message:process", json.dumps({
            "tenant_id": tenant_id,
            "conversation_id": conv["id"],
            "content": text,
            "channel": "telegram",
            "telegram_chat_id": chat_id
        }))
    
    return {"ok": True}

@app.post("/webhooks/whatsapp/{tenant_slug}")
async def whatsapp_webhook(tenant_slug: str, request: Request):
    """Receive WhatsApp webhook updates"""
    data = await request.json()
    
    # Find tenant
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM tenants WHERE slug = $1",
            tenant_slug
        )
        if not row:
            return {"status": "ok"}
        
        tenant_id = str(row["id"])
    
    # Process WhatsApp messages
    entry = data.get("entry", [])
    for e in entry:
        changes = e.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            messages = value.get("messages", [])
            
            for msg in messages:
                from_number = msg.get("from")
                text = msg.get("text", {}).get("body", "")
                
                # Get or create conversation
                conv = await ConversationManager.get_or_create_conversation(
                    tenant_id, "whatsapp", from_number
                )
                
                # Store message
                await ConversationManager.add_message(
                    tenant_id, conv["id"], "user", text,
                    {"whatsapp_message_id": msg.get("id")}
                )
                
                # Queue for processing
                await redis_client.lpush("queue:message:process", json.dumps({
                    "tenant_id": tenant_id,
                    "conversation_id": conv["id"],
                    "content": text,
                    "channel": "whatsapp",
                    "whatsapp_number": from_number
                }))
    
    return {"status": "ok"}

@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    # TODO: Verify Stripe signature
    data = await request.json()
    
    event_type = data.get("type")
    
    if event_type == "customer.subscription.created":
        # Handle subscription creation
        pass
    elif event_type == "customer.subscription.updated":
        # Handle subscription update
        pass
    elif event_type == "customer.subscription.deleted":
        # Handle cancellation
        pass
    
    return {"received": True}

# ============================================
# WEBSOCKETS (Real-time)
# ============================================

@app.websocket("/ws/tenant/{tenant_id}")
async def tenant_websocket(websocket: WebSocket, tenant_id: str):
    """WebSocket for real-time tenant updates"""
    await websocket.accept()
    
    # Verify tenant exists
    tenant = await TenantManager.get_tenant(tenant_id)
    if not tenant:
        await websocket.close(code=4004, reason="Tenant not found")
        return
    
    # Subscribe to Redis pub/sub for this tenant
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(f"tenant:{tenant_id}:events")
    
    try:
        while True:
            # Wait for messages from Redis
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message:
                await websocket.send_text(message["data"])
            
            # Check for client messages (ping/pong)
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                if data == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                pass
    except WebSocketDisconnect:
        await pubsub.unsubscribe()
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await pubsub.unsubscribe()

# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(asyncpg.exceptions.PostgresError)
async def postgres_exception_handler(request: Request, exc: asyncpg.exceptions.PostgresError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Database error", "detail": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"}
    )

# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    import uvicorn
    import asyncio
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=Config.ENV == "development",
        workers=int(os.getenv("WORKERS", 1))
    )
