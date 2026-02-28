"""
Prospect Research Engine
Deep research and personalization for sales outreach
"""
import os
import re
import json
import httpx
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from urllib.parse import urlparse, urljoin
import feedparser

@dataclass
class CompanyResearch:
    """Complete research profile for a prospect company"""
    domain: str
    company_name: str
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    employee_count: Optional[int] = None
    revenue_range: Optional[str] = None
    location: Optional[Dict] = None
    description: Optional[str] = None
    
    # Website Research
    website_content: Optional[str] = None
    website_summary: Optional[str] = None
    products_services: List[str] = None
    value_proposition: Optional[str] = None
    target_audience: Optional[str] = None
    
    # LinkedIn Research
    linkedin_url: Optional[str] = None
    linkedin_followers: Optional[int] = None
    linkedin_posts: List[Dict] = None
    company_culture: Optional[str] = None
    recent_hires: List[Dict] = None
    
    # News Research
    recent_news: List[Dict] = None
    funding_rounds: List[Dict] = None
    acquisitions: List[Dict] = None
    expansion_plans: Optional[str] = None
    
    # Pain Points Analysis
    identified_pain_points: List[Dict] = None
    automation_opportunities: List[str] = None
    tech_stack_gaps: List[str] = None
    
    # AI Recommendations
    recommended_employees: List[Dict] = None
    personalized_email: Optional[str] = None
    email_subject: Optional[str] = None
    
    # Metadata
    research_date: str = None
    data_sources: List[str] = None
    confidence_score: float = 0.0
    
    def __post_init__(self):
        if self.products_services is None:
            self.products_services = []
        if self.linkedin_posts is None:
            self.linkedin_posts = []
        if self.recent_hires is None:
            self.recent_hires = []
        if self.recent_news is None:
            self.recent_news = []
        if self.funding_rounds is None:
            self.funding_rounds = []
        if self.acquisitions is None:
            self.acquisitions = []
        if self.identified_pain_points is None:
            self.identified_pain_points = []
        if self.automation_opportunities is None:
            self.automation_opportunities = []
        if self.tech_stack_gaps is None:
            self.tech_stack_gaps = []
        if self.recommended_employees is None:
            self.recommended_employees = []
        if self.data_sources is None:
            self.data_sources = []
        if self.research_date is None:
            self.research_date = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict:
        return asdict(self)


class ProspectResearchEngine:
    """
    Deep research engine for prospect personalization
    Researches company website, LinkedIn, news, and analyzes pain points
    """
    
    def __init__(self):
        self.moonshot_api_key = os.getenv("MOONSHOT_API_KEY")
        self.apollo_api_key = os.getenv("APOLLO_API_KEY")
        self.model = "moonshot-v1-32k"
        self.cache = {}  # Simple in-memory cache
        self.cache_ttl = timedelta(hours=24)
    
    async def research_company(self, domain: str, company_name: Optional[str] = None) -> CompanyResearch:
        """
        Conduct comprehensive research on a company
        """
        # Check cache
        cache_key = f"{domain}_{datetime.utcnow().strftime('%Y%m%d')}"
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            if datetime.utcnow() - cached['timestamp'] < self.cache_ttl:
                return cached['data']
        
        # Initialize research object
        research = CompanyResearch(
            domain=domain,
            company_name=company_name or self._extract_company_name(domain)
        )
        
        # Run all research tasks in parallel
        tasks = [
            self._enrich_from_apollo(research),
            self._research_website(research),
            self._research_linkedin(research),
            self._research_news(research),
        ]
        
        await asyncio.gather(*tasks, return_exceptions=True)
        
        # Analyze findings
        await self._analyze_pain_points(research)
        await self._generate_recommendations(research)
        await self._generate_personalized_email(research)
        
        # Calculate confidence score
        research.confidence_score = self._calculate_confidence(research)
        
        # Cache results
        self.cache[cache_key] = {
            'data': research,
            'timestamp': datetime.utcnow()
        }
        
        return research
    
    async def _enrich_from_apollo(self, research: CompanyResearch):
        """Enrich company data from Apollo.io"""
        try:
            if not self.apollo_api_key:
                # Mock data for demo
                research.industry = "Technology"
                research.sub_industry = "Software Development"
                research.employee_count = 150
                research.revenue_range = "$10M-$50M"
                research.location = {
                    "city": "San Francisco",
                    "state": "CA",
                    "country": "United States"
                }
                research.linkedin_url = f"https://linkedin.com/company/{research.domain.replace('.', '-')}"
                research.data_sources.append("apollo_mock")
                return
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.apollo.io/v1/organizations/enrich",
                    headers={"X-Api-Key": self.apollo_api_key},
                    json={"domain": research.domain}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    org = data.get('organization', {})
                    
                    research.company_name = org.get('name', research.company_name)
                    research.industry = org.get('industry')
                    research.sub_industry = org.get('sub_industry')
                    research.employee_count = org.get('employee_count')
                    research.revenue_range = org.get('estimated_revenue')
                    research.location = {
                        "city": org.get('city'),
                        "state": org.get('state'),
                        "country": org.get('country')
                    }
                    research.linkedin_url = org.get('linkedin_url')
                    research.description = org.get('short_description')
                    
                    research.data_sources.append("apollo")
                    
        except Exception as e:
            print(f"Apollo enrichment error: {e}")
    
    async def _research_website(self, research: CompanyResearch):
        """Research company website content"""
        try:
            url = f"https://{research.domain}"
            
            async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
                response = await client.get(
                    url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    }
                )
                
                if response.status_code == 200:
                    content = response.text
                    research.website_content = self._extract_text_from_html(content)
                    
                    # Use AI to analyze website
                    await self._analyze_website_with_ai(research)
                    research.data_sources.append("website")
                    
        except Exception as e:
            print(f"Website research error: {e}")
    
    def _extract_text_from_html(self, html: str) -> str:
        """Extract readable text from HTML"""
        # Simple HTML tag removal
        text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:10000]  # Limit to 10k chars
    
    async def _analyze_website_with_ai(self, research: CompanyResearch):
        """Use AI to analyze website content"""
        try:
            prompt = f"""Analyze this company website content and extract key information:

Company: {research.company_name}
Domain: {research.domain}

Website Content:
{research.website_content[:5000]}

Provide a JSON response with:
{{
    "summary": "2-3 sentence company description",
    "products_services": ["list of main products/services"],
    "value_proposition": "their main value proposition",
    "target_audience": "who they serve",
    "industry": "detected industry",
    "indicators": {{
        "has_blog": true/false,
        "has_chat": true/false,
        "has_booking": true/false,
        "has_ecommerce": true/false,
        "uses_crm": "detected CRM or null",
        "social_media_active": true/false
    }}
}}"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.moonshot.cn/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.moonshot_api_key}"},
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                        "response_format": {"type": "json_object"}
                    },
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = json.loads(result['choices'][0]['message']['content'])
                    
                    research.website_summary = content.get('summary')
                    research.products_services = content.get('products_services', [])
                    research.value_proposition = content.get('value_proposition')
                    research.target_audience = content.get('target_audience')
                    
                    if not research.industry:
                        research.industry = content.get('industry')
                    
                    # Store indicators for pain point analysis
                    research.tech_stack_gaps = self._identify_tech_gaps(content.get('indicators', {}))
                    
        except Exception as e:
            print(f"AI website analysis error: {e}")
    
    def _identify_tech_gaps(self, indicators: Dict) -> List[str]:
        """Identify technology gaps based on website indicators"""
        gaps = []
        if not indicators.get('has_chat'):
            gaps.append("No chat support")
        if not indicators.get('has_booking'):
            gaps.append("No online booking system")
        if not indicators.get('has_blog'):
            gaps.append("No content marketing")
        if not indicators.get('uses_crm'):
            gaps.append("No visible CRM integration")
        if not indicators.get('social_media_active'):
            gaps.append("Limited social media presence")
        return gaps
    
    async def _research_linkedin(self, research: CompanyResearch):
        """Research company LinkedIn presence"""
        try:
            # In production, this would use LinkedIn API or scraping
            # For demo, we'll use mock data patterns
            
            linkedin_company = research.domain.replace('.', '-')
            research.linkedin_url = f"https://linkedin.com/company/{linkedin_company}"
            
            # Mock LinkedIn data
            research.linkedin_followers = max(500, int(research.employee_count * 10) if research.employee_count else 1000)
            
            research.linkedin_posts = [
                {
                    "date": (datetime.utcnow() - timedelta(days=i)).isoformat(),
                    "content": f"Exciting company update #{i}",
                    "engagement": 50 + i * 10
                }
                for i in range(1, 4)
            ]
            
            research.recent_hires = [
                {
                    "name": f"New Hire {i}",
                    "role": ["Sales Director", "Marketing Manager", "CTO"][i],
                    "date": (datetime.utcnow() - timedelta(days=i*15)).isoformat()
                }
                for i in range(3)
            ]
            
            research.company_culture = "Innovation-focused, fast-growing team"
            research.data_sources.append("linkedin")
            
        except Exception as e:
            print(f"LinkedIn research error: {e}")
    
    async def _research_news(self, research: CompanyResearch):
        """Research recent news about the company"""
        try:
            # Use Google News RSS feed
            search_query = research.company_name.replace(' ', '+')
            news_url = f"https://news.google.com/rss/search?q={search_query}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(news_url, timeout=30)
                
                if response.status_code == 200:
                    feed = feedparser.parse(response.text)
                    
                    research.recent_news = [
                        {
                            "title": entry.title,
                            "link": entry.link,
                            "published": entry.published,
                            "summary": entry.get('summary', '')[:200]
                        }
                        for entry in feed.entries[:5]
                    ]
                    
                    # Look for funding announcements
                    for entry in feed.entries:
                        title_lower = entry.title.lower()
                        if any(word in title_lower for word in ['funding', 'raised', 'investment', 'series']):
                            research.funding_rounds.append({
                                "announcement": entry.title,
                                "link": entry.link,
                                "date": entry.published
                            })
                    
                    research.data_sources.append("news")
                    
        except Exception as e:
            print(f"News research error: {e}")
    
    async def _analyze_pain_points(self, research: CompanyResearch):
        """Analyze and identify potential pain points"""
        try:
            prompt = f"""Based on this company research, identify pain points and automation opportunities:

Company: {research.company_name}
Industry: {research.industry}
Size: {research.employee_count} employees
Description: {research.description}
Website Summary: {research.website_summary}
Products/Services: {', '.join(research.products_services)}
Value Prop: {research.value_proposition}
Target Audience: {research.target_audience}
Tech Gaps: {', '.join(research.tech_stack_gaps)}
Recent News: {[n['title'] for n in research.recent_news[:3]]}
Recent Hires: {[h['role'] for h in research.recent_hires]}

Provide a JSON response:
{{
    "pain_points": [
        {{
            "category": "operational|sales|marketing|customer_support|technical",
            "description": "specific pain point",
            "severity": "high|medium|low",
            "evidence": "what indicates this pain point"
        }}
    ],
    "automation_opportunities": ["list of specific automation use cases"],
    "recommended_ai_employees": [
        {{
            "role": "role name",
            "reason": "why this role would help",
            "estimated_impact": "high|medium|low",
            "hourly_value": estimated hourly value (25-150)
        }}
    ]
}}"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.moonshot.cn/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.moonshot_api_key}"},
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.4,
                        "response_format": {"type": "json_object"}
                    },
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = json.loads(result['choices'][0]['message']['content'])
                    
                    research.identified_pain_points = content.get('pain_points', [])
                    research.automation_opportunities = content.get('automation_opportunities', [])
                    research.recommended_employees = content.get('recommended_ai_employees', [])
                    
        except Exception as e:
            print(f"Pain point analysis error: {e}")
            # Fallback pain points
            research.identified_pain_points = [
                {
                    "category": "operational",
                    "description": "Manual processes slowing growth",
                    "severity": "medium",
                    "evidence": "Company size suggests scaling challenges"
                }
            ]
    
    async def _generate_recommendations(self, research: CompanyResearch):
        """Generate AI employee recommendations if not already done"""
        if research.recommended_employees:
            return
        
        # Default recommendations based on industry
        industry_recommendations = {
            "Technology": [
                {"role": "AI Sales Development Rep", "reason": "Scale outreach", "estimated_impact": "high", "hourly_value": 65},
                {"role": "AI Customer Success Manager", "reason": "Retain customers", "estimated_impact": "high", "hourly_value": 55}
            ],
            "Healthcare": [
                {"role": "AI Appointment Scheduler", "reason": "Reduce no-shows", "estimated_impact": "high", "hourly_value": 35},
                {"role": "AI Patient Coordinator", "reason": "Streamline intake", "estimated_impact": "medium", "hourly_value": 40}
            ],
            "Real Estate": [
                {"role": "AI Lead Qualifier", "reason": "Pre-qualify buyers", "estimated_impact": "high", "hourly_value": 50},
                {"role": "AI Listing Coordinator", "reason": "Manage listings", "estimated_impact": "medium", "hourly_value": 45}
            ]
        }
        
        defaults = industry_recommendations.get(research.industry, [
            {"role": "AI Sales Assistant", "reason": "Handle initial outreach", "estimated_impact": "high", "hourly_value": 50},
            {"role": "AI Customer Support", "reason": "24/7 support coverage", "estimated_impact": "medium", "hourly_value": 35}
        ])
        
        research.recommended_employees = defaults
    
    async def _generate_personalized_email(self, research: CompanyResearch):
        """Generate personalized cold email based on research"""
        try:
            prompt = f"""Write a personalized cold email to {research.company_name} based on this research:

Company: {research.company_name}
Industry: {research.industry}
Size: {research.employee_count} employees
What they do: {research.website_summary}
Target: {research.target_audience}

Pain Points Identified:
{json.dumps(research.identified_pain_points, indent=2)}

Recommended AI Employees:
{json.dumps(research.recommended_employees[:2], indent=2)}

Write from "Colton" at Automio (AI workforce automation platform).

Guidelines:
- Subject line should be personalized and intriguing (not generic)
- Opening hook should reference specific research finding
- Show you understand their business
- Mention 1-2 specific AI employees that would help them
- Keep it concise (under 150 words)
- End with a soft CTA (not "let me know")
- Professional but conversational tone

Provide JSON:
{{
    "subject": "subject line",
    "body": "email body with \\n\\n for paragraphs"
}}"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.moonshot.cn/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.moonshot_api_key}"},
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.7,
                        "response_format": {"type": "json_object"}
                    },
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = json.loads(result['choices'][0]['message']['content'])
                    
                    research.email_subject = content.get('subject')
                    research.personalized_email = content.get('body')
                    
        except Exception as e:
            print(f"Email generation error: {e}")
            # Fallback email
            research.email_subject = f"Quick question about {research.company_name}'s growth"
            research.personalized_email = f"Hi there,\n\nI came across {research.company_name} and was impressed by what you're building in the {research.industry} space.\n\nI help companies like yours automate repetitive work with AI employees - things like lead qualification, customer support, and data entry.\n\nWould you be open to a quick call to explore if this makes sense for your team?\n\nBest,\nColton"
    
    def _calculate_confidence(self, research: CompanyResearch) -> float:
        """Calculate confidence score based on data completeness"""
        score = 0.0
        weights = {
            'website_summary': 0.2,
            'industry': 0.15,
            'employee_count': 0.15,
            'pain_points': 0.2,
            'recommended_employees': 0.15,
            'personalized_email': 0.15
        }
        
        if research.website_summary:
            score += weights['website_summary']
        if research.industry:
            score += weights['industry']
        if research.employee_count:
            score += weights['employee_count']
        if research.identified_pain_points:
            score += weights['pain_points']
        if research.recommended_employees:
            score += weights['recommended_employees']
        if research.personalized_email:
            score += weights['personalized_email']
        
        return round(score, 2)
    
    def _extract_company_name(self, domain: str) -> str:
        """Extract company name from domain"""
        name = domain.replace('www.', '').split('.')[0]
        return name.replace('-', ' ').replace('_', ' ').title()
    
    async def batch_research(self, domains: List[str]) -> List[CompanyResearch]:
        """Research multiple companies in batch"""
        tasks = [self.research_company(domain) for domain in domains]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        successful = []
        for result in results:
            if isinstance(result, Exception):
                print(f"Research error: {result}")
            else:
                successful.append(result)
        
        return successful


# AI Employee Role Templates for recommendations
AI_EMPLOYEE_TEMPLATES = {
    "sales_development_rep": {
        "name": "AI Sales Development Rep",
        "skills": ["Cold outreach", "Lead qualification", "CRM management", "Follow-up sequences"],
        "hourly_value": 65,
        "best_for": ["B2B companies", "High-volume sales", "Long sales cycles"]
    },
    "customer_success_manager": {
        "name": "AI Customer Success Manager",
        "skills": ["Onboarding", "Health checks", "Renewal management", "Upsell identification"],
        "hourly_value": 55,
        "best_for": ["SaaS companies", "Subscription businesses", "High churn risk"]
    },
    "appointment_scheduler": {
        "name": "AI Appointment Scheduler",
        "skills": ["Calendar management", "Reminder calls", "Rescheduling", "No-show reduction"],
        "hourly_value": 35,
        "best_for": ["Service businesses", "Healthcare", "Consulting"]
    },
    "social_media_manager": {
        "name": "AI Social Media Manager",
        "skills": ["Content creation", "Posting schedule", "Engagement", "Analytics"],
        "hourly_value": 50,
        "best_for": ["B2C companies", "E-commerce", "Brand awareness"]
    },
    "bookkeeper": {
        "name": "AI Bookkeeper",
        "skills": ["Invoice processing", "Expense categorization", "Reconciliation", "Reporting"],
        "hourly_value": 45,
        "best_for": ["Growing businesses", "High transaction volume", "Manual processes"]
    },
    "customer_support": {
        "name": "AI Customer Support",
        "skills": ["Ticket resolution", "Live chat", "Email support", "Knowledge base"],
        "hourly_value": 35,
        "best_for": ["High support volume", "24/7 coverage needed", "Common questions"]
    },
    "data_entry_specialist": {
        "name": "AI Data Entry Specialist",
        "skills": ["Form processing", "Database updates", "Data validation", "Report generation"],
        "hourly_value": 30,
        "best_for": ["High paperwork", "Compliance requirements", "Data-heavy processes"]
    },
    "executive_assistant": {
        "name": "AI Executive Assistant",
        "skills": ["Inbox management", "Meeting prep", "Travel booking", "Research"],
        "hourly_value": 60,
        "best_for": ["Busy executives", "Rapidly scaling teams", "Time optimization"]
    }
}
