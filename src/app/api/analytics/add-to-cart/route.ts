import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

// POST /api/analytics/add-to-cart  { productId }
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, dev: true });
  }
  try {
    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    const db = getSupabaseServer();
    await db!.from("analytics_events").insert({
      product_id: productId,
      event_type: "add_to_cart",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("analytics/add-to-cart error:", err);
    return NextResponse.json({ ok: true, dev: true });
  }
}