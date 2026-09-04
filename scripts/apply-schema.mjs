#!/usr/bin/env node
/**
 * Applies supabase/schema.sql to the project using the Supabase Management API.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-schema.mjs
 */
import { readFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const projectRef = new URL(url).hostname.split(".")[0];

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN env var (starts with sbp_).");
  process.exit(1);
}
if (!projectRef) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

console.log(`Applying schema to project ${projectRef} …`);
const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`Schema apply FAILED (${res.status}):`, text.slice(0, 2000));
  process.exit(1);
}
console.log(`✓ Schema applied (${res.status})`);
if (text.trim()) console.log("Response:", text.slice(0, 500));