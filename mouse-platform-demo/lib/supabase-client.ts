import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton instance - use any to avoid type issues with mock
let supabaseInstance: any = null;

export function createClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Always return mock during build or when credentials are missing
    if (typeof window === 'undefined' || !supabaseUrl || !supabaseKey || supabaseUrl.length < 10) {
      console.warn('Supabase credentials not configured or in build phase, using mock data');
      return createMockClient();
    }
    
    try {
      supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
        },
      });
    } catch (error) {
      console.warn('Failed to create Supabase client, using mock:', error);
      return createMockClient();
    }
  }
  return supabaseInstance;
}

// Mock client fallback for development
function createMockClient() {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Mock mode' } }),
          order: () => ({ data: [], error: null }),
        }),
        order: () => ({ data: [], error: null }),
        ilike: () => ({ data: [], error: null }),
        or: () => ({ data: [], error: null }),
      }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as any;
}

export default createClient;
