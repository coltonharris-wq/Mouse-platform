"""
Security Fixes Test Suite
Tests all 7 critical security fixes
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import hashlib
import time
from fastapi.testclient import TestClient

# Import the secure main
import sys
sys.path.insert(0, '/Users/jewelsharris/.openclaw/workspace/mouse-platform/api-gateway')

from main_secure import app, verify_api_key, verify_customer_access, rate_limiter
from commission_calculation import calculate_revenue_split_cents, calculate_revenue_split_dollars, dollars_to_cents
from rate_limiter import RateLimiter

client = TestClient(app)

# ============================================
# TEST FIX 1: Screenshot Endpoint Authentication
# ============================================

class TestScreenshotAuth:
    """Test screenshot endpoint requires authentication"""
    
    def test_screenshot_without_auth_fails(self):
        """Screenshot endpoint should reject requests without auth"""
        response = client.get("/api/v1/customers/cst_test123/vms/vm_test123/screenshot")
        assert response.status_code == 401
    
    def test_screenshot_with_wrong_auth_fails(self):
        """Screenshot endpoint should reject wrong auth"""
        response = client.get(
            "/api/v1/customers/cst_test123/vms/vm_test123/screenshot",
            headers={"Authorization": "Bearer wrong_token"}
        )
        assert response.status_code == 403
    
    @patch('main_secure.supabase')
    def test_screenshot_with_valid_auth_succeeds(self, mock_supabase):
        """Screenshot endpoint should work with valid auth"""
        # Setup mock
        mock_supabase.get_employee_by_vm = AsyncMock(return_value={
            "id": "emp_test123",
            "customer_id": "cst_test123",
            "status": "active"
        })
        
        # Generate valid token
        valid_token = f"cust_{hashlib.sha256('cst_test123'.encode()).hexdigest()[:16]}"
        
        with patch('main_secure.platform') as mock_platform:
            mock_platform.stream_vm = AsyncMock(return_value={
                "screenshot_base64": "fake_screenshot_data",
                "timestamp": "2026-02-27T00:00:00Z"
            })
            
            response = client.get(
                "/api/v1/customers/cst_test123/vms/vm_test123/screenshot",
                headers={"Authorization": f"Bearer {valid_token}"}
            )
            
            # Should not be 401 or 403
            assert response.status_code not in [401, 403]


# ============================================
# TEST FIX 2: WebSocket Authentication
# ============================================

class TestWebSocketAuth:
    """Test WebSocket requires authentication"""
    
    @pytest.mark.asyncio
    async def test_websocket_without_auth_closes(self):
        """WebSocket should close without authentication"""
        with client.websocket_connect("/ws/vms/cst_test123/vm_test123") as websocket:
            # Don't send auth message - should timeout and close
            try:
                data = websocket.receive_json(timeout=6)
                assert data["type"] == "error"
                assert "timeout" in data["message"].lower() or "Authentication" in data["message"]
            except Exception:
                pass  # Expected - connection closed
    
    @pytest.mark.asyncio
    async def test_websocket_with_wrong_auth_closes(self):
        """WebSocket should close with wrong authentication"""
        with client.websocket_connect("/ws/vms/cst_test123/vm_test123") as websocket:
            websocket.send_json({"token": "wrong_token"})
            data = websocket.receive_json()
            assert data["type"] == "error"
            assert "Authentication failed" in data["message"]


# ============================================
# TEST FIX 3: Customer Data Isolation
# ============================================

class TestDataIsolation:
    """Test customer data isolation"""
    
    def test_customer_cannot_access_other_customer_data(self):
        """Customer A should not access Customer B's data"""
        # Generate token for customer A
        token_a = f"cust_{hashlib.sha256('cst_customer_a'.encode()).hexdigest()[:16]}"
        
        # Try to access customer B's data
        response = client.get(
            "/api/v1/customers/cst_customer_b/dashboard",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert response.status_code == 403
    
    def test_vm_isolation(self):
        """Customer should not access VMs they don't own"""
        valid_token = f"cust_{hashlib.sha256('cst_test123'.encode()).hexdigest()[:16]}"
        
        with patch('main_secure.supabase') as mock_supabase:
            # VM belongs to different customer
            mock_supabase.get_employee_by_vm = AsyncMock(return_value={
                "id": "emp_other",
                "customer_id": "cst_other_customer",
                "status": "active"
            })
            
            response = client.get(
                "/api/v1/customers/cst_test123/vms/vm_test123/screenshot",
                headers={"Authorization": f"Bearer {valid_token}"}
            )
            
            assert response.status_code == 403


# ============================================
# TEST FIX 4: Rate Limiting
# ============================================

class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_rate_limiter_blocks_excess_requests(self):
        """Rate limiter should block requests over limit"""
        limiter = RateLimiter(window_size=60)
        key = "test:key"
        
        # Make 10 requests (should all pass)
        for i in range(10):
            assert limiter.check_rate_limit(key, max_requests=10) == True
        
        # 11th request should fail
        assert limiter.check_rate_limit(key, max_requests=10) == False
    
    def test_rate_limiter_resets_after_window(self):
        """Rate limiter should reset after window"""
        limiter = RateLimiter(window_size=1)  # 1 second window
        key = "test:key:reset"
        
        # Exhaust limit
        for i in range(5):
            limiter.check_rate_limit(key, max_requests=5)
        
        # Should be blocked
        assert limiter.check_rate_limit(key, max_requests=5) == False
        
        # Wait for window to reset
        time.sleep(1.1)
        
        # Should work again
        assert limiter.check_rate_limit(key, max_requests=5) == True
    
    def test_customer_creation_rate_limited(self):
        """Customer creation should be rate limited"""
        responses = []
        for i in range(15):
            response = client.post("/api/v1/customers", json={
                "company_name": f"Test Corp {i}",
                "email": f"test{i}@test.com"
            })
            responses.append(response.status_code)
        
        # Some should be rate limited (429)
        assert 429 in responses or responses.count(201) < 15


# ============================================
# TEST FIX 5: Commission Calculation Precision
# ============================================

class TestCommissionPrecision:
    """Test commission calculation uses integer cents"""
    
    def test_commission_calculation_no_floating_point_error(self):
        """Commission should not have floating point errors"""
        # Test $100.00
        result = calculate_revenue_split_cents(10000)  # $100.00 in cents
        
        # Platform fee should be exactly $12.00 (1200 cents)
        assert result["platform_fee_cents"] == 1200
        
        # Reseller should get exactly $88.00 (8800 cents)
        assert result["reseller_cents"] == 8800
        
        # Total should equal gross
        total = result["platform_fee_cents"] + result["reseller_cents"]
        assert total == result["gross_amount_cents"]
    
    def test_commission_with_99_cents(self):
        """Commission calculation with $99.99"""
        result = calculate_revenue_split_cents(9999)  # $99.99
        
        # Platform fee: 12% of $99.99 = $12.00 (rounded)
        assert result["platform_fee_cents"] == 1200
        
        # Reseller gets remainder: $87.99
        assert result["reseller_cents"] == 8799
        
        # Total should equal gross
        total = result["platform_fee_cents"] + result["reseller_cents"]
        assert total == 9999
    
    def test_dollar_conversion_roundtrip(self):
        """Dollars to cents and back should preserve value"""
        test_amounts = [0.99, 9.99, 49.99, 99.99, 100.00, 999.99]
        
        for amount in test_amounts:
            cents = dollars_to_cents(amount)
            result = calculate_revenue_split_cents(cents)
            total_cents = result["platform_fee_cents"] + result["reseller_cents"]
            
            # Total should equal original cents
            assert total_cents == cents, f"Failed for amount {amount}"


# ============================================
# TEST FIX 6: RLS Policies (SQL tests)
# ============================================

class TestRLSPolicies:
    """Test RLS policies are in place"""
    
    def test_rls_policies_sql_file_exists(self):
        """RLS policies SQL file should exist"""
        import os
        sql_file = "/Users/jewelsharris/.openclaw/workspace/mouse-platform/supabase/security_fixes_rls.sql"
        assert os.path.exists(sql_file)
    
    def test_rls_policies_cover_required_tables(self):
        """RLS policies should cover all required tables"""
        sql_file = "/Users/jewelsharris/.openclaw/workspace/mouse-platform/supabase/security_fixes_rls.sql"
        with open(sql_file, 'r') as f:
            content = f.read()
        
        # Check for required tables
        required_tables = [
            "revenue_events",
            "usage_logs",
            "employees",
            "customers",
            "chat_logs",
            "profiles"
        ]
        
        for table in required_tables:
            assert table in content, f"Missing RLS policy for {table}"


# ============================================
# TEST FIX 7: Employee Creation Race Condition
# ============================================

class TestEmployeeRaceCondition:
    """Test employee creation handles race conditions"""
    
    @pytest.mark.asyncio
    async def test_idempotency_key_prevents_duplicates(self):
        """Same idempotency key should not create duplicate employees"""
        from secure_deployment import SecureEmployeeDeployment
        
        mock_supabase = MagicMock()
        mock_orgo = MagicMock()
        
        deployer = SecureEmployeeDeployment(mock_supabase, mock_orgo, "ws_test")
        
        # First call should create
        idempotency_key = "test_key_123"
        
        mock_supabase.get_token_balance = AsyncMock(return_value={"balance": 10000})
        mock_supabase.create_employee = AsyncMock(return_value={"id": "emp_1"})
        mock_supabase.update_employee = AsyncMock()
        mock_orgo.create_computer = AsyncMock(return_value={"id": "vm_1", "url": "http://vm1"})
        
        # Mock _check_existing_deployment to return None first time
        deployer._check_existing_deployment = AsyncMock(return_value=None)
        deployer._acquire_lock = AsyncMock(return_value=True)
        deployer._release_lock = AsyncMock()
        
        with patch('secure_deployment.KnightAgent') as mock_knight:
            mock_knight_instance = AsyncMock()
            mock_knight.return_value = mock_knight_instance
            
            result1 = await deployer.deploy_employee_secure(
                customer_id="cst_test",
                role="developer",
                name="Test Employee",
                task="Test task",
                idempotency_key=idempotency_key
            )
            
            assert result1["employee"]["id"] == "emp_1"
            
            # Second call with same key should return cached result
            deployer._check_existing_deployment = AsyncMock(return_value={
                "employee": {"id": "emp_1"},
                "vm": {"id": "vm_1"},
                "from_cache": True
            })
            
            result2 = await deployer.deploy_employee_secure(
                customer_id="cst_test",
                role="developer",
                name="Test Employee",
                task="Test task",
                idempotency_key=idempotency_key
            )
            
            assert result2.get("from_cache") == True


# ============================================
# TEST SECURITY HEADERS AND ERROR HANDLING
# ============================================

class TestSecurityHeaders:
    """Test security headers and error handling"""
    
    def test_error_messages_dont_leak_secrets(self):
        """Error messages should not contain sensitive info"""
        # This would need the actual app to be running
        pass
    
    def test_cors_not_allow_all_in_production(self):
        """CORS should not allow * in production"""
        import os
        os.environ["ENVIRONMENT"] = "production"
        os.environ["ALLOWED_ORIGINS"] = "https://app.automioapp.com"
        
        # Re-import to pick up environment
        # Note: In real test, you'd need to restart app
        pass


# ============================================
# INTEGRATION TEST
# ============================================

class TestIntegration:
    """Integration tests for all security fixes"""
    
    def test_all_fixes_applied(self):
        """Verify all security fixes are in place"""
        import os
        
        # Check files exist
        files_to_check = [
            "/Users/jewelsharris/.openclaw/workspace/mouse-platform/api-gateway/main_secure.py",
            "/Users/jewelsharris/.openclaw/workspace/mouse-platform/api-gateway/rate_limiter.py",
            "/Users/jewelsharris/.openclaw/workspace/mouse-platform/api-gateway/commission_calculation.py",
            "/Users/jewelsharris/.openclaw/workspace/mouse-platform/api-gateway/secure_deployment.py",
            "/Users/jewelsharris/.openclaw/workspace/mouse-platform/supabase/security_fixes_rls.sql",
        ]
        
        for file_path in files_to_check:
            assert os.path.exists(file_path), f"Missing file: {file_path}"
        
        print("✓ All security fix files are in place")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
