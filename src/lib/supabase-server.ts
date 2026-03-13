import { createClient } from '@supabase/supabase-js';

// Client avec service_role — bypasse RLS, uniquement côté serveur
export function createServerSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Client avec anon key — pour Supabase Auth (signInWithPassword)
export function createAnonSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
}
