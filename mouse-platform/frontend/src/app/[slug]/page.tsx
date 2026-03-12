import { notFound } from 'next/navigation';
import BrandedLanding from '@/components/branded/BrandedLanding';
import { supabaseQuery } from '@/lib/supabase-server';

const KNOWN_ROUTES = [
  'dashboard', 'reseller', 'onboarding', 'admin', 'marketplace',
  'pricing', 'join', 'api', '_next', 'favicon.ico',
];

export default async function BrandedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Safety net: skip known routes
  if (KNOWN_ROUTES.includes(slug) || slug.startsWith('_')) {
    notFound();
  }

  // Look up brand directly from DB (server component — no fetch needed)
  const rows = await supabaseQuery(
    'resellers', 'GET', undefined,
    `brand_slug=eq.${slug}&select=brand_slug,brand_display_name,brand_logo_url,brand_color,brand_tagline&limit=1`
  );

  if (!rows || rows.length === 0) {
    notFound();
  }

  const r = rows[0];
  const brand = {
    slug: r.brand_slug,
    display_name: r.brand_display_name || r.brand_slug,
    logo_url: r.brand_logo_url || null,
    color: r.brand_color || '#0F6B6E',
    tagline: r.brand_tagline || null,
  };

  return <BrandedLanding brand={brand} slug={slug} />;
}
