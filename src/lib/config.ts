// Central config for external services. Everything gracefully falls back to
// local dev mode when environment variables are not configured.
export const isSupabaseConfigured = (): boolean =>
  !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

export const isSupabaseServerConfigured = (): boolean =>
  isSupabaseConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isStripeConfigured = (): boolean =>
  !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
export const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Translation provider config (tried in order: LibreTranslate → Azure → Google)
export const libretranslateUrl = process.env.LIBRETRANSLATE_URL || "http://localhost:5000";
export const azureTranslatorKey = process.env.AZURE_TRANSLATOR_KEY || "";
export const azureTranslatorRegion = process.env.AZURE_TRANSLATOR_REGION || "";
export const azureTranslatorEndpoint =
  process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";
export const googleTranslateApiKey = process.env.GOOGLE_TRANSLATE_API_KEY || "";

export const adminEmail = process.env.ADMIN_EMAIL || "admin@cleopatra-beauty.de";
// Dev-mode fallback password (used only when Supabase auth is NOT configured)
export const adminDevPassword = "cleopatra2026";