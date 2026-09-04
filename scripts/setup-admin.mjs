#!/usr/bin/env node
/**
 * Creates the Cleopatra admin account in Supabase Auth and grants admin access.
 *
 * Usage:
 *   node scripts/setup-admin.mjs
 * (reads NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL,
 *  ADMIN_PASSWORD from .env.local)
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
const email = process.env.ADMIN_EMAIL || "admin@cleopatra-beauty.de";
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!password) {
  console.error("Missing ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

console.log(`Creating admin account: ${email}`);

// 1. Create (or fetch) the auth user
const listRes = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers });
const list = await listRes.json();
let user = (list.users || []).find((u) => u.email === email);

let userId = user?.id;
if (!user) {
  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const created = await createRes.json();
  if (!createRes.ok) {
    console.error("createUser failed:", JSON.stringify(created));
    process.exit(1);
  }
  userId = created.id;
  console.log("Admin auth user created.");
} else {
  console.log("Admin auth user already exists.");
}

// 2. Grant admin access (insert into admin_users)
const upsertRes = await fetch(`${url}/rest/v1/admin_users?on_conflict=user_id`, {
  method: "POST",
  headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify({ user_id: userId, email }),
});
if (!upsertRes.ok) {
  console.error("Could not grant admin access:", await upsertRes.text());
  process.exit(1);
}

console.log("✓ Admin account ready. Sign in at /admin/login with:");
console.log(`  Email:    ${email}`);
console.log(`  Password: ${"*".repeat(String(password).length)}`);