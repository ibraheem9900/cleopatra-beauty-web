import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

// POST /api/analytics/view  { productId }
// Records a product view (fire-and-forget from the product page).
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, dev: true }); // silently no-op in dev
  }
  try {
    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    const db = getSupabaseServer();
    await db!.from("analytics_events").insert({
      product_id: productId,
      event_type: "view",
    });
    // Denormalized counter for fast "most viewed" queries
    await db!
      .from("products")
      .update({ view_count: (await db!.from("products").select("view_count").eq("id", productId).single()).data?.view_count + 1 || 1 })
      .eq("id", productId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("analytics/view error:", err);
    return NextResponse.json({ ok: true, dev: true });
  }
}