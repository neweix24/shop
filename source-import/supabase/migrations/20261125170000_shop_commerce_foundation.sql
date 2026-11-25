-- Shop-owned commerce data in the existing Neweix Supabase project.
-- Additive only: does not modify Account, Eixon, or Supreme tables.
create extension if not exists pgcrypto;

create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  currency char(3) not null default 'BDT' check (currency = 'BDT'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.shop_products(id) on delete restrict,
  sku text not null unique,
  title text not null,
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, title)
);

create table if not exists public.shop_inventory (
  variant_id uuid primary key references public.shop_product_variants(id) on delete restrict,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0 and quantity_reserved <= quantity_on_hand),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_customer_addresses (
  id uuid primary key default gen_random_uuid(),
  account_user_id uuid not null references auth.users(id) on delete restrict,
  recipient_name text not null,
  phone text not null,
  division text not null,
  district text not null,
  upazila text not null,
  union_or_area text,
  address_line text not null,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shop_customer_addresses_owner_idx on public.shop_customer_addresses(account_user_id);

create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  account_user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','processing','packed','shipped','delivered','cancelled','refunded','manual_review')),
  currency char(3) not null default 'BDT' check (currency = 'BDT'),
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  delivery_fee_minor bigint not null default 0 check (delivery_fee_minor >= 0),
  total_minor bigint not null check (total_minor >= 0 and total_minor = subtotal_minor + delivery_fee_minor),
  delivery_address jsonb not null,
  customer_note text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(account_user_id, idempotency_key)
);
create index if not exists shop_orders_owner_created_idx on public.shop_orders(account_user_id, created_at desc);

create table if not exists public.shop_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete restrict,
  variant_id uuid not null references public.shop_product_variants(id) on delete restrict,
  sku_snapshot text not null,
  product_title_snapshot text not null,
  variant_title_snapshot text not null,
  quantity integer not null check (quantity > 0 and quantity <= 100),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  line_total_minor bigint not null check (line_total_minor = unit_price_minor * quantity),
  created_at timestamptz not null default now()
);
create index if not exists shop_order_items_order_idx on public.shop_order_items(order_id);

create table if not exists public.shop_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete restrict,
  provider text not null default 'eixon' check (provider = 'eixon'),
  provider_reference text unique,
  status text not null default 'pending' check (status in ('pending','verified','failed','cancelled','refunded','manual_review')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'BDT' check (currency = 'BDT'),
  idempotency_key text not null unique,
  provider_payload jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shop_payment_attempts_order_idx on public.shop_payment_attempts(order_id);

create table if not exists public.shop_delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.shop_orders(id) on delete restrict,
  provider text not null default 'pathao' check (provider in ('pathao','manual')),
  provider_reference text unique,
  status text not null default 'pending' check (status in ('pending','quoted','booked','picked_up','in_transit','delivered','failed','manual_review')),
  quote_amount_minor bigint check (quote_amount_minor is null or quote_amount_minor >= 0),
  quote_expires_at timestamptz,
  tracking_url text,
  provider_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists shop_order_events_order_created_idx on public.shop_order_events(order_id, created_at);

create table if not exists public.shop_returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete restrict,
  account_user_id uuid not null references auth.users(id) on delete restrict,
  reason text not null,
  status text not null default 'requested' check (status in ('requested','approved','rejected','received','refunded','closed')),
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shop_returns_owner_idx on public.shop_returns(account_user_id, created_at desc);

-- All business mutations are server-only. Browser roles get read-only catalog and
-- owner-scoped reads; order creation/payment/inventory require a trusted server API.
alter table public.shop_products enable row level security;
alter table public.shop_product_variants enable row level security;
alter table public.shop_inventory enable row level security;
alter table public.shop_customer_addresses enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_order_items enable row level security;
alter table public.shop_payment_attempts enable row level security;
alter table public.shop_delivery_jobs enable row level security;
alter table public.shop_order_events enable row level security;
alter table public.shop_returns enable row level security;

drop policy if exists shop_products_public_active_read on public.shop_products;
create policy shop_products_public_active_read on public.shop_products
  for select to anon, authenticated using (status = 'active');
drop policy if exists shop_variants_public_active_read on public.shop_product_variants;
create policy shop_variants_public_active_read on public.shop_product_variants
  for select to anon, authenticated using (
    is_active and exists (
      select 1 from public.shop_products p
      where p.id = product_id and p.status = 'active'
    )
  );

drop policy if exists shop_addresses_owner_read on public.shop_customer_addresses;
create policy shop_addresses_owner_read on public.shop_customer_addresses
  for select to authenticated using (account_user_id = auth.uid());
drop policy if exists shop_orders_owner_read on public.shop_orders;
create policy shop_orders_owner_read on public.shop_orders
  for select to authenticated using (account_user_id = auth.uid());
drop policy if exists shop_order_items_owner_read on public.shop_order_items;
create policy shop_order_items_owner_read on public.shop_order_items
  for select to authenticated using (
    exists (select 1 from public.shop_orders o where o.id = order_id and o.account_user_id = auth.uid())
  );
drop policy if exists shop_order_events_owner_read on public.shop_order_events;
create policy shop_order_events_owner_read on public.shop_order_events
  for select to authenticated using (
    exists (select 1 from public.shop_orders o where o.id = order_id and o.account_user_id = auth.uid())
  );
drop policy if exists shop_returns_owner_read on public.shop_returns;
create policy shop_returns_owner_read on public.shop_returns
  for select to authenticated using (account_user_id = auth.uid());

-- No client-side INSERT/UPDATE/DELETE policies are granted for financial,
-- inventory, order, delivery, or payment records. Service-role server operations
-- must still validate Account identity and provider signatures.
