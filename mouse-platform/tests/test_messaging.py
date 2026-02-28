"""
King Mouse Messaging Tests
Tests for AI message processing, intent detection, and action triggering
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

def test_send_message_success(client, valid_message_data, mock_supabase, mock_orgo):
    """Successfully send message to King Mouse"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        response = client.post(
            "/api/v1/customers/cst_test123/message",
            json=valid_message_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "response" in data
        assert "actions" in data

def test_message_triggers_website_deployment(client, mock_supabase, mock_orgo):
    """Message about website should trigger web developer deployment"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        mock_orgo.create_computer = AsyncMock(return_value={
            "id": "vm_web123",
            "url": "https://vm.orgo.com/web123"
        })
        
        response = client.post(
            "/api/v1/customers/cst_test123/message",
            json={"message": "I need a website built for my business"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("employee_deployed") is not None

def test_message_triggers_social_media_deployment(client, mock_supabase, mock_orgo):
    """Message about social media should trigger social media manager deployment"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        response = client.post(
            "/api/v1/customers/cst_test123/message",
            json={"message": "Help me with Instagram marketing"}
        )
        
        assert response.status_code == 200

def test_message_triggers_sales_deployment(client, mock_supabase, mock_orgo):
    """Message about sales should trigger sales rep deployment"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        response = client.post(
            "/api/v1/customers/cst_test123/message",
            json={"message": "I need help with sales outreach"}
        )
        
        assert response.status_code == 200

def test_message_case_insensitive(client, mock_supabase, mock_orgo):
    """Message processing should be case insensitive"""
    with patch('main.platform.supabase', mock_supabase), \
         patch('main.platform.orgo', mock_orgo):
        
        # Test various cases
        cases = [
            "I NEED A WEBSITE",
            "i need a website",
            "I Need A Website",
            "i NeEd A wEbSiTe"
        ]
        
        for msg in cases:
            response = client.post(
                "/api/v1/customers/cst_test123/message",
                json={"message": msg}
            )
            assert response.status_code == 200

def test_message_logged_to_database(client, valid_message_data, mock_supabase):
    """All messages should be logged"""
    with patch('main.platform.supabase', mock_supabase):
        response = client.post(
            "/api/v1/customers/cst_test123/message",
            json=valid_message_data
        )
        
        assert response.status_code == 200
        mock_supabase.log_chat.assert_called_once()

def test_empty_message_rejected(client):
    """Empty message should be rejected"""
    response = client.post(
        "/api/v1/customers/cst_test123/message",
        json={"message": ""}
    )
    
    assert response.status_code == 422

def test_message_too_long_rejected(client):
    """Overly long message should be rejected"""
    response = client.post(
        "/api/v1/customers/cst_test123/message",
        json={"message": "A" * 5001}  # Assuming 5000 char limit
    )
    
    assert response.status_code == 422

def test_generic_message_no_deployment(client, mock_supabase):
    """Generic message should not deploy employee"""
    with patch('main.platform.supabase', mock_supabase):
        response = client.post(
            "/api/v1/customers/cst_test123/message",
            json={"message": "Hello, how are you?"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("employee_deployed") is None

def test_unknown_customer_message(client, mock_supabase):
    """Message to unknown customer should return error"""
    with patch('main.platform.supabase', mock_supabase):
        mock_supabase.get_customer.return_value = None
        
        response = client.post(
            "/api/v1/customers/cst_unknown/message",
            json={"message": "I need a website"}
        )
        
        assert response.status_code == 404

def test_king_mouse_agent_role_detection():
    """Test King Mouse role detection logic"""
    from ai_agents import KingMouseAgent
    
    king = KingMouseAgent(company_name="Test", plan="growth")
    
    test_cases = [
        ("I need a website", "web_developer"),
        ("Build me an online store", "web_developer"),
        ("Social media help", "social_media_manager"),
        ("Instagram posts", "social_media_manager"),
        ("Sales outreach", "sales_rep"),
        ("Find me leads", "sales_rep"),
        ("Bookkeeping", "bookkeeper"),
        ("Customer support", "customer_support"),
        ("Just saying hello", None),
    ]
    
    for message, expected_role in test_cases:
        result = king.detect_role(message)
        assert result == expected_role, f"Failed for: {message}"

def test_king_mouse_response_generation():
    """Test King Mouse response generation"""
    from ai_agents import KingMouseAgent
    
    king = KingMouseAgent(company_name="Test Corp", plan="growth")
    
    # Should include company name in response
    response = king.generate_response("web_developer", "Build website")
    assert "Test Corp" in response or "website" in response.lower()

def test_message_with_employee_context(client, mock_supabase):
    """Message with employee_id should route to specific employee"""
    with patch('main.platform.supabase', mock_supabase):
        mock_supabase.get_employee = AsyncMock(return_value={
            "id": "emp_existing",
            "customer_id": "cst_test123",
            "status": "active"
        })
        
        response = client.post(
            "/api/v1/customers/cst_test123/message",
            json={
                "message": "Status update?",
                "employee_id": "emp_existing"
            }
        )
        
        assert response.status_code == 200
