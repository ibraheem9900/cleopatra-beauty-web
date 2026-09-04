import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  isSupabaseServerConfigured,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
} from "@/lib/config";

// Server-side client with the anon key (respects RLS; used for public reads/writes
// like product views and newsletter signups).
export function getSupabaseServer() {
  if (!isSupabaseConfigured()) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Privileged client with the service role key — bypasses RLS. NEVER import this
// into client components; only use it inside API routes / server code.
export function getSupabaseAdmin() {
  if (!isSupabaseServerConfigured()) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}