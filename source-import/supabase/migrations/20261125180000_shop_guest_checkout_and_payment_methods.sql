-- Restore the previously approved guest-checkout and payment-method contract.
alter table public.shop_orders alter column account_user_id drop not null;
alter table public.shop_orders
  add column if not exists guest_name text,
  add column if not exists guest_phone text,
  add column if not exists payment_method text not null default 'eixon_wallet',
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','due_on_delivery','failed','refunded','manual_review'));
alter table public.shop_orders
  drop constraint if exists shop_orders_guest_identity_check;
alter table public.shop_orders
  add constraint shop_orders_guest_identity_check
  check (
    (account_user_id is not null)
    or (guest_name is not null and length(trim(guest_name)) between 2 and 120
        and guest_phone is not null and length(trim(guest_phone)) between 7 and 24)
  );
alter table public.shop_orders
  drop constraint if exists shop_orders_payment_method_check;
alter table public.shop_orders
  add constraint shop_orders_payment_method_check
  check (payment_method in ('eixon_wallet','cod','bkash','nagad','card'));
create unique index if not exists shop_orders_idempotency_global_idx on public.shop_orders(idempotency_key);
create index if not exists shop_orders_guest_tracking_idx on public.shop_orders(order_number, guest_phone)
  where account_user_id is null;

alter table public.shop_payment_attempts
  drop constraint if exists shop_payment_attempts_provider_check;
alter table public.shop_payment_attempts
  add constraint shop_payment_attempts_provider_check
  check (provider in ('eixon_wallet','bkash','nagad','card','cod'));

alter table public.shop_returns alter column account_user_id drop not null;
alter table public.shop_returns add column if not exists guest_phone text;
alter table public.shop_returns
  drop constraint if exists shop_returns_guest_identity_check;
alter table public.shop_returns
  add constraint shop_returns_guest_identity_check
  check (
    (account_user_id is not null)
    or (guest_phone is not null and length(trim(guest_phone)) between 7 and 24)
  );

create table if not exists public.shop_carts (
  id uuid primary key default gen_random_uuid(),
  account_user_id uuid references auth.users(id) on delete cascade,
  guest_token_hash text unique,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shop_carts_owner_check check (
    (account_user_id is not null and guest_token_hash is null)
    or (account_user_id is null and guest_token_hash is not null)
  )
);
create index if not exists shop_carts_owner_idx on public.shop_carts(account_user_id) where account_user_id is not null;
create index if not exists shop_carts_expiry_idx on public.shop_carts(expires_at);
create table if not exists public.shop_cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.shop_carts(id) on delete cascade,
  variant_id uuid not null references public.shop_product_variants(id) on delete restrict,
  quantity integer not null check(quantity between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, variant_id)
);
create index if not exists shop_cart_items_variant_idx on public.shop_cart_items(variant_id);

alter table public.shop_carts enable row level security;
alter table public.shop_cart_items enable row level security;
revoke all on table public.shop_carts, public.shop_cart_items from anon, authenticated;
grant all on table public.shop_carts, public.shop_cart_items to service_role;
