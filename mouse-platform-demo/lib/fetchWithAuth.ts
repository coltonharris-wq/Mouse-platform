/**
 * Fetch with auth headers. On 401, clears session and redirects to login.
 * Use for all authenticated API calls from dashboard/portal.
 */

import { getAuthHeaders } from './admin-auth';

function clearSessionAndRedirect() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('mouse_session');
    localStorage.removeItem('mouse_token');
    window.location.href = '/login?expired=1';
  } catch {}
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const authHeaders = getAuthHeaders();
  if (authHeaders && typeof authHeaders === 'object' && 'Authorization' in authHeaders) {
    headers.set('Authorization', (authHeaders as Record<string, string>).Authorization);
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    clearSessionAndRedirect();
    throw new Error('Session expired');
  }

  return res;
}
