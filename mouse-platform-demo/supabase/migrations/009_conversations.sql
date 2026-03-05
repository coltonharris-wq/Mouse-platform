-- V9: Conversations table for King Mouse per-user chat history
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  portal TEXT NOT NULL DEFAULT 'customer' CHECK (portal IN ('customer', 'reseller', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast history lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_portal ON conversations(user_id, portal, created_at DESC);

-- RLS: service role has full access (API routes use service key)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON conversations
  FOR ALL USING (true) WITH CHECK (true);
