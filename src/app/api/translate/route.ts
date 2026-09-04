import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  azureTranslatorKey,
  azureTranslatorRegion,
  azureTranslatorEndpoint,
  googleTranslateApiKey,
  libretranslateUrl,
} from "@/lib/config";

/**
 * Live translation API.
 *
 * Providers are tried in this order (all free):
 *   1. Self-hosted LibreTranslate (LIBRETRANSLATE_URL)
 *   2. Azure Translator free tier (AZURE_TRANSLATOR_KEY)
 *   3. Google Cloud Translation API (GOOGLE_TRANSLATE_API_KEY)
 *
 * Results are cached in the Supabase `translations` table (and in memory) so
 * repeat content is never re-translated. Falls back to the original English
 * text if every provider fails or none is configured.
 */

const memoryCache = new Map<string, string>(); // "lang::text" -> translated
const SUPPORTED_LANGS = ["de", "et", "ru"];

// ---------- Providers ----------

async function translateLibreTranslate(texts: string[], target: string): Promise<string[] | null> {
  const res = await fetch(`${libretranslateUrl.replace(/\/$/, "")}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source: "en",
      target,
      format: "text",
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const data = await res.json();
  // LibreTranslate returns { translatedText } for a string, or { translatedText: [] } array form
  if (Array.isArray(data?.translatedText)) {
    return data.translatedText.map((t: string) => t || "");
  }
  if (typeof data?.translatedText === "string") {
    return texts.map(() => data.translatedText);
  }
  return null;
}

async function translateAzure(texts: string[], target: string): Promise<string[] | null> {
  const headers: Record<string, string> = {
    "Ocp-Apim-Subscription-Key": azureTranslatorKey,
    "Content-Type": "application/json",
  };
  if (azureTranslatorRegion) headers["Ocp-Apim-Subscription-Region"] = azureTranslatorRegion;
  const res = await fetch(`${azureTranslatorEndpoint}/translate?api-version=3.0&from=en&to=${target}`, {
    method: "POST",
    headers,
    body: JSON.stringify(texts.map((text) => ({ text }))),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const data = await res.json();
  return data.map((d: any) => d?.translations?.[0]?.text || "");
}

async function translateGoogle(texts: string[], target: string): Promise<string[] | null> {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: texts, target, source: "en", format: "text" }),
      signal: AbortSignal.timeout(8000),
    }
  ).catch(() => null);
  if (!res || !res.ok) return null;
  const data = await res.json();
  return (data?.data?.translations || []).map((t: any) => t?.translatedText || "");
}

// ---------- Main translation function ----------

async function translateBatch(
  texts: string[],
  targetLang: string,
  provider: string | null
): Promise<string[]> {
  const results: string[] = new Array(texts.length);
  const toTranslate: { index: number; text: string }[] = [];

  texts.forEach((text, i) => {
    const cacheKey = `${targetLang}::${text}`;
    if (memoryCache.has(cacheKey)) {
      results[i] = memoryCache.get(cacheKey)!;
    } else if (!text.trim()) {
      results[i] = text;
    } else {
      toTranslate.push({ index: i, text });
    }
  });

  if (toTranslate.length === 0) return results;

  const textsToTranslate = toTranslate.map((t) => t.text);
  let translated: string[] | null = null;

  // Try providers in order
  if (translated === null) translated = await translateLibreTranslate(textsToTranslate, targetLang);
  if (translated === null) translated = await translateAzure(textsToTranslate, targetLang);
  if (translated === null) translated = await translateGoogle(textsToTranslate, targetLang);

  // Persist to Supabase cache when configured
  const db = getSupabaseAdmin();
  if (db) {
    const rows = toTranslate
      .map((t, i) => ({
        source_text: t.text,
        target_lang: targetLang,
        translated_text: translated?.[i] || t.text,
        provider: provider || (translated ? "auto" : "none"),
      }))
      .filter((r) => r.translated_text !== r.source_text);
    if (rows.length > 0) {
      try {
        await db.from("translations").upsert(rows, { onConflict: "source_text,target_lang" });
      } catch {}
    }
  }

  toTranslate.forEach(({ index, text }, i) => {
    const value = translated?.[i]?.trim() ? translated[i] : text; // fallback: English
    results[index] = value;
    memoryCache.set(`${targetLang}::${text}`, value);
  });

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang") || "de";
  if (!text) return NextResponse.json({ error: "Missing 'text' parameter" }, { status: 400 });
  const [translated] = await translateBatch([text], lang, null);
  return NextResponse.json({ translated, original: text, lang });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts, targetLang = "de", sourceLang = "en" } = body;

    if (!texts || typeof texts !== "object") {
      return NextResponse.json({ error: "Missing 'texts' object" }, { status: 400 });
    }
    if (!SUPPORTED_LANGS.includes(targetLang)) {
      return NextResponse.json({ translations: texts, lang: targetLang });
    }

    // Also serve from the Supabase translation cache first
    const db = getSupabaseAdmin();
    const keys = Object.keys(texts);
    const values = keys.map((k) => texts[k]);
    const result: Record<string, string> = {};
    const missing: { key: string; value: string }[] = [];

    if (db) {
      const { data: cached } = await db
        .from("translations")
        .select("source_text, translated_text")
        .in("source_text", values)
        .eq("target_lang", targetLang);
      const cacheMap = new Map(
        (cached || []).map((c: any) => [c.source_text, c.translated_text])
      );
      values.forEach((value, i) => {
        if (cacheMap.has(value)) result[keys[i]] = cacheMap.get(value)!;
        else missing.push({ key: keys[i], value });
      });
    } else {
      values.forEach((value, i) => missing.push({ key: keys[i], value }));
    }

    if (missing.length > 0) {
      const translated = await translateBatch(
        missing.map((m) => m.value),
        targetLang,
        body.provider || null
      );
      missing.forEach((m, i) => {
        result[m.key] = translated[i];
      });
    }

    return NextResponse.json({ translations: result, lang: targetLang, sourceLang });
  } catch (err) {
    console.error("Translate API error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}