import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

// GET /api/admin/orders — full order list (newest first)
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, orders: [] });
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db!
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ configured: true, orders: data });
}

// PATCH /api/admin/orders — { id, status?, trackingNumber? }
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const body = await request.json();
  const { id, status, trackingNumber } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, string> = {};
  if (status) updates.status = status;
  if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
  updates.updated_at = new Date().toISOString();

  const db = getSupabaseAdmin();
  const { data, error } = await db!.from("orders").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}