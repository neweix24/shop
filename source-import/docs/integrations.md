# Production integration checklist

## Supabase/customer auth

Use the existing server-side auth boundary. Browser-safe values are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; `SUPABASE_SERVICE_ROLE_KEY` is server-only. Configure Google/OAuth callback URLs for the exact public origin and `/api/oauth/callback` where applicable. Preserve the `webdev_app_session` cookie name and `SameSite=None; Secure` behavior for embedded HTTPS Preview. Validate the OAuth state nonce and allow only fixed in-app return paths.

## Pathao

Create a server adapter that receives a validated address, selected dispatch origin, and parcel facts. Request a live quote only after coverage and upazila support are verified. Persist the provider request/response, quote expiry, and provider reference on the server. If the provider is unavailable or coverage is unsupported, return a typed manual-review state. The client must not receive provider secrets.

## Payments

Create provider-specific server endpoints and webhook verification for bKash, Nagad, Rocket, and any card provider. Cash on Delivery can remain `not-started` until dispatch confirmation. Client redirects are not proof of payment; use signed webhook/provider lookup and idempotent payment-attempt records to mark an order verified.

## Data model direction

Recommended additive tables: `products`, `product_variants`, `inventory_events`, `wishlists`, `carts`, `cart_items`, `customer_addresses`, `orders`, `order_items`, `payment_attempts`, `delivery_quotes`, `reviews`, `consents`, and `audit_events`. Customer rows should reference `users.id`; staff permissions should be held separately from customer-facing profile data. Do not use a client-provided user id for authorization.
