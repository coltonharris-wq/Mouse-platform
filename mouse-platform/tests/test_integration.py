"""
Integration Tests
Full end-to-end user flow tests
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock, call

@pytest.mark.integration
def test_complete_onboarding_flow(client):
    """Full customer onboarding: signup → King Mouse → QR code"""
    with patch('main.platform.supabase') as mock_supabase:
        # Setup mocks
        mock_supabase.create_customer = AsyncMock(return_value={
            "id": "cst_new123",
            "status": "active"
        })
        mock_supabase.create_king_mouse = AsyncMock(return_value={"id": "km_123"})
        mock_supabase.get_customer = AsyncMock(return_value={
            "id": "cst_new123",
            "company_name": "Clean Eats",
            "email": "owner@cleaneats.com",
            "status": "active"
        })
        mock_supabase.get_king_mouse = AsyncMock(return_value={
            "bot_username": "cleaneats_king_mouse_bot",
            "bot_link": "https://t.me/cleaneats_king_mouse_bot",
            "qr_code_url": "data:image/png;base64,abc123"
        })
        
        # 1. Customer signs up
        response = client.post("/api/v1/customers", json={
            "company_name": "Clean Eats",
            "email": "owner@cleaneats.com",
            "plan": "growth"
        })
        
        assert response.status_code == 200
        data = response.json()
        customer_id = data["customer"]["id"]
        
        # Verify QR code generated
        assert data["qr_code_url"].startswith("data:image/png;base64,")
        
        # 2. Get King Mouse status
        response = client.get(f"/api/v1/customers/{customer_id}/king-mouse")
        assert response.status_code == 200
        assert response.json()["status"] == "active"

@pytest.mark.integration
def test_message_to_deployment_flow(client):
    """Full flow: message → AI processing → VM deployment → screenshot"""
    with patch('main.platform.supabase') as mock_supabase, \
         patch('main.platform.orgo') as mock_orgo:
        
        # Setup mocks
        customer_id = "cst_test123"
        mock_supabase.get_customer = AsyncMock(return_value={
            "id": customer_id,
            "company_name": "Test Corp",
            "plan_tier": "growth",
            "status": "active"
        })
        mock_supabase.get_king_mouse = AsyncMock(return_value={
            "bot_token": "test_token",
            "status": "active"
        })
        mock_supabase.create_employee = AsyncMock(return_value={
            "id": "emp_web123",
            "status": "deploying"
        })
        mock_supabase.update_employee = AsyncMock(return_value={"status": "active"})
        mock_supabase.get_employee_by_vm = AsyncMock(return_value={
            "id": "emp_web123",
            "customer_id": customer_id,
            "status": "active",
            "current_task": "Build website"
        })
        mock_orgo.create_computer = AsyncMock(return_value={
            "id": "vm_web123",
            "url": "https://vm.orgo.com/web123",
            "status": "running"
        })
        mock_orgo.get_screenshot = AsyncMock(return_value="base64_screenshot_data")
        
        # 1. Customer sends message
        response = client.post(
            f"/api/v1/customers/{customer_id}/message",
            json={"message": "I need a website built"}
        )
        
        assert response.status_code == 200
        assert response.json()["employee_deployed"] is not None
        vm_id = response.json().get("vm_id", "vm_web123")
        
        # 2. Get screenshot of working employee
        response = client.get(
            f"/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot"
        )
        
        assert response.status_code == 200
        assert "screenshot_base64" in response.json()

@pytest.mark.integration
def test_demo_flow(client):
    """Full demo flow: run demo → deploy employees → cleanup"""
    with patch('main.platform.supabase') as mock_supabase, \
         patch('main.platform.orgo') as mock_orgo:
        
        # Setup mocks
        mock_supabase.create_customer = AsyncMock(return_value={
            "id": "cst_demo123",
            "status": "active"
        })
        mock_supabase.create_king_mouse = AsyncMock(return_value={"id": "km_demo"})
        mock_supabase.create_employee = AsyncMock(return_value={
            "id": "emp_demo",
            "status": "deploying"
        })
        mock_supabase.update_employee = AsyncMock(return_value={"status": "active"})
        mock_supabase.get_demo_customers = AsyncMock(return_value=[
            {"id": "cst_demo123"}
        ])
        mock_orgo.create_computer = AsyncMock(return_value={
            "id": "vm_demo",
            "url": "https://vm.orgo.com/demo"
        })
        mock_orgo.stop_computer = AsyncMock(return_value={"status": "stopped"})
        mock_orgo.delete_computer = AsyncMock(return_value={"status": "deleted"})
        
        # 1. Run demo
        response = client.post("/api/v1/demo/run")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["employees"]) == 2  # Web dev + Social media
        
        # Verify both employees created
        assert mock_supabase.create_employee.call_count == 2
        assert mock_orgo.create_computer.call_count == 2
        
        # 2. Cleanup demo
        response = client.delete("/api/v1/demo/cleanup")
        
        assert response.status_code == 200
        assert response.json()["success"] is True
        
        # Verify cleanup called
        mock_supabase.delete_customer.assert_called_once()

@pytest.mark.integration
def test_stripe_webhook_to_status_update(client):
    """Full flow: Stripe webhook → customer status update"""
    with patch('stripe.Webhook.construct_event') as mock_construct, \
         patch('main.platform.supabase') as mock_supabase:
        
        mock_construct.return_value = {
            "type": "invoice.payment_succeeded",
            "data": {
                "object": {
                    "customer": "cus_test123",
                    "amount_paid": 9900,
                    "id": "inv_test123"
                }
            }
        }
        mock_supabase.update_customer_by_stripe_id = AsyncMock(return_value={"status": "active"})
        mock_supabase.create_revenue_event = AsyncMock(return_value={"id": "rev_123"})
        
        # Process webhook
        response = client.post(
            "/webhooks/stripe",
            json={},
            headers={"Stripe-Signature": "sig_test"}
        )
        
        assert response.status_code == 200
        
        # Verify customer updated and revenue logged
        mock_supabase.update_customer_by_stripe_id.assert_called_once()
        mock_supabase.create_revenue_event.assert_called_once()

@pytest.mark.integration
def test_telegram_to_deployment_flow(client):
    """Full flow: Telegram message → AI processing → deployment confirmation"""
    with patch('main.supabase') as mock_supabase, \
         patch('main.telegram') as mock_telegram, \
         patch('main.platform') as mock_platform, \
         patch('main.platform.orgo') as mock_orgo:
        
        # Setup
        customer_id = "cst_telegram123"
        chat_id = 987654321
        
        mock_supabase.get_customer_by_telegram_chat = AsyncMock(return_value={
            "id": customer_id,
            "company_name": "Test Corp",
            "plan_tier": "growth",
            "status": "active"
        })
        mock_platform.handle_message = AsyncMock(return_value={
            "message": "I'm deploying a web developer for you!",
            "action": "deploy_employee",
            "employee_id": "emp_new123",
            "vm_id": "vm_new123"
        })
        
        # Incoming Telegram message
        payload = {
            "update_id": 123,
            "message": {
                "message_id": 1,
                "from": {"id": chat_id, "username": "testuser"},
                "chat": {"id": chat_id, "type": "private"},
                "date": 1234567890,
                "text": "I need a website"
            }
        }
        
        response = client.post("/webhooks/telegram", json=payload)
        
        assert response.status_code == 200
        
        # Verify AI processed message
        mock_platform.handle_message.assert_called_once_with(customer_id, "I need a website")
        
        # Verify response sent back to Telegram
        mock_telegram.send_message.assert_called_once()
        call_args = mock_telegram.send_message.call_args
        assert call_args[0][0] == chat_id
        assert "deploying" in call_args[0][1].lower() or "web developer" in call_args[0][1].lower()
