import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl, isSupabaseConfigured } from "./env";

export { isSupabaseConfigured, ownerEmail, MEDIA_BUCKET } from "./env";

/** Authorisation is enforced in Postgres by RLS; this key is safe to ship. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
