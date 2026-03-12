import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'dashboard', 'demo', 'help', 'join',
  'login', 'logout', 'marketplace', 'mouse', 'mice', 'onboarding',
  'pricing', 'register', 'reseller', 'settings', 'signup', 'support',
  'terms', 'privacy', 'billing', 'status', 'health', 'docs',
  'king-mouse', 'kingmouse', 'receptionist', 'voice', 'lead-finder',
  'task-log', 'businesses', 'analytics', 'invite', 'ref',
];

function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.length < 3) return { valid: false, error: 'Slug must be at least 3 characters' };
  if (slug.length > 30) return { valid: false, error: 'Slug must be 30 characters or less' };
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length > 2) {
    return { valid: false, error: 'Slug must be lowercase alphanumeric with hyphens, cannot start/end with hyphen' };
  }
  if (/[^a-z0-9-]/.test(slug)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return { valid: false, error: 'This slug is reserved' };
  }
  return { valid: true };
}

// GET — Check slug availability
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug')?.toLowerCase().trim();
    if (!slug) {
      return NextResponse.json({ error: 'slug parameter required' }, { status: 400 });
    }

    const validation = validateSlug(slug);
    if (!validation.valid) {
      return NextResponse.json({ available: false, slug, reason: validation.error });
    }

    const existing = await supabaseQuery(
      'resellers', 'GET', undefined,
      `brand_slug=eq.${slug}&select=id&limit=1`
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ available: false, slug, reason: 'Already taken' });
    }

    return NextResponse.json({ available: true, slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — Register/update brand slug
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reseller_id, slug, display_name, logo_url, color, tagline } = body;

    if (!reseller_id || !slug) {
      return NextResponse.json({ error: 'reseller_id and slug required' }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    const validation = validateSlug(normalizedSlug);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if slug is taken by another reseller
    const existing = await supabaseQuery(
      'resellers', 'GET', undefined,
      `brand_slug=eq.${normalizedSlug}&select=id&limit=1`
    );

    if (existing && existing.length > 0 && existing[0].id !== reseller_id) {
      return NextResponse.json({ error: 'Slug already taken by another reseller' }, { status: 409 });
    }

    // Update reseller brand info
    await supabaseQuery('resellers', 'PATCH', {
      brand_slug: normalizedSlug,
      brand_display_name: display_name || null,
      brand_logo_url: logo_url || null,
      brand_color: color || '#0F6B6E',
      brand_tagline: tagline || null,
    }, `id=eq.${reseller_id}`);

    const customerDomain = process.env.NEXT_PUBLIC_CUSTOMER_DOMAIN || 'mouse.is';
    const brandUrl = `https://${customerDomain}/${normalizedSlug}`;

    return NextResponse.json({
      success: true,
      brand: {
        slug: normalizedSlug,
        display_name: display_name || null,
        url: brandUrl,
        color: color || '#0F6B6E',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
