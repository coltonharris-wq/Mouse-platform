#!/usr/bin/env python3
"""
🧪 Post-Deployment Verification Script
Tests all Mouse Platform endpoints after deployment
"""

import asyncio
import aiohttp
import sys
import os
from datetime import datetime

# Configuration
API_BASE = os.getenv("API_URL", "https://api.mouseplatform.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://app.mouseplatform.com")

colors = {
    "green": "\033[92m",
    "red": "\033[91m",
    "yellow": "\033[93m",
    "blue": "\033[94m",
    "reset": "\033[0m"
}

def log_success(msg):
    print(f"{colors['green']}✅ {msg}{colors['reset']}")

def log_error(msg):
    print(f"{colors['red']}❌ {msg}{colors['reset']}")

def log_info(msg):
    print(f"{colors['blue']}ℹ️  {msg}{colors['reset']}")

def log_warning(msg):
    print(f"{colors['yellow']}⚠️  {msg}{colors['reset']}")

async def test_health_endpoint(session):
    """Test the health check endpoint"""
    try:
        async with session.get(f"{API_BASE}/health") as resp:
            if resp.status == 200:
                data = await resp.json()
                log_success(f"Health check passed: {data.get('status', 'ok')}")
                return True
            else:
                log_error(f"Health check failed: HTTP {resp.status}")
                return False
    except Exception as e:
        log_error(f"Health check error: {e}")
        return False

async def test_api_docs(session):
    """Test API documentation endpoints"""
    try:
        async with session.get(f"{API_BASE}/docs") as resp:
            if resp.status == 200:
                log_success("API docs accessible at /docs")
                return True
            else:
                log_warning(f"API docs returned HTTP {resp.status}")
                return False
    except Exception as e:
        log_error(f"API docs error: {e}")
        return False

async def test_frontend(session):
    """Test frontend accessibility"""
    try:
        async with session.get(FRONTEND_URL) as resp:
            if resp.status == 200:
                log_success(f"Frontend accessible at {FRONTEND_URL}")
                return True
            else:
                log_error(f"Frontend returned HTTP {resp.status}")
                return False
    except Exception as e:
        log_error(f"Frontend error: {e}")
        return False

async def test_cors_headers(session):
    """Test CORS configuration"""
    try:
        headers = {"Origin": FRONTEND_URL}
        async with session.options(f"{API_BASE}/health", headers=headers) as resp:
            cors_header = resp.headers.get("Access-Control-Allow-Origin")
            if cors_header:
                log_success(f"CORS configured: {cors_header}")
                return True
            else:
                log_warning("CORS headers not present")
                return False
    except Exception as e:
        log_error(f"CORS test error: {e}")
        return False

async def test_stripe_webhook_endpoint(session):
    """Test Stripe webhook endpoint exists"""
    try:
        # Send invalid payload to test endpoint exists
        async with session.post(
            f"{API_BASE}/webhooks/stripe",
            headers={"Stripe-Signature": "invalid"},
            data="{}"
        ) as resp:
            # Should return 400 (invalid signature) not 404
            if resp.status == 400:
                log_success("Stripe webhook endpoint exists")
                return True
            elif resp.status == 404:
                log_error("Stripe webhook endpoint not found")
                return False
            else:
                log_warning(f"Stripe webhook returned HTTP {resp.status}")
                return True  # Endpoint exists even if error
    except Exception as e:
        log_error(f"Stripe webhook error: {e}")
        return False

async def test_telegram_webhook_endpoint(session):
    """Test Telegram webhook endpoint"""
    try:
        async with session.post(
            f"{API_BASE}/webhooks/telegram",
            json={"update_id": 1, "message": {"message_id": 1}}
        ) as resp:
            if resp.status in [200, 401]:  # 401 is ok (missing auth)
                log_success("Telegram webhook endpoint exists")
                return True
            elif resp.status == 404:
                log_error("Telegram webhook endpoint not found")
                return False
            else:
                log_warning(f"Telegram webhook returned HTTP {resp.status}")
                return True
    except Exception as e:
        log_error(f"Telegram webhook error: {e}")
        return False

async def test_ssl_configuration(session):
    """Test SSL/HTTPS configuration"""
    if not API_BASE.startswith("https://"):
        log_warning("API not using HTTPS")
        return False
    
    if not FRONTEND_URL.startswith("https://"):
        log_warning("Frontend not using HTTPS")
        return False
    
    log_success("SSL/HTTPS enabled")
    return True

async def run_all_tests():
    """Run all deployment verification tests"""
    print("🚀 Mouse Platform Deployment Verification")
    print("=" * 50)
    print(f"API: {API_BASE}")
    print(f"Frontend: {FRONTEND_URL}")
    print("")
    
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            test_health_endpoint(session),
            test_api_docs(session),
            test_frontend(session),
            test_cors_headers(session),
            test_stripe_webhook_endpoint(session),
            test_telegram_webhook_endpoint(session),
            test_ssl_configuration(session),
            return_exceptions=True
        )
    
    passed = sum(1 for r in results if r is True)
    failed = sum(1 for r in results if r is False)
    warnings = sum(1 for r in results if r is None)
    
    print("")
    print("=" * 50)
    print("📊 Test Results")
    print("=" * 50)
    log_success(f"Passed: {passed}")
    if failed > 0:
        log_error(f"Failed: {failed}")
    if warnings > 0:
        log_warning(f"Warnings: {warnings}")
    
    print("")
    if failed == 0:
        print("🎉 Deployment verification complete! All critical checks passed.")
    else:
        print("⚠️  Some checks failed. Review the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Verify Mouse Platform deployment")
    parser.add_argument("--api-url", help="API base URL")
    parser.add_argument("--frontend-url", help="Frontend URL")
    args = parser.parse_args()
    
    if args.api_url:
        API_BASE = args.api_url
    if args.frontend_url:
        FRONTEND_URL = args.frontend_url
    
    asyncio.run(run_all_tests())
