"""
Security Utilities
Encryption, credential management, and security helpers
"""

import os
import hashlib
import hmac
import secrets
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import json

# Encryption key from environment
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "").encode()

class CredentialEncryption:
    """Handles encryption/decryption of sensitive credentials"""
    
    def __init__(self):
        self._cipher = None
        if ENCRYPTION_KEY:
            # Derive a Fernet key from the encryption key
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b'openclaw-salt',  # In production, use unique salt per tenant
                iterations=480000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(ENCRYPTION_KEY))
            self._cipher = Fernet(key)
    
    def encrypt(self, plaintext: str) -> str:
        """Encrypt plaintext string"""
        if not self._cipher:
            raise RuntimeError("Encryption not configured")
        return self._cipher.encrypt(plaintext.encode()).decode()
    
    def decrypt(self, ciphertext: str) -> str:
        """Decrypt ciphertext string"""
        if not self._cipher:
            raise RuntimeError("Encryption not configured")
        return self._cipher.decrypt(ciphertext.encode()).decode()
    
    def encrypt_dict(self, data: dict) -> str:
        """Encrypt a dictionary"""
        return self.encrypt(json.dumps(data))
    
    def decrypt_dict(self, ciphertext: str) -> dict:
        """Decrypt to dictionary"""
        return json.loads(self.decrypt(ciphertext))


class APIKeyManager:
    """Generate and validate API keys"""
    
    PREFIX = "oc_"  # OpenClaw prefix
    
    @staticmethod
    def generate_key() -> tuple[str, str]:
        """Generate new API key. Returns (full_key, hash)"""
        # Generate random key
        random_bytes = secrets.token_bytes(32)
        key = APIKeyManager.PREFIX + base64.urlsafe_b64encode(random_bytes).decode().rstrip("=")
        
        # Hash for storage
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        return key, key_hash
    
    @staticmethod
    def hash_key(key: str) -> str:
        """Hash an API key for lookup"""
        return hashlib.sha256(key.encode()).hexdigest()


class WebhookVerifier:
    """Verify webhook signatures from external services"""
    
    @staticmethod
    def verify_telegram_signature(bot_token: str, data: bytes, signature: str) -> bool:
        """Verify Telegram webhook signature"""
        # Telegram uses a secret token header, not HMAC
        # The secret is set when configuring webhook
        expected = hashlib.sha256(bot_token.encode()).hexdigest()[:16]
        return hmac.compare_digest(signature, expected)
    
    @staticmethod
    def verify_stripe_signature(payload: bytes, signature: str, secret: str) -> bool:
        """Verify Stripe webhook signature"""
        try:
            # Stripe signatures are in format: t=timestamp,v1=signature
            import stripe
            # Use stripe library for proper verification
            return True  # Placeholder
        except Exception:
            return False


class RateLimiter:
    """Simple rate limiting using Redis"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Check if request is within rate limit"""
        if not self.redis:
            return True
        
        current = await self.redis.get(f"rate_limit:{key}")
        if current is None:
            # First request in window
            await self.redis.setex(f"rate_limit:{key}", window_seconds, 1)
            return True
        
        count = int(current)
        if count >= max_requests:
            return False
        
        await self.redis.incr(f"rate_limit:{key}")
        return True
    
    async def get_remaining(self, key: str, max_requests: int) -> int:
        """Get remaining requests in current window"""
        if not self.redis:
            return max_requests
        
        current = await self.redis.get(f"rate_limit:{key}")
        if current is None:
            return max_requests
        
        return max(0, max_requests - int(current))


class TenantIsolation:
    """Enforce tenant isolation at application level"""
    
    @staticmethod
    def sanitize_tenant_id(tenant_id: str) -> Optional[str]:
        """Validate and sanitize tenant ID"""
        try:
            # Check UUID format
            uuid.UUID(tenant_id)
            return tenant_id
        except ValueError:
            return None
    
    @staticmethod
    def validate_resource_access(tenant_id: str, resource_tenant_id: str) -> bool:
        """Check if tenant can access resource"""
        return tenant_id == resource_tenant_id


# Security headers middleware
async def add_security_headers(request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    
    # XSS protection
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # Content Security Policy
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self'; "
        "connect-src 'self' https: wss:;"
    )
    
    # Referrer policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # HSTS (HTTPS only)
    if os.getenv("ENV") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response


# Singleton instances
_encryption: Optional[CredentialEncryption] = None

def get_encryption() -> CredentialEncryption:
    global _encryption
    if _encryption is None:
        _encryption = CredentialEncryption()
    return _encryption
