import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const resellerId = request.nextUrl.searchParams.get('reseller_id');
    if (!resellerId) {
      return NextResponse.json({ error: 'reseller_id required' }, { status: 400 });
    }

    const leads = await supabaseQuery(
      'saved_leads', 'GET', undefined,
      `reseller_id=eq.${resellerId}&order=created_at.desc&select=*`
    ) || [];

    // Build CSV
    const headers = ['Company Name', 'Industry', 'Location', 'Phone', 'Email', 'Website', 'Status', 'Source', 'Notes', 'Created'];
    const rows = leads.map((l: {
      company_name: string; industry: string; location: string; phone: string;
      email: string; website: string; status: string; source: string; notes: string; created_at: string;
    }) => [
      l.company_name || '',
      l.industry || '',
      l.location || '',
      l.phone || '',
      l.email || '',
      l.website || '',
      l.status || '',
      l.source || '',
      (l.notes || '').replace(/"/g, '""'),
      l.created_at ? new Date(l.created_at).toLocaleDateString() : '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r: string[]) => r.map((c: string) => `"${c}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
