import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { business_name, industry, city, services, usps } = await request.json();

    if (!business_name || !industry) {
      return NextResponse.json({ error: 'business_name and industry are required' }, { status: 400 });
    }

    const kimiKey = process.env.KIMI_API_KEY;
    if (!kimiKey) {
      return NextResponse.json({ error: 'KIMI_API_KEY not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${kimiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2-0711',
        messages: [
          {
            role: 'system',
            content: 'You are an expert ad copywriter for local service businesses. Return ONLY valid JSON, no markdown fences.',
          },
          {
            role: 'user',
            content: `Generate ad copy for a ${industry} business called ${business_name} in ${city || 'their local area'}.

Services: ${(services || []).join(', ')}
Unique Selling Points: ${(usps || []).join(', ')}

Return JSON:
{
  "google": {
    "headlines": ["3 headlines, max 30 chars each, focus on urgency, local, trust"],
    "descriptions": ["2 descriptions, max 90 chars each"]
  },
  "facebook": "1 Facebook ad post, 3-4 sentences, emoji okay, hook with pain point, present solution, clear CTA",
  "instagram": "1 Instagram ad, 1-2 sentences + CTA + 5 relevant hashtags"
}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[GENERATE_ADS] Kimi error:', errText);
      return NextResponse.json({ error: 'Ad copy generation failed' }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse ad copy response' }, { status: 502 });
    }

    return NextResponse.json({
      google: parsed.google || { headlines: [], descriptions: [] },
      facebook: parsed.facebook || '',
      instagram: parsed.instagram || '',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
