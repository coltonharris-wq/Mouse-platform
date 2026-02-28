#!/usr/bin/env python3
"""
Mouse Platform Demo Script
Run the full Clean Eats demo
"""
import asyncio
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from orchestrator import MousePlatform

async def run_demo():
    print("""
╔════════════════════════════════════════════════════════════════╗
║                   🎯 MOUSE PLATFORM DEMO                        ║
║                   Clean Eats - AI Workforce                     ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    platform = MousePlatform()
    
    print("🚀 Starting demo...\n")
    
    # Run the demo
    result = await platform.run_demo()
    
    if result["success"]:
        print("✅ DEMO SETUP COMPLETE!\n")
        print("═" * 60)
        print("📊 CUSTOMER")
        print("═" * 60)
        print(f"   Company: {result['customer']['company_name']}")
        print(f"   Email:   {result['customer']['email']}")
        print(f"   Plan:    {result['customer']['plan_tier'].title()}")
        print(f"   ID:      {result['customer']['id']}")
        
        print("\n🤖 KING MOUSE (Customer Interface)")
        print("─" * 60)
        print(f"   Bot:     @{result['king_mouse']['bot_username']}")
        print(f"   Link:    {result['king_mouse']['bot_link']}")
        print(f"   Status:  {result['king_mouse']['status']}")
        
        print("\n👥 AI EMPLOYEES DEPLOYED")
        print("─" * 60)
        for emp in result["employees"]:
            print(f"\n   🎭 {emp['name']}")
            print(f"      Role: {emp['role']}")
            print(f"      ID:   {emp['id']}")
            print(f"      VM:   {emp['vm_url']}")
        
        print("\n🌐 DASHBOARD")
        print("─" * 60)
        print(f"   http://localhost:3000{result['dashboard_url']}")
        
        print("\n📱 TELEGRAM QR CODE")
        print("─" * 60)
        print(f"   Save this QR code to scan:")
        print(f"   {result['qr_code_url'][:80]}...")
        
        print("\n" + "═" * 60)
        print("💬 TRY THESE MESSAGES IN TELEGRAM:")
        print("═" * 60)
        print('   "I need a website for my meal prep business"')
        print('   "Create Instagram posts for our launch"')
        print('   "Help me get more customers"')
        
        print("\n" + "═" * 60)
        print("🎥 LIVE VM MONITORING")
        print("═" * 60)
        print("   Screenshots update every 3 seconds")
        print("   Watch your AI employees work in real-time!")
        
        print("\n" + "═" * 60)
        print("🧹 CLEANUP")
        print("═" * 60)
        print("   python3 demo/cleanup-demo.py")
        
    else:
        print("❌ Demo failed!")
        print(result.get("error", "Unknown error"))
        return 1
    
    print("\n✨ Demo complete!")
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(run_demo())
    sys.exit(exit_code)
