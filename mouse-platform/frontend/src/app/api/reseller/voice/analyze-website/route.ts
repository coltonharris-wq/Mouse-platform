import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    // Fetch the website HTML
    let html: string;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MouseBot/1.0)',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(15000),
      });
      html = await res.text();
    } catch {
      return NextResponse.json(
        { error: 'Could not fetch the website. Check the URL and try again.' },
        { status: 422 }
      );
    }

    // Truncate HTML to avoid exceeding token limits
    const truncated = html.slice(0, 30000);

    // Send to Kimi K2.5 for extraction
    const kimiKey = process.env.KIMI_API_KEY;
    if (!kimiKey) {
      return NextResponse.json({ error: 'KIMI_API_KEY not configured' }, { status: 500 });
    }

    const kimiRes = await fetch('https://api.moonshot.ai/v1/chat/completions', {
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
            content: 'You extract structured business information from website HTML. Return ONLY valid JSON, no markdown fences.',
          },
          {
            role: 'user',
            content: `Extract from this website HTML the following fields. Return a JSON object with these keys:
- business_name (string)
- hours (string, e.g. "Mon-Fri: 9AM-5PM, Sat: 10AM-2PM")
- services (string[], list of main services)
- phone (string or null)
- address (string or null)
- industry (string, e.g. "Restaurant", "Plumbing", "Dental")
- suggested_greeting (string, a friendly phone greeting using the business name)

If a field cannot be determined, use null or empty array. Here is the HTML:

${truncated}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!kimiRes.ok) {
      const errText = await kimiRes.text();
      console.error('[ANALYZE_WEBSITE] Kimi error:', errText);
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 });
    }

    const kimiData = await kimiRes.json();
    const content = kimiData.choices?.[0]?.message?.content || '';

    // Parse JSON from the response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[ANALYZE_WEBSITE] Failed to parse Kimi response:', content);
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 502 });
    }

    return NextResponse.json({
      business_name: parsed.business_name || null,
      hours: parsed.hours || null,
      services: parsed.services || [],
      phone: parsed.phone || null,
      address: parsed.address || null,
      industry: parsed.industry || null,
      suggested_greeting: parsed.suggested_greeting || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[ANALYZE_WEBSITE]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
