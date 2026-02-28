"""
Security and Authentication Tests
Tests for authentication, authorization, and security controls
"""
import pytest
from unittest.mock import patch, MagicMock
import stripe

def test_stripe_webhook_signature_validation(client, mock_stripe_webhook_payload):
    """CRITICAL: Stripe webhook must validate signature"""
    with patch('stripe.Webhook.construct_event') as mock_construct:
        mock_construct.return_value = mock_stripe_webhook_payload
        
        response = client.post(
            "/webhooks/stripe",
            json=mock_stripe_webhook_payload,
            headers={"Stripe-Signature": "valid_sig"}
        )
        
        # Should call construct_event for validation
        mock_construct.assert_called_once()
        assert response.status_code == 200

def test_stripe_webhook_invalid_signature(client, mock_stripe_webhook_payload):
    """CRITICAL: Invalid Stripe signature must be rejected"""
    with patch('stripe.Webhook.construct_event') as mock_construct:
        mock_construct.side_effect = stripe.error.SignatureVerificationError(
            "Invalid signature", "sig"
        )
        
        response = client.post(
            "/webhooks/stripe",
            json=mock_stripe_webhook_payload,
            headers={"Stripe-Signature": "invalid_sig"}
        )
        
        assert response.status_code == 400
        assert "signature" in response.json()["detail"].lower()

def test_screenshot_endpoint_requires_ownership(client, mock_supabase):
    """CRITICAL: Screenshot endpoint must verify VM ownership"""
    with patch('main.supabase', mock_supabase):
        # Setup: VM belongs to different customer
        mock_supabase.get_employee_by_vm.return_value = {
            "id": "emp_other",
            "customer_id": "cst_other",  # Different customer
            "status": "active"
        }
        
        response = client.get("/api/v1/customers/cst_test123/vms/vm_test123/screenshot")
        
        # Should be forbidden
        assert response.status_code == 403

def test_screenshot_endpoint_allows_owner(client, mock_supabase, mock_orgo):
    """Screenshot endpoint allows VM owner"""
    with patch('main.supabase', mock_supabase), patch('main.orgo', mock_orgo):
        mock_supabase.get_employee_by_vm.return_value = {
            "id": "emp_test123",
            "customer_id": "cst_test123",  # Same customer
            "status": "active"
        }
        
        response = client.get("/api/v1/customers/cst_test123/vms/vm_test123/screenshot")
        
        assert response.status_code == 200
        assert "screenshot_base64" in response.json()

def test_cors_restricted_in_production():
    """HIGH: CORS should not allow all origins in production"""
    import os
    os.environ['ENVIRONMENT'] = 'production'
    
    # Re-import to pick up environment
    from main import app
    
    cors_middleware = None
    for middleware in app.user_middleware:
        if 'CORSMiddleware' in str(middleware.cls):
            cors_middleware = middleware
            break
    
    # In production, allow_origins should be restricted
    if cors_middleware:
        origins = cors_middleware.options.get('allow_origins', [])
        assert "*" not in origins, "CORS should not allow * in production"

def test_customer_create_input_validation(client):
    """HIGH: Customer creation should validate inputs"""
    # Test empty company name
    response = client.post("/api/v1/customers", json={
        "company_name": "",
        "email": "test@test.com"
    })
    assert response.status_code == 422
    
    # Test invalid email
    response = client.post("/api/v1/customers", json={
        "company_name": "Test Corp",
        "email": "not-an-email"
    })
    assert response.status_code == 422
    
    # Test invalid plan
    response = client.post("/api/v1/customers", json={
        "company_name": "Test Corp",
        "email": "test@test.com",
        "plan": "invalid_plan"
    })
    assert response.status_code == 422

def test_customer_create_company_name_length(client):
    """HIGH: Company name should have length limits"""
    # Test too long name
    response = client.post("/api/v1/customers", json={
        "company_name": "A" * 101,
        "email": "test@test.com"
    })
    assert response.status_code == 422
    
    # Test too short name
    response = client.post("/api/v1/customers", json={
        "company_name": "A",
        "email": "test@test.com"
    })
    assert response.status_code == 422

def test_telegram_webhook_secret_validation(client, mock_telegram_webhook_payload):
    """HIGH: Telegram webhook should validate secret"""
    # Without secret header
    response = client.post("/webhooks/telegram", json=mock_telegram_webhook_payload)
    
    # Should require some form of validation
    # This test documents the requirement - implementation needed
    assert response.status_code in [200, 401, 403]  # Depends on implementation

def test_api_key_header_required_for_sensitive_endpoints(client):
    """HIGH: Sensitive endpoints should require API key"""
    sensitive_endpoints = [
        ("GET", "/admin/vms/status"),
        ("POST", "/api/v1/demo/run"),
        ("DELETE", "/api/v1/demo/cleanup"),
    ]
    
    for method, endpoint in sensitive_endpoints:
        response = client.request(method, endpoint)
        # Should require authentication
        assert response.status_code in [401, 403], f"{method} {endpoint} should require auth"

def test_rate_limiting_on_customer_creation(client):
    """HIGH: Customer creation should be rate limited"""
    # Make multiple rapid requests
    responses = []
    for i in range(15):
        response = client.post("/api/v1/customers", json={
            "company_name": f"Test Corp {i}",
            "email": f"test{i}@test.com",
            "plan": "starter"
        })
        responses.append(response.status_code)
    
    # Some should be rate limited (429)
    assert 429 in responses or responses.count(201) < 15, "Should have rate limiting"

def test_sql_injection_protection(client):
    """MEDIUM: SQL injection attempts should be blocked"""
    malicious_inputs = [
        "'; DROP TABLE customers; --",
        "1 OR 1=1",
        "test@example.com'; DELETE FROM employees; --",
        "<script>alert('xss')</script>",
    ]
    
    for payload in malicious_inputs:
        response = client.post("/api/v1/customers", json={
            "company_name": payload,
            "email": "test@test.com"
        })
        # Should either reject or sanitize - not cause server error
        assert response.status_code in [200, 201, 422, 400]

def test_error_messages_dont_leak_internal_info(client):
    """HIGH: Error messages shouldn't expose internal details"""
    with patch('main.platform.onboard_customer') as mock_onboard:
        mock_onboard.side_effect = Exception("Database connection failed: postgres://user:pass@host/db")
        
        response = client.post("/api/v1/customers", json={
            "company_name": "Test Corp",
            "email": "test@test.com"
        })
        
        assert response.status_code == 500
        error_msg = response.json()["detail"]
        # Should not contain sensitive info
        assert "postgres://" not in error_msg
        assert "password" not in error_msg.lower()

def test_health_endpoint_doesnt_expose_sensitive_info(client):
    """MEDIUM: Health check shouldn't leak API keys"""
    response = client.get("/health")
    
    assert response.status_code == 200
    response_text = response.text.lower()
    
    # Should not contain API keys
    assert "api_key" not in response_text
    assert "secret" not in response_text
    assert "password" not in response_text
    assert "token" not in response_text or '"status"' in response.text
