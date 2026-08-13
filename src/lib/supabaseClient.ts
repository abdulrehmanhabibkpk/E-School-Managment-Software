import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const meta = import.meta as any;
  const supabaseUrl = meta.env?.VITE_SUPABASE_URL;
  const supabaseKey = meta.env?.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing. Supabase features will be disabled.');
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        // Explicitly use window.fetch if it exists to avoid polyfill issues
        fetch: (input: RequestInfo | URL, init?: RequestInit) => window.fetch(input, init)
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};
