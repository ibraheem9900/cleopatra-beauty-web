"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from "@/lib/config";

// Browser-side Supabase client. Built on @supabase/ssr so the auth session is
// stored in a cookie that src/middleware.ts can validate server-side.
export function getSupabaseBrowser() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}