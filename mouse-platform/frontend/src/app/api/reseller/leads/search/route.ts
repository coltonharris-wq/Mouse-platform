import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

// In-memory cache (1 hour TTL)
const searchCache = new Map<string, { data: unknown; expires: number }>();

interface PlaceResult {
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  place_id?: string;
  types?: string[];
  opening_hours?: { open_now?: boolean; weekday_text?: string[] };
  reviews?: { author_name: string; rating: number; text: string; relative_time_description: string }[];
}

// Website scraping helpers
function extractFromHtml(html: string): {
  title: string;
  metaDesc: string;
  hasChatWidget: boolean;
  hasBooking: boolean;
  hasContactForm: boolean;
  socialLinks: Record<string, string>;
} {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

  const chatWidgets = ['intercom', 'drift', 'livechat', 'tidio', 'zendesk', 'hubspot', 'crisp', 'tawk'];
  const hasChatWidget = chatWidgets.some((w) => html.toLowerCase().includes(w));

  const bookingWidgets = ['calendly', 'acuity', 'square appointments', 'vagaro', 'booksy', 'fresha', 'simplybook', 'booking-widget', 'book-now', 'schedule-appointment'];
  const hasBooking = bookingWidgets.some((w) => html.toLowerCase().includes(w));

  const hasContactForm = /<form[^>]*>/i.test(html) && (/type=["']email["']/i.test(html) || /type=["']tel["']/i.test(html));

  const socialLinks: Record<string, string> = {};
  const fbMatch = html.match(/href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s]+)["']/i);
  if (fbMatch) socialLinks.facebook = fbMatch[1];
  const igMatch = html.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s]+)["']/i);
  if (igMatch) socialLinks.instagram = igMatch[1];
  const ypMatch = html.match(/href=["'](https?:\/\/(?:www\.)?yelp\.com\/[^"'\s]+)["']/i);
  if (ypMatch) socialLinks.yelp = ypMatch[1];

  return {
    title: titleMatch?.[1]?.trim() || '',
    metaDesc: metaMatch?.[1]?.trim() || '',
    hasChatWidget,
    hasBooking,
    hasContactForm,
    socialLinks,
  };
}

async function scrapeWebsite(url: string): Promise<ReturnType<typeof extractFromHtml> | null> {
  try {
    let fullUrl = url;
    if (!fullUrl.startsWith('http')) fullUrl = 'https://' + fullUrl;
    const res = await fetch(fullUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MouseBot/1.0)', Accept: 'text/html' },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    return extractFromHtml(html.slice(0, 50000));
  } catch {
    return null;
  }
}

async function analyzeWithKimi(businesses: {
  name: string; address: string; phone: string; website: string;
  rating: number; review_count: number; hours: string; types: string[];
  reviews_text: string; siteData: ReturnType<typeof extractFromHtml> | null;
}[]): Promise<Record<string, unknown>[]> {
  const kimiKey = process.env.KIMI_API_KEY;
  if (!kimiKey || businesses.length === 0) return businesses.map(() => ({}));

  // Batch analyze — send all businesses in one call for efficiency
  const businessDescriptions = businesses.map((b, i) => {
    const site = b.siteData;
    return `Business ${i + 1}: ${b.name}
Address: ${b.address}
Phone: ${b.phone}
Website: ${b.website}
Google Rating: ${b.rating} (${b.review_count} reviews)
Hours: ${b.hours}
Types: ${b.types.join(', ')}
Recent Reviews: ${b.reviews_text}
Website Title: ${site?.title || 'N/A'}
Website Description: ${site?.metaDesc || 'N/A'}
Has Chat Widget: ${site?.hasChatWidget || false}
Has Online Booking: ${site?.hasBooking || false}
Has Contact Form: ${site?.hasContactForm || false}
Social Links: ${site ? Object.entries(site.socialLinks).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None found' : 'N/A'}`;
  }).join('\n\n---\n\n');

  try {
    const res = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${kimiKey}` },
      body: JSON.stringify({
        model: 'kimi-k2-0711',
        messages: [
          {
            role: 'system',
            content: 'You are a B2B sales intelligence analyst. Generate sales intelligence for a reseller selling AI business tools (AI receptionist that answers calls 24/7, lead generation funnels, AI operations manager). Return ONLY valid JSON array, no markdown fences.',
          },
          {
            role: 'user',
            content: `Analyze these ${businesses.length} businesses and return a JSON array with one object per business. Each object must have:
{
  "owner_name": "extracted or null",
  "owner_source": "where you found it or null",
  "estimated_employees": "~X employees",
  "estimated_revenue": "$XK-$XM/year",
  "years_in_business": "Est. YYYY or unknown",
  "sales_angles": ["3-5 specific angles based on their gaps"],
  "pain_points": ["what is probably frustrating them"],
  "gatekeeper_strategy": "specific tactic for this business type",
  "best_call_time": "when to call",
  "suggested_pitch": "3-4 sentences ready to say on the phone, personalized",
  "current_tools": ["detected tools from website"],
  "missing_tools": ["tools they need: AI receptionist, online booking, review management, lead gen"],
  "recommended_products": ["receptionist", "lead_funnel", "king_mouse"],
  "estimated_value": "$X/month potential",
  "website_quality": "basic|modern|professional|outdated|none",
  "social_activity": "Active|Inactive X weeks|No social presence",
  "google_response_rate": "X% of reviews|rarely responds|unknown"
}

${businessDescriptions}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) return businesses.map(() => ({}));

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return businesses.map(() => ({}));
  }
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query') || '';
    const location = request.nextUrl.searchParams.get('location') || '';
    const resellerId = request.nextUrl.searchParams.get('reseller_id') || 'anon';
    const minRating = Number(request.nextUrl.searchParams.get('min_rating') || '0');
    const maxResults = Math.min(Number(request.nextUrl.searchParams.get('max_results') || '20'), 50);

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

    // Check cache
    const cacheKey = `${query}|${location}|${minRating}`;
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expires > now) {
      return NextResponse.json(cached.data);
    }

    const searchQuery = `${query} ${location}`.trim();
    const googleKey = process.env.GOOGLE_PLACES_API_KEY;

    let places: PlaceResult[] = [];

    // Step 1: Google Places Text Search
    if (googleKey) {
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleKey}`;
        const placesRes = await fetch(placesUrl);
        if (placesRes.ok) {
          const placesData = await placesRes.json();
          places = (placesData.results || []).slice(0, maxResults);
        }
      } catch { /* fallback below */ }
    }

    // Step 2: Place Details enrichment (top 10)
    const enrichedPlaces: (PlaceResult & { details_reviews?: PlaceResult['reviews'] })[] = [];
    if (googleKey && places.length > 0) {
      const detailPromises = places.slice(0, 10).map(async (p) => {
        if (!p.place_id) return p;
        try {
          const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=formatted_phone_number,website,opening_hours,reviews&key=${googleKey}`;
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const result = detailData.result || {};
            return {
              ...p,
              formatted_phone_number: result.formatted_phone_number || p.formatted_phone_number,
              website: result.website || p.website,
              opening_hours: result.opening_hours || p.opening_hours,
              details_reviews: (result.reviews || []).slice(0, 5),
            };
          }
        } catch { /* skip */ }
        return p;
      });
      enrichedPlaces.push(...(await Promise.all(detailPromises)));
      // Add remaining places without detail enrichment
      enrichedPlaces.push(...places.slice(10));
    } else {
      enrichedPlaces.push(...places);
    }

    // Filter by rating
    const filtered = minRating > 0
      ? enrichedPlaces.filter((p) => (p.rating || 0) >= minRating)
      : enrichedPlaces;

    // Step 3: Website scraping (parallel, top 10)
    const siteDataMap = new Map<number, ReturnType<typeof extractFromHtml> | null>();
    const scrapePromises = filtered.slice(0, 10).map(async (p, i) => {
      if (p.website) {
        siteDataMap.set(i, await scrapeWebsite(p.website));
      }
    });
    await Promise.all(scrapePromises);

    // Step 4: Kimi K2.5 Intelligence Analysis
    const businessesForAnalysis = filtered.slice(0, 10).map((p, i) => {
      const reviews = (p as PlaceResult & { details_reviews?: PlaceResult['reviews'] }).details_reviews || [];
      return {
        name: p.name,
        address: p.formatted_address || '',
        phone: p.formatted_phone_number || '',
        website: p.website || '',
        rating: p.rating || 0,
        review_count: p.user_ratings_total || 0,
        hours: p.opening_hours?.weekday_text?.join(', ') || '',
        types: p.types || [],
        reviews_text: reviews.map((r) => `${r.author_name} (${r.rating}*): ${r.text?.slice(0, 100)}`).join(' | '),
        siteData: siteDataMap.get(i) || null,
      };
    });

    const intelResults = await analyzeWithKimi(businessesForAnalysis);

    // Build final results
    const results = filtered.map((p, i) => {
      const intel = (intelResults[i] || {}) as Record<string, unknown>;
      const siteData = siteDataMap.get(i);

      return {
        name: p.name,
        address: p.formatted_address || '',
        phone: p.formatted_phone_number || '',
        website: p.website || '',
        rating: p.rating || 0,
        review_count: p.user_ratings_total || 0,
        place_id: p.place_id || '',
        industry: query,
        business_types: p.types || [],
        hours: p.opening_hours?.weekday_text?.join(', ') || '',
        is_open_now: p.opening_hours?.open_now || false,
        online_presence: {
          google_rating: p.rating || 0,
          google_reviews: p.user_ratings_total || 0,
          google_response_rate: (intel.google_response_rate as string) || 'unknown',
          has_website: !!p.website,
          website_quality: (intel.website_quality as string) || (p.website ? 'basic' : 'none'),
          has_online_booking: siteData?.hasBooking || false,
          has_chat_widget: siteData?.hasChatWidget || false,
          has_contact_form: siteData?.hasContactForm || false,
          facebook_url: siteData?.socialLinks?.facebook || null,
          yelp_url: siteData?.socialLinks?.yelp || null,
          instagram_url: siteData?.socialLinks?.instagram || null,
          social_activity: (intel.social_activity as string) || 'Unknown',
        },
        intel: {
          estimated_employees: (intel.estimated_employees as string) || 'Unknown',
          estimated_revenue: (intel.estimated_revenue as string) || 'Unknown',
          owner_name: (intel.owner_name as string) || null,
          owner_source: (intel.owner_source as string) || null,
          owner_linkedin: (intel.owner_linkedin as string) || null,
          decision_maker: (intel.decision_maker as string) || null,
          years_in_business: (intel.years_in_business as string) || null,
          sales_angles: (intel.sales_angles as string[]) || [],
          pain_points: (intel.pain_points as string[]) || [],
          gatekeeper_strategy: (intel.gatekeeper_strategy as string) || '',
          best_call_time: (intel.best_call_time as string) || '',
          suggested_pitch: (intel.suggested_pitch as string) || '',
          current_tools: (intel.current_tools as string[]) || [],
          missing_tools: (intel.missing_tools as string[]) || [],
          recommended_products: (intel.recommended_products as string[]) || [],
          estimated_value: (intel.estimated_value as string) || '',
        },
      };
    });

    // Fallback if no Google API key
    if (results.length === 0 && !googleKey) {
      const fallback = [
        { name: `${query} Solutions`, address: `123 Main St, ${location || 'Your City'}` },
        { name: `Pro ${query} Services`, address: `456 Oak Ave, ${location || 'Your City'}` },
        { name: `Elite ${query}`, address: `789 Elm Blvd, ${location || 'Your City'}` },
      ].map((f) => ({
        ...f,
        phone: '', website: '', rating: 0, review_count: 0, place_id: '',
        industry: query, business_types: [], hours: '', is_open_now: false,
        online_presence: {
          google_rating: 0, google_reviews: 0, google_response_rate: 'unknown',
          has_website: false, website_quality: 'none' as const, has_online_booking: false,
          has_chat_widget: false, has_contact_form: false,
          facebook_url: null, yelp_url: null, instagram_url: null, social_activity: 'Unknown',
        },
        intel: {
          estimated_employees: 'Unknown', estimated_revenue: 'Unknown',
          owner_name: null, owner_source: null, owner_linkedin: null,
          decision_maker: null, years_in_business: null,
          sales_angles: [], pain_points: [], gatekeeper_strategy: '',
          best_call_time: '', suggested_pitch: '', current_tools: [],
          missing_tools: [], recommended_products: [], estimated_value: '',
        },
      }));
      const response = { results: fallback };
      searchCache.set(cacheKey, { data: response, expires: now + 3600000 });
      return NextResponse.json(response);
    }

    const response = { results };
    searchCache.set(cacheKey, { data: response, expires: now + 3600000 });
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
