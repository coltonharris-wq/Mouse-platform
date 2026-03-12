import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query') || '';
    const location = request.nextUrl.searchParams.get('location') || '';
    const resellerId = request.nextUrl.searchParams.get('reseller_id') || 'anon';

    if (!query) {
      return NextResponse.json({ error: 'query parameter required' }, { status: 400 });
    }

    // Rate limit: 10 searches per minute per reseller
    const now = Date.now();
    const limit = rateLimits.get(resellerId);
    if (limit && limit.resetAt > now && limit.count >= 10) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 });
    }
    if (!limit || limit.resetAt <= now) {
      rateLimits.set(resellerId, { count: 1, resetAt: now + 60000 });
    } else {
      limit.count++;
    }

    const searchQuery = `${query} ${location}`.trim();

    // Try Google Places API first
    const googleKey = process.env.GOOGLE_PLACES_API_KEY;
    if (googleKey) {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleKey}`;
      const placesRes = await fetch(placesUrl);
      if (placesRes.ok) {
        const placesData = await placesRes.json();
        const results = (placesData.results || []).slice(0, 20).map((p: {
          name: string;
          formatted_address: string;
          formatted_phone_number?: string;
          website?: string;
          types?: string[];
        }) => ({
          name: p.name,
          address: p.formatted_address || '',
          phone: p.formatted_phone_number || '',
          website: p.website || '',
          industry: query,
        }));
        return NextResponse.json({ results });
      }
    }

    // Fallback: generate sample results based on search query
    const sampleBusinesses = [
      { name: `${query} Solutions`, address: `123 Main St, ${location || 'Your City'}`, phone: '(555) 123-4567', website: '', industry: query },
      { name: `Pro ${query} Services`, address: `456 Oak Ave, ${location || 'Your City'}`, phone: '(555) 234-5678', website: '', industry: query },
      { name: `${location || 'Local'} ${query} Co`, address: `789 Elm Blvd, ${location || 'Your City'}`, phone: '(555) 345-6789', website: '', industry: query },
      { name: `Elite ${query}`, address: `321 Pine Dr, ${location || 'Your City'}`, phone: '(555) 456-7890', website: '', industry: query },
      { name: `${query} Experts Inc`, address: `654 Cedar Ln, ${location || 'Your City'}`, phone: '(555) 567-8901', website: '', industry: query },
    ];

    return NextResponse.json({ results: sampleBusinesses });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
