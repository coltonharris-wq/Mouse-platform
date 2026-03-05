#!/usr/bin/env python3
"""Inspect schema of existing tables"""
import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dgfnpllysgmszmfifnnk.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY", "sb_publishable_Opewawr5gxGTVGRUw_1YxA_PqScB2Pe")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Insert a test lead to see the schema
test_lead = {
    "name": "Test Lead",
    "email": "test@example.com",
    "source": "schema_check",
    "status": "test"
}

try:
    print("📝 Inserting test lead to discover schema...")
    result = supabase.table("leads").insert(test_lead).execute()
    if result.data:
        print("\n✅ Lead inserted successfully!")
        print(f"   Columns available: {list(result.data[0].keys())}")
        print(f"\n   Full record:")
        for key, value in result.data[0].items():
            print(f"   {key}: {value}")
        
        # Clean up test lead
        lead_id = result.data[0].get("id")
        if lead_id:
            supabase.table("leads").delete().eq("id", lead_id).execute()
            print(f"\n🧹 Test lead cleaned up")
except Exception as e:
    print(f"❌ Error: {e}")
