"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  Mail,
  TrendingUp,
  AlertTriangle,
  Eye,
  BarChart3,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

interface DashboardStats {
  configured: boolean;
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  signupCount: number;
  topSelling: { productId: string; name: string; qty: number; revenue: number }[];
  mostViewed: { productId: string; name: string; viewCount: number }[];
  recentOrders: any[];
  lowStock: any[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  // Realtime refresh for the dashboard
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => fetch("/api/admin/stats").then((r) => r.json()).then(setStats)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    { label: "Total Products", value: stats?.productCount ?? 0, icon: Package, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/products" },
    { label: "Total Orders", value: stats?.orderCount ?? 0, icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50", href: "/admin/orders" },
    { label: "Revenue", value: formatPrice(stats?.totalRevenue ?? 0), icon: TrendingUp, color: "text-gold", bg: "bg-gold/10", href: "/admin/orders" },
    { label: "Newsletter Signups", value: stats?.signupCount ?? 0, icon: Mail, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/newsletter" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {stats?.configured === false
              ? "Supabase is not configured — data will appear once you add your credentials."
              : "Real-time store overview."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={stat.href}
              className="block p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "…" : stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders — real data */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-gold hover:text-gold-dark font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="px-5 py-6 text-sm text-gray-400">Loading orders…</p>
            ) : (stats?.recentOrders?.length || 0) === 0 ? (
              <div className="px-5 py-12 text-center">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500 font-medium mb-1">No orders yet</p>
                <p className="text-xs text-gray-400">Completed checkouts will show up here in real time.</p>
              </div>
            ) : (
              stats!.recentOrders!.map((order) => (
                <div key={order.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 font-mono">{order.order_number}</p>
                    <p className="text-xs text-gray-500 truncate">{order.customer_name} — {order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(Number(order.total))}</p>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full capitalize ${statusColors[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics: Most Viewed */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold" />
              Most Viewed
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : (stats?.mostViewed?.length || 0) === 0 ? (
              <p className="text-sm text-gray-500">
                No views yet. Product page visits are tracked automatically.
              </p>
            ) : (
              <div className="space-y-3">
                {stats!.mostViewed!.map((p) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.viewCount} views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling — from real completed orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              Top Selling Products
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : (stats?.topSelling?.length || 0) === 0 ? (
              <p className="text-sm text-gray-500">
                No sales yet. Products sold through checkout will rank here by quantity.
              </p>
            ) : (
              <div className="space-y-4">
                {stats!.topSelling!.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-4">
                    <span className="w-6 text-sm font-bold text-gray-300">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.qty} sold · {formatPrice(p.revenue)}</p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                          style={{ width: `${Math.max(8, (p.qty / Math.max(1, stats!.topSelling![0].qty)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stock Alerts
            </h2>
          </div>
          <div className="p-5">
            {(stats?.lowStock?.length || 0) === 0 ? (
              <p className="text-sm text-gray-500">All products are in stock.</p>
            ) : (
              <div className="space-y-3">
                {stats!.lowStock!.map((product: any) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className={`text-xs capitalize ${product.stock === "out-of-stock" ? "text-red-500" : "text-amber-600"}`}>
                        {String(product.stock).replace("-", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}