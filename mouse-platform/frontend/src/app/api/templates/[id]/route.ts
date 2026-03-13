/**
 * GET /api/templates/[id]
 * Returns full template for a specific niche.
 * Tries Supabase first, falls back to local defaults.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';
import { defaultTemplates } from '@/data/default-templates';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try Supabase first
  try {
    const templates = await supabaseQuery(
      'pro_templates',
      'GET',
      undefined,
      `id=eq.${encodeURIComponent(id)}&select=*&limit=1`
    );
    if (templates && templates.length > 0) {
      return NextResponse.json(templates[0]);
    }
  } catch {
    // Fall through to local defaults
  }

  // Fallback to local defaults
  const template = defaultTemplates.find((t) => t.id === id);
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json(template);
}
