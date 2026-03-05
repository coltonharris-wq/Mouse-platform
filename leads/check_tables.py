#!/usr/bin/env python3
"""Check what tables exist in Supabase"""
import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dgfnpllysgmszmfifnnk.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY", "sb_publishable_Opewawr5gxGTVGRUw_1YxA_PqScB2Pe")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Try common table names
tables_to_check = [
    "sales_pipeline", "sales_metrics", "leads", "customers", 
    "contacts", "deals", "opportunities", "inquiries",
    "form_submissions", "demo_requests"
]

print("🔍 Checking Supabase tables...\n")

for table in tables_to_check:
    try:
        result = supabase.table(table).select("*").limit(1).execute()
        print(f"✅ {table} - EXISTS ({len(result.data)} records sample)")
        if result.data:
            print(f"   Columns: {list(result.data[0].keys())}")
    except Exception as e:
        if "Could not find" in str(e):
            print(f"❌ {table} - NOT FOUND")
        else:
            print(f"⚠️  {table} - ERROR: {e}")
    print()
