import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (for API routes and server components)
let serverInstance: any = null;

export function getSupabaseServer() {
  if (!serverInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
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
