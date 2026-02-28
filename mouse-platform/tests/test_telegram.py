"""
Telegram Bot Integration Tests
Tests for Telegram webhook handling and message responses
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

def test_telegram_webhook_message_received(client, mock_telegram_webhook_payload):
    """Handle incoming Telegram message"""
    with patch('main.supabase') as mock_supabase, \
         patch('main.telegram') as mock_telegram, \
         patch('main.platform') as mock_platform:
        
        mock_supabase.get_customer_by_telegram_chat.return_value = {
            "id": "cst_test123",
            "company_name": "Test Corp"
        }
        mock_platform.handle_message = AsyncMock(return_value={
            "message": "I'll help you with that!"
        })
        
        response = client.post("/webhooks/telegram", json=mock_telegram_webhook_payload)
        
        assert response.status_code == 200
        assert response.json()["ok"] is True

def test_telegram_webhook_sends_response(client, mock_telegram_webhook_payload):
    """Should send response back to Telegram"""
    with patch('main.supabase') as mock_supabase, \
         patch('main.telegram') as mock_telegram, \
         patch('main.platform') as mock_platform:
        
        mock_supabase.get_customer_by_telegram_chat.return_value = {
            "id": "cst_test123"
        }
        mock_platform.handle_message = AsyncMock(return_value={
            "message": "Deploying your AI employee!"
        })
        
        client.post("/webhooks/telegram", json=mock_telegram_webhook_payload)
        
        mock_telegram.send_message.assert_called_once()
        call_args = mock_telegram.send_message.call_args
        assert call_args[0][0] == 123456  # chat_id

def test_telegram_webhook_unknown_chat(client, mock_telegram_webhook_payload):
    """Handle message from unknown chat gracefully"""
    with patch('main.supabase') as mock_supabase:
        mock_supabase.get_customer_by_telegram_chat.return_value = None
        
        response = client.post("/webhooks/telegram", json=mock_telegram_webhook_payload)
        
        assert response.status_code == 200
        assert response.json()["ok"] is True  # Acknowledge to Telegram

def test_telegram_webhook_empty_message(client):
    """Handle empty message"""
    payload = {
        "update_id": 123,
        "message": {
            "message_id": 1,
            "chat": {"id": 123456},
            "date": 1234567890,
            "text": ""
        }
    }
    
    response = client.post("/webhooks/telegram", json=payload)
    assert response.status_code == 200

def test_telegram_webhook_no_text(client):
    """Handle message without text (e.g., sticker)"""
    payload = {
        "update_id": 123,
        "message": {
            "message_id": 1,
            "chat": {"id": 123456},
            "date": 1234567890,
            "sticker": {"file_id": "sticker123"}
        }
    }
    
    with patch('main.supabase') as mock_supabase:
        mock_supabase.get_customer_by_telegram_chat.return_value = {"id": "cst_123"}
        
        response = client.post("/webhooks/telegram", json=payload)
        assert response.status_code == 200

def test_telegram_webhook_deployment_request(client, mock_telegram_webhook_payload):
    """Message requesting deployment should trigger employee creation"""
    with patch('main.supabase') as mock_supabase, \
         patch('main.telegram') as mock_telegram, \
         patch('main.platform') as mock_platform:
        
        mock_supabase.get_customer_by_telegram_chat.return_value = {
            "id": "cst_test123",
            "company_name": "Test Corp",
            "plan_tier": "growth"
        }
        mock_platform.handle_message = AsyncMock(return_value={
            "message": "I'm deploying a web developer for you!",
            "action": "deploy_employee",
            "employee_id": "emp_new123"
        })
        
        payload = mock_telegram_webhook_payload.copy()
        payload["message"]["text"] = "I need a website built"
        
        client.post("/webhooks/telegram", json=payload)
        
        mock_platform.handle_message.assert_called_once()

def test_telegram_message_too_long(client, mock_telegram_webhook_payload):
    """Handle very long messages"""
    with patch('main.supabase') as mock_supabase, \
         patch('main.telegram') as mock_telegram, \
         patch('main.platform') as mock_platform:
        
        mock_supabase.get_customer_by_telegram_chat.return_value = {"id": "cst_123"}
        
        payload = mock_telegram_webhook_payload.copy()
        payload["message"]["text"] = "A" * 5000
        
        response = client.post("/webhooks/telegram", json=payload)
        assert response.status_code == 200

def test_telegram_webhook_error_handling(client, mock_telegram_webhook_payload):
    """Handle errors gracefully"""
    with patch('main.supabase') as mock_supabase:
        mock_supabase.get_customer_by_telegram_chat.side_effect = Exception("DB Error")
        
        response = client.post("/webhooks/telegram", json=mock_telegram_webhook_payload)
        
        # Should still return 200 to Telegram to prevent retries
        assert response.status_code == 200
        assert response.json()["ok"] is False
