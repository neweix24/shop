-- Optimize Shop owner-read policies so auth.uid() is evaluated once per statement.
-- Authorization semantics are unchanged; all policies remain SELECT-only for authenticated users.
begin;

drop policy if exists shop_addresses_owner_read on public.shop_customer_addresses;
create policy shop_addresses_owner_read
on public.shop_customer_addresses
for select
to authenticated
using (account_user_id = (select auth.uid()));

drop policy if exists shop_orders_owner_read on public.shop_orders;
create policy shop_orders_owner_read
on public.shop_orders
for select
to authenticated
using (account_user_id = (select auth.uid()));

drop policy if exists shop_order_items_owner_read on public.shop_order_items;
create policy shop_order_items_owner_read
on public.shop_order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.shop_orders as orders
    where orders.id = shop_order_items.order_id
      and orders.account_user_id = (select auth.uid())
  )
);

drop policy if exists shop_order_events_owner_read on public.shop_order_events;
create policy shop_order_events_owner_read
on public.shop_order_events
for select
to authenticated
using (
  exists (
    select 1
    from public.shop_orders as orders
    where orders.id = shop_order_events.order_id
      and orders.account_user_id = (select auth.uid())
  )
);

drop policy if exists shop_returns_owner_read on public.shop_returns;
create policy shop_returns_owner_read
on public.shop_returns
for select
to authenticated
using (account_user_id = (select auth.uid()));

commit;
