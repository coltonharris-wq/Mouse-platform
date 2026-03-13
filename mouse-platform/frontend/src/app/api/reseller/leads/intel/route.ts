import { NextRequest, NextResponse } from 'next/server';

// Cache intel for 24 hours
const intelCache = new Map<string, { data: unknown; expires: number }>();

export async function GET(request: NextRequest) {
  try {
    const placeId = request.nextUrl.searchParams.get('place_id');
    if (!placeId) {
      return NextResponse.json({ error: 'place_id required' }, { status: 400 });
    }

    const now = Date.now();
    const cached = intelCache.get(placeId);
    if (cached && cached.expires > now) {
      return NextResponse.json(cached.data);
    }

    const googleKey = process.env.GOOGLE_PLACES_API_KEY;
    const kimiKey = process.env.KIMI_API_KEY;

    if (!googleKey) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
    }

    // Fetch place details
    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,reviews,types&key=${googleKey}`;
    const detailRes = await fetch(detailUrl);
    if (!detailRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 502 });
    }

    const detailData = await detailRes.json();
    const place = detailData.result || {};
    const reviews = (place.reviews || []).slice(0, 5);

    // Scrape website
    let siteTitle = '';
    let siteDesc = '';
    let hasChatWidget = false;
    let hasBooking = false;
    let hasContactForm = false;
    const socialLinks: Record<string, string> = {};

    if (place.website) {
      try {
        const siteRes = await fetch(place.website, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MouseBot/1.0)', Accept: 'text/html' },
          signal: AbortSignal.timeout(5000),
        });
        const html = (await siteRes.text()).slice(0, 50000);

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        siteTitle = titleMatch?.[1]?.trim() || '';
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        siteDesc = metaMatch?.[1]?.trim() || '';

        hasChatWidget = ['intercom', 'drift', 'livechat', 'tidio', 'zendesk', 'hubspot', 'crisp', 'tawk'].some((w) => html.toLowerCase().includes(w));
        hasBooking = ['calendly', 'acuity', 'vagaro', 'booksy', 'fresha', 'simplybook', 'book-now'].some((w) => html.toLowerCase().includes(w));
        hasContactForm = /<form[^>]*>/i.test(html) && (/type=["']email["']/i.test(html) || /type=["']tel["']/i.test(html));

        const fbMatch = html.match(/href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s]+)["']/i);
        if (fbMatch) socialLinks.facebook = fbMatch[1];
        const igMatch = html.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s]+)["']/i);
        if (igMatch) socialLinks.instagram = igMatch[1];
      } catch { /* skip scraping errors */ }
    }

    // Kimi K2.5 analysis
    let intel: Record<string, unknown> = {};
    if (kimiKey) {
      try {
        const reviewsText = reviews.map((r: { author_name: string; rating: number; text: string }) =>
          `${r.author_name} (${r.rating}*): ${r.text?.slice(0, 150)}`
        ).join(' | ');

        const res = await fetch('https://api.moonshot.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${kimiKey}` },
          body: JSON.stringify({
            model: 'kimi-k2-0711',
            messages: [
              { role: 'system', content: 'You are a B2B sales intelligence analyst. Return ONLY valid JSON, no markdown.' },
              {
                role: 'user',
                content: `Analyze this business for a reseller selling AI tools (AI receptionist, lead gen funnels, AI operations manager).

Business: ${place.name}
Address: ${place.formatted_address}
Phone: ${place.formatted_phone_number || 'N/A'}
Website: ${place.website || 'None'}
Rating: ${place.rating} (${place.user_ratings_total} reviews)
Hours: ${place.opening_hours?.weekday_text?.join(', ') || 'N/A'}
Types: ${(place.types || []).join(', ')}
Reviews: ${reviewsText}
Website Title: ${siteTitle || 'N/A'}
Has Chat: ${hasChatWidget}, Has Booking: ${hasBooking}, Has Form: ${hasContactForm}
Social: ${Object.entries(socialLinks).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None'}

Return JSON: { owner_name, owner_source, estimated_employees, estimated_revenue, years_in_business, sales_angles[], pain_points[], gatekeeper_strategy, best_call_time, suggested_pitch, current_tools[], missing_tools[], recommended_products[], estimated_value, website_quality, social_activity, google_response_rate }`,
              },
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || '';
          const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          intel = JSON.parse(cleaned);
        }
      } catch { /* skip intel errors */ }
    }

    const result = {
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      rating: place.rating || 0,
      review_count: place.user_ratings_total || 0,
      hours: place.opening_hours?.weekday_text?.join(', ') || '',
      online_presence: {
        google_rating: place.rating || 0,
        google_reviews: place.user_ratings_total || 0,
        google_response_rate: (intel.google_response_rate as string) || 'unknown',
        has_website: !!place.website,
        website_quality: (intel.website_quality as string) || 'basic',
        has_online_booking: hasBooking,
        has_chat_widget: hasChatWidget,
        has_contact_form: hasContactForm,
        facebook_url: socialLinks.facebook || null,
        yelp_url: null,
        instagram_url: socialLinks.instagram || null,
        social_activity: (intel.social_activity as string) || 'Unknown',
      },
      intel: {
        estimated_employees: (intel.estimated_employees as string) || 'Unknown',
        estimated_revenue: (intel.estimated_revenue as string) || 'Unknown',
        owner_name: (intel.owner_name as string) || null,
        owner_source: (intel.owner_source as string) || null,
        owner_linkedin: null,
        decision_maker: null,
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

    intelCache.set(placeId, { data: result, expires: now + 86400000 });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
