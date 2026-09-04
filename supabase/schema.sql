-- ============================================================
-- Cleopatra Beauty — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)
-- ============================================================

-- ---------- Categories ----------
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  name_key text,
  icon text,
  coming_soon boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  name_key text,
  subtitle text,
  subtitle_key text,
  category text references public.categories(id),
  price numeric not null,
  currency text default 'EUR',
  description text,
  description_key text,
  inci text,
  scent_profile text,
  usage_instructions text,
  highlight_tags text[] default '{}',
  skin_types text[] default '{}',
  key_ingredients text[] default '{}',
  images jsonb default '[]',
  stock text default 'in-stock',
  weight text,
  status text default 'active',
  sku text,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Customers ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz default now()
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references public.customers(id),
  customer_name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  postal_code text,
  country text default 'Germany',
  items jsonb default '[]',
  shipping_method text,
  shipping_cost numeric default 0,
  subtotal numeric default 0,
  total numeric not null,
  payment_method text,
  payment_status text default 'pending',
  stripe_payment_intent_id text,
  status text default 'pending',
  tracking_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Order items (analytics + history) ----------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id text references public.products(id),
  product_name text,
  quantity int not null,
  price numeric not null,
  created_at timestamptz default now()
);

-- ---------- Analytics events (views, add-to-cart, purchases) ----------
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  product_id text references public.products(id) on delete cascade,
  event_type text not null,           -- view | add_to_cart | purchase
  session_id text,
  created_at timestamptz default now()
);
create index if not exists analytics_events_product_idx on public.analytics_events (product_id, event_type);

-- ---------- Newsletter signups ----------
create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz default now()
);

-- ---------- Translation cache (live translation) ----------
create table if not exists public.translations (
  id bigint generated always as identity primary key,
  source_text text not null,
  target_lang text not null,
  translated_text text not null,
  provider text,
  created_at timestamptz default now(),
  unique (source_text, target_lang)
);

-- ---------- Admin users (admin access control) ----------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customers enable row level security;
alter table public.analytics_events enable row level security;
alter table public.newsletter_signups enable row level security;
alter table public.translations enable row level security;
alter table public.admin_users enable row level security;

-- Admin check: a user is an admin if their auth.uid() is in admin_users
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Categories: public read, admin write
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- Products: public read (active only), admin write
create policy "products_public_read" on public.products for select using (status = 'active' or public.is_admin());
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Orders: admin only (never public)
create policy "orders_admin_all" on public.orders for all using (public.is_admin()) with check (public.is_admin());

-- Order items: admin only
create policy "order_items_admin_all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- Customers: admin only
create policy "customers_admin_all" on public.customers for all using (public.is_admin()) with check (public.is_admin());

-- Analytics: anyone may record events (tracking), only admins may read
create policy "analytics_public_insert" on public.analytics_events for insert with check (true);
create policy "analytics_admin_read" on public.analytics_events for select using (public.is_admin());

-- Newsletter: anyone may sign up, only admins may read
create policy "newsletter_public_insert" on public.newsletter_signups for insert with check (true);
create policy "newsletter_admin_read" on public.newsletter_signups for select using (public.is_admin());

-- Translations: public read (cache is harmless), admin write
create policy "translations_public_read" on public.translations for select using (true);
create policy "translations_admin_write" on public.translations for all using (public.is_admin()) with check (public.is_admin());

-- Admin users: admin only
create policy "admin_users_admin_all" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Realtime: new orders appear in the admin panel instantly
-- ============================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.analytics_events;