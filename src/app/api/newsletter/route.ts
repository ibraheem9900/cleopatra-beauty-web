import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

// POST /api/newsletter  { email, source }
// Public endpoint — RLS allows anonymous inserts into newsletter_signups.
export async function POST(request: NextRequest) {
  const { email, source = "website" } = await request.json().catch(() => ({}));
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Dev mode: accept silently (no persistence until Supabase is added)
    return NextResponse.json({ ok: true, dev: true });
  }

  const db = getSupabaseServer();
  const { error } = await db!
    .from("newsletter_signups")
    .upsert({ email: email.toLowerCase(), source }, { onConflict: "email" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}