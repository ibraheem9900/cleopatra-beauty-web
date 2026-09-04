"use client";
import { create } from "zustand";
import { Language } from "../types";
import en from "./en.json";
import de from "./de.json";
import et from "./et.json";
import ru from "./ru.json";
import { allDynamicTexts } from "@/data/content";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

const staticTranslations: Record<Language, Record<string, string>> = {
  en,
  de,
  et,
  ru,
};

// ---------- Persistent caches (localStorage) ----------
const CACHE_KEY = "cleopatra-translations"; // keyed static overrides
const DYNAMIC_CACHE_KEY = "cleopatra-dynamic-translations"; // sourceText -> translated

type TranslationCache = Partial<Record<Language, Record<string, string>>>;
type DynamicCache = Partial<Record<Language, Record<string, string>>>;

function loadCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// ---------- Dynamic text corpus (everything not covered by static keys) ----------
function productTexts(): string[] {
  const out: string[] = [];
  for (const p of products) {
    out.push(p.name, p.subtitle, p.description, p.inci, p.scentProfile, p.usageInstructions);
    out.push(...p.highlightTags, ...p.keyIngredients, ...p.skinTypes);
  }
  for (const c of categories) out.push(c.name);
  return out.filter(Boolean);
}

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  /** Live-translate an arbitrary English string (cached per language) */
  translateText: (text: string) => string;
  /** Trigger live translation of the whole dynamic corpus */
  translateAll: () => Promise<void>;
  isTranslating: boolean;
  /** Bumped when the dynamic cache updates so consumers re-render */
  dynamicVersion: number;
}

export const useLanguageStore = create<LanguageState>((set, get) => {
  // `t` reads the live language but must receive a NEW identity whenever the
  // language changes — zustand only re-renders `s => s.t` subscribers when the
  // selected reference actually changes.
  const buildT = (): LanguageState["t"] => (key: string) => {
    const lang = get().language;
    return staticTranslations[lang]?.[key] || staticTranslations.en[key] || key;
  };

  return {
    language: "en",
    isTranslating: false,
    dynamicVersion: 0,
    t: buildT(),

    setLanguage: (lang: Language) => {
      set({ language: lang, t: buildT() });
      if (lang !== "en") {
        get().translateAll();
      }
    },

  translateText: (text: string) => {
    if (!text || get().language === "en") return text;
    const cache = loadCache<DynamicCache>(DYNAMIC_CACHE_KEY, {});
    return cache[get().language]?.[text] || text; // fallback: English
  },

  translateAll: async () => {
    const lang = get().language;
    if (lang === "en") return;

    set({ isTranslating: true });
    try {
      // Collect the full dynamic corpus (deduped)
      const corpus = Array.from(new Set([...allDynamicTexts, ...productTexts()]));
      const cache = loadCache<DynamicCache>(DYNAMIC_CACHE_KEY, {});
      const existing = cache[lang] || {};
      const missing = corpus.filter((text) => !existing[text] && text.trim());

      if (missing.length > 0) {
        const texts: Record<string, string> = {};
        missing.forEach((text, i) => {
          texts[`t${i}`] = text;
        });

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts, targetLang: lang, sourceLang: "en" }),
        });

        if (res.ok) {
          const data = await res.json();
          const translations = data?.translations || {};
          const updated: DynamicCache = { ...cache, [lang]: { ...existing } };
          Object.entries(translations).forEach(([key, value]) => {
            const source = texts[key];
            if (source && value) updated[lang]![source] = value as string;
          });
          saveCache(DYNAMIC_CACHE_KEY, updated);
        }
      }

      set({ isTranslating: false, dynamicVersion: get().dynamicVersion + 1 });
    } catch (err) {
      console.warn("Live translation failed, using English fallback:", err);
      set({ isTranslating: false });
    }
  },
  };
});

/** Hook for components rendering arbitrary dynamic strings. */
export function useTranslatedText(text: string): string {
  const translateText = useLanguageStore((s) => s.translateText);
  useLanguageStore((s) => s.language);
  useLanguageStore((s) => s.dynamicVersion);
  return translateText(text);
}