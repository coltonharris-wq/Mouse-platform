/**
 * GET /api/templates
 * Returns all available pro templates (light version for dropdowns/selectors).
 * Tries Supabase first, falls back to local defaults.
 */

import { NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { defaultTemplates } from '@/data/default-templates';

export async function GET() {
  try {
    const templates = await supabaseQuery(
      'pro_templates',
      'GET',
      undefined,
      'active=eq.true&select=*'
    );
    if (templates && templates.length > 0) {
      return NextResponse.json({ templates, source: 'database' });
    }
  } catch {
    // Supabase not available or table doesn't exist — fall through
  }

  // Fallback to local defaults
  return NextResponse.json({ templates: defaultTemplates, source: 'local' });
}
