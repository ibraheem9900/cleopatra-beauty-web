#!/usr/bin/env node
/**
 * Seeds categories + the real products into Supabase.
 * Idempotent — safe to re-run.
 * Usage: node scripts/seed.mjs   (reads credentials from .env.local)
 */
import { readFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const en = JSON.parse(
  readFileSync(new URL("../src/lib/i18n/en.json", import.meta.url), "utf8")
);

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=minimal",
};

async function upsert(table, rows) {
  const res = await fetch(`${url}/rest/v1/${table}?on_conflict=id`, {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    console.error(`Seeding ${table} failed:`, await res.text());
    process.exit(1);
  }
  console.log(`✓ ${table}: ${rows.length} row(s)`);
}

const categories = [
  { id: "soaps", name: "Soaps", slug: "soaps", name_key: "filter.soaps", icon: "droplets", coming_soon: false, sort_order: 1 },
  { id: "lotions", name: "Lotions", slug: "lotions", name_key: "filter.lotions", icon: "sparkles", coming_soon: true, sort_order: 2 },
  { id: "lipCare", name: "Lip Care", slug: "lip-care", name_key: "filter.lipCare", icon: "flower2", coming_soon: true, sort_order: 3 },
  { id: "hairOils", name: "Hair Oils", slug: "hair-oils", name_key: "filter.hairOils", icon: "leaf", coming_soon: true, sort_order: 4 },
];

const products = [
  {
    id: "royal-milk-soap",
    slug: "royal-milk-soap",
    name: en["product.royalMilk.name"],
    name_key: "product.royalMilk.name",
    subtitle: en["product.royalMilk.subtitle"],
    subtitle_key: "product.royalMilk.subtitle",
    category: "soaps",
    price: 12.9,
    currency: "EUR",
    description: en["product.royalMilk.description"],
    description_key: "product.royalMilk.description",
    inci: en["product.royalMilk.inci"],
    scent_profile: en["product.royalMilk.scent"],
    usage_instructions: en["product.royalMilk.usage"],
    highlight_tags: ["Hydrating", "Nourishing", "Daily Use"],
    skin_types: ["all", "dry", "normal", "sensitive"],
    key_ingredients: ["Goat's Milk", "Honey", "Kaolin Clay"],
    images: [
      { src: "/images/royal-milk-front.jpg", alt: "Royal Milk Soap - Front view" },
      { src: "/images/royal-milk-lifestyle.jpg", alt: "Royal Milk Soap - With milk bottle" },
      { src: "/images/royal-milk-promo.png", alt: "Royal Milk Soap - Lifestyle" },
    ],
    stock: "in-stock",
    weight: "100g",
    status: "active",
    sku: "RM-100",
    view_count: 0,
  },
  {
    id: "black-pearl-charcoal-soap",
    slug: "black-pearl-charcoal-soap",
    name: en["product.blackPearl.name"],
    name_key: "product.blackPearl.name",
    subtitle: en["product.blackPearl.subtitle"],
    subtitle_key: "product.blackPearl.subtitle",
    category: "soaps",
    price: 11.9,
    currency: "EUR",
    description: en["product.blackPearl.description"],
    description_key: "product.blackPearl.description",
    inci: en["product.blackPearl.inci"],
    scent_profile: en["product.blackPearl.scent"],
    usage_instructions: en["product.blackPearl.usage"],
    highlight_tags: ["Purifying", "Detoxifying", "Refreshing"],
    skin_types: ["oily", "combination", "normal"],
    key_ingredients: ["Activated Charcoal", "Tea Tree Oil", "Eucalyptus"],
    images: [
      { src: "/images/black-pearl-front.jpg", alt: "Black Pearl Charcoal Soap - Front view" },
      { src: "/images/black-pearl-lifestyle.jpg", alt: "Black Pearl Charcoal Soap - Dark background" },
    ],
    stock: "in-stock",
    weight: "100g",
    status: "active",
    sku: "BP-200",
    view_count: 0,
  },
];

await upsert("categories", categories);
await upsert("products", products);
console.log("✓ Seed complete — 2 products + 4 categories are in the database.");