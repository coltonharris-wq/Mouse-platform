export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Industry-specific data for lead intelligence
const INDUSTRY_DATA: Record<string, { avgTicket: string; monthlyCallVolume: string; painPoints: string[]; suggestedPrice: string; salesAngle: string }> = {
  plumbing: { avgTicket: '$250-$800', monthlyCallVolume: '80-200', painPoints: ['Missed calls = lost jobs', 'After-hours emergencies', 'Scheduling chaos'], suggestedPrice: '$297/mo (Growth)', salesAngle: 'Every missed call is a $500 job walking to a competitor. Mouse AI answers 24/7.' },
  hvac: { avgTicket: '$300-$2000', monthlyCallVolume: '100-300', painPoints: ['Seasonal demand spikes', 'Quote follow-ups', 'Maintenance scheduling'], suggestedPrice: '$497/mo (Pro)', salesAngle: 'HVAC calls spike in summer/winter. Mouse handles overflow without hiring temps.' },
  dental: { avgTicket: '$150-$500', monthlyCallVolume: '200-500', painPoints: ['Appointment no-shows', 'Insurance verification', 'Patient follow-ups'], suggestedPrice: '$297/mo (Growth)', salesAngle: 'No-shows cost dental offices $150+ each. Mouse AI confirms and reschedules automatically.' },
  legal: { avgTicket: '$500-$5000', monthlyCallVolume: '50-150', painPoints: ['Client intake bottleneck', 'Document management', 'Billing follow-ups'], suggestedPrice: '$497/mo (Pro)', salesAngle: 'Every consultation lead that goes unanswered is $2-5K in potential billing. Mouse captures them all.' },
  'real-estate': { avgTicket: '$5000-$15000', monthlyCallVolume: '100-300', painPoints: ['Lead response time', 'Showing scheduling', 'Follow-up fatigue'], suggestedPrice: '$497/mo (Pro)', salesAngle: 'Speed to lead matters. Mouse responds to inquiries in seconds, not hours.' },
  restaurant: { avgTicket: '$30-$80', monthlyCallVolume: '500-2000', painPoints: ['Reservation management', 'Online ordering', 'Staff scheduling'], suggestedPrice: '$97/mo (Starter)', salesAngle: 'Stop losing orders to voicemail. Mouse takes reservations and orders 24/7.' },
  salon: { avgTicket: '$50-$200', monthlyCallVolume: '150-400', painPoints: ['Booking management', 'No-show prevention', 'Marketing'], suggestedPrice: '$97/mo (Starter)', salesAngle: 'Full books = full revenue. Mouse manages appointments so stylists just do hair.' },
  construction: { avgTicket: '$5000-$50000', monthlyCallVolume: '30-80', painPoints: ['Bid management', 'Subcontractor coordination', 'Project tracking'], suggestedPrice: '$497/mo (Pro)', salesAngle: 'One missed bid = tens of thousands lost. Mouse tracks every lead and follow-up.' },
  'auto-shop': { avgTicket: '$200-$1500', monthlyCallVolume: '100-300', painPoints: ['Appointment scheduling', 'Parts ordering', 'Customer updates'], suggestedPrice: '$297/mo (Growth)', salesAngle: 'Customers hate calling for status updates. Mouse proactively texts them when their car is ready.' },
  default: { avgTicket: 'Varies', monthlyCallVolume: 'Varies', painPoints: ['Missed customer calls', 'Manual data entry', 'Inconsistent follow-ups'], suggestedPrice: '$97/mo (Starter)', salesAngle: 'Your business runs itself with Mouse AI employees handling the busywork.' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const radius = searchParams.get('radius') || '50000';

    if (!query && !location) {
      return NextResponse.json({ error: 'Search query or location required' }, { status: 400 });
    }

    // Try backend first (which has Google Places integration)
    try {
      const response = await fetch(`${API_URL}/leads/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: location || query,
          industry: query !== location ? query : undefined,
          radius_miles: Math.round(parseInt(radius) / 1609) || 25,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        // Enrich leads with intelligence data
        if (data.leads) {
          data.leads = data.leads.map((lead: any) => enrichLead(lead, query));
        }
        return NextResponse.json(data);
      }
    } catch {
      // Backend unavailable
    }

    // No backend available — return empty state with instructions
    return NextResponse.json({
      leads: [],
      message: 'Google Places API needs to be enabled for real lead data. Search for businesses manually or enable the API at console.cloud.google.com.',
      industryIntel: getIndustryIntel(query),
      demoMode: false,
    });
  } catch (error: any) {
    console.error('Leads search error:', error);
    return NextResponse.json({ leads: [], error: error.message });
  }
}

function enrichLead(lead: any, industry: string) {
  const intel = getIndustryIntel(industry);
  const hasWebsite = !!lead.website && lead.website !== 'Unknown';
  const rating = lead.rating || 0;
  const reviews = lead.reviews || 0;

  // Calculate lead score
  let score = 50;
  if (!hasWebsite) score += 15; // No website = easy sell
  if (rating < 4.0) score += 10; // Low rating = needs help
  if (reviews < 50) score += 5; // Few reviews = less established
  if (rating >= 4.5 && reviews > 100) score += 15; // High-value established business
  score = Math.min(100, Math.max(1, score));

  return {
    ...lead,
    leadScore: score,
    scoreExplanation: generateScoreExplanation(score, hasWebsite, rating, reviews),
    industryData: intel,
    hasWebsite,
    suggestedSalesAngle: intel.salesAngle,
    suggestedPrice: intel.suggestedPrice,
  };
}

function generateScoreExplanation(score: number, hasWebsite: boolean, rating: number, reviews: number): string {
  const reasons = [];
  if (!hasWebsite) reasons.push('No website (digital presence pain point)');
  if (rating < 4.0) reasons.push(`Below-average rating (${rating}) suggests operational issues`);
  if (reviews > 100) reasons.push(`${reviews} reviews indicates established business with budget`);
  if (score >= 80) reasons.push('High conversion probability');
  return reasons.join('. ') || 'Standard lead profile';
}

function getIndustryIntel(query: string) {
  const q = query.toLowerCase();
  for (const [key, data] of Object.entries(INDUSTRY_DATA)) {
    if (q.includes(key)) return data;
  }
  return INDUSTRY_DATA.default;
}
