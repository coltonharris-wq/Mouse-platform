#!/usr/bin/env python3
"""
Cleanup Demo Script
Remove all demo data
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from orchestrator import MousePlatform

async def cleanup():
    print("🧹 Cleaning up demo data...\n")
    
    platform = MousePlatform()
    await platform.cleanup_demo()
    
    print("✅ Demo data cleaned up!")
    print("   • Customers removed")
    print("   • VMs stopped and deleted")
    print("   • Employees archived")

if __name__ == "__main__":
    asyncio.run(cleanup())
