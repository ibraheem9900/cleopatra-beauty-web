"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguageStore } from "@/lib/i18n/store";
import { Language } from "@/lib/types";

const languages: { code: Language; name: string; nativeName: string; short: string }[] = [
  { code: "en", name: "English", nativeName: "English", short: "EN" },
  { code: "de", name: "German", nativeName: "Deutsch", short: "DE" },
  { code: "et", name: "Estonian", nativeName: "Eesti", short: "ET" },
  { code: "ru", name: "Russian", nativeName: "Русский", short: "RU" },
];

interface Props {
  mobile?: boolean;
}

export default function LanguageSwitcher({ mobile }: Props) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, isTranslating } = useLanguageStore();
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (mobile) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted tracking-wide uppercase mb-1">Language</p>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                language === lang.code
                  ? "bg-gold text-white"
                  : "bg-cream-dark text-foreground hover:bg-warm-beige"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-warm-beige text-foreground text-[10px] font-semibold flex items-center justify-center">
                {lang.short}
              </span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-foreground/80 hover:bg-warm-beige/50 transition-colors"
        aria-label="Change language"
      >
        <span className="w-6 h-6 rounded-full bg-warm-beige text-foreground text-[10px] font-semibold flex items-center justify-center">
          {current.short}
        </span>
        <span className="hidden sm:inline text-xs tracking-wide uppercase">
          {current.code}
        </span>
        {isTranslating && (
          <span className="w-3 h-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-warm-beige/50 overflow-hidden z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  language === lang.code
                    ? "bg-gold/10 text-gold font-medium"
                    : "text-foreground hover:bg-cream-dark"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-warm-beige text-foreground text-[10px] font-semibold flex items-center justify-center">
                  {lang.short}
                </span>
                <span>{lang.nativeName}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
