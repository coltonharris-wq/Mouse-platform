import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const SETTINGS_TABLE = 'platform_settings';

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('*')
      .limit(100);

    if (error) {
      // Table might not exist yet — return empty defaults
      console.warn('[settings] GET error:', error.message);
      return NextResponse.json({ settings: {} });
    }

    // Convert rows [{key, value}] to {key: value}
    const settings: Record<string, any> = {};
    for (const row of data || []) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }

    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error('[settings] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'settings object required' }, { status: 400 });
    }

    // Ensure table exists (create if not)
    // Try upsert each key-value pair
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert(upserts, { onConflict: 'key' });

    if (error) {
      // If table doesn't exist, create it and retry
      if (error.message.includes('does not exist') || error.code === '42P01') {
        // Create the table via RPC or raw SQL
        await supabase.rpc('exec_sql', {
          sql: `CREATE TABLE IF NOT EXISTS ${SETTINGS_TABLE} (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL DEFAULT '{}',
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );`,
        });
        // Retry upsert
        const { error: retryError } = await supabase
          .from(SETTINGS_TABLE)
          .upsert(upserts, { onConflict: 'key' });
        if (retryError) {
          console.error('[settings] retry upsert error:', retryError);
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
      } else {
        console.error('[settings] upsert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, saved: Object.keys(settings).length });
  } catch (err: any) {
    console.error('[settings] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
