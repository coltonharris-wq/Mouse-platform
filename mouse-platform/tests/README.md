# Mouse Platform - Comprehensive Test Suite

A complete end-to-end testing framework for the Mouse Platform API.

## Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| Authentication & Security | 15 | ✅ Passing |
| Customer Onboarding | 12 | ✅ Passing |
| King Mouse Messaging | 18 | ✅ Passing |
| VM/Employee Deployment | 14 | ✅ Passing |
| Stripe Integration | 10 | ✅ Passing |
| Telegram Integration | 8 | ✅ Passing |
| WebSocket Streaming | 6 | ✅ Passing |
| Error Handling | 12 | ✅ Passing |

**Total: 95 tests**

## Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=api-gateway --cov-report=html

# Run specific test category
pytest tests/test_security.py -v
pytest tests/test_onboarding.py -v
```

## Test Structure

```
tests/
├── conftest.py              # Fixtures and test config
├── test_security.py         # Security & auth tests
├── test_onboarding.py       # Customer onboarding
├── test_messaging.py        # King Mouse AI tests
├── test_deployment.py       # VM/employee deployment
├── test_payments.py         # Stripe integration
├── test_telegram.py         # Telegram bot tests
├── test_websocket.py        # WebSocket streaming
├── test_integration.py      # Full flow integration
└── utils/
    ├── factories.py         # Test data factories
    ├── mocks.py            # Mock services
    └── helpers.py          # Test utilities
```

## Environment Setup

```bash
# Test environment variables
export TEST_MODE=true
export SUPABASE_URL=https://test.supabase.co
export SUPABASE_SERVICE_KEY=test-key
export ORGO_API_KEY=test-key
export ORGO_WORKSPACE_ID=test-workspace
export STRIPE_SECRET_KEY=sk_test_xxx
export STRIPE_WEBHOOK_SECRET=whsec_test_xxx
export TELEGRAM_BOT_TOKEN=test-token
export MOONSHOT_API_KEY=test-key
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements-test.txt
      - run: pytest tests/ --cov=api-gateway --cov-fail-under=80
```