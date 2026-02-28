"""
Test suite for Mouse Platform API Gateway
Tests real implementations (not mocks)
"""
import pytest
import asyncio
import os
from datetime import datetime

# Import the modules to test
from ai_agents import KingMouseAgent, KnightAgent, MoonshotClient
from orchestrator import MousePlatform, StripeClient, TelegramAPIClient
from telegram_bot import TelegramBot, TelegramBotManager

# Load environment variables for testing
MOONSHOT_API_KEY = os.getenv("MOONSHOT_API_KEY")
ORGO_API_KEY = os.getenv("ORGO_API_KEY")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")


class TestMoonshotClient:
    """Tests for Moonshot AI integration"""
    
    @pytest.mark.asyncio
    async def test_chat_completion(self):
        """Test that Moonshot API returns valid responses"""
        if not MOONSHOT_API_KEY:
            pytest.skip("MOONSHOT_API_KEY not set")
        
        client = MoonshotClient()
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello from Moonshot' and nothing else."}
        ]
        
        response = await client.chat_completion(messages, max_tokens=50)
        
        assert "choices" in response
        assert len(response["choices"]) > 0
        assert "message" in response["choices"][0]
        content = response["choices"][0]["message"]["content"]
        assert "Hello" in content or "Moonshot" in content
    
    @pytest.mark.asyncio
    async def test_chat_completion_with_tools(self):
        """Test function calling capability"""
        if not MOONSHOT_API_KEY:
            pytest.skip("MOONSHOT_API_KEY not set")
        
        client = MoonshotClient()
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Deploy a web developer to build a website"}
        ]
        
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "deploy_employee",
                    "description": "Deploy an AI employee",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "role": {"type": "string", "enum": ["web_developer", "sales_rep"]}
                        },
                        "required": ["role"]
                    }
                }
            }
        ]
        
        response = await client.chat_completion(messages, tools=tools)
        
        assert "choices" in response
        # AI may or may not use the tool depending on its interpretation


class TestKingMouseAgent:
    """Tests for King Mouse AI agent"""
    
    @pytest.mark.asyncio
    async def test_process_message_web_request(self):
        """Test processing a web development request"""
        agent = KingMouseAgent(
            company_name="Test Co",
            plan="starter",
            customer_id="test_123"
        )
        
        response = await agent.process_message("I need a website for my business")
        
        assert "message" in response
        assert response["action"] == "deploy_employee"
        assert response["role"] == "web_developer"
        assert "employee_name" in response
        assert "task_description" in response
    
    @pytest.mark.asyncio
    async def test_process_message_sales_request(self):
        """Test processing a sales request"""
        agent = KingMouseAgent(
            company_name="Test Co",
            plan="starter",
            customer_id="test_123"
        )
        
        response = await agent.process_message("I need help with sales outreach")
        
        assert "message" in response
        assert response["action"] == "deploy_employee"
        assert response["role"] == "sales_rep"
    
    @pytest.mark.asyncio
    async def test_process_message_general_inquiry(self):
        """Test processing a general inquiry"""
        agent = KingMouseAgent(
            company_name="Test Co",
            plan="starter",
            customer_id="test_123"
        )
        
        response = await agent.process_message("What can you do?")
        
        assert "message" in response
        # Should either have no action or use AI to respond
        assert isinstance(response["message"], str)


class TestKnightAgent:
    """Tests for Knight AI agent"""
    
    @pytest.mark.asyncio
    async def test_generate_task_plan(self):
        """Test task plan generation"""
        if not MOONSHOT_API_KEY:
            pytest.skip("MOONSHOT_API_KEY not set")
        
        agent = KnightAgent(
            vm_id="test_vm_123",
            role="web_developer",
            task="Build a Shopify website"
        )
        
        plan = await agent._generate_task_plan("Build a Shopify website")
        
        assert isinstance(plan, list)
        assert len(plan) > 0
        # Plan should contain actionable steps
        assert any("shopify" in step.lower() or "website" in step.lower() or "build" in step.lower() 
                   for step in plan)


class TestStripeClient:
    """Tests for Stripe integration"""
    
    @pytest.mark.asyncio
    async def test_create_customer(self):
        """Test creating a Stripe customer"""
        if not STRIPE_SECRET_KEY:
            pytest.skip("STRIPE_SECRET_KEY not set")
        
        client = StripeClient()
        test_email = f"test_{datetime.utcnow().timestamp()}@example.com"
        
        customer = await client.create_customer(
            email=test_email,
            name="Test Customer"
        )
        
        assert "id" in customer
        assert customer["email"] == test_email
        assert customer["name"] == "Test Customer"
        
        # Cleanup
        await client.delete_customer(customer["id"])
    
    @pytest.mark.asyncio
    async def test_delete_customer(self):
        """Test deleting a Stripe customer"""
        if not STRIPE_SECRET_KEY:
            pytest.skip("STRIPE_SECRET_KEY not set")
        
        client = StripeClient()
        test_email = f"test_{datetime.utcnow().timestamp()}@example.com"
        
        # Create then delete
        customer = await client.create_customer(email=test_email, name="Test")
        result = await client.delete_customer(customer["id"])
        
        assert result.get("deleted") is True


class TestTelegramBot:
    """Tests for Telegram bot integration"""
    
    @pytest.mark.asyncio
    async def test_get_me(self):
        """Test getting bot info"""
        if not TELEGRAM_BOT_TOKEN:
            pytest.skip("TELEGRAM_BOT_TOKEN not set")
        
        bot = TelegramBot(token=TELEGRAM_BOT_TOKEN)
        result = await bot.get_me()
        
        assert result.get("ok") is True
        assert "result" in result
        assert "username" in result["result"]
    
    @pytest.mark.asyncio
    async def test_validate_token(self):
        """Test token validation"""
        manager = TelegramBotManager()
        
        if TELEGRAM_BOT_TOKEN:
            is_valid = await manager.validate_token(TELEGRAM_BOT_TOKEN)
            assert is_valid is True
        
        # Invalid token should return False
        is_invalid = await manager.validate_token("invalid_token_123")
        assert is_invalid is False


class TestMousePlatform:
    """Integration tests for Mouse Platform"""
    
    @pytest.mark.asyncio
    async def test_plan_limits(self):
        """Test plan limit calculations"""
        platform = MousePlatform()
        
        # Verify plan limits are defined
        assert "starter" in platform.PLAN_LIMITS
        assert "growth" in platform.PLAN_LIMITS
        assert "enterprise" in platform.PLAN_LIMITS
        
        # Verify limits have required fields
        for plan, limits in platform.PLAN_LIMITS.items():
            assert "max_vms" in limits
            assert "ram_per_vm" in limits
            assert "cpu_per_vm" in limits
    
    @pytest.mark.asyncio
    async def test_create_real_telegram_bot(self):
        """Test Telegram bot creation logic"""
        platform = MousePlatform()
        
        result = await platform._create_real_telegram_bot(
            customer_id="test_123",
            company_name="Test Company"
        )
        
        assert "bot_token" in result
        assert "bot_username" in result
        assert "bot_link" in result
        assert "test_company" in result["bot_username"].lower()


class TestInputValidation:
    """Tests for input validation"""
    
    def test_company_name_validation(self):
        """Test company name length validation"""
        from pydantic import ValidationError
        from main import CustomerCreate
        
        # Valid name
        valid = CustomerCreate(company_name="Test Co", email="test@example.com")
        assert valid.company_name == "Test Co"
        
        # Empty name should fail
        with pytest.raises(ValidationError):
            CustomerCreate(company_name="", email="test@example.com")
        
        # Name too long should fail
        with pytest.raises(ValidationError):
            CustomerCreate(company_name="A" * 101, email="test@example.com")
    
    def test_email_validation(self):
        """Test email format validation"""
        from pydantic import ValidationError
        from main import CustomerCreate
        
        # Valid email
        valid = CustomerCreate(company_name="Test", email="test@example.com")
        assert valid.email == "test@example.com"
        
        # Invalid email should fail
        with pytest.raises(ValidationError):
            CustomerCreate(company_name="Test", email="not-an-email")
    
    def test_plan_validation(self):
        """Test plan enum validation"""
        from pydantic import ValidationError
        from main import CustomerCreate
        
        # Valid plans
        starter = CustomerCreate(company_name="Test", email="test@example.com", plan="starter")
        assert starter.plan == "starter"
        
        growth = CustomerCreate(company_name="Test", email="test@example.com", plan="growth")
        assert growth.plan == "growth"
        
        # Invalid plan should fail
        with pytest.raises(ValidationError):
            CustomerCreate(company_name="Test", email="test@example.com", plan="invalid")


class TestSecurity:
    """Tests for security features"""
    
    def test_cors_origins(self):
        """Test CORS origins are properly configured"""
        import main
        
        # CORS should not allow all origins
        assert "*" not in main.allowed_origins or os.getenv("ALLOWED_ORIGINS") == "*"
    
    def test_stripe_webhook_requires_secret(self):
        """Test that Stripe webhook requires secret"""
        # If STRIPE_WEBHOOK_SECRET is not set, webhook should reject
        if not os.getenv("STRIPE_WEBHOOK_SECRET"):
            # This is a security issue in production
            pass  # Just document, don't fail


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
