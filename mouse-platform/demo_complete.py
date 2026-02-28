#!/usr/bin/env python3
"""
Mouse Platform - Complete Demo Script
Shows end-to-end functionality of the OpenClaw-as-a-Service platform
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_KEY = "dev_test_key"

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

async def make_request(session, method, endpoint, data=None):
    """Make API request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        if method == "GET":
            async with session.get(url, headers=headers) as resp:
                return await resp.json()
        elif method == "POST":
            async with session.post(url, headers=headers, json=data) as resp:
                return await resp.json()
    except Exception as e:
        return {"error": str(e)}

async def run_demo():
    """Run complete platform demo"""
    print(f"{Colors.HEADER}{'='*60}")
    print("MOUSE PLATFORM - COMPLETE DEMO")
    print(f"{'='*60}{Colors.ENDC}\n")
    
    async with aiohttp.ClientSession() as session:
        # 1. Health Check
        print(f"{Colors.OKBLUE}1. Checking API Health...{Colors.ENDC}")
        result = await make_request(session, "GET", "/health")
        if result.get("status") == "healthy":
            print(f"{Colors.OKGREEN}✅ API is healthy (v{result.get('version')}){Colors.ENDC}")
        else:
            print(f"{Colors.FAIL}❌ API health check failed{Colors.ENDC}")
            return
        
        # 2. Create Customer
        print(f"\n{Colors.OKBLUE}2. Creating Customer 'Clean Eats'...{Colors.ENDC}")
        customer_data = {
            "company_name": "Clean Eats",
            "email": "owner@cleaneats.com",
            "plan": "growth"
        }
        result = await make_request(session, "POST", "/api/v1/customers", customer_data)
        
        if result.get("success"):
            customer = result.get("customer", {})
            customer_id = customer.get("id")
            print(f"{Colors.OKGREEN}✅ Customer created: {customer_id}{Colors.ENDC}")
            print(f"   📧 Email: {customer.get('email')}")
            print(f"   🏢 Company: {customer.get('company_name')}")
            
            # Show King Mouse bot info
            bot = customer.get("king_mouse_bot", {})
            if bot:
                print(f"   🤖 King Mouse Bot: @{bot.get('username')}")
                print(f"   📱 QR Code: {bot.get('qr_code', 'N/A')[:50]}...")
        else:
            print(f"{Colors.FAIL}❌ Failed to create customer: {result.get('detail', 'Unknown error')}{Colors.ENDC}")
            return
        
        # 3. Check King Mouse Status
        print(f"\n{Colors.OKBLUE}3. Checking King Mouse Bot Status...{Colors.ENDC}")
        result = await make_request(session, "GET", f"/api/v1/customers/{customer_id}/king-mouse")
        if result.get("success"):
            bot = result.get("bot", {})
            print(f"{Colors.OKGREEN}✅ Bot Status: {bot.get('status')}{Colors.ENDC}")
        
        # 4. Send Message to King Mouse
        print(f"\n{Colors.OKBLUE}4. Sending Message to King Mouse...{Colors.ENDC}")
        message_data = {
            "message": "I need a website built for my restaurant"
        }
        result = await make_request(session, "POST", f"/api/v1/customers/{customer_id}/message", message_data)
        if result.get("success"):
            print(f"{Colors.OKGREEN}✅ Message sent successfully{Colors.ENDC}")
            print(f"   💬 Response: {result.get('response', {}).get('text', 'N/A')[:100]}...")
        
        # 5. Deploy AI Employee
        print(f"\n{Colors.OKBLUE}5. Deploying AI Employee (Web Developer)...{Colors.ENDC}")
        employee_data = {
            "role": "web_developer",
            "name": "Alex",
            "task_description": "Build a modern restaurant website with online ordering"
        }
        result = await make_request(session, "POST", f"/api/v1/customers/{customer_id}/employees", employee_data)
        
        if result.get("success"):
            employee = result.get("employee", {})
            employee_id = employee.get("id")
            vm_id = employee.get("vm_id")
            print(f"{Colors.OKGREEN}✅ Employee deployed: {employee_id}{Colors.ENDC}")
            print(f"   👤 Name: {employee.get('name')}")
            print(f"   💼 Role: {employee.get('role')}")
            print(f"   🖥️  VM ID: {vm_id}")
        else:
            print(f"{Colors.WARNING}⚠️  Employee deployment: {result.get('detail', 'Skipped')}{Colors.ENDC}")
            employee_id = None
            vm_id = None
        
        # 6. List Employees
        print(f"\n{Colors.OKBLUE}6. Listing All Employees...{Colors.ENDC}")
        result = await make_request(session, "GET", f"/api/v1/customers/{customer_id}/employees")
        if result.get("success"):
            employees = result.get("employees", [])
            print(f"{Colors.OKGREEN}✅ Found {len(employees)} employee(s){Colors.ENDC}")
            for emp in employees:
                print(f"   - {emp.get('name')} ({emp.get('role')}) - {emp.get('status')}")
        
        # 7. Create VM
        print(f"\n{Colors.OKBLUE}7. Creating Additional VM...{Colors.ENDC}")
        vm_data = {
            "name": "Social Media Agent",
            "ram": 4,
            "cpu": 2,
            "role": "social_media"
        }
        result = await make_request(session, "POST", f"/api/v1/customers/{customer_id}/vms", vm_data)
        if result.get("success"):
            vm = result.get("vm", {})
            print(f"{Colors.OKGREEN}✅ VM created: {vm.get('id')}{Colors.ENDC}")
        else:
            print(f"{Colors.WARNING}⚠️  VM creation: {result.get('detail', 'Skipped')}{Colors.ENDC}")
        
        # 8. List VMs
        print(f"\n{Colors.OKBLUE}8. Listing All VMs...{Colors.ENDC}")
        result = await make_request(session, "GET", f"/api/v1/customers/{customer_id}/vms")
        if result.get("success"):
            vms = result.get("vms", [])
            print(f"{Colors.OKGREEN}✅ Found {len(vms)} VM(s){Colors.ENDC}")
            for vm in vms:
                print(f"   - {vm.get('name')} ({vm.get('status')})")
        
        # 9. Check Token Balance
        print(f"\n{Colors.OKBLUE}9. Checking Token Balance...{Colors.ENDC}")
        result = await make_request(session, "GET", f"/api/v1/customers/{customer_id}/tokens/balance")
        if result.get("success"):
            balance = result.get("balance", {})
            print(f"{Colors.OKGREEN}✅ Token Balance: {balance.get('amount', 0)} tokens{Colors.ENDC}")
        
        # 10. Use Tokens
        print(f"\n{Colors.OKBLUE}10. Using Tokens for VM Deployment...{Colors.ENDC}")
        token_data = {
            "amount": 50,
            "description": "VM deployment for web developer",
            "reference_type": "vm_deployment"
        }
        result = await make_request(session, "POST", f"/api/v1/customers/{customer_id}/tokens/use", token_data)
        if result.get("success"):
            print(f"{Colors.OKGREEN}✅ Used 50 tokens{Colors.ENDC}")
        else:
            print(f"{Colors.WARNING}⚠️  Token usage: {result.get('detail', 'Skipped')}{Colors.ENDC}")
        
        # 11. List Token Transactions
        print(f"\n{Colors.OKBLUE}11. Listing Token Transactions...{Colors.ENDC}")
        result = await make_request(session, "GET", f"/api/v1/customers/{customer_id}/tokens/transactions")
        if result.get("success"):
            transactions = result.get("transactions", [])
            print(f"{Colors.OKGREEN}✅ Found {len(transactions)} transaction(s){Colors.ENDC}")
            for tx in transactions[:3]:  # Show first 3
                print(f"   - {tx.get('type')}: {tx.get('amount')} tokens")
        
        # 12. Get Platform Stats (Admin)
        print(f"\n{Colors.OKBLUE}12. Getting Platform Stats (Admin)...{Colors.ENDC}")
        result = await make_request(session, "GET", "/api/v1/admin/stats")
        if result.get("success"):
            stats = result.get("stats", {})
            print(f"{Colors.OKGREEN}✅ Platform Stats:{Colors.ENDC}")
            print(f"   👥 Total Customers: {stats.get('total_customers', 0)}")
            print(f"   👤 Total Employees: {stats.get('total_employees', 0)}")
            print(f"   🖥️  Total VMs: {stats.get('total_vms', 0)}")
        else:
            print(f"{Colors.WARNING}⚠️  Stats: {result.get('detail', 'Skipped')}{Colors.ENDC}")
    
    # Summary
    print(f"\n{Colors.HEADER}{'='*60}")
    print("DEMO COMPLETE")
    print(f"{'='*60}{Colors.ENDC}")
    print(f"""
{Colors.OKGREEN}✅ Successfully demonstrated:{Colors.ENDC}
   • Customer onboarding with King Mouse AI
   • AI employee deployment
   • VM creation and management
   • Token-based billing system
   • Real-time messaging
   • Admin platform stats

{Colors.OKCYAN}Next steps:{Colors.ENDC}
   1. View API docs at: {BASE_URL}/docs
   2. Connect to frontend dashboard
   3. Configure Stripe webhooks
   4. Set up Telegram bot webhooks
   5. Deploy to production
""")

if __name__ == "__main__":
    asyncio.run(run_demo())
