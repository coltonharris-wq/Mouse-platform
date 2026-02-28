#!/usr/bin/env python3
"""
STRESS TEST USER 1 - Mouse Platform Concurrent Load Test
Simulates 10 concurrent customers signing up and using the platform
"""

import asyncio
import aiohttp
import json
import time
import random
import string
from datetime import datetime
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor
import sys

# Configuration
# BASE_URL = "https://api.mouseplatform.com"
# Use localhost for testing if deployed locally
BASE_URL = "http://localhost:8000"

@dataclass
class TestResult:
    test_name: str
    customer_id: str
    success: bool
    duration_ms: float
    error_message: str = ""
    details: Dict = None
    
    def __post_init__(self):
        if self.details is None:
            self.details = {}

@dataclass
class CustomerProfile:
    id: str = ""
    email: str = ""
    company_name: str = ""
    plan: str = "growth"
    token: str = ""
    vm_ids: List[str] = None
    employee_ids: List[str] = None
    
    def __post_init__(self):
        if self.vm_ids is None:
            self.vm_ids = []
        if self.employee_ids is None:
            self.employee_ids = []

class StressTestRunner:
    def __init__(self):
        self.results: List[TestResult] = []
        self.customers: List[CustomerProfile] = []
        self.session: aiohttp.ClientSession = None
        self.start_time = None
        self.bugs_found: List[Dict] = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30))
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def generate_unique_email(self, index: int) -> str:
        """Generate unique test email"""
        timestamp = int(time.time())
        random_str = ''.join(random.choices(string.ascii_lowercase, k=6))
        return f"stresstest{index}_{timestamp}_{random_str}@test.com"
    
    def generate_company_name(self, index: int) -> str:
        """Generate unique company name"""
        prefixes = ["Clean", "Swift", "Bright", "Auto", "Smart", "Quick", "Pro", "Elite", "Metro", "Global"]
        suffixes = ["Eats", "Tech", "Solutions", "Corp", "Systems", "Services", "Labs", "Hub", "Works", "Co"]
        return f"{prefixes[index]} {suffixes[index]}"

    async def make_request(self, method: str, endpoint: str, **kwargs) -> tuple:
        """Make HTTP request and return (success, response_data, error)"""
        url = f"{BASE_URL}{endpoint}"
        try:
            async with self.session.request(method, url, **kwargs) as response:
                try:
                    data = await response.json()
                except:
                    data = await response.text()
                
                success = 200 <= response.status < 300
                return success, data, None, response.status
        except asyncio.TimeoutError:
            return False, None, "Request timeout", 0
        except Exception as e:
            return False, None, str(e), 0

    # ============ TEST SCENARIOS ============
    
    async def test_customer_signup(self, index: int) -> TestResult:
        """Test 1: Customer signup"""
        test_name = f"CUSTOMER_SIGNUP_{index}"
        start = time.time()
        
        customer = CustomerProfile(
            email=self.generate_unique_email(index),
            company_name=self.generate_company_name(index),
            plan=random.choice(["starter", "growth", "enterprise"])
        )
        
        payload = {
            "company_name": customer.company_name,
            "email": customer.email,
            "plan": customer.plan
        }
        
        success, data, error, status = await self.make_request(
            "POST", "/api/v1/customers",
            json=payload
        )
        
        duration = (time.time() - start) * 1000
        
        if success and data and isinstance(data, dict) and data.get("success"):
            customer.id = data.get("customer", {}).get("id", "")
            self.customers.append(customer)
            
            # Check for bugs
            if not data.get("king_mouse"):
                self.bugs_found.append({
                    "severity": "HIGH",
                    "bug_id": f"BUG-{test_name}-001",
                    "description": "Signup successful but no King Mouse bot created",
                    "customer": customer.email
                })
            
            return TestResult(test_name, customer.id, True, duration, details=data)
        else:
            error_msg = error or (data.get("detail", "Unknown error") if isinstance(data, dict) else str(data))
            
            # Check for specific bugs
            if status == 409:
                self.bugs_found.append({
                    "severity": "MEDIUM",
                    "bug_id": f"BUG-{test_name}-002",
                    "description": f"Duplicate email error for unique email: {customer.email}",
                    "customer": customer.email
                })
            elif status == 0:
                self.bugs_found.append({
                    "severity": "CRITICAL",
                    "bug_id": f"BUG-{test_name}-003",
                    "description": "API server not responding - connection refused/timeout",
                    "customer": customer.email
                })
            
            return TestResult(test_name, "", False, duration, error_msg, {"status": status})

    async def test_get_customer(self, customer: CustomerProfile) -> TestResult:
        """Test 2: Get customer details"""
        test_name = f"GET_CUSTOMER_{customer.id[:8]}"
        start = time.time()
        
        success, data, error, status = await self.make_request(
            "GET", f"/api/v1/customers/{customer.id}"
        )
        
        duration = (time.time() - start) * 1000
        
        if success:
            if data.get("email") != customer.email:
                self.bugs_found.append({
                    "severity": "CRITICAL",
                    "bug_id": f"BUG-{test_name}-001",
                    "description": f"Customer data mismatch: expected {customer.email}, got {data.get('email')}",
                    "customer": customer.id
                })
            return TestResult(test_name, customer.id, True, duration, details=data)
        else:
            return TestResult(test_name, customer.id, False, duration, error or str(data))

    async def test_get_king_mouse_status(self, customer: CustomerProfile) -> TestResult:
        """Test 3: Get King Mouse bot status"""
        test_name = f"KING_MOUSE_STATUS_{customer.id[:8]}"
        start = time.time()
        
        success, data, error, status = await self.make_request(
            "GET", f"/api/v1/customers/{customer.id}/king-mouse"
        )
        
        duration = (time.time() - start) * 1000
        
        if success:
            # Check for bugs
            if not data.get("bot_link"):
                self.bugs_found.append({
                    "severity": "HIGH",
                    "bug_id": f"BUG-{test_name}-001",
                    "description": "King Mouse status missing bot_link",
                    "customer": customer.id
                })
            return TestResult(test_name, customer.id, True, duration, details=data)
        else:
            error_msg = error or str(data)
            if status == 404:
                self.bugs_found.append({
                    "severity": "HIGH",
                    "bug_id": f"BUG-{test_name}-002",
                    "description": "King Mouse bot not found for existing customer",
                    "customer": customer.id
                })
            return TestResult(test_name, customer.id, False, duration, error_msg, {"status": status})

    async def test_send_message(self, customer: CustomerProfile, message: str) -> TestResult:
        """Test 4: Send message to King Mouse"""
        test_name = f"SEND_MESSAGE_{customer.id[:8]}"
        start = time.time()
        
        payload = {"message": message}
        
        success, data, error, status = await self.make_request(
            "POST", f"/api/v1/customers/{customer.id}/message",
            json=payload
        )
        
        duration = (time.time() - start) * 1000
        
        if success:
            # Check if AI recognized intent and triggered action
            if "website" in message.lower() or "web" in message.lower():
                if not data.get("employee_deployed"):
                    self.bugs_found.append({
                        "severity": "MEDIUM",
                        "bug_id": f"BUG-{test_name}-001",
                        "description": f"Website request not triggering employee deployment. Message: {message}",
                        "customer": customer.id,
                        "response": data.get("response", "")
                    })
            return TestResult(test_name, customer.id, True, duration, details=data)
        else:
            return TestResult(test_name, customer.id, False, duration, error or str(data), {"status": status})

    async def test_list_vms(self, customer: CustomerProfile) -> TestResult:
        """Test 5: List customer VMs"""
        test_name = f"LIST_VMS_{customer.id[:8]}"
        start = time.time()
        
        success, data, error, status = await self.make_request(
            "GET", f"/api/v1/customers/{customer.id}/vms"
        )
        
        duration = (time.time() - start) * 1000
        
        if success:
            vms = data.get("vms", [])
            for vm in vms:
                if vm.get("id") not in customer.vm_ids:
                    customer.vm_ids.append(vm.get("id"))
                if vm.get("employee_id") not in customer.employee_ids:
                    customer.employee_ids.append(vm.get("employee_id"))
            return TestResult(test_name, customer.id, True, duration, details={"vm_count": len(vms)})
        else:
            return TestResult(test_name, customer.id, False, duration, error or str(data))

    async def test_deploy_employee(self, customer: CustomerProfile) -> TestResult:
        """Test 6: Deploy AI employee"""
        test_name = f"DEPLOY_EMPLOYEE_{customer.id[:8]}"
        start = time.time()
        
        roles = ["Web Developer", "Social Media Manager", "Sales Rep", "Bookkeeper"]
        names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery"]
        
        payload = {
            "role": random.choice(roles),
            "name": random.choice(names),
            "task_description": "Build a landing page with contact form for lead generation"
        }
        
        success, data, error, status = await self.make_request(
            "POST", f"/api/v1/customers/{customer.id}/vms",
            json=payload
        )
        
        duration = (time.time() - start) * 1000
        
        if success:
            vm_id = data.get("vm", {}).get("id", "")
            emp_id = data.get("employee", {}).get("id", "")
            if vm_id:
                customer.vm_ids.append(vm_id)
            if emp_id:
                customer.employee_ids.append(emp_id)
            
            # Check for bugs
            if data.get("employee", {}).get("status") == "deploying":
                self.bugs_found.append({
                    "severity": "MEDIUM",
                    "bug_id": f"BUG-{test_name}-001",
                    "description": "Employee status still 'deploying' in response, should be 'active'",
                    "customer": customer.id
                })
            
            return TestResult(test_name, customer.id, True, duration, details=data)
        else:
            error_msg = error or str(data)
            if status == 403:
                self.bugs_found.append({
                    "severity": "LOW",
                    "bug_id": f"BUG-{test_name}-002",
                    "description": f"VM limit reached for plan: {customer.plan}",
                    "customer": customer.id
                })
            return TestResult(test_name, customer.id, False, duration, error_msg, {"status": status})

    async def test_get_screenshot(self, customer: CustomerProfile) -> TestResult:
        """Test 7: Get VM screenshot - CRITICAL SECURITY TEST"""
        test_name = f"GET_SCREENSHOT_{customer.id[:8]}"
        start = time.time()
        
        if not customer.vm_ids:
            return TestResult(test_name, customer.id, False, 0, "No VMs available", {"skipped": True})
        
        vm_id = customer.vm_ids[0]
        
        success, data, error, status = await self.make_request(
            "GET", f"/api/v1/customers/{customer.id}/vms/{vm_id}/screenshot"
        )
        
        duration = (time.time() - start) * 1000
        
        if success:
            # Check for security vulnerability - can we access other customer's VMs?
            if not data.get("screenshot_base64"):
                self.bugs_found.append({
                    "severity": "MEDIUM",
                    "bug_id": f"BUG-{test_name}-001",
                    "description": "Screenshot endpoint returned success but no image data",
                    "customer": customer.id
                })
            return TestResult(test_name, customer.id, True, duration, details={"has_image": bool(data.get("screenshot_base64"))})
        else:
            return TestResult(test_name, customer.id, False, duration, error or str(data))

    async def test_unauthorized_screenshot_access(self, customer: CustomerProfile, target_vm_id: str) -> TestResult:
        """Test 8: SECURITY - Try to access another customer's VM screenshot"""
        test_name = f"UNAUTHORIZED_ACCESS_{customer.id[:8]}"
        start = time.time()
        
        # Try to access a VM that doesn't belong to this customer
        success, data, error, status = await self.make_request(
            "GET", f"/api/v1/customers/{customer.id}/vms/{target_vm_id}/screenshot"
        )
        
        duration = (time.time() - start) * 1000
        
        if success:
            # This is a CRITICAL security bug!
            self.bugs_found.append({
                "severity": "CRITICAL",
                "bug_id": f"BUG-{test_name}-001",
                "description": f"SECURITY LEAK: Customer {customer.id} successfully accessed VM {target_vm_id} that doesn't belong to them!",
                "customer": customer.id,
                "target_vm": target_vm_id
            })
            return TestResult(test_name, customer.id, False, duration, "SECURITY BUG: Unauthorized access succeeded", {"security_vulnerability": True})
        else:
            if status == 403:
                return TestResult(test_name, customer.id, True, duration, "Correctly blocked unauthorized access", {"security_test_passed": True})
            else:
                return TestResult(test_name, customer.id, True, duration, f"Access blocked with status {status}", {"status": status})

    async def test_duplicate_email(self, email: str) -> TestResult:
        """Test 9: Try to create customer with duplicate email"""
        test_name = "DUPLICATE_EMAIL_TEST"
        start = time.time()
        
        payload = {
            "company_name": "Duplicate Test Co",
            "email": email,
            "plan": "starter"
        }
        
        success, data, error, status = await self.make_request(
            "POST", "/api/v1/customers",
            json=payload
        )
        
        duration = (time.time() - start) * 1000
        
        if not success and status == 409:
            return TestResult(test_name, "", True, duration, "Correctly rejected duplicate email", {"status": status})
        elif success:
            self.bugs_found.append({
                "severity": "HIGH",
                "bug_id": "BUG-DUPLICATE-001",
                "description": f"Duplicate email allowed! Created customer with same email: {email}",
                "email": email
            })
            return TestResult(test_name, "", False, duration, "BUG: Duplicate email accepted", {"data": data})
        else:
            return TestResult(test_name, "", False, duration, f"Unexpected response: {error or data}", {"status": status})

    async def test_invalid_input(self) -> TestResult:
        """Test 10: Send invalid input to test validation"""
        test_name = "INVALID_INPUT_TEST"
        start = time.time()
        
        # Test with missing required fields
        payload = {"company_name": "A"}  # Missing email, invalid company name
        
        success, data, error, status = await self.make_request(
            "POST", "/api/v1/customers",
            json=payload
        )
        
        duration = (time.time() - start) * 1000
        
        if not success and (status == 400 or status == 422):
            return TestResult(test_name, "", True, duration, "Correctly rejected invalid input", {"status": status})
        elif success:
            self.bugs_found.append({
                "severity": "HIGH",
                "bug_id": "BUG-VALIDATION-001",
                "description": "Invalid input accepted - missing email field",
                "payload": payload
            })
            return TestResult(test_name, "", False, duration, "BUG: Invalid input accepted")
        else:
            return TestResult(test_name, "", True, duration, f"Rejected with status {status}", {"status": status})

    async def test_health_check(self) -> TestResult:
        """Test 11: Health check endpoint"""
        test_name = "HEALTH_CHECK"
        start = time.time()
        
        success, data, error, status = await self.make_request("GET", "/health")
        
        duration = (time.time() - start) * 1000
        
        if success and data.get("status") == "healthy":
            return TestResult(test_name, "", True, duration, details=data)
        else:
            self.bugs_found.append({
                "severity": "CRITICAL",
                "bug_id": "BUG-HEALTH-001",
                "description": "Health check failed or returned unhealthy status",
                "response": data
            })
            return TestResult(test_name, "", False, duration, error or "Health check failed", {"response": data})

    async def test_rate_limiting(self) -> TestResult:
        """Test 12: Check if rate limiting is implemented"""
        test_name = "RATE_LIMITING_TEST"
        start = time.time()
        
        # Send 20 rapid requests to test rate limiting
        tasks = []
        for i in range(20):
            payload = {
                "company_name": f"Rate Test {i}",
                "email": f"rate{i}_{int(time.time())}@test.com",
                "plan": "starter"
            }
            tasks.append(self.make_request("POST", "/api/v1/customers", json=payload))
        
        responses = await asyncio.gather(*tasks)
        
        duration = (time.time() - start) * 1000
        
        # Check if any requests were rate limited (429 status)
        rate_limited = sum(1 for r in responses if r[3] == 429)
        
        if rate_limited > 0:
            return TestResult(test_name, "", True, duration, f"Rate limiting working: {rate_limited}/20 requests limited", {"rate_limited": rate_limited})
        else:
            self.bugs_found.append({
                "severity": "HIGH",
                "bug_id": "BUG-RATE-LIMIT-001",
                "description": "No rate limiting detected - sent 20 rapid requests, all accepted",
                "total_requests": 20
            })
            return TestResult(test_name, "", False, duration, "BUG: No rate limiting detected")

    async def test_get_token_packages(self) -> TestResult:
        """Test 13: Get token pricing packages"""
        test_name = "GET_TOKEN_PACKAGES"
        start = time.time()
        
        success, data, error, status = await self.make_request("GET", "/api/v1/token-packages")
        
        duration = (time.time() - start) * 1000
        
        if success:
            packages = data if isinstance(data, list) else data.get("packages", [])
            return TestResult(test_name, "", True, duration, details={"package_count": len(packages)})
        else:
            return TestResult(test_name, "", False, duration, error or str(data))

    # ============ CONCURRENT TEST SCENARIOS ============
    
    async def run_customer_lifecycle(self, index: int) -> List[TestResult]:
        """Run full customer lifecycle for one customer"""
        results = []
        
        # 1. Signup
        result = await self.test_customer_signup(index)
        results.append(result)
        
        if not result.success:
            return results  # Can't continue without successful signup
        
        customer = self.customers[-1]
        
        # 2. Get customer details
        await asyncio.sleep(random.uniform(0.1, 0.5))  # Random delay
        results.append(await self.test_get_customer(customer))
        
        # 3. Get King Mouse status
        await asyncio.sleep(random.uniform(0.1, 0.5))
        results.append(await self.test_get_king_mouse_status(customer))
        
        # 4. Send messages
        messages = [
            "Hi there!",
            "I need a website built for my business",
            "Can you help with social media marketing?",
            "I need help with bookkeeping"
        ]
        for msg in messages:
            await asyncio.sleep(random.uniform(0.1, 0.3))
            results.append(await self.test_send_message(customer, msg))
        
        # 5. Deploy employees (test plan limits)
        for _ in range(random.randint(1, 4)):
            await asyncio.sleep(random.uniform(0.5, 1.0))
            results.append(await self.test_deploy_employee(customer))
        
        # 6. List VMs
        await asyncio.sleep(random.uniform(0.1, 0.5))
        results.append(await self.test_list_vms(customer))
        
        # 7. Get screenshot (if VMs exist)
        if customer.vm_ids:
            await asyncio.sleep(random.uniform(0.1, 0.3))
            results.append(await self.test_get_screenshot(customer))
        
        return results

    async def run_security_tests(self) -> List[TestResult]:
        """Run security penetration tests"""
        results = []
        
        if len(self.customers) >= 2:
            # Try to access another customer's VM
            customer1 = self.customers[0]
            customer2 = self.customers[1]
            
            if customer2.vm_ids:
                results.append(await self.test_unauthorized_screenshot_access(customer1, customer2.vm_ids[0]))
            
            if customer1.vm_ids:
                results.append(await self.test_unauthorized_screenshot_access(customer2, customer1.vm_ids[0]))
        
        # Test duplicate email
        if self.customers:
            results.append(await self.test_duplicate_email(self.customers[0].email))
        
        # Test invalid input
        results.append(await self.test_invalid_input())
        
        return results

    async def run_all_tests(self):
        """Execute complete stress test suite"""
        print("=" * 80)
        print("🐭 MOUSE PLATFORM - STRESS TEST USER 1")
        print("=" * 80)
        print(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Target: {BASE_URL}")
        print(f"Concurrent Customers: 10")
        print("=" * 80)
        print()
        
        self.start_time = time.time()
        
        # Phase 1: Health Check
        print("🔍 Phase 1: Health Check...")
        health_result = await self.test_health_check()
        self.results.append(health_result)
        print(f"   {'✅' if health_result.success else '❌'} Health Check: {health_result.duration_ms:.0f}ms")
        
        if not health_result.success:
            print("\n❌ CRITICAL: Health check failed. Aborting tests.")
            return
        
        # Phase 2: Token Packages
        print("\n🔍 Phase 2: Token Packages...")
        token_result = await self.test_get_token_packages()
        self.results.append(token_result)
        print(f"   {'✅' if token_result.success else '❌'} Token Packages: {token_result.duration_ms:.0f}ms")
        
        # Phase 3: Concurrent Customer Signups (10 customers)
        print("\n🔍 Phase 3: Concurrent Customer Signups (10 customers)...")
        signup_tasks = [self.run_customer_lifecycle(i) for i in range(10)]
        signup_results = await asyncio.gather(*signup_tasks)
        for results in signup_results:
            self.results.extend(results)
        
        successful_signups = sum(1 for r in self.results if r.test_name.startswith("CUSTOMER_SIGNUP") and r.success)
        print(f"   ✅ Successful Signups: {successful_signups}/10")
        
        # Phase 4: Security Tests
        print("\n🔍 Phase 4: Security Tests...")
        security_results = await self.run_security_tests()
        self.results.extend(security_results)
        for r in security_results:
            icon = "✅" if r.success else "❌"
            print(f"   {icon} {r.test_name}: {r.duration_ms:.0f}ms")
        
        # Phase 5: Rate Limiting Test
        print("\n🔍 Phase 5: Rate Limiting Test...")
        rate_result = await self.test_rate_limiting()
        self.results.append(rate_result)
        print(f"   {'✅' if rate_result.success else '❌'} Rate Limiting: {rate_result.duration_ms:.0f}ms")
        
        # Generate Report
        await self.generate_report()

    async def generate_report(self):
        """Generate comprehensive test report"""
        total_time = time.time() - self.start_time
        
        passed = sum(1 for r in self.results if r.success)
        failed = sum(1 for r in self.results if not r.success)
        total = len(self.results)
        
        critical_bugs = sum(1 for b in self.bugs_found if b["severity"] == "CRITICAL")
        high_bugs = sum(1 for b in self.bugs_found if b["severity"] == "HIGH")
        medium_bugs = sum(1 for b in self.bugs_found if b["severity"] == "MEDIUM")
        low_bugs = sum(1 for b in self.bugs_found if b["severity"] == "LOW")
        
        report = {
            "test_run_id": f"stress-test-{int(time.time())}",
            "timestamp": datetime.now().isoformat(),
            "target_url": BASE_URL,
            "duration_seconds": round(total_time, 2),
            "summary": {
                "total_tests": total,
                "passed": passed,
                "failed": failed,
                "success_rate": f"{(passed/total*100):.1f}%" if total > 0 else "0%"
            },
            "bugs": {
                "critical": critical_bugs,
                "high": high_bugs,
                "medium": medium_bugs,
                "low": low_bugs,
                "total": len(self.bugs_found)
            },
            "bugs_found": self.bugs_found,
            "test_results": [
                {
                    "test_name": r.test_name,
                    "customer_id": r.customer_id,
                    "success": r.success,
                    "duration_ms": round(r.duration_ms, 2),
                    "error": r.error_message if not r.success else None
                }
                for r in self.results
            ]
        }
        
        # Save report to file
        report_file = f"/Users/jewelsharris/.openclaw/workspace/mouse-platform/STRESS_TEST_REPORT_{int(time.time())}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 STRESS TEST RESULTS")
        print("=" * 80)
        print(f"Duration: {total_time:.1f} seconds")
        print(f"Tests Run: {total}")
        print(f"Passed: {passed} ({(passed/total*100):.1f}%)" if total > 0 else "Passed: 0")
        print(f"Failed: {failed}")
        print()
        print("🐛 BUGS FOUND:")
        print(f"   🔴 Critical: {critical_bugs}")
        print(f"   🟠 High: {high_bugs}")
        print(f"   🟡 Medium: {medium_bugs}")
        print(f"   🟢 Low: {low_bugs}")
        print(f"   Total: {len(self.bugs_found)}")
        print()
        
        if self.bugs_found:
            print("📋 BUG DETAILS:")
            for bug in sorted(self.bugs_found, key=lambda x: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(x["severity"], 4)):
                icon = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(bug["severity"], "⚪")
                print(f"\n   {icon} {bug['bug_id']} ({bug['severity']})")
                print(f"      {bug['description']}")
                if "customer" in bug:
                    print(f"      Customer: {bug['customer']}")
        
        print()
        print("=" * 80)
        print(f"📄 Full report saved to: {report_file}")
        print("=" * 80)
        
        return report


async def main():
    """Main entry point"""
    async with StressTestRunner() as runner:
        await runner.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
