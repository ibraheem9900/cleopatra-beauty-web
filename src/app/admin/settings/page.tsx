"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Key, Store, Globe2, Shield } from "lucide-react";
import { useAdminStore } from "@/lib/store/admin";

export default function AdminSettingsPage() {
  const { logout } = useAdminStore();
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("Cleopatra Beauty");
  const [storeEmail, setStoreEmail] = useState("hello@cleopatra-beauty.de");
  const [storeCurrency, setStoreCurrency] = useState("EUR");
  const [vatNumber, setVatNumber] = useState("DE123456789");
  const [companyAddress, setCompanyAddress] = useState("Berlin, Germany");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Manage your store configuration.</p>
      </div>

      {/* Store Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Store className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Store Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Store Name</label>
              <input
                type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Contact Email</label>
              <input
                type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Currency</label>
              <select value={storeCurrency} onChange={(e) => setStoreCurrency(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold cursor-pointer">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Company Address</label>
              <input
                type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">VAT Number (USt-IdNr.)</label>
            <input
              type="text" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Languages</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {["🇬🇧 English", "🇩🇪 German", "🇪🇪 Estonian", "🇷🇺 Russian"].map((lang) => (
              <span key={lang} className="px-3 py-2 bg-gold/10 text-gold text-sm font-medium rounded-lg">
                {lang}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">All storefront text is translatable via i18n JSON files.</p>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Security</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Admin Password</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="••••••••"
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
              <button className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Current default: cleopatra2026</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors"
          >
            Sign out of admin panel
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-gold hover:bg-gold-light text-white hover:shadow-lg"
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Settings"}
        </motion.button>
      </div>
    </div>
  );
}
