import { NextRequest, NextResponse } from "next/server";
import { adminDevPassword, isSupabaseConfigured } from "@/lib/config";

/**
 * Dev-mode fallback login. Only active when Supabase auth is NOT configured.
 * Real deployments use Supabase Auth from the /admin/login page directly.
 */
export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase auth is configured — use Supabase login" }, { status: 400 });
  }
  const { password } = await request.json();
  if (password === adminDevPassword) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("cleopatra_admin_dev", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8, // 8h session
    });
    return res;
  }
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("cleopatra_admin_dev", "", { path: "/", maxAge: 0 });
  return res;
}