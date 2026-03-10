/**
 * Admin auth — verify request is from platform_owner or admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Only these emails can access admin. Default: colton.harris@automioapp.com
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'colton.harris@automioapp.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function requireAdmin(request: NextRequest): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { ok: false, response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
    }

    const email = (user.email || '').toLowerCase();
    if (ADMIN_EMAILS.includes(email)) {
      return { ok: true };
    }

    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
}

export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  try {
    const session = localStorage.getItem('mouse_session');
    if (!session) return {};
    const parsed = JSON.parse(session);
    const token = localStorage.getItem('mouse_token') || parsed?.token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {}
  return {};
}
