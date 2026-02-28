"""
Customer Onboarding Tests
Tests for customer signup, King Mouse setup, and initial configuration
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

def test_create_customer_success(client, valid_customer_data, mock_supabase):
    """Successful customer creation"""
    with patch('main.platform.supabase', mock_supabase):
        response = client.post("/api/v1/customers", json=valid_customer_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "customer" in data
        assert "king_mouse" in data
        assert "qr_code_url" in data

def test_create_customer_creates_database_record(client, valid_customer_data, mock_supabase):
    """Customer creation should create database record"""
    with patch('main.platform.supabase', mock_supabase):
        response = client.post("/api/v1/customers", json=valid_customer_data)
        
        assert response.status_code == 200
        # Verify database was called
        mock_supabase.create_customer.assert_called_once()
        mock_supabase.create_king_mouse.assert_called_once()

def test_create_customer_generates_valid_id(client, valid_customer_data, mock_supabase):
    """Customer should get valid ID format"""
    with patch('main.platform.supabase', mock_supabase):
        mock_supabase.create_customer = AsyncMock(return_value={
            "id": "cst_a1b2c3d4e5f6",
            "status": "active"
        })
        
        response = client.post("/api/v1/customers", json=valid_customer_data)
        
        data = response.json()
        customer_id = data["customer"]["id"]
        assert customer_id.startswith("cst_")
        assert len(customer_id) == 16  # cst_ + 12 hex chars

def test_create_customer_creates_king_mouse(client, valid_customer_data, mock_supabase):
    """Customer creation should set up King Mouse bot"""
    with patch('main.platform.supabase', mock_supabase):
        response = client.post("/api/v1/customers", json=valid_customer_data)
        
        data = response.json()
        king_mouse = data["king_mouse"]
        
        assert "bot_token" in king_mouse
        assert "bot_username" in king_mouse
        assert "bot_link" in king_mouse
        assert king_mouse["bot_link"].startswith("https://t.me/")

def test_create_customer_generates_qr_code(client, valid_customer_data, mock_supabase):
    """Should generate QR code for Telegram bot"""
    with patch('main.platform.supabase', mock_supabase):
        response = client.post("/api/v1/customers", json=valid_customer_data)
        
        data = response.json()
        qr_code = data["qr_code_url"]
        
        # Should be base64 data URL
        assert qr_code.startswith("data:image/png;base64,")
        assert len(qr_code) > 100  # Should have actual image data

def test_get_customer_exists(client, mock_supabase):
    """Get customer returns customer data"""
    with patch('main.supabase', mock_supabase):
        response = client.get("/api/v1/customers/cst_test123")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "cst_test123"
        assert "company_name" in data

def test_get_customer_not_found(client, mock_supabase):
    """Get non-existent customer returns 404"""
    with patch('main.supabase', mock_supabase):
        mock_supabase.get_customer.return_value = None
        
        response = client.get("/api/v1/customers/cst_nonexistent")
        
        assert response.status_code == 404

def test_get_king_mouse_status(client, mock_supabase):
    """Get King Mouse status"""
    with patch('main.platform.supabase', mock_supabase):
        response = client.get("/api/v1/customers/cst_test123/king-mouse")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "bot_username" in data
        assert "bot_link" in data
        assert "qr_code_url" in data

def test_customer_email_validation(client):
    """Should validate email format"""
    invalid_emails = [
        "not-an-email",
        "@nodomain.com",
        "spaces in@email.com",
        "double..dots@email.com",
        ".leadingdot@email.com",
    ]
    
    for email in invalid_emails:
        response = client.post("/api/v1/customers", json={
            "company_name": "Test Corp",
            "email": email
        })
        assert response.status_code == 422, f"Should reject: {email}"

def test_customer_company_name_sanitization(client, valid_customer_data, mock_supabase):
    """Company name should be sanitized for Telegram bot username"""
    test_cases = [
        ("Test Corp", "test_corp_king_mouse_bot"),
        ("A & B Company", "a_b_company_king_mouse_bot"),
        ("Multi  Space   Corp", "multi_space_corp_king_mouse_bot"),
        ("Test.Corp.Inc", "test_corp_inc_king_mouse_bot"),
    ]
    
    for company_name, expected_pattern in test_cases:
        with patch('main.platform.supabase', mock_supabase):
            data = valid_customer_data.copy()
            data["company_name"] = company_name
            
            response = client.post("/api/v1/customers", json=data)
            
            assert response.status_code == 200
            bot_username = response.json()["king_mouse"]["bot_username"]
            # Should not contain special chars or spaces
            assert " " not in bot_username
            assert "&" not in bot_username
            assert "." not in bot_username

def test_customer_plan_tier_validation(client):
    """Should only accept valid plan tiers"""
    valid_plans = ["starter", "growth", "enterprise"]
    invalid_plans = ["free", "premium", "basic", "invalid"]
    
    for plan in valid_plans:
        with patch('main.platform.supabase', new_callable=MagicMock):
            response = client.post("/api/v1/customers", json={
                "company_name": "Test Corp",
                "email": f"test_{plan}@test.com",
                "plan": plan
            })
            assert response.status_code in [200, 201], f"Should accept plan: {plan}"
    
    for plan in invalid_plans:
        response = client.post("/api/v1/customers", json={
            "company_name": "Test Corp",
            "email": "test@test.com",
            "plan": plan
        })
        assert response.status_code == 422, f"Should reject plan: {plan}"

def test_duplicate_email_prevention(client, mock_supabase):
    """Should prevent duplicate email registration"""
    with patch('main.platform.supabase', mock_supabase):
        # First creation
        response1 = client.post("/api/v1/customers", json={
            "company_name": "Test Corp",
            "email": "duplicate@test.com"
        })
        assert response1.status_code == 200
        
        # Mock duplicate detection
        mock_supabase.create_customer.side_effect = Exception("Email already exists")
        
        # Second creation with same email
        response2 = client.post("/api/v1/customers", json={
            "company_name": "Another Corp",
            "email": "duplicate@test.com"
        })
        assert response2.status_code == 409  # Conflict
