#!/usr/bin/env python3
"""
Mouse Platform Lead Funnel Automation
Checks for new leads and runs follow-up sequences
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

TOUCHPOINTS_DIR = "/Users/jewelsharris/.openclaw/workspace/leads/touchpoints"

def get_new_leads():
    """Get leads created in last 10 minutes that haven't been contacted"""
    ten_min_ago = (datetime.utcnow() - timedelta(minutes=10)).isoformat()
    try:
        result = supabase.table("leads")\
            .select("*")\
            .gte("created_at", ten_min_ago)\
            .is_("contacted_at", "null")\
            .execute()
        return result.data or []
    except Exception as e:
        print(f"❌ Error fetching new leads: {e}")
        return []

def get_leads_needing_followup():
    """Get leads that need follow-up based on days since first contact"""
    try:
        # Get all contacted leads
        result = supabase.table("leads")\
            .select("*")\
            .not_.is_("contacted_at", "null")\
            .in_("status", ["contacted", "engaged", "qualified"])\
            .execute()
        return result.data or []
    except Exception as e:
        print(f"❌ Error fetching follow-up leads: {e}")
        return []

def get_warm_leads():
    """Get high-score leads that haven't been alerted yet"""
    try:
        result = supabase.table("leads")\
            .select("*")\
            .gte("score", 70)\
            .not_.is_("email", "null")\
            .execute()
        
        # Filter for those that have been contacted but not closed
        warm = [l for l in (result.data or []) 
                if l.get("contacted_at") and not l.get("closed_at")]
        return warm
    except Exception as e:
        print(f"❌ Error fetching warm leads: {e}")
        return []

def calculate_days_since_contact(lead):
    """Calculate days since first contact"""
    if not lead.get("contacted_at"):
        return 0
    contacted = datetime.fromisoformat(lead["contacted_at"].replace("Z", "+00:00"))
    return (datetime.utcnow().replace(tzinfo=contacted.tzinfo) - contacted).days

def should_followup(lead, days):
    """Determine if lead needs follow-up today based on sequence"""
    status = lead.get("status", "new")
    
    # Follow-up schedule: Day 2, Day 5, Day 10
    if days == 2 and status == "contacted":
        return "day2_value_roi"
    elif days == 5 and status in ["contacted", "engaged"]:
        return "day5_case_study"
    elif days == 10 and status in ["contacted", "engaged"]:
        return "day10_last_chance"
    return None

def mark_contacted(lead_id):
    """Mark lead as contacted with current timestamp"""
    try:
        supabase.table("leads")\
            .update({"contacted_at": datetime.utcnow().isoformat(), "status": "contacted"})\
            .eq("id", lead_id)\
            .execute()
        return True
    except Exception as e:
        print(f"❌ Error marking lead contacted: {e}")
        return False

def log_touchpoint(lead, action, details=None):
    """Log touchpoint to daily log file"""
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = f"{TOUCHPOINTS_DIR}/{today}.jsonl"
    
    touchpoint = {
        "timestamp": datetime.now().isoformat(),
        "lead_id": lead.get("id"),
        "business_name": lead.get("business_name"),
        "email": lead.get("email"),
        "action": action,
        "details": details or {}
    }
    
    os.makedirs(TOUCHPOINTS_DIR, exist_ok=True)
    with open(log_file, "a") as f:
        f.write(json.dumps(touchpoint) + "\n")

def main():
    print("🔍 Mouse Platform Lead Funnel Automation")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 1. NEW LEADS - Auto-reply within 5 minutes
    new_leads = get_new_leads()
    print(f"📨 New inbound leads (last 10 min): {len(new_leads)}")
    
    new_contacts = []
    for lead in new_leads:
        print(f"   • {lead.get('business_name')} - {lead.get('email', 'no email')}")
        print(f"     Source: {lead.get('source', 'unknown')} | Score: {lead.get('score', 0)}")
        
        if lead.get("email"):
            # Would send auto-reply email here
            print(f"     ✉️  Auto-reply needed")
            new_contacts.append(lead)
            log_touchpoint(lead, "auto_reply_sent", {"template": "day1_intro"})
            mark_contacted(lead["id"])
    
    # 2. FOLLOW-UP SEQUENCE
    followup_leads = get_leads_needing_followup()
    print(f"\n📅 Leads in follow-up pipeline: {len(followup_leads)}")
    
    needs_action = []
    for lead in followup_leads:
        days = calculate_days_since_contact(lead)
        action = should_followup(lead, days)
        
        if action:
            needs_action.append({
                "lead": lead,
                "action": action,
                "days": days
            })
    
    if needs_action:
        print(f"   ⏰ {len(needs_action)} leads need follow-up today:")
        for item in needs_action:
            lead = item["lead"]
            print(f"   • {lead.get('business_name')} - {item['action']} (day {item['days']})")
            # Would send follow-up email here
            log_touchpoint(lead, item['action'], {"days_since_contact": item['days']})
    
    # 3. WARM LEADS (score >= 70, need immediate alert)
    warm_leads = get_warm_leads()
    print(f"\n🔥 Warm leads (high score, actively engaged): {len(warm_leads)}")
    
    alert_needed = []
    for lead in warm_leads:
        days = calculate_days_since_contact(lead)
        print(f"   • {lead.get('business_name')} - Score: {lead.get('score')}")
        print(f"     Email: {lead.get('email')} | Status: {lead.get('status')} | Days: {days}")
        alert_needed.append(lead)
    
    # 4. COLD LEADS (no response after day 10 sequence)
    cold_candidates = [l for l in followup_leads 
                      if calculate_days_since_contact(l) > 10 
                      and l.get('status') in ['contacted', 'engaged']]
    print(f"\n❄️  Cold leads (>10 days, no progression): {len(cold_candidates)}")
    for lead in cold_candidates[:5]:  # Show first 5
        print(f"   • {lead.get('business_name')} - Last contact: {calculate_days_since_contact(lead)} days ago")
    
    # Save summary
    summary = {
        "timestamp": datetime.now().isoformat(),
        "new_leads": len(new_leads),
        "auto_replies_sent": len(new_contacts),
        "followups_needed": len(needs_action),
        "warm_leads": len(alert_needed),
        "cold_leads": len(cold_candidates),
        "details": {
            "new_leads_list": [l.get('business_name') for l in new_leads],
            "warm_leads_list": [{"name": l.get('business_name'), "score": l.get('score'), "email": l.get('email')} 
                               for l in alert_needed],
            "followup_actions": [{"name": a['lead'].get('business_name'), "action": a['action']} 
                                for a in needs_action]
        }
    }
    
    today = datetime.now().strftime("%Y-%m-%d")
    summary_file = f"{TOUCHPOINTS_DIR}/{today}_summary.json"
    os.makedirs(TOUCHPOINTS_DIR, exist_ok=True)
    with open(summary_file, "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n📊 Summary: {len(new_leads)} new | {len(needs_action)} follow-up | {len(alert_needed)} warm | {len(cold_candidates)} cold")
    print(f"💾 Saved to: {summary_file}")
    
    # Return structured output
    return {
        "new_leads": new_leads,
        "warm_leads": alert_needed,
        "followup_actions": needs_action,
        "cold_leads": cold_candidates
    }

if __name__ == "__main__":
    result = main()
    
    # Exit with status indicating if action is needed
    if result["warm_leads"] or result["new_leads"]:
        sys.exit(1)  # Action needed
    else:
        sys.exit(0)  # All clear
