/**
 * Environment flags with no SDK import, so the public experience never pulls
 * the database client into its bundle when no backend is configured.
 */
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const ownerEmail = (import.meta.env.VITE_OWNER_EMAIL as string | undefined)?.toLowerCase();
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const MEDIA_BUCKET = "media";
