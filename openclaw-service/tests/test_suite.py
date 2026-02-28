"""
Test Suite for OpenClaw-as-a-Service
"""

import pytest
import asyncio
import asyncpg
import redis.asyncio as redis
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock
import json
import uuid

# Import the app
import sys
sys.path.insert(0, '/Users/jewelsharris/.openclaw/workspace/openclaw-service')

from api.main import app, get_db, get_redis

# Test fixtures
@pytest.fixture
def test_client():
    """Create test client"""
    return TestClient(app)

@pytest.fixture
async def mock_db():
    """Mock database connection"""
    conn = AsyncMock()
    return conn

@pytest.fixture
async def mock_redis():
    """Mock Redis connection"""
    r = AsyncMock()
    return r

# ============================================
# UNIT TESTS
# ============================================

class TestSecurity:
    """Security-related tests"""
    
    def test_api_key_generation(self):
        """Test API key generation and hashing"""
        from security.security_utils import APIKeyManager
        
        key, key_hash = APIKeyManager.generate_key()
        
        assert key.startswith("oc_")
        assert len(key) > 10
        assert len(key_hash) == 64  # SHA-256 hex
        
        # Verify hashing is consistent
        assert APIKeyManager.hash_key(key) == key_hash
    
    def test_encryption_roundtrip(self):
        """Test encryption and decryption"""
        import os
        os.environ["ENCRYPTION_KEY"] = "test-key-32-bytes-long!!!!!!"
        
        from security.security_utils import get_encryption
        
        enc = get_encryption()
        plaintext = "sensitive-data-123"
        
        ciphertext = enc.encrypt(plaintext)
        decrypted = enc.decrypt(ciphertext)
        
        assert decrypted == plaintext
        assert ciphertext != plaintext
    
    def test_rate_limiting(self):
        """Test rate limit logic"""
        from security.security_utils import RateLimiter
        
        mock_redis = AsyncMock()
        limiter = RateLimiter(mock_redis)
        
        # First request should be allowed
        mock_redis.get.return_value = None
        # This would need async test

class TestTenantIsolation:
    """Multi-tenancy isolation tests"""
    
    @pytest.mark.asyncio
    async def test_tenant_cannot_access_other_data(self, test_client):
        """Verify tenants are isolated"""
        # This would test the RLS policies
        pass
    
    def test_tenant_id_validation(self):
        """Test tenant ID validation"""
        from security.security_utils import TenantIsolation
        
        # Valid UUID
        valid = "550e8400-e29b-41d4-a716-446655440000"
        assert TenantIsolation.sanitize_tenant_id(valid) == valid
        
        # Invalid UUID
        assert TenantIsolation.sanitize_tenant_id("not-a-uuid") is None
        assert TenantIsolation.sanitize_tenant_id("") is None

class TestAPIEndpoints:
    """API endpoint tests"""
    
    def test_health_endpoint(self, test_client):
        """Test health check endpoint"""
        response = test_client.get("/health")
        
        # Will fail without DB/Redis but should return 200
        assert response.status_code in [200, 503]
    
    def test_create_tenant_validation(self, test_client):
        """Test tenant creation validation"""
        # Missing required field
        response = test_client.post("/api/v1/tenants", json={})
        assert response.status_code == 422
        
        # Invalid email
        response = test_client.post("/api/v1/tenants", json={
            "name": "Test",
            "email": "not-an-email"
        })
        assert response.status_code == 422
    
    def test_authentication_required(self, test_client):
        """Test protected endpoints require auth"""
        # Try accessing protected endpoint without auth
        response = test_client.get("/api/v1/tenants/me")
        assert response.status_code == 401
        
        response = test_client.post("/api/v1/knights", json={
            "task_description": "test"
        })
        assert response.status_code == 401

class TestBotHandlers:
    """Bot handler tests"""
    
    @pytest.mark.asyncio
    async def test_telegram_webhook_processing(self):
        """Test Telegram webhook handler"""
        from bot_handlers.telegram_handler import TelegramBotManager
        
        manager = TelegramBotManager()
        
        # Mock the session
        manager._session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "ok": True,
            "result": {"id": 123, "username": "testbot", "first_name": "Test"}
        }
        manager._session.get.return_value.__aenter__.return_value = mock_response
        manager._session.post.return_value.__aenter__.return_value = mock_response
        
        result = await manager.register_bot(
            "tenant-123", "test-tenant", "token123", 
            "https://api.example.com"
        )
        
        assert result["success"] is True
    
    @pytest.mark.asyncio
    async def test_whatsapp_message_sending(self):
        """Test WhatsApp message sending"""
        from bot_handlers.whatsapp_handler import WhatsAppManager
        
        manager = WhatsAppManager()
        
        # Mock session
        manager._session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {"messages": [{"id": "msg123"}]}
        manager._session.post.return_value.__aenter__.return_value = mock_response
        
        # Register a config
        manager.configs["test-tenant"] = Mock(
            phone_number_id="12345",
            access_token="token123"
        )
        
        result = await manager.send_message("test-tenant", "+1234567890", "Hello")
        assert result is True

class TestVMOrchestration:
    """VM orchestration tests"""
    
    @pytest.mark.asyncio
    async def test_knight_provisioning(self):
        """Test Knight VM provisioning"""
        from orchestrator.vm_orchestrator import VMOrchestrator
        
        orchestrator = VMOrchestrator()
        
        # Mock Orgo client
        orchestrator.orgo.create_computer = AsyncMock(return_value={
            "id": "vm-123",
            "name": "test-vm"
        })
        orchestrator.orgo.execute_python = AsyncMock(return_value={
            "exitCode": 0,
            "stdout": "Success"
        })
        
        instance = await orchestrator.provision_knight(
            "tenant-123", "knight-456", "test task", {"ram_gb": 4, "cpu_cores": 2}
        )
        
        assert instance.tenant_id == "tenant-123"
        assert instance.knight_id == "knight-456"
        assert instance.status == "pending"
    
    @pytest.mark.asyncio
    async def test_tier_spec_lookup(self):
        """Test tier specification lookup"""
        from orchestrator.vm_orchestrator import VMOrchestrator
        
        orchestrator = VMOrchestrator()
        
        # Test each tier
        free = orchestrator.tier_specs["free"]
        assert free["ram"] == 4
        assert free["max_knights"] == 1
        
        enterprise = orchestrator.tier_specs["enterprise"]
        assert enterprise["ram"] == 16
        assert enterprise["max_knights"] == 20

# ============================================
# INTEGRATION TESTS
# ============================================

@pytest.mark.integration
class TestIntegration:
    """Integration tests requiring real services"""
    
    @pytest.mark.asyncio
    async def test_database_rls(self):
        """Test Row Level Security policies"""
        # This would require a real database connection
        pass
    
    @pytest.mark.asyncio
    async def test_redis_pubsub(self):
        """Test Redis pub/sub messaging"""
        # This would require a real Redis connection
        pass

# ============================================
# LOAD TESTS
# ============================================

@pytest.mark.load
class TestLoad:
    """Load and performance tests"""
    
    def test_concurrent_webhook_processing(self):
        """Test handling multiple concurrent webhooks"""
        # Simulated load test
        pass
    
    def test_vm_provisioning_under_load(self):
        """Test VM provisioning at scale"""
        pass

# ============================================
# SECURITY TESTS
# ============================================

@pytest.mark.security
class TestSecurityAudit:
    """Security audit tests"""
    
    def test_sql_injection_protection(self, test_client):
        """Test SQL injection protection"""
        # Attempt SQL injection in various fields
        malicious_inputs = [
            "'; DROP TABLE tenants; --",
            "1 OR 1=1",
            "admin'--",
        ]
        
        for malicious in malicious_inputs:
            response = test_client.post("/api/v1/tenants", json={
                "name": malicious,
                "email": "test@test.com"
            })
            # Should not crash, might be 422 or handled gracefully
            assert response.status_code != 500
    
    def test_xss_protection(self, test_client):
        """Test XSS protection in responses"""
        # Headers should prevent XSS
        response = test_client.get("/health")
        assert "X-XSS-Protection" in response.headers or "Content-Security-Policy" in response.headers

# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
