/**
 * Supabase Server Client - Service role for API routes
 */

interface SupabaseConfig {
  url: string;
  serviceKey: string;
  anonKey: string;
}

function getConfig(): SupabaseConfig {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

export async function supabaseQuery(
  table: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  filters?: string
): Promise<any> {
  const { url, serviceKey } = getConfig();
  const endpoint = `${url}/rest/v1/${table}${filters ? `?${filters}` : ''}`;

  const res = await fetch(endpoint, {
    method,
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  return null;
}

export async function supabaseRpc(fn: string, params: any = {}): Promise<any> {
  const { url, serviceKey } = getConfig();

  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase RPC ${res.status}: ${text}`);
  }

  return res.json();
}
