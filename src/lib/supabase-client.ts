import { createClient } from '@supabase/supabase-js';

// Singleton — one instance per browser tab
let _client: ReturnType<typeof createClient> | null = null;

// detectSessionInUrl: false prevents Supabase from calling history.replaceState
// to clean the hash, which Next.js App Router intercepts as a navigation and
// cancels any pending fetch requests (breaking the token exchange flow).
export function createBrowserSupabase() {
  if (typeof window === 'undefined') {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { detectSessionInUrl: false } }
    );
  }
  return _client;
}
