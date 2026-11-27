-- Neweix Shop payment policy alignment.
-- Supreme policy: Eixon is the only Shop checkout payment route. COD and
-- direct MFS/card gateways are not permitted. Checkout remains disabled until
-- the approved Eixon server-to-server contract passes release acceptance.
--
-- Precondition verified 2026-11-27:
--   shop_orders = 0 rows
--   shop_payment_attempts = 0 rows
-- This migration intentionally aborts if legacy records exist. Review and
-- reconcile those records manually rather than silently rewriting them.

begin;

do $$
declare
  v_orders bigint;
  v_attempts bigint;
begin
  select count(*) into v_orders
    from public.shop_orders
   where payment_method <> 'eixon_wallet'
      or payment_status = 'due_on_delivery';

  select count(*) into v_attempts
    from public.shop_payment_attempts
   where provider <> 'eixon';

  if v_orders > 0 or v_attempts > 0 then
    raise exception
      'Shop Eixon-only migration blocked: % orders and % payment attempts require manual review',
      v_orders, v_attempts
      using errcode = '55000';
  end if;
end;
$$;

alter table public.shop_orders
  drop constraint if exists shop_orders_payment_method_check;
alter table public.shop_orders
  add constraint shop_orders_payment_method_check
  check (payment_method = 'eixon_wallet');

alter table public.shop_orders
  drop constraint if exists shop_orders_payment_status_check;
alter table public.shop_orders
  add constraint shop_orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'manual_review'));

alter table public.shop_payment_attempts
  drop constraint if exists shop_payment_attempts_provider_check;
alter table public.shop_payment_attempts
  add constraint shop_payment_attempts_provider_check
  check (provider = 'eixon');

-- Keep the old RPC signature as an explicit compatibility rejection so stale
-- callers cannot create COD orders. The function no longer runs the old order
-- creation implementation and has no execution grants for application roles.
create or replace function public.shop_create_guest_cod_order(
  p_guest_name text,
  p_guest_phone text,
  p_delivery_address jsonb,
  p_items jsonb,
  p_idempotency_key text,
  p_customer_note text default null
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  raise exception
    'Cash on Delivery is prohibited by the current Neweix Shop payment policy.'
    using errcode = '55000';
end;
$function$;

revoke all on function public.shop_create_guest_cod_order(text, text, jsonb, jsonb, text, text)
  from public, anon, authenticated, service_role;

comment on constraint shop_orders_payment_method_check on public.shop_orders is
  'Eixon is the only approved Neweix Shop payment method.';
comment on constraint shop_payment_attempts_provider_check on public.shop_payment_attempts is
  'Only the Eixon provider may be used for Neweix Shop payment attempts.';
comment on function public.shop_create_guest_cod_order(text, text, jsonb, jsonb, text, text) is
  'Retired compatibility stub. COD order creation is prohibited and the function is not executable by application roles.';

commit;
