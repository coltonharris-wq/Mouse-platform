import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (for API routes and server components)
let serverInstance: any = null;

export function getSupabaseServer() {
  if (!serverInstance) {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('mock')) {
      console.warn('[supabase-server] No valid Supabase credentials');
      return null;
    }

    serverInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return serverInstance;
}

export default getSupabaseServer;

/**
 * Direct REST-style query helper for Supabase PostgREST.
 * Used by provision.ts, usage.ts, king-mouse.ts.
 */
export async function supabaseQuery(
  table: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: Record<string, any>,
  queryString?: string
): Promise<any> {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not configured');
  }

  const url = `${supabaseUrl}/rest/v1/${table}${queryString ? `?${queryString}` : ''}`;

  const headers: Record<string, string> = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} ${table} failed: ${res.status} ${err}`);
  }

  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

/**
 * Call a Supabase RPC function.
 */
export async function supabaseRpc(
  functionName: string,
  params: Record<string, any>
): Promise<any> {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not configured');
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase RPC ${functionName} failed: ${res.status} ${err}`);
  }

  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}
