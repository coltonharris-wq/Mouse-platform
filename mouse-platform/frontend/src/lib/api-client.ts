export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = typeof window !== 'undefined'
    ? sessionStorage.getItem('access_token')
    : null;
  const headers = new Headers(options?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers });
}
