import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseServerConfigured } from "@/lib/config";

// GET /api/admin/products — all products (admin sees drafts too)
export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ configured: false, products: [] });
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db!.from("products").select("*").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ configured: true, products: data });
}

// POST /api/admin/products — create (upsert by id so edits never duplicate)
export async function POST(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const body = await request.json();
  if (!body?.id || !body?.name) {
    return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db!
    .from("products")
    .upsert(body, { onConflict: "id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// PATCH /api/admin/products — { id, ...updates }
export async function PATCH(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = getSupabaseAdmin();
  const { data, error } = await db!
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// DELETE /api/admin/products — soft delete (keeps order history intact)
export async function DELETE(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = getSupabaseAdmin();
  const { error } = await db!
    .from("products")
    .update({ status: "draft", stock: "out-of-stock", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}