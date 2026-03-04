import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resellerId = searchParams.get('resellerId');

    // If resellerId provided, try Python backend first
    if (resellerId) {
      try {
        const response = await fetch(`${API_URL}/reseller/my-customers/${resellerId}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall through to Supabase
      }
    }

    // Fetch from Supabase directly
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ customers: data });
      }
    }

    // No data available
    return NextResponse.json({ customers: [] });
  } catch (error: any) {
    console.error('Reseller customers error:', error);
    return NextResponse.json({ customers: [] });
  }
}
