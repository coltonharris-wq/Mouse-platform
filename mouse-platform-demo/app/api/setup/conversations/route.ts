export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * POST /api/setup/conversations
 * Creates the conversations table if it doesn't exist.
 * Uses service role key — admin only.
 */
export async function POST() {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'No database connection' }, { status: 500 });
  }

  try {
    // Try to create via RPC — first create the function, then call it
    const { error: rpcError } = await supabase.rpc('create_conversations_table');

    if (rpcError) {
      // Function doesn't exist yet — return SQL for manual execution
      return NextResponse.json({
        success: false,
        message: 'Run this SQL in Supabase SQL Editor:',
        sql: `
-- Create conversations table for King Mouse chat history
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  portal TEXT NOT NULL DEFAULT 'customer' CHECK (portal IN ('customer', 'reseller', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_portal 
  ON conversations(user_id, portal, created_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON conversations
  FOR ALL USING (true) WITH CHECK (true);
        `.trim(),
      });
    }

    return NextResponse.json({ success: true, message: 'Conversations table created' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
