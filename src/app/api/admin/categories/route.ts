import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseServerConfigured } from "@/lib/config";

// GET /api/admin/categories
export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ configured: false, categories: [] });
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db!.from("categories").select("*").order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ configured: true, categories: data });
}

// POST — create/update category
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
    .from("categories")
    .upsert(body, { onConflict: "id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ category: data });
}

// PATCH — update fields
export async function PATCH(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = getSupabaseAdmin();
  const { data, error } = await db!
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ category: data });
}

// DELETE
export async function DELETE(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = getSupabaseAdmin();
  const { error } = await db!.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}