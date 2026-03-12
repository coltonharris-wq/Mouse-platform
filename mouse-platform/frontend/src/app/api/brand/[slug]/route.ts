import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

// GET /api/brand/[slug] — Public brand info lookup
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const rows = await supabaseQuery(
      'resellers', 'GET', undefined,
      `brand_slug=eq.${slug}&select=brand_slug,brand_display_name,brand_logo_url,brand_color,brand_tagline&limit=1`
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ found: false });
    }

    const r = rows[0];
    return NextResponse.json({
      found: true,
      brand: {
        slug: r.brand_slug,
        display_name: r.brand_display_name || r.brand_slug,
        logo_url: r.brand_logo_url || null,
        color: r.brand_color || '#0F6B6E',
        tagline: r.brand_tagline || null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
