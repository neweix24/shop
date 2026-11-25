-- Tighten direct API grants and cover Shop foreign-key lookups.
revoke all on table
 public.shop_products, public.shop_product_variants, public.shop_inventory,
 public.shop_customer_addresses, public.shop_orders, public.shop_order_items,
 public.shop_payment_attempts, public.shop_delivery_jobs, public.shop_order_events,
 public.shop_returns
from anon, authenticated;

grant select on public.shop_products, public.shop_product_variants to anon, authenticated;
grant select on public.shop_customer_addresses, public.shop_orders,
 public.shop_order_items, public.shop_order_events, public.shop_returns to authenticated;

grant all on table
 public.shop_products, public.shop_product_variants, public.shop_inventory,
 public.shop_customer_addresses, public.shop_orders, public.shop_order_items,
 public.shop_payment_attempts, public.shop_delivery_jobs, public.shop_order_events,
 public.shop_returns
to service_role;

create index if not exists shop_order_events_actor_idx on public.shop_order_events(actor_user_id);
create index if not exists shop_order_items_variant_idx on public.shop_order_items(variant_id);
create index if not exists shop_returns_order_idx on public.shop_returns(order_id);
