export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ success: false, data: [] });
  }

  try {
    const { data, error } = await supabase
      .from('resellers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Resellers fetch error:', error);
    return NextResponse.json({ success: false, data: [], error: error.message });
  }
}
