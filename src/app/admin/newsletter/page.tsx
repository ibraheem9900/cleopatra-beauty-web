"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Search, Mail, Users, Calendar, Inbox } from "lucide-react";
import { useAdminStore } from "@/lib/store/admin";

export default function AdminNewsletterPage() {
  const { newsletterSignups, loadNewsletterSignups } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewsletterSignups().finally(() => setLoading(false));
  }, [loadNewsletterSignups]);

  const filtered = newsletterSignups.filter((s) =>
    (s.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    window.location.href = "/api/admin/newsletter?format=csv";
  };

  const thisMonthCount = newsletterSignups.filter((s) => {
    if (!s.created_at && !s.date) return false;
    const d = new Date(s.created_at || s.date || "");
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1">Newsletter Signups</h1>
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${newsletterSignups.length} subscribers`}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-white font-medium rounded-xl text-sm transition-all hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </motion.button>
      </div>

      {/* Stats — real counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Signups</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? "…" : newsletterSignups.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? "…" : thisMonthCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Sources</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "…" : new Set(newsletterSignups.map((s) => s.source).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((signup) => (
                <tr key={signup.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600">
                        {(signup.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900">{signup.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Date(signup.created_at || signup.date || "").toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                      {signup.source || "website"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="p-14 text-center">
            <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium mb-1">No signups yet</p>
            <p className="text-sm text-gray-400">
              Emails collected from the homepage and footer signup forms will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}