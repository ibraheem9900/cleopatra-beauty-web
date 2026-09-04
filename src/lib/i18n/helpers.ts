import en from "./en.json";
import de from "./de.json";
import et from "./et.json";
import ru from "./ru.json";
import { Language } from "../types";

const translations: Record<Language, Record<string, string>> = { en, de, et, ru };

export function getTranslation(key: string, lang: Language = "en"): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

export function t(key: string, lang: Language = "en"): string {
  return getTranslation(key, lang);
}
