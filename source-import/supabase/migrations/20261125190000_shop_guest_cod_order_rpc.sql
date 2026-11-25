-- Atomic guest COD order placement, inventory reservation and API rate limiting.
create table if not exists public.shop_api_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null,
  hit_count integer not null check (hit_count >= 0),
  updated_at timestamptz not null default now()
);
alter table public.shop_api_rate_limits enable row level security;
revoke all on table public.shop_api_rate_limits from anon, authenticated;
grant all on table public.shop_api_rate_limits to service_role;

create or replace function public.shop_consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hits integer;
begin
  if p_key_hash is null or length(p_key_hash) <> 64 or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;
  insert into public.shop_api_rate_limits(key_hash, window_started_at, hit_count, updated_at)
  values (p_key_hash, now(), 1, now())
  on conflict (key_hash) do update
    set window_started_at = case
          when public.shop_api_rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= now()
          then now() else public.shop_api_rate_limits.window_started_at end,
        hit_count = case
          when public.shop_api_rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= now()
          then 1 else public.shop_api_rate_limits.hit_count + 1 end,
        updated_at = now()
  returning hit_count into v_hits;
  return v_hits <= p_limit;
end;
$$;
revoke all on function public.shop_consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.shop_consume_rate_limit(text, integer, integer) to service_role;

create or replace function public.shop_create_guest_cod_order(
  p_guest_name text,
  p_guest_phone text,
  p_delivery_address jsonb,
  p_items jsonb,
  p_idempotency_key text,
  p_customer_note text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item record;
  v_variant record;
  v_subtotal bigint := 0;
  v_order public.shop_orders%rowtype;
  v_count integer := 0;
begin
  if p_guest_name is null or length(trim(p_guest_name)) not between 2 and 120 then
    raise exception 'Invalid guest name' using errcode = '22023';
  end if;
  if p_guest_phone is null or p_guest_phone !~ '^\+?8801[3-9][0-9]{8}$' then
    raise exception 'Invalid Bangladesh phone number' using errcode = '22023';
  end if;
  if p_delivery_address is null or jsonb_typeof(p_delivery_address) <> 'object'
     or coalesce(length(trim(p_delivery_address->>'address_line')),0) < 4
     or coalesce(length(trim(p_delivery_address->>'district')),0) < 2
     or coalesce(length(trim(p_delivery_address->>'upazila')),0) < 2 then
    raise exception 'Invalid delivery address' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'Invalid cart items' using errcode = '22023';
  end if;
  if p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9:_-]{8,100}$' then
    raise exception 'Invalid idempotency key' using errcode = '22023';
  end if;
  if p_customer_note is not null and length(p_customer_note) > 500 then
    raise exception 'Customer note too long' using errcode = '22023';
  end if;

  select * into v_order from public.shop_orders where idempotency_key = p_idempotency_key;
  if found then
    if v_order.account_user_id is null and v_order.guest_phone = p_guest_phone then
      return jsonb_build_object('id', v_order.id, 'order_number', v_order.order_number, 'status', v_order.status, 'replayed', true);
    end if;
    raise exception 'Idempotency key conflict' using errcode = '23505';
  end if;

  if exists (
    select 1 from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
    group by variant_id having count(*) > 1
  ) then
    raise exception 'Duplicate cart variant' using errcode = '22023';
  end if;

  for v_item in
    select * from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
  loop
    if v_item.variant_id is null or v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 100 then
      raise exception 'Invalid cart line' using errcode = '22023';
    end if;
    select v.id, v.sku, v.title as variant_title, v.unit_price_minor,
           p.title as product_title, i.quantity_on_hand, i.quantity_reserved
      into v_variant
      from public.shop_product_variants v
      join public.shop_products p on p.id = v.product_id
      join public.shop_inventory i on i.variant_id = v.id
     where v.id = v_item.variant_id and v.is_active = true and p.status = 'active'
     for update of i;
    if not found then
      raise exception 'Product variant unavailable' using errcode = 'P0002';
    end if;
    if v_variant.quantity_on_hand - v_variant.quantity_reserved < v_item.quantity then
      raise exception 'Insufficient inventory' using errcode = 'P0001';
    end if;
    v_subtotal := v_subtotal + (v_variant.unit_price_minor * v_item.quantity);
  end loop;

  insert into public.shop_orders(
    account_user_id, guest_name, guest_phone, status, currency, subtotal_minor,
    delivery_fee_minor, total_minor, delivery_address, customer_note,
    idempotency_key, payment_method, payment_status
  ) values (
    null, trim(p_guest_name), p_guest_phone, 'manual_review', 'BDT', v_subtotal,
    0, v_subtotal, p_delivery_address, nullif(trim(p_customer_note), ''),
    p_idempotency_key, 'cod', 'due_on_delivery'
  ) returning * into v_order;

  for v_item in
    select * from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
  loop
    select v.id, v.sku, v.title as variant_title, v.unit_price_minor,
           p.title as product_title
      into v_variant
      from public.shop_product_variants v
      join public.shop_products p on p.id = v.product_id
     where v.id = v_item.variant_id;
    insert into public.shop_order_items(
      order_id, variant_id, sku_snapshot, product_title_snapshot,
      variant_title_snapshot, quantity, unit_price_minor, line_total_minor
    ) values (
      v_order.id, v_variant.id, v_variant.sku, v_variant.product_title,
      v_variant.variant_title, v_item.quantity, v_variant.unit_price_minor,
      v_variant.unit_price_minor * v_item.quantity
    );
    update public.shop_inventory
       set quantity_reserved = quantity_reserved + v_item.quantity, updated_at = now()
     where variant_id = v_item.variant_id;
  end loop;

  insert into public.shop_delivery_jobs(order_id, provider, status)
  values (v_order.id, 'manual', 'manual_review');
  insert into public.shop_order_events(order_id, event_type, details)
  values (v_order.id, 'guest_order_created', jsonb_build_object('payment_method','cod','delivery','manual_review'));

  return jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'status', v_order.status,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'subtotal_minor', v_order.subtotal_minor,
    'delivery_fee_minor', v_order.delivery_fee_minor,
    'total_minor', v_order.total_minor,
    'replayed', false
  );
end;
$$;
revoke all on function public.shop_create_guest_cod_order(text, text, jsonb, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.shop_create_guest_cod_order(text, text, jsonb, jsonb, text, text) to service_role;
