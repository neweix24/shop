-- Public presentation metadata for Shop-owned catalog products.
alter table public.shop_products
  add column if not exists category text not null default 'Other',
  add column if not exists image_url text,
  add column if not exists is_featured boolean not null default false;

alter table public.shop_products
  drop constraint if exists shop_products_category_length_check;
alter table public.shop_products
  add constraint shop_products_category_length_check
  check (length(trim(category)) between 2 and 60);

alter table public.shop_products
  drop constraint if exists shop_products_image_url_https_check;
alter table public.shop_products
  add constraint shop_products_image_url_https_check
  check (image_url is null or image_url ~ '^https://');
