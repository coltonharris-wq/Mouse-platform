"""
Test Configuration and Fixtures
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone
import os
import sys

# Add parent directory and api-gateway to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api-gateway'))

# Set test environment
os.environ['TEST_MODE'] = 'true'
os.environ['SUPABASE_URL'] = 'https://test.supabase.co'
os.environ['SUPABASE_SERVICE_KEY'] = 'test-service-key'
os.environ['ORGO_API_KEY'] = 'test-orgo-key'
os.environ['ORGO_WORKSPACE_ID'] = 'test-workspace-id'
os.environ['STRIPE_SECRET_KEY'] = 'fake_stripe_key_for_testing'
os.environ['STRIPE_WEBHOOK_SECRET'] = 'whsec_test_webhook'
os.environ['TELEGRAM_BOT_TOKEN'] = 'test-telegram-token'
os.environ['MOONSHOT_API_KEY'] = 'test-moonshot-key'

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def mock_supabase():
    """Mock Supabase client"""
    mock = MagicMock()
    mock.create_customer = AsyncMock(return_value={"id": "cst_test123", "status": "active"})
    mock.get_customer = AsyncMock(return_value={
        "id": "cst_test123",
        "company_name": "Test Corp",
        "email": "test@test.com",
        "plan_tier": "starter",
        "status": "active"
    })
    mock.update_customer = AsyncMock(return_value={"status": "updated"})
    mock.create_king_mouse = AsyncMock(return_value={"bot_token": "test_token"})
    mock.get_king_mouse = AsyncMock(return_value={
        "bot_token": "test_token",
        "bot_username": "test_bot",
        "bot_link": "https://t.me/test_bot",
        "status": "active"
    })
    mock.create_employee = AsyncMock(return_value={"id": "emp_test123", "status": "deploying"})
    mock.update_employee = AsyncMock(return_value={"status": "active"})
    mock.get_employee_by_vm = AsyncMock(return_value={
        "id": "emp_test123",
        "customer_id": "cst_test123",
        "status": "active"
    })
    mock.get_employees_by_customer = AsyncMock(return_value=[])
    mock.log_chat = AsyncMock(return_value={"id": "log_123"})
    mock.health = MagicMock(return_value=True)
    return mock

@pytest.fixture
def mock_orgo():
    """Mock Orgo client"""
    mock = MagicMock()
    mock.create_computer = AsyncMock(return_value={
        "id": "vm_test123",
        "url": "https://vm.orgo.com/test123",
        "status": "running"
    })
    mock.get_screenshot = AsyncMock(return_value="iVBORw0KGgoAAAANS...")
    mock.get_computer_status = AsyncMock(return_value={"status": "running"})
    mock.stop_computer = AsyncMock(return_value={"status": "stopped"})
    mock.delete_computer = AsyncMock(return_value={"status": "deleted"})
    mock.list_all_vms = AsyncMock(return_value=[])
    mock.health = MagicMock(return_value=True)
    return mock

@pytest.fixture
def mock_telegram():
    """Mock Telegram bot"""
    mock = MagicMock()
    mock.send_message = AsyncMock(return_value={"message_id": 123})
    mock.health = MagicMock(return_value=True)
    return mock

@pytest.fixture
def mock_stripe():
    """Mock Stripe client"""
    mock = MagicMock()
    mock.webhooks = MagicMock()
    mock.webhooks.construct_event = MagicMock(return_value={
        "type": "customer.subscription.created",
        "data": {"object": {"customer": "cus_test123"}}
    })
    return mock

@pytest.fixture
def valid_customer_data():
    """Valid customer creation data"""
    return {
        "company_name": "Test Corp",
        "email": "test@test.com",
        "plan": "starter",
        "reseller_id": "automio_default"
    }

@pytest.fixture
def valid_employee_data():
    """Valid employee deployment data"""
    return {
        "role": "Web Developer",
        "name": "Alex Dev",
        "task_description": "Build a landing page"
    }

@pytest.fixture
def valid_message_data():
    """Valid message data"""
    return {
        "message": "I need a website built",
        "employee_id": None
    }

@pytest.fixture
def mock_stripe_webhook_payload():
    """Valid Stripe webhook payload"""
    return {
        "id": "evt_test123",
        "type": "customer.subscription.created",
        "data": {
            "object": {
                "id": "sub_test123",
                "customer": "cus_test123",
                "status": "active"
            }
        }
    }

@pytest.fixture
def mock_telegram_webhook_payload():
    """Valid Telegram webhook payload"""
    return {
        "update_id": 123456789,
        "message": {
            "message_id": 1,
            "from": {"id": 123456, "username": "testuser"},
            "chat": {"id": 123456, "type": "private"},
            "date": int(datetime.now(timezone.utc).timestamp()),
            "text": "I need help with my website"
        }
    }

@pytest.fixture
def test_headers():
    """Standard test headers"""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

@pytest.fixture
def auth_headers():
    """Authenticated test headers"""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer test-token"
    }

@pytest.fixture
def client(mock_supabase, mock_orgo, mock_telegram):
    """Create a FastAPI test client with mocked dependencies"""
    from fastapi.testclient import TestClient
    
    # Import main after setting up environment
    with patch.dict(os.environ, {"TEST_MODE": "true"}):
        with patch('main.supabase', mock_supabase):
            with patch('main.orgo', mock_orgo):
                with patch('main.telegram', mock_telegram):
                    with patch('main.platform.supabase', mock_supabase):
                        with patch('main.platform.orgo', mock_orgo):
                            with patch('main.platform.telegram', mock_telegram):
                                from main import app
                                yield TestClient(app)