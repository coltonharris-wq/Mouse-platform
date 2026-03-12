import { redirect } from 'next/navigation';
import { supabaseQuery } from '@/lib/supabase-server';

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  // Look up invite link
  const links = await supabaseQuery('reseller_invite_links', 'GET', undefined,
    `code=eq.${code}&is_active=eq.true&select=*`
  );

  if (!links || links.length === 0) {
    redirect('/onboarding');
  }

  const link = links[0];

  // Increment clicks
  await supabaseQuery('reseller_invite_links', 'PATCH',
    { clicks: (link.clicks || 0) + 1 },
    `id=eq.${link.id}`
  );

  // Build redirect URL
  const params_str = new URLSearchParams();
  params_str.set('ref', code);
  if (link.pro_slug) params_str.set('pro', link.pro_slug);
  if (link.plan_slug) params_str.set('plan', link.plan_slug);

  redirect(`/onboarding?${params_str.toString()}`);
}
