"""
Example usage of the Prospect Research Engine

This script demonstrates how to use the deep research personalization system
to research prospects and generate personalized outreach.
"""
import asyncio
import json
from prospect_research import ProspectResearchEngine

async def demo_single_company():
    """Demo: Research a single company"""
    print("=" * 60)
    print("DEEP RESEARCH PERSONALIZATION DEMO")
    print("=" * 60)
    
    # Initialize the research engine
    engine = ProspectResearchEngine()
    
    # Research a company
    domain = "stripe.com"
    company_name = "Stripe"
    
    print(f"\n🔍 Researching: {company_name} ({domain})")
    print("-" * 60)
    
    result = await engine.research_company(domain, company_name)
    
    # Print results
    print(f"\n📊 COMPANY OVERVIEW")
    print(f"   Name: {result.company_name}")
    print(f"   Industry: {result.industry}")
    print(f"   Sub-industry: {result.sub_industry}")
    print(f"   Employees: {result.employee_count}")
    print(f"   Revenue: {result.revenue_range}")
    print(f"   Location: {result.location}")
    
    print(f"\n🌐 WEBSITE ANALYSIS")
    print(f"   Summary: {result.website_summary}")
    print(f"   Products/Services: {', '.join(result.products_services)}")
    print(f"   Value Prop: {result.value_proposition}")
    
    print(f"\n💼 LINKEDIN PRESENCE")
    print(f"   URL: {result.linkedin_url}")
    print(f"   Followers: {result.linkedin_followers:,}")
    print(f"   Recent Posts: {len(result.linkedin_posts)}")
    print(f"   Culture: {result.company_culture}")
    
    print(f"\n📰 RECENT NEWS")
    for news in result.recent_news[:3]:
        print(f"   • {news['title']}")
    
    print(f"\n🎯 PAIN POINTS IDENTIFIED")
    for pain_point in result.identified_pain_points:
        severity_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(pain_point['severity'], "⚪")
        print(f"   {severity_emoji} [{pain_point['category'].upper()}] {pain_point['description']}")
        print(f"      Evidence: {pain_point['evidence']}")
    
    print(f"\n🤖 RECOMMENDED AI EMPLOYEES")
    for employee in result.recommended_employees:
        impact_emoji = {"high": "🚀", "medium": "⚡", "low": "💡"}.get(employee['estimated_impact'], "•")
        print(f"   {impact_emoji} {employee['role']}")
        print(f"      Why: {employee['reason']}")
        print(f"      Value: ${employee['hourly_value']}/hour")
    
    print(f"\n📧 GENERATED EMAIL")
    print(f"   Subject: {result.email_subject}")
    print(f"\n   Body:")
    print(f"   {'-' * 50}")
    print(result.personalized_email)
    print(f"   {'-' * 50}")
    
    print(f"\n✅ Confidence Score: {result.confidence_score * 100:.0f}%")
    print(f"📊 Data Sources: {', '.join(result.data_sources)}")
    print(f"🕐 Research Date: {result.research_date}")
    
    return result


async def demo_batch_research():
    """Demo: Research multiple companies"""
    print("\n" + "=" * 60)
    print("BATCH RESEARCH DEMO")
    print("=" * 60)
    
    engine = ProspectResearchEngine()
    
    domains = [
        "notion.so",
        "figma.com",
        "linear.app"
    ]
    
    print(f"\n🔍 Researching {len(domains)} companies...")
    
    results = await engine.batch_research(domains)
    
    print(f"\n📊 BATCH RESULTS SUMMARY")
    print("-" * 60)
    
    for result in results:
        print(f"\n   {result.company_name}")
        print(f"   ├── Industry: {result.industry}")
        print(f"   ├── Pain Points: {len(result.identified_pain_points)}")
        print(f"   ├── AI Recommendations: {len(result.recommended_employees)}")
        print(f"   └── Confidence: {result.confidence_score * 100:.0f}%")
    
    return results


async def demo_enrich_only():
    """Demo: Quick enrichment from Apollo only"""
    print("\n" + "=" * 60)
    print("APOLLO ENRICHMENT DEMO")
    print("=" * 60)
    
    engine = ProspectResearchEngine()
    
    domain = "airbnb.com"
    
    print(f"\n🔍 Enriching: {domain}")
    
    # Create minimal research object
    from prospect_research import CompanyResearch
    research = CompanyResearch(domain=domain, company_name="Airbnb")
    
    # Run only Apollo enrichment
    await engine._enrich_from_apollo(research)
    
    print(f"\n📊 ENRICHMENT RESULTS")
    print(f"   Name: {research.company_name}")
    print(f"   Industry: {research.industry}")
    print(f"   Sub-industry: {research.sub_industry}")
    print(f"   Employees: {research.employee_count}")
    print(f"   Revenue: {research.revenue_range}")
    print(f"   Location: {research.location}")
    print(f"   Description: {research.description[:100]}..." if research.description else "   Description: N/A")


def save_research_to_json(research, filename: str = "research_result.json"):
    """Save research results to JSON file"""
    with open(filename, 'w') as f:
        json.dump(research.to_dict(), f, indent=2, default=str)
    print(f"\n💾 Research saved to: {filename}")


async def main():
    """Run all demos"""
    # Demo 1: Single company deep research
    result = await demo_single_company()
    
    # Save the result
    save_research_to_json(result, "single_company_research.json")
    
    # Demo 2: Batch research (commented out to save API calls)
    # await demo_batch_research()
    
    # Demo 3: Apollo enrichment only (commented out)
    # await demo_enrich_only()
    
    print("\n" + "=" * 60)
    print("DEMO COMPLETE")
    print("=" * 60)
    print("\n✅ The deep research system can now:")
    print("   • Research company websites and extract key information")
    print("   • Analyze LinkedIn presence and company culture")
    print("   • Find recent news and funding announcements")
    print("   • Identify pain points and automation opportunities")
    print("   • Recommend specific AI employees for each prospect")
    print("   • Generate personalized cold emails with context")
    print("   • Show research findings to sales reps for approval")
    print("   • Integrate with Apollo.io for data enrichment")


if __name__ == "__main__":
    asyncio.run(main())
