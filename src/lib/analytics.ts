"use client";

// Fire-and-forget analytics events. Never blocks the UI; silently no-ops
// when Supabase is not configured.

export function trackProductView(productId: string) {
  try {
    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function trackAddToCart(productId: string) {
  try {
    fetch("/api/analytics/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}