"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, X, Truck, Package, ShoppingBag, RefreshCw } from "lucide-react";
import { useAdminStore, AdminOrder } from "@/lib/store/admin";
import { formatPrice } from "@/lib/utils";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

const statusOptions: AdminOrder["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const paymentColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  dev: "bg-gray-100 text-gray-600",
};

export default function AdminOrdersPage() {
  const { orders, loadOrders, updateOrderStatus, updateOrderTracking } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Load real orders from the database (middleware guards this route server-side)
  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, [loadOrders]);

  // Realtime: new orders appear instantly (when Supabase is configured)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const refresh = useCallback(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, [loadOrders]);

  const filteredOrders = orders
    .filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (o.order_number || "").toLowerCase().includes(q) ||
        (o.customer_name || "").toLowerCase().includes(q) ||
        (o.email || "").toLowerCase().includes(q);
      const matchesStatus = !filterStatus || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1">Orders</h1>
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${orders.length} order${orders.length === 1 ? "" : "s"} total`}
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2 text-gray-400 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold cursor-pointer"
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-mono font-medium text-gray-900">{order.order_number}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {Array.isArray(order.items) ? order.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0} items
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{formatPrice(Number(order.total))}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full capitalize ${paymentColors[order.payment_status] || "bg-gray-100 text-gray-600"}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => { setSelectedOrder(order); setTrackingInput(order.tracking_number || ""); }}
                      className="p-2 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gold/5"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredOrders.length === 0 && (
          <div className="p-14 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium mb-1">No orders yet</p>
            <p className="text-sm text-gray-400">
              Orders placed through the checkout will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-[80] p-4 pt-8 overflow-y-auto"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full shadow-xl mb-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-serif text-lg text-gray-900">{selectedOrder.order_number}</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Customer info */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                  {selectedOrder.phone && <p className="text-sm text-gray-500">{selectedOrder.phone}</p>}
                  {selectedOrder.address && (
                    <p className="text-sm text-gray-500">
                      {selectedOrder.address}, {selectedOrder.postal_code} {selectedOrder.city}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Items</h3>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{item.name}</span>
                          <span className="text-xs text-gray-500">×{item.quantity}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">Total</span>
                    <span className="text-sm font-semibold text-gray-900">{formatPrice(Number(selectedOrder.total))}</span>
                  </div>
                </div>

                {/* Shipping & Payment */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shipping</h3>
                    <p className="text-sm text-gray-700 capitalize">{selectedOrder.shipping_method || "—"}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Payment</h3>
                    <p className="text-sm text-gray-700 capitalize">{selectedOrder.payment_method || "—"}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Pay Status</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full capitalize ${paymentColors[selectedOrder.payment_status] || "bg-gray-100 text-gray-600"}`}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>

                {/* Status update */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateOrderStatus(selectedOrder.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                          selectedOrder.status === s
                            ? `${statusColors[s]} ring-2 ring-offset-1 ring-current`
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking number */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tracking Number</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Enter tracking number..."
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                    />
                    <button
                      onClick={() => updateOrderTracking(selectedOrder.id, trackingInput)}
                      className="px-4 py-2 bg-gold hover:bg-gold-light text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                  {selectedOrder.tracking_number && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Current: <span className="font-mono">{selectedOrder.tracking_number}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}