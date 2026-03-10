/**
 * Safe JSON parsing for API request bodies.
 * Handles empty body, malformed JSON, and non-object body.
 */

export async function safeParseJson<T = Record<string, unknown>>(
  request: Request
): Promise<{ data: T; error?: string }> {
  try {
    const text = await request.text();
    if (!text || text.trim() === '') {
      return { data: {} as T };
    }
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null) {
      return { data: {} as T, error: 'Request body must be a JSON object' };
    }
    return { data: parsed as T };
  } catch {
    return { data: {} as T, error: 'Invalid JSON in request body' };
  }
}
