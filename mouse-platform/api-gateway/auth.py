"""
Authentication and Security Utilities
Provides JWT auth, rate limiting, and security controls
"""
import os
import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Header, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import redis.asyncio as redis
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Security configuration
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")
TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", secrets.token_hex(16))

# Redis for rate limiting and token blacklist
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Security headers
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
}

class SecurityManager:
    """Manages authentication, rate limiting, and security controls"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.limiter: Optional[Limiter] = None
        self._init_redis()
        self._init_limiter()
    
    def _init_redis(self):
        """Initialize Redis connection for rate limiting and sessions"""
        try:
            self.redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        except Exception as e:
            print(f"Redis connection failed: {e}. Running without distributed rate limiting.")
            self.redis_client = None
    
    def _init_limiter(self):
        """Initialize rate limiter"""
        self.limiter = Limiter(
            key_func=get_remote_address,
            default_limits=["100/minute"],
            storage_uri=REDIS_URL if self.redis_client else None
        )
    
    # ========== JWT AUTHENTICATION ==========
    
    def create_customer_token(self, customer_id: str, email: str) -> str:
        """Create a JWT token for customer authentication"""
        payload = {
            "sub": customer_id,
            "email": email,
            "type": "customer",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            "jti": secrets.token_hex(16)  # Unique token ID for revocation
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    def create_admin_token(self, admin_id: str) -> str:
        """Create a JWT token for admin authentication"""
        payload = {
            "sub": admin_id,
            "type": "admin",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            "jti": secrets.token_hex(16)
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            
            # Check if token is blacklisted
            if self.redis_client:
                jti = payload.get("jti")
                if jti and self.redis_client.get(f"blacklist:{jti}"):
                    raise HTTPException(status_code=401, detail="Token has been revoked")
            
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    async def revoke_token(self, token: str):
        """Revoke a token (add to blacklist)"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            jti = payload.get("jti")
            exp = payload.get("exp")
            
            if self.redis_client and jti and exp:
                # Calculate TTL until token would have expired
                ttl = int(exp - datetime.utcnow().timestamp())
                if ttl > 0:
                    await self.redis_client.setex(f"blacklist:{jti}", ttl, "revoked")
        except jwt.InvalidTokenError:
            pass
    
    # ========== DEPENDENCIES FOR FASTAPI ==========
    
    async def get_current_customer(self, authorization: str = Header(None)) -> Dict[str, Any]:
        """Dependency to get current authenticated customer"""
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = authorization.replace("Bearer ", "")
        payload = self.verify_token(token)
        
        if payload.get("type") != "customer":
            raise HTTPException(status_code=403, detail="Invalid token type")
        
        return payload
    
    async def get_current_admin(self, authorization: str = Header(None)) -> Dict[str, Any]:
        """Dependency to get current authenticated admin"""
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = authorization.replace("Bearer ", "")
        payload = self.verify_token(token)
        
        if payload.get("type") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return payload
    
    async def verify_admin_api_key(self, authorization: str = Header(None)) -> bool:
        """Dependency to verify admin API key"""
        if not ADMIN_API_KEY:
            raise HTTPException(status_code=500, detail="Admin API key not configured")
        
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing authorization header")
        
        token = authorization.replace("Bearer ", "")
        
        # Use constant-time comparison to prevent timing attacks
        if not secrets.compare_digest(token, ADMIN_API_KEY):
            raise HTTPException(status_code=403, detail="Invalid admin API key")
        
        return True
    
    async def verify_customer_or_admin(
        self,
        customer_id: str,
        authorization: str = Header(None)
    ) -> Dict[str, Any]:
        """Verify that the requester is either the customer or an admin"""
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = authorization.replace("Bearer ", "")
        payload = self.verify_token(token)
        
        token_type = payload.get("type")
        token_sub = payload.get("sub")
        
        # Admin can access any customer's data
        if token_type == "admin":
            return payload
        
        # Customer can only access their own data
        if token_type == "customer" and token_sub == customer_id:
            return payload
        
        raise HTTPException(status_code=403, detail="Access denied")

# ========== RATE LIMITING CONFIGURATION ==========

def get_rate_limiter() -> Limiter:
    """Get configured rate limiter"""
    security_mgr = SecurityManager()
    return security_mgr.limiter

# Rate limit tiers
RATE_LIMITS = {
    "health": "1000/minute",           # Health checks are frequent
    "public": "30/minute",              # Public endpoints
    "customer_create": "5/minute",      # Customer creation (prevents spam)
    "auth": "10/minute",                # Authentication endpoints
    "sensitive": "10/minute",           # Sensitive operations
    "webhook": "100/minute",            # Webhooks from external services
    "vm_operation": "20/minute",        # VM operations
    "token_purchase": "5/minute",       # Token purchases
    "admin": "60/minute",               # Admin operations
}

# ========== CORS CONFIGURATION ==========

def get_cors_origins() -> list:
    """Get allowed CORS origins based on environment"""
    env = os.getenv("ENVIRONMENT", "development")
    allowed = os.getenv("ALLOWED_ORIGINS", "")
    
    if env == "production":
        if allowed:
            return [origin.strip() for origin in allowed.split(",")]
        return []  # Empty means no CORS in production (must be explicitly set)
    else:
        # Development allows localhost
        origins = ["http://localhost:3000", "http://localhost:5173"]
        if allowed:
            origins.extend([origin.strip() for origin in allowed.split(",")])
        return origins

# ========== TELEGRAM WEBHOOK SECURITY ==========

def verify_telegram_webhook(update: Dict[str, Any], secret_token: str = Header(None, alias="X-Telegram-Bot-Api-Secret-Token")) -> bool:
    """Verify Telegram webhook secret token"""
    expected_secret = TELEGRAM_WEBHOOK_SECRET
    
    if not expected_secret:
        # If not configured, skip validation (warn in logs)
        print("WARNING: TELEGRAM_WEBHOOK_SECRET not set, webhook validation disabled")
        return True
    
    if not secret_token:
        raise HTTPException(status_code=401, detail="Missing Telegram webhook secret")
    
    if not secrets.compare_digest(secret_token, expected_secret):
        raise HTTPException(status_code=403, detail="Invalid webhook secret")
    
    return True

# ========== REQUEST VALIDATION ==========

class RequestValidator:
    """Validates incoming requests for security issues"""
    
    MAX_PAYLOAD_SIZE = 1024 * 1024  # 1MB
    ALLOWED_CONTENT_TYPES = ["application/json", "application/x-www-form-urlencoded"]
    
    @staticmethod
    def validate_payload_size(request: Request):
        """Check request payload size"""
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > RequestValidator.MAX_PAYLOAD_SIZE:
            raise HTTPException(status_code=413, detail="Payload too large")
    
    @staticmethod
    def sanitize_customer_id(customer_id: str) -> str:
        """Sanitize and validate customer ID format"""
        # Customer IDs should be alphanumeric with underscores and dashes
        if not customer_id or len(customer_id) > 64:
            raise HTTPException(status_code=400, detail="Invalid customer ID format")
        
        # Check format: cst_[alphanumeric]
        if not customer_id.startswith("cst_"):
            raise HTTPException(status_code=400, detail="Invalid customer ID format")
        
        # Check for SQL injection patterns
        dangerous_patterns = ["'", ";", "--", "/*", "*/", "DROP", "DELETE", "INSERT", "UPDATE"]
        for pattern in dangerous_patterns:
            if pattern.upper() in customer_id.upper():
                raise HTTPException(status_code=400, detail="Invalid customer ID format")
        
        return customer_id
    
    @staticmethod
    def sanitize_email(email: str) -> str:
        """Sanitize and validate email format"""
        import re
        
        if not email or len(email) > 254:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Basic email validation
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        return email.lower()
    
    @staticmethod
    def sanitize_company_name(name: str) -> str:
        """Sanitize company name"""
        if not name:
            raise HTTPException(status_code=400, detail="Company name is required")
        
        if len(name) < 2 or len(name) > 100:
            raise HTTPException(status_code=400, detail="Company name must be 2-100 characters")
        
        # Remove potentially dangerous characters
        sanitized = name.replace("<", "").replace(">", "").replace("'", "").replace('"', "")
        
        return sanitized.strip()

# ========== API KEY ROTATION ==========

class APIKeyManager:
    """Manages API key rotation"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis = redis_client
    
    async def rotate_key(self, key_name: str) -> str:
        """Generate and store a new API key"""
        new_key = f"{key_name}_{secrets.token_hex(32)}"
        
        if self.redis:
            # Store with metadata
            await self.redis.hset(f"apikey:{key_name}", mapping={
                "key": new_key,
                "created_at": datetime.utcnow().isoformat(),
                "rotated_from": os.getenv(f"{key_name.upper()}_API_KEY", "")
            })
        
        return new_key
    
    async def validate_key(self, key_name: str, provided_key: str) -> bool:
        """Validate an API key"""
        if self.redis:
            stored = await self.redis.hget(f"apikey:{key_name}", "key")
            if stored:
                return secrets.compare_digest(provided_key, stored)
        
        # Fallback to environment variable
        env_key = os.getenv(f"{key_name.upper()}_API_KEY")
        if env_key:
            return secrets.compare_digest(provided_key, env_key)
        
        return False

# Global security manager instance
security_manager = SecurityManager()

# Export commonly used functions
get_current_customer = security_manager.get_current_customer
get_current_admin = security_manager.get_current_admin
verify_admin_api_key = security_manager.verify_admin_api_key
verify_customer_or_admin = security_manager.verify_customer_or_admin
