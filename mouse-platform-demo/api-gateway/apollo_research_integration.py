"""
Apollo-Research Integration
Connects Apollo.io lead import with deep research personalization
"""
from typing import List, Dict, Optional
from dataclasses import dataclass
import asyncio

from prospect_research import ProspectResearchEngine, CompanyResearch
from apollo_lib import ApolloLead, searchApolloLeads


@dataclass
class EnrichedApolloLead:
    """Apollo lead with deep research enrichment"""
    # Original Apollo data
    id: str
    company_name: str
    domain: str
    contact_first_name: Optional[str]
    contact_last_name: Optional[str]
    contact_email: Optional[str]
    contact_job_title: Optional[str]
    
    # Deep research data
    research: Optional[CompanyResearch] = None
    research_status: str = "pending"  # pending, in_progress, completed, failed
    
    # Generated content
    personalized_subject: Optional[str] = None
    personalized_email: Optional[str] = None


class ApolloResearchIntegration:
    """
    Integrates Apollo.io lead import with deep research personalization
    
    Workflow:
    1. Import leads from Apollo.io
    2. Enrich each lead with deep research
    3. Generate personalized emails
    4. Present to sales rep for approval
    5. Track email sends and responses
    """
    
    def __init__(self):
        self.research_engine = ProspectResearchEngine()
        self.enriched_leads: Dict[str, EnrichedApolloLead] = {}
    
    async def import_and_research(
        self,
        industry: Optional[str] = None,
        location: Optional[str] = None,
        company_size: Optional[str] = None,
        limit: int = 25
    ) -> List[EnrichedApolloLead]:
        """
        Import leads from Apollo and enrich with research
        
        Args:
            industry: Industry filter (e.g., "Technology", "Healthcare")
            location: Location filter (e.g., "Raleigh, NC")
            company_size: Company size filter (e.g., "11-50")
            limit: Maximum leads to import
            
        Returns:
            List of enriched leads with research data
        """
        # 1. Search Apollo for leads
        apollo_results = await searchApolloLeads({
            "industry": industry,
            "location": location,
            "company_size": company_size,
            "per_page": limit
        })
        
        # 2. Convert to enriched leads
        enriched = []
        for lead in apollo_results["leads"]:
            enriched_lead = EnrichedApolloLead(
                id=lead["id"],
                company_name=lead["company"]["name"],
                domain=lead["company"]["domain"],
                contact_first_name=lead["contact"]["first_name"] if lead.get("contact") else None,
                contact_last_name=lead["contact"]["last_name"] if lead.get("contact") else None,
                contact_email=lead["contact"]["email"] if lead.get("contact") else None,
                contact_job_title=lead["contact"]["job_title"] if lead.get("contact") else None
            )
            enriched.append(enriched_lead)
            self.enriched_leads[enriched_lead.id] = enriched_lead
        
        # 3. Research each company (in parallel)
        await self._research_batch(enriched)
        
        return enriched
    
    async def _research_batch(self, leads: List[EnrichedApolloLead]):
        """Research all leads in parallel batches"""
        # Process in batches of 5 to avoid rate limits
        batch_size = 5
        for i in range(0, len(leads), batch_size):
            batch = leads[i:i + batch_size]
            tasks = [self._research_single_lead(lead) for lead in batch]
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _research_single_lead(self, lead: EnrichedApolloLead):
        """Research a single lead"""
        try:
            lead.research_status = "in_progress"
            
            # Conduct research
            research = await self.research_engine.research_company(
                domain=lead.domain,
                company_name=lead.company_name
            )
            
            lead.research = research
            lead.personalized_subject = research.email_subject
            lead.personalized_email = research.personalized_email
            lead.research_status = "completed"
            
        except Exception as e:
            print(f"Research failed for {lead.domain}: {e}")
            lead.research_status = "failed"
    
    async def enrich_existing_lead(self, lead_id: str) -> Optional[EnrichedApolloLead]:
        """
        Enrich an existing lead with deep research
        
        Args:
            lead_id: The Apollo lead ID
            
        Returns:
            Enriched lead or None if not found
        """
        # In production, fetch from database
        # For demo, return from memory
        return self.enriched_leads.get(lead_id)
    
    def get_leads_by_status(self, status: str) -> List[EnrichedApolloLead]:
        """Get all leads with a specific research status"""
        return [
            lead for lead in self.enriched_leads.values()
            if lead.research_status == status
        ]
    
    def get_leads_ready_for_outreach(self) -> List[EnrichedApolloLead]:
        """Get leads with completed research and generated emails"""
        return [
            lead for lead in self.enriched_leads.values()
            if lead.research_status == "completed"
            and lead.personalized_email is not None
        ]
    
    def update_email(self, lead_id: str, subject: str, body: str):
        """Update the personalized email for a lead (after rep edits)"""
        if lead_id in self.enriched_leads:
            self.enriched_leads[lead_id].personalized_subject = subject
            self.enriched_leads[lead_id].personalized_email = body
    
    def mark_as_sent(self, lead_id: str):
        """Mark a lead's email as sent"""
        # In production, update database
        pass
    
    def get_research_stats(self) -> Dict:
        """Get statistics about research jobs"""
        total = len(self.enriched_leads)
        completed = len([l for l in self.enriched_leads.values() if l.research_status == "completed"])
        failed = len([l for l in self.enriched_leads.values() if l.research_status == "failed"])
        pending = len([l for l in self.enriched_leads.values() if l.research_status == "pending"])
        in_progress = len([l for l in self.enriched_leads.values() if l.research_status == "in_progress"])
        
        return {
            "total": total,
            "completed": completed,
            "failed": failed,
            "pending": pending,
            "in_progress": in_progress,
            "completion_rate": completed / total if total > 0 else 0
        }


# FastAPI routes for Apollo-Research integration
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/apollo-research", tags=["apollo-research"])

# Global integration instance
integration = ApolloResearchIntegration()


class ImportRequest(BaseModel):
    industry: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None
    limit: int = 25


class UpdateEmailRequest(BaseModel):
    lead_id: str
    subject: str
    body: str


@router.post("/import")
async def import_and_research(request: ImportRequest):
    """
    Import leads from Apollo and enrich with deep research
    
    This is the main endpoint for the sales workflow:
    1. Searches Apollo.io for leads matching criteria
    2. Researches each company (website, LinkedIn, news)
    3. Generates personalized emails
    4. Returns enriched leads ready for review
    """
    try:
        leads = await integration.import_and_research(
            industry=request.industry,
            location=request.location,
            company_size=request.company_size,
            limit=request.limit
        )
        
        return {
            "success": True,
            "total_imported": len(leads),
            "leads": [
                {
                    "id": lead.id,
                    "company_name": lead.company_name,
                    "domain": lead.domain,
                    "contact": {
                        "first_name": lead.contact_first_name,
                        "last_name": lead.contact_last_name,
                        "email": lead.contact_email,
                        "job_title": lead.contact_job_title
                    },
                    "research_status": lead.research_status,
                    "personalized_subject": lead.personalized_subject,
                    "personalized_email": lead.personalized_email,
                    "confidence_score": lead.research.confidence_score if lead.research else None
                }
                for lead in leads
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.get("/leads")
async def get_enriched_leads(status: Optional[str] = None):
    """Get all enriched leads, optionally filtered by status"""
    if status:
        leads = integration.get_leads_by_status(status)
    else:
        leads = list(integration.enriched_leads.values())
    
    return {
        "leads": [
            {
                "id": lead.id,
                "company_name": lead.company_name,
                "domain": lead.domain,
                "research_status": lead.research_status,
                "personalized_subject": lead.personalized_subject,
                "personalized_email": lead.personalized_email
            }
            for lead in leads
        ]
    }


@router.get("/leads/{lead_id}")
async def get_lead_details(lead_id: str):
    """Get detailed information about a specific lead including full research"""
    lead = integration.enriched_leads.get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {
        "id": lead.id,
        "company_name": lead.company_name,
        "domain": lead.domain,
        "contact": {
            "first_name": lead.contact_first_name,
            "last_name": lead.contact_last_name,
            "email": lead.contact_email,
            "job_title": lead.contact_job_title
        },
        "research_status": lead.research_status,
        "research": lead.research.to_dict() if lead.research else None,
        "personalized_subject": lead.personalized_subject,
        "personalized_email": lead.personalized_email
    }


@router.post("/leads/{lead_id}/email")
async def update_lead_email(lead_id: str, request: UpdateEmailRequest):
    """Update the personalized email for a lead"""
    if lead_id not in integration.enriched_leads:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    integration.update_email(lead_id, request.subject, request.body)
    return {"success": True, "message": "Email updated"}


@router.get("/stats")
async def get_research_stats():
    """Get research job statistics"""
    return integration.get_research_stats()


@router.get("/ready-for-outreach")
async def get_leads_ready():
    """Get leads that are ready for outreach (research completed)"""
    leads = integration.get_leads_ready_for_outreach()
    return {
        "count": len(leads),
        "leads": [
            {
                "id": lead.id,
                "company_name": lead.company_name,
                "contact_email": lead.contact_email,
                "personalized_subject": lead.personalized_subject
            }
            for lead in leads
        ]
    }
