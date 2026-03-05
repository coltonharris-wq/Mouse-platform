#!/usr/bin/env python3
"""
Lead Funnel Automation - Check and process inbound leads
"""
import os
import sys
import json
from datetime import datetime, timedelta
from supabase import create_client

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dgfnpllysgmszmfifnnk.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY", "sb_publishable_Opewawr5gxGTVGRUw_1YxA_PqScB2Pe")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_table_exists():
    """Check if sales_pipeline table exists"""
    try:
        result = supabase.table("sales_pipeline").select("*").limit(1).execute()
        return True
    except Exception as e:
        print(f"❌ sales_pipeline table not found: {e}")
        return False

def get_new_leads():
    """Get leads created in the last 10 minutes (new inbound)"""
    ten_min_ago = (datetime.utcnow() - timedelta(minutes=10)).isoformat()
    try:
        result = supabase.table("sales_pipeline")\
            .select("*")\
            .gte("created_at", ten_min_ago)\
            .eq("status", "new")\
            .execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching new leads: {e}")
        return []

def get_leads_for_followup():
    """Get leads that need follow-up based on their stage and last contact date"""
    try:
        result = supabase.table("sales_pipeline")\
            .select("*")\
            .in_("status", ["contacted", "engaged", "qualified"])\
            .execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching follow-up leads: {e}")
        return []

def get_warm_leads():
    """Get leads that have replied positively (need immediate alert)"""
    try:
        result = supabase.table("sales_pipeline")\
            .select("*")\
            .eq("temperature", "warm")\
            .eq("alerted", False)\
            .execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching warm leads: {e}")
        return []

def calculate_days_since_first_contact(lead):
    """Calculate days since first contact"""
    if not lead.get("first_contact_date"):
        return 0
    first_contact = datetime.fromisoformat(lead["first_contact_date"].replace("Z", "+00:00"))
    return (datetime.utcnow().replace(tzinfo=first_contact.tzinfo) - first_contact).days

def main():
    print("🔍 Lead Funnel Automation Check")
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check if table exists
    if not check_table_exists():
        print("⚠️  sales_pipeline table does not exist yet")
        print("📋 Creating placeholder structure...")
        # Table needs to be created in Supabase dashboard first
        sys.exit(0)
    
    # 1. Check for new inbound leads
    new_leads = get_new_leads()
    print(f"📨 New inbound leads: {len(new_leads)}")
    
    if new_leads:
        for lead in new_leads:
            print(f"   • {lead.get('name', 'Unknown')} - {lead.get('email', 'no-email')}")
            print(f"     Source: {lead.get('source', 'unknown')}")
    
    # 2. Check for leads needing follow-up
    followup_leads = get_leads_for_followup()
    print(f"\n📅 Leads in follow-up sequence: {len(followup_leads)}")
    
    needs_action = []
    for lead in followup_leads:
        days = calculate_days_since_first_contact(lead)
        status = lead.get('status', 'unknown')
        
        # Follow-up schedule: Day 1, Day 2, Day 5, Day 10
        if days == 1 and status == "contacted":
            needs_action.append({"lead": lead, "action": "day2_value_add", "days": days})
        elif days == 5 and status in ["contacted", "engaged"]:
            needs_action.append({"lead": lead, "action": "day5_case_study", "days": days})
        elif days == 10 and status in ["contacted", "engaged"]:
            needs_action.append({"lead": lead, "action": "day10_last_chance", "days": days})
    
    if needs_action:
        print(f"   ⏰ {len(needs_action)} leads need follow-up today:")
        for item in needs_action:
            lead = item["lead"]
            print(f"   • {lead.get('name')} - {item['action']} (day {item['days']})")
    
    # 3. Check for warm leads (need immediate alert)
    warm_leads = get_warm_leads()
    print(f"\n🔥 Warm leads (need alert): {len(warm_leads)}")
    
    if warm_leads:
        for lead in warm_leads:
            print(f"   • {lead.get('name', 'Unknown')} - {lead.get('email')}")
            print(f"     Status: {lead.get('status')} | Last activity: {lead.get('last_activity_date', 'N/A')}")
    
    # Output summary JSON for parsing
    summary = {
        "timestamp": datetime.now().isoformat(),
        "new_leads_count": len(new_leads),
        "new_leads": new_leads,
        "followup_count": len(needs_action),
        "followup_leads": needs_action,
        "warm_leads_count": len(warm_leads),
        "warm_leads": warm_leads
    }
    
    # Save to touchpoints log
    log_file = f"/Users/jewelsharris/.openclaw/workspace/leads/touchpoints/{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(log_file, "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n✅ Summary saved to: {log_file}")
    print(f"\n📊 SUMMARY: {len(new_leads)} new | {len(needs_action)} follow-up | {len(warm_leads)} warm")

if __name__ == "__main__":
    main()
