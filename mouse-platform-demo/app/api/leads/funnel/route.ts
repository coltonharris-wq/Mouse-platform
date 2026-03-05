export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Demo leads data for the funnel
const DEMO_LEADS = [
  { id: "l1", businessName: "Summit Roofing Solutions", contactName: "Mike Thompson", phone: "(555) 234-5678", email: "mike@summitroofing.com", website: "summitroofing.com", score: 9, status: "qualified", industry: "Construction", location: "Denver, CO", foundDate: "2026-03-05", companySize: "11-50" },
  { id: "l2", businessName: "Bright Smile Dental", contactName: "Dr. Sarah Kim", phone: "(555) 345-6789", email: "info@brightsmile.com", website: "brightsmile.com", score: 8, status: "contacted", industry: "Healthcare", location: "Austin, TX", foundDate: "2026-03-05", companySize: "11-50" },
  { id: "l3", businessName: "Pinnacle Law Group", contactName: "James Rodriguez", phone: "(555) 456-7890", email: "jrodriguez@pinnaclelaw.com", website: "pinnaclelaw.com", score: 7, status: "new", industry: "Legal", location: "Miami, FL", foundDate: "2026-03-05", companySize: "11-50" },
  { id: "l4", businessName: "FastFix Plumbing", contactName: "Carlos Mendez", phone: "(555) 567-8901", email: "carlos@fastfixplumb.com", website: "fastfixplumb.com", score: 9, status: "converted", industry: "Home Services", location: "Phoenix, AZ", foundDate: "2026-03-04", companySize: "1-10" },
  { id: "l5", businessName: "TechNova Solutions", contactName: "Priya Patel", phone: "(555) 678-9012", email: "priya@technova.io", website: "technova.io", score: 6, status: "contacted", industry: "Technology", location: "San Francisco, CA", foundDate: "2026-03-04", companySize: "51-200" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const scoreMin = searchParams.get('score_min');
    const scoreMax = searchParams.get('score_max');
    const search = searchParams.get('search');

    let leads = [...DEMO_LEADS];

    if (status) {
      leads = leads.filter(l => l.status === status);
    }
    if (scoreMin) {
      leads = leads.filter(l => l.score >= parseInt(scoreMin));
    }
    if (scoreMax) {
      leads = leads.filter(l => l.score <= parseInt(scoreMax));
    }
    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(l =>
        l.businessName.toLowerCase().includes(q) ||
        l.contactName.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      leads,
      total: leads.length,
      stats: {
        today: DEMO_LEADS.filter(l => l.foundDate === "2026-03-05").length,
        thisWeek: DEMO_LEADS.length,
        converted: DEMO_LEADS.filter(l => l.status === "converted").length,
        avgScore: (DEMO_LEADS.reduce((sum, l) => sum + l.score, 0) / DEMO_LEADS.length).toFixed(1),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, location, radius, company_size, keywords, email, auto_outreach } = body;

    if (!industry || !location || !email) {
      return NextResponse.json({ error: 'Industry, location, and email are required' }, { status: 400 });
    }

    // In production, this would save to Supabase and kick off the lead gen worker
    const config = {
      id: `funnel-${Date.now()}`,
      industry,
      location,
      radius: radius || 25,
      company_size: company_size || [],
      keywords: keywords || '',
      email,
      auto_outreach: auto_outreach || false,
      created_at: new Date().toISOString(),
      status: 'active',
    };

    return NextResponse.json({
      success: true,
      config,
      message: `Lead funnel configured for ${industry} in ${location}. Your first leads will arrive within 24 hours.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
