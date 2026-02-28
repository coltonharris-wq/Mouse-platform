"""
Prospect Research API Routes
FastAPI routes for deep research functionality
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import asyncio

from prospect_research import ProspectResearchEngine, CompanyResearch

router = APIRouter(prefix="/research", tags=["research"])

# Initialize research engine
research_engine = ProspectResearchEngine()


# Request/Response Models
class ResearchRequest(BaseModel):
    domain: str = Field(..., description="Company domain (e.g., 'example.com')")
    company_name: Optional[str] = Field(None, description="Optional company name override")


class BatchResearchRequest(BaseModel):
    domains: List[str] = Field(..., max_length=50, description="List of domains to research")


class PainPoint(BaseModel):
    category: str
    description: str
    severity: str
    evidence: str


class AIEmployeeRecommendation(BaseModel):
    role: str
    reason: str
    estimated_impact: str
    hourly_value: int


class NewsItem(BaseModel):
    title: str
    link: str
    published: str
    summary: str


class ResearchResponse(BaseModel):
    domain: str
    company_name: str
    industry: Optional[str]
    sub_industry: Optional[str]
    employee_count: Optional[int]
    revenue_range: Optional[str]
    location: Optional[Dict]
    description: Optional[str]
    
    # Research findings
    website_summary: Optional[str]
    products_services: List[str]
    value_proposition: Optional[str]
    target_audience: Optional[str]
    linkedin_url: Optional[str]
    
    # Analysis
    pain_points: List[PainPoint]
    automation_opportunities: List[str]
    tech_stack_gaps: List[str]
    
    # Recommendations
    recommended_employees: List[AIEmployeeRecommendation]
    
    # Generated content
    email_subject: Optional[str]
    personalized_email: Optional[str]
    
    # Metadata
    research_date: str
    data_sources: List[str]
    confidence_score: float


class ResearchStatus(BaseModel):
    status: str  # "pending", "in_progress", "completed", "failed"
    progress: int  # 0-100
    domain: str
    started_at: str
    completed_at: Optional[str]
    error: Optional[str]


# In-memory status store (use Redis in production)
research_statuses: Dict[str, ResearchStatus] = {}


@router.post("/company", response_model=ResearchResponse)
async def research_company(request: ResearchRequest):
    """
    Conduct deep research on a single company
    
    Researches:
    - Company website content and offerings
    - LinkedIn presence and activity
    - Recent news and funding
    - Pain points and automation opportunities
    - Generates personalized email with AI employee recommendations
    """
    try:
        result = await research_engine.research_company(
            domain=request.domain,
            company_name=request.company_name
        )
        return _convert_to_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")


@router.post("/batch", response_model=List[ResearchResponse])
async def batch_research(request: BatchResearchRequest):
    """
    Research multiple companies in parallel
    
    Limited to 50 domains per request for performance.
    """
    if len(request.domains) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 domains per batch")
    
    try:
        results = await research_engine.batch_research(request.domains)
        return [_convert_to_response(r) for r in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch research failed: {str(e)}")


@router.post("/company/async")
async def start_research_async(
    request: ResearchRequest,
    background_tasks: BackgroundTasks
):
    """
    Start async research job
    
    Returns immediately with job ID. Poll /research/status/{job_id} for results.
    """
    job_id = f"research_{request.domain.replace('.', '_')}_{datetime.utcnow().timestamp()}"
    
    research_statuses[job_id] = ResearchStatus(
        status="pending",
        progress=0,
        domain=request.domain,
        started_at=datetime.utcnow().isoformat(),
        completed_at=None,
        error=None
    )
    
    background_tasks.add_task(
        _run_async_research,
        job_id,
        request.domain,
        request.company_name
    )
    
    return {"job_id": job_id, "status": "started"}


@router.get("/status/{job_id}", response_model=ResearchStatus)
async def get_research_status(job_id: str):
    """Get status of an async research job"""
    if job_id not in research_statuses:
        raise HTTPException(status_code=404, detail="Research job not found")
    return research_statuses[job_id]


@router.get("/result/{job_id}", response_model=ResearchResponse)
async def get_research_result(job_id: str):
    """Get completed research result"""
    if job_id not in research_statuses:
        raise HTTPException(status_code=404, detail="Research job not found")
    
    status = research_statuses[job_id]
    if status.status != "completed":
        raise HTTPException(
            status_code=400, 
            detail=f"Research not completed. Current status: {status.status}"
        )
    
    # In production, retrieve from database/cache
    # For now, we re-run (would be cached)
    result = await research_engine.research_company(status.domain)
    return _convert_to_response(result)


@router.post("/generate-email")
async def generate_email(request: ResearchRequest):
    """
    Generate a personalized email for a company
    
    Shorthand endpoint that just returns the email content without full research.
    """
    try:
        result = await research_engine.research_company(
            domain=request.domain,
            company_name=request.company_name
        )
        return {
            "domain": result.domain,
            "company_name": result.company_name,
            "email_subject": result.email_subject,
            "personalized_email": result.personalized_email,
            "confidence_score": result.confidence_score,
            "recommended_employees": result.recommended_employees
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email generation failed: {str(e)}")


@router.post("/enrich-apollo")
async def enrich_from_apollo(request: ResearchRequest):
    """
    Enrich company data from Apollo.io only
    
    Fast endpoint for basic company enrichment.
    """
    try:
        # Create minimal research object
        from prospect_research import CompanyResearch
        research = CompanyResearch(
            domain=request.domain,
            company_name=request.company_name or request.domain
        )
        
        # Just run Apollo enrichment
        await research_engine._enrich_from_apollo(research)
        
        return {
            "domain": research.domain,
            "company_name": research.company_name,
            "industry": research.industry,
            "sub_industry": research.sub_industry,
            "employee_count": research.employee_count,
            "revenue_range": research.revenue_range,
            "location": research.location,
            "description": research.description,
            "linkedin_url": research.linkedin_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enrichment failed: {str(e)}")


@router.get("/templates/employees")
async def get_employee_templates():
    """Get available AI employee role templates"""
    from prospect_research import AI_EMPLOYEE_TEMPLATES
    return AI_EMPLOYEE_TEMPLATES


# Helper functions

def _convert_to_response(research: CompanyResearch) -> ResearchResponse:
    """Convert CompanyResearch to API response"""
    return ResearchResponse(
        domain=research.domain,
        company_name=research.company_name,
        industry=research.industry,
        sub_industry=research.sub_industry,
        employee_count=research.employee_count,
        revenue_range=research.revenue_range,
        location=research.location,
        description=research.description,
        website_summary=research.website_summary,
        products_services=research.products_services,
        value_proposition=research.value_proposition,
        target_audience=research.target_audience,
        linkedin_url=research.linkedin_url,
        pain_points=[PainPoint(**p) for p in research.identified_pain_points],
        automation_opportunities=research.automation_opportunities,
        tech_stack_gaps=research.tech_stack_gaps,
        recommended_employees=[AIEmployeeRecommendation(**e) for e in research.recommended_employees],
        email_subject=research.email_subject,
        personalized_email=research.personalized_email,
        research_date=research.research_date,
        data_sources=research.data_sources,
        confidence_score=research.confidence_score
    )


async def _run_async_research(job_id: str, domain: str, company_name: Optional[str]):
    """Background task for async research"""
    try:
        research_statuses[job_id].status = "in_progress"
        research_statuses[job_id].progress = 10
        
        # Run research
        result = await research_engine.research_company(domain, company_name)
        
        research_statuses[job_id].status = "completed"
        research_statuses[job_id].progress = 100
        research_statuses[job_id].completed_at = datetime.utcnow().isoformat()
        
    except Exception as e:
        research_statuses[job_id].status = "failed"
        research_statuses[job_id].error = str(e)
        research_statuses[job_id].completed_at = datetime.utcnow().isoformat()
