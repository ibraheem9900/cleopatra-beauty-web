"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Globe2, FileText, Layout, MessageSquare } from "lucide-react";
import { useAdminStore } from "@/lib/store/admin";

type ContentSection = "homepage" | "legal";

const homepageFields = [
  { key: "hero.tagline", label: "Hero Tagline", type: "text" },
  { key: "hero.subtitle", label: "Hero Subtitle", type: "textarea" },
  { key: "hero.shopNow", label: "Hero CTA Button", type: "text" },
  { key: "hero.cta", label: "Hero Secondary CTA", type: "text" },
  { key: "about.intro.title", label: "About Section Title", type: "text" },
  { key: "about.intro.text", label: "About Section Text", type: "textarea" },
  { key: "comingSoon.title", label: "Coming Soon Badge", type: "text" },
  { key: "comingSoon.subtitle", label: "Coming Soon Title", type: "text" },
];

const legalFields = [
  { key: "footer.impressum", label: "Impressum Link Text", type: "text" },
  { key: "footer.privacy", label: "Privacy Policy Link Text", type: "text" },
  { key: "footer.terms", label: "Terms & Conditions Link Text", type: "text" },
  { key: "footer.shippingPolicy", label: "Shipping Policy Link Text", type: "text" },
];

export default function AdminContentPage() {
  const { content, updateContent } = useAdminStore();
  const [activeSection, setActiveSection] = useState<ContentSection>("homepage");
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [saved, setSaved] = useState(false);

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "German", flag: "🇩🇪" },
    { code: "et", label: "Estonian", flag: "🇪🇪" },
    { code: "ru", label: "Russian", flag: "🇷🇺" },
  ];

  const fields = activeSection === "homepage" ? homepageFields : legalFields;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1">Content Management</h1>
        <p className="text-sm text-gray-500">Edit homepage, about, and legal page content without code changes.</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveSection("homepage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeSection === "homepage" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Layout className="w-4 h-4" />
          Homepage
        </button>
        <button
          onClick={() => setActiveSection("legal")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeSection === "legal" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          Legal Pages
        </button>
      </div>

      {/* Language selector */}
      <div className="flex items-center gap-2">
        <Globe2 className="w-4 h-4 text-gray-400" />
        <p className="text-xs text-gray-500 mr-1">Editing:</p>
        <div className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setActiveLanguage(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeLanguage === lang.code
                  ? "bg-gold text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Fields */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <MessageSquare className="w-3 h-3" />
          Editing content for <strong className="text-gray-600">{activeLanguage.toUpperCase()}</strong> language.
          Missing translations will fall back to English.
        </p>
        <div className="space-y-5">
          {fields.map((field) => {
            const contentKey = `${activeLanguage}.${field.key}`;
            const value = content[contentKey] || content[field.key] || "";
            return (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{field.label}</label>
                <p className="text-[10px] text-gray-400 mb-1 font-mono">{field.key}</p>
                {field.type === "textarea" ? (
                  <textarea
                    value={value}
                    onChange={(e) => updateContent(contentKey, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateContent(contentKey, e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
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
            {saved ? "Saved!" : "Save Changes"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
