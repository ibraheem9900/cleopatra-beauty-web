import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

/**
 * GET /api/admin/stats — real analytics from Supabase.
 * Protected by middleware (admin session required).
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      productCount: 0,
      orderCount: 0,
      totalRevenue: 0,
      signupCount: 0,
      topSelling: [],
      mostViewed: [],
      recentOrders: [],
      lowStock: [],
    });
  }

  const db = getSupabaseAdmin();

  const [products, orders, signups] = await Promise.all([
    db!.from("products").select("id, name, price, stock, view_count, images").order("created_at"),
    db!.from("orders").select("*").order("created_at", { ascending: false }),
    db!.from("newsletter_signups").select("count", { count: "exact", head: true }),
  ]);

  const productCount = products.data?.length || 0;
  const activeOrders = (orders.data || []).filter((o: any) => o.status !== "cancelled");
  const orderCount = orders.data?.length || 0;
  const totalRevenue = activeOrders.reduce(
    (sum: number, o: any) => sum + (o.payment_status === "paid" || o.payment_status === "dev" ? Number(o.total) : 0),
    0
  );
  const signupCount = signups.count || 0;

  // Top selling: by completed order quantity (real orders)
  const salesMap = new Map<string, { name: string; qty: number; revenue: number }>();
  (orders.data || []).forEach((o: any) => {
    if (o.status === "cancelled") return;
    (o.items || []).forEach((i: any) => {
      const cur = salesMap.get(i.productId) || { name: i.name, qty: 0, revenue: 0 };
      cur.qty += i.quantity;
      cur.revenue += i.quantity * i.price;
      salesMap.set(i.productId, cur);
    });
  });
  const topSelling = Array.from(salesMap.entries())
    .map(([id, v]) => ({ productId: id, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Most viewed: denormalized view_count + events
  const mostViewed = (products.data || [])
    .map((p: any) => ({
      productId: p.id,
      name: p.name,
      viewCount: Number(p.view_count) || 0,
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  const lowStock = (products.data || []).filter(
    (p: any) => p.stock === "low-stock" || p.stock === "out-of-stock"
  );

  return NextResponse.json({
    configured: true,
    productCount,
    orderCount,
    totalRevenue,
    signupCount,
    topSelling,
    mostViewed,
    recentOrders: (orders.data || []).slice(0, 8),
    lowStock,
  });
}