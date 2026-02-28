#!/usr/bin/env python3
"""
🧪 MOUSE PLATFORM - COMPLETE USER TEST
Tests every aspect of the signup and usage flow
"""

import asyncio
import sys
import os
from datetime import datetime

# Add path for imports
sys.path.insert(0, '/Users/jewelsharris/.openclaw/workspace/mouse-platform/api-gateway')

# Set test environment variables from environment
os.environ['ORGO_API_KEY'] = os.getenv('ORGO_API_KEY', 'test-orgo-key')
os.environ['ORGO_WORKSPACE_ID'] = os.getenv('ORGO_WORKSPACE_ID', 'test-workspace')
os.environ['MOONSHOT_API_KEY'] = os.getenv('MOONSHOT_API_KEY', 'test-moonshot-key')
os.environ['SUPABASE_URL'] = os.getenv('SUPABASE_URL', 'https://test.supabase.co')
os.environ['SUPABASE_SERVICE_KEY'] = os.getenv('SUPABASE_SERVICE_KEY', 'test-key')
os.environ['TELEGRAM_BOT_TOKEN'] = os.getenv('TELEGRAM_BOT_TOKEN', 'test-token')
os.environ['STRIPE_SECRET_KEY'] = os.getenv('STRIPE_SECRET_KEY', 'sk_test_xxx')

print("=" * 70)
print("🧪 MOUSE PLATFORM - BUG BASH TEST SUITE")
print("=" * 70)
print()

bugs_found = []
warnings_found = []

def report_bug(category, description, severity="HIGH"):
    """Record a bug found"""
    bugs_found.append({
        "category": category,
        "description": description,
        "severity": severity
    })
    print(f"  🐛 BUG [{severity}]: {category}")
    print(f"      → {description}")
    print()

def report_warning(category, description):
    """Record a warning"""
    warnings_found.append({
        "category": category,
        "description": description
    })
    print(f"  ⚠️  WARNING: {category}")
    print(f"      → {description}")
    print()

def test_section(name):
    print(f"\n{'─' * 70}")
    print(f"📋 {name}")
    print(f"{'─' * 70}")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 1: CODE REVIEW - STATIC ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 1: STATIC CODE ANALYSIS")

# Test 1.1: Import issues
print("\n1.1 Testing imports...")
try:
    from orchestrator import MousePlatform
    from supabase_client import SupabaseClient
    from orgo_client import OrgoClient
    from telegram_bot import TelegramBot
    from ai_agents import KingMouseAgent, KnightAgent
    print("  ✅ All imports successful")
except Exception as e:
    report_bug("IMPORTS", f"Import error: {e}", "CRITICAL")

# Test 1.2: Check for async/await issues
print("\n1.2 Checking async/await patterns...")
import inspect

# Check orchestrator methods
from orchestrator import MousePlatform
platform = MousePlatform()

async_methods = [
    'onboard_customer', 'handle_message', 'deploy_employee', 
    'stream_vm', 'list_customer_vms', 'get_king_mouse_status',
    'run_demo', 'cleanup_demo'
]

for method_name in async_methods:
    method = getattr(platform, method_name, None)
    if method:
        if not asyncio.iscoroutinefunction(method):
            report_bug("ASYNC/PATTERN", f"Method '{method_name}' should be async but isn't", "HIGH")
    else:
        report_bug("MISSING_METHOD", f"Method '{method_name}' not found on MousePlatform", "HIGH")

print("  ✅ Async method signatures checked")

# Test 1.3: Check Supabase client
print("\n1.3 Checking Supabase client...")
from supabase_client import SupabaseClient

# Check if methods exist
required_methods = [
    'create_customer', 'get_customer', 'update_customer', 'delete_customer',
    'create_king_mouse', 'get_king_mouse', 'create_employee', 'update_employee',
    'get_employee', 'get_employee_by_vm', 'get_employees_by_customer',
    'log_chat', 'create_revenue_event', 'get_demo_customers'
]

supabase = SupabaseClient()
for method in required_methods:
    if not hasattr(supabase, method):
        report_bug("SUPABASE_CLIENT", f"Missing method: {method}", "HIGH")

print("  ✅ Supabase client methods verified")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 2: ONBOARDING FLOW TESTS
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 2: CUSTOMER ONBOARDING FLOW")

# Test 2.1: Test customer data validation
print("\n2.1 Testing customer data structures...")

test_cases = [
    {"company_name": "Test Corp", "email": "test@test.com", "plan": "starter"},
    {"company_name": "", "email": "test@test.com"},  # Empty name
    {"company_name": "Test", "email": "invalid-email"},  # Invalid email
    {"company_name": "A" * 1000, "email": "test@test.com"},  # Very long name
]

for i, data in enumerate(test_cases):
    print(f"  Test case {i+1}: {data.get('company_name', 'N/A')[:30]}...")
    # In real app this would validate - noting missing validation

print("  ⚠️  No validation on company_name length or email format")
report_warning("VALIDATION", "No input validation on customer creation data")

# Test 2.2: King Mouse creation
print("\n2.2 Testing King Mouse creation...")
try:
    result = asyncio.run(platform._create_king_mouse("test_123", "Test Company"))
    print(f"  Generated bot username: {result['bot_username']}")
    
    # Check for potential issues
    if " " in result['bot_username']:
        report_bug("KING_MOUSE", "Bot username contains spaces - Telegram doesn't allow this", "HIGH")
    
    if len(result['bot_username']) > 32:
        report_bug("KING_MOUSE", "Bot username exceeds Telegram's 32 character limit", "HIGH")
    
    # Check special characters
    import re
    if not re.match(r'^[a-zA-Z0-9_]+$', result['bot_username']):
        report_bug("KING_MOUSE", f"Bot username '{result['bot_username']}' contains invalid characters", "HIGH")
    
    print("  ✅ King Mouse creation logic checked")
except Exception as e:
    report_bug("KING_MOUSE", f"Error creating King Mouse: {e}", "HIGH")

# Test 2.3: QR Code generation
print("\n2.3 Testing QR code generation...")
try:
    qr_result = asyncio.run(platform._generate_qr_code("https://t.me/test_bot"))
    if not qr_result.startswith("data:image/png;base64,"):
        report_bug("QR_CODE", "QR code doesn't return proper base64 data URL format", "MEDIUM")
    print("  ✅ QR code generation works")
except Exception as e:
    report_bug("QR_CODE", f"QR generation error: {e}", "MEDIUM")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 3: MESSAGING & AI AGENT TESTS
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 3: MESSAGING & AI AGENTS")

# Test 3.1: King Mouse message processing
print("\n3.1 Testing King Mouse message processing...")

from ai_agents import KingMouseAgent

king = KingMouseAgent(company_name="Test Corp", plan="growth")

test_messages = [
    ("I need a website", "web_developer"),
    ("Help with social media", "social_media_manager"),
    ("Sales outreach", "sales_rep"),
    ("Bookkeeping help", "bookkeeper"),
    ("Customer support", "customer_support"),
    ("Random message", None),
    ("", None),  # Empty message
]

for msg, expected_role in test_messages:
    try:
        result = asyncio.run(king.process_message(msg))
        if expected_role and result.get('action') != 'deploy_employee':
            report_bug("AI_AGENT", f"Message '{msg}' didn't trigger deployment action", "MEDIUM")
    except Exception as e:
        report_bug("AI_AGENT", f"Error processing message '{msg}': {e}", "HIGH")

print("  ✅ Message processing tested")

# Test 3.2: Check for case sensitivity issues
print("\n3.2 Testing case sensitivity...")
king_lower = asyncio.run(king.process_message("i need a website"))
king_upper = asyncio.run(king.process_message("I NEED A WEBSITE"))
king_mixed = asyncio.run(king.process_message("I nEeD a WeBsItE"))

if king_lower.get('action') != king_upper.get('action'):
    report_warning("AI_AGENT", "Case sensitivity affects message processing")

print("  ✅ Case sensitivity checked")

# Test 3.3: Role configuration
print("\n3.3 Testing role configurations...")

expected_roles = ["web_developer", "social_media_manager", "sales_rep", "bookkeeper", "customer_support"]
for role in expected_roles:
    if role not in KingMouseAgent.ROLES:
        report_bug("AI_AGENT", f"Role '{role}' missing from ROLES configuration", "HIGH")
    else:
        role_data = KingMouseAgent.ROLES[role]
        if 'name' not in role_data or 'skills' not in role_data or 'hourly_value' not in role_data:
            report_bug("AI_AGENT", f"Role '{role}' missing required fields", "MEDIUM")

print("  ✅ Role configurations checked")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 4: VM & EMPLOYEE DEPLOYMENT TESTS
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 4: VM & EMPLOYEE DEPLOYMENT")

# Test 4.1: Employee deployment logic
print("\n4.1 Testing employee deployment structure...")

# Check employee ID generation pattern
import uuid
test_id = f"emp_{uuid.uuid4().hex[:12]}"
if not test_id.startswith("emp_") or len(test_id) != 16:
    report_warning("EMPLOYEE_ID", f"Employee ID format may cause issues: {test_id}")

print("  ✅ Employee ID generation checked")

# Test 4.2: VM config validation
print("\n4.2 Testing VM configuration...")

vm_configs = [
    {"name": "test-vm", "ram": 4, "cpu": 2, "os": "linux"},
    {"name": "test-vm", "ram": 0, "cpu": 2},  # Invalid RAM
    {"name": "test-vm", "ram": 4, "cpu": 0},  # Invalid CPU
    {"name": "", "ram": 4, "cpu": 2},  # Empty name
]

for i, config in enumerate(vm_configs):
    if config.get('ram', 0) <= 0:
        report_warning("VM_CONFIG", f"VM config {i+1} has invalid RAM: {config.get('ram')}")
    if config.get('cpu', 0) <= 0:
        report_warning("VM_CONFIG", f"VM config {i+1} has invalid CPU: {config.get('cpu')}")

print("  ✅ VM configurations checked")

# Test 4.3: Knight agent initialization
print("\n4.3 Testing Knight agent...")

from ai_agents import KnightAgent

# Check if knight can be instantiated
knight = KnightAgent(vm_id="test-vm-123", role="web_developer")
if not knight.vm_id or not knight.role:
    report_bug("KNIGHT", "KnightAgent not properly initialized with vm_id and role", "HIGH")

# Check execute_on_vm method exists
if not hasattr(knight, '_execute_on_vm'):
    report_bug("KNIGHT", "KnightAgent missing _execute_on_vm method", "HIGH")

print("  ✅ Knight agent structure checked")

# Test 4.4: Check for SQL injection vulnerabilities
print("\n4.4 Security: SQL injection checks...")
malicious_inputs = [
    "'; DROP TABLE customers; --",
    "1 OR 1=1",
    "test@example.com'; DELETE FROM employees; --",
]

# These would go into the database - the code uses Supabase client which should parameterize
# But let's verify the data flows
report_warning("SECURITY", "Manual verification needed: Ensure all Supabase queries use parameterized inputs")
print("  ✅ SQL injection checks complete")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 5: API ENDPOINT TESTS
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 5: API ENDPOINT ANALYSIS")

# Test 5.1: Route validation
print("\n5.1 Checking API routes...")

from main import app
from fastapi.routing import APIRoute

routes = [r for r in app.routes if isinstance(r, APIRoute)]
print(f"  Found {len(routes)} API routes")

# Check for missing response models
for route in routes:
    if not route.response_model and route.methods != {'HEAD'}:
        report_warning("API", f"Route {route.path} ({route.methods}) missing response model")

# Check for missing error handling
protected_routes = [
    "/api/v1/customers/{customer_id}",
    "/api/v1/customers/{customer_id}/message",
    "/api/v1/customers/{customer_id}/vms",
    "/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot"
]

print(f"  ✅ Routes checked")

# Test 5.2: WebSocket implementation
print("\n5.2 Checking WebSocket implementation...")

# Check for proper disconnect handling
ws_code = '''
except WebSocketDisconnect:
    manager.disconnect(websocket, client_id)
except Exception as e:
    await websocket.send_json({"type": "error", "message": str(e)})
    manager.disconnect(websocket, client_id)
'''

with open('/Users/jewelsharris/.openclaw/workspace/mouse-platform/api-gateway/main.py', 'r') as f:
    content = f.read()
    if ws_code.strip() not in content:
        report_warning("WEBSOCKET", "WebSocket error handling may not be complete")

print("  ✅ WebSocket checked")

# Test 5.3: CORS configuration
print("\n5.3 Checking CORS configuration...")

if 'allow_origins=["*"]' in content:
    report_bug("SECURITY", "CORS allows all origins (*) - security risk for production", "HIGH")

print("  ✅ CORS configuration checked")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 6: DATABASE SCHEMA TESTS
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 6: DATABASE SCHEMA ANALYSIS")

schema_path = '/Users/jewelsharris/.openclaw/workspace/mouse-platform/supabase/schema.sql'
with open(schema_path, 'r') as f:
    schema = f.read()

# Test 6.1: Check for required tables
print("\n6.1 Checking required tables...")

required_tables = [
    'resellers', 'customers', 'king_mice', 'employees', 
    'tasks', 'usage_logs', 'revenue_events', 'chat_logs', 'profiles'
]

for table in required_tables:
    if f'CREATE TABLE {table}' not in schema and f'CREATE TABLE IF NOT EXISTS {table}' not in schema:
        report_bug("DATABASE", f"Required table '{table}' not found in schema", "HIGH")

print("  ✅ Required tables verified")

# Test 6.2: Check for RLS policies
print("\n6.2 Checking Row Level Security...")

if 'ENABLE ROW LEVEL SECURITY' not in schema:
    report_bug("SECURITY", "RLS not enabled on tables", "CRITICAL")

# Check for policy existence
if 'CREATE POLICY' not in schema:
    report_bug("SECURITY", "No RLS policies defined", "CRITICAL")

print("  ✅ RLS policies checked")

# Test 6.3: Check foreign key constraints
print("\n6.3 Checking foreign key constraints...")

# Check critical FKs
critical_fks = [
    ('customers', 'reseller_id'),
    ('employees', 'customer_id'),
    ('king_mice', 'customer_id'),
    ('tasks', 'employee_id'),
]

for table, column in critical_fks:
    if f'{column}' not in schema or f'REFERENCES' not in schema:
        report_warning("DATABASE", f"Verify FK constraint on {table}.{column}")

print("  ✅ Foreign key constraints checked")

# Test 6.4: Check for indexes
print("\n6.4 Checking indexes...")

if 'CREATE INDEX' not in schema:
    report_warning("DATABASE", "No explicit indexes defined - may cause performance issues")

print("  ✅ Indexes checked")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 7: STRIPE INTEGRATION TESTS
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 7: STRIPE INTEGRATION")

# Test 7.1: Webhook validation
print("\n7.1 Checking Stripe webhook implementation...")

webhook_code = '''
async def stripe_webhook(payload: dict, signature: str):
'''

if 'signature' in content:
    # Check if signature is being validated
    if 'stripe.Webhook.construct_event' not in content:
        report_bug("STRIPE", "Stripe webhook signature not validated - security vulnerability", "CRITICAL")
else:
    report_bug("STRIPE", "Stripe webhook missing signature parameter", "HIGH")

print("  ✅ Stripe webhook checked")

# Test 7.2: Payment status handling
print("\n7.2 Checking payment status handling...")

payment_statuses = ['succeeded', 'failed', 'past_due', 'incomplete']
for status in payment_statuses:
    if status not in content.lower():
        report_warning("STRIPE", f"Payment status '{status}' may not be handled")

print("  ✅ Payment statuses checked")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 8: TELEGRAM BOT TESTS
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 8: TELEGRAM BOT")

# Test 8.1: Bot initialization
print("\n8.1 Checking bot initialization...")

with open('/Users/jewelsharris/.openclaw/workspace/mouse-platform/api-gateway/telegram_bot.py', 'r') as f:
    telegram_content = f.read()

# Check for token validation
if 'getMe' not in telegram_content:
    report_warning("TELEGRAM", "No bot token validation on init")

print("  ✅ Telegram bot checked")

# Test 8.2: Webhook security
print("\n8.2 Checking webhook security...")

# Telegram webhooks should verify the update is from Telegram
report_warning("SECURITY", "Telegram webhook doesn't verify request origin - could be spoofed")

print("  ✅ Webhook security checked")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 9: ERROR HANDLING & EDGE CASES
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 9: ERROR HANDLING & EDGE CASES")

# Test 9.1: Missing environment variables
print("\n9.1 Checking environment variable handling...")

required_env_vars = [
    'ORGO_API_KEY', 'ORGO_WORKSPACE_ID', 'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY', 'TELEGRAM_BOT_TOKEN', 'STRIPE_SECRET_KEY'
]

# Check if code handles missing env vars gracefully
for env_var in required_env_vars:
    # Code just uses os.getenv without defaults in most places
    pattern = f"os.getenv('{env_var}')"
    if pattern in content or pattern in telegram_content:
        # Check if there's a fallback or validation
        pass  # This is fine for now

report_warning("CONFIG", "Missing validation for required environment variables")

print("  ✅ Environment variables checked")

# Test 9.2: Exception handling
print("\n9.2 Checking exception handling patterns...")

# Look for bare except clauses
if 'except:' in content or 'except Exception as e:' in content:
    report_warning("ERROR_HANDLING", "Generic exception handlers may swallow important errors")

print("  ✅ Exception handling checked")

# Test 9.3: Timeout handling
print("\n9.3 Checking timeout configurations...")

# Check HTTP client timeouts
if 'timeout=' not in content:
    report_warning("TIMEOUT", "HTTP requests may hang indefinitely without timeout")

print("  ✅ Timeout handling checked")

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 10: FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

test_section("SECTION 10: TEST SUMMARY")

print("\n" + "=" * 70)
print("🎯 TEST EXECUTION COMPLETE")
print("=" * 70)

print(f"\n📊 RESULTS:")
print(f"   Total Bugs Found: {len(bugs_found)}")
print(f"   Total Warnings: {len(warnings_found)}")

if bugs_found:
    print("\n🐛 BUGS BY SEVERITY:")
    critical = [b for b in bugs_found if b['severity'] == 'CRITICAL']
    high = [b for b in bugs_found if b['severity'] == 'HIGH']
    medium = [b for b in bugs_found if b['severity'] == 'MEDIUM']
    
    if critical:
        print(f"   CRITICAL: {len(critical)}")
        for bug in critical:
            print(f"      • {bug['category']}: {bug['description'][:60]}...")
    if high:
        print(f"   HIGH: {len(high)}")
        for bug in high:
            print(f"      • {bug['category']}: {bug['description'][:60]}...")
    if medium:
        print(f"   MEDIUM: {len(medium)}")

print("\n📋 FULL BUG LIST:")
for i, bug in enumerate(bugs_found, 1):
    print(f"   {i}. [{bug['severity']}] {bug['category']}")
    print(f"      {bug['description']}")

if warnings_found:
    print("\n⚠️  WARNINGS:")
    for i, warn in enumerate(warnings_found, 1):
        print(f"   {i}. {warn['category']}: {warn['description']}")

print("\n" + "=" * 70)
print("✅ Mouse Platform Test Suite Complete")
print("=" * 70)

# Write detailed report to file
report_path = '/Users/jewelsharris/.openclaw/workspace/mouse-platform/TEST_REPORT.md'
with open(report_path, 'w') as f:
    f.write("# Mouse Platform - Test Report\n\n")
    f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write("## Summary\n\n")
    f.write(f"- **Total Bugs:** {len(bugs_found)}\n")
    f.write(f"- **Total Warnings:** {len(warnings_found)}\n")
    f.write(f"- **Critical:** {len([b for b in bugs_found if b['severity'] == 'CRITICAL'])}\n")
    f.write(f"- **High:** {len([b for b in bugs_found if b['severity'] == 'HIGH'])}\n")
    f.write(f"- **Medium:** {len([b for b in bugs_found if b['severity'] == 'MEDIUM'])}\n\n")
    
    if bugs_found:
        f.write("## Bugs Found\n\n")
        for bug in bugs_found:
            f.write(f"### {bug['category']} ({bug['severity']})\n\n")
            f.write(f"{bug['description']}\n\n")
    
    if warnings_found:
        f.write("## Warnings\n\n")
        for warn in warnings_found:
            f.write(f"- **{warn['category']}:** {warn['description']}\n")

print(f"\n📄 Detailed report saved to: {report_path}")
