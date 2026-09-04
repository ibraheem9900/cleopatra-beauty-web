import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

// GET /api/admin/newsletter?format=csv
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const empty = { configured: false, signups: [] };
    if (request.nextUrl.searchParams.get("format") === "csv") {
      return new NextResponse("email,source,date\n", {
        headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=newsletter.csv" },
      });
    }
    return NextResponse.json(empty);
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db!
    .from("newsletter_signups")
    .select("email, source, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const signups = data || [];

  if (request.nextUrl.searchParams.get("format") === "csv") {
    const rows = signups.map((s: any) =>
      [s.email, s.source || "", new Date(s.created_at).toISOString().slice(0, 10)].join(",")
    );
    const csv = `email,source,date\n${rows.join("\n")}\n`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=newsletter-signups.csv",
      },
    });
  }

  return NextResponse.json({ configured: true, signups });
}