# Production integration contract

## Ownership and boundaries

Shop is the customer-facing online store and owns its catalog, cart, orders, inventory, delivery, returns, support, and sales reporting. Account owns identity credentials and sessions. Eixon owns EIX, wallets, balances, financial ledger, payment lifecycle, settlement, and reconciliation. Supreme retains highest governance authority. Neweix provides ecosystem navigation and service coordination.

Shop must not write to Account or Eixon private data, maintain a shadow EIX ledger, or create wallet-transfer endpoints. Do not introduce the cancelled Developer Marketplace, Developer Portal, developer billing, or plugin publishing program.

## Account authentication

The Account repository documents Supabase Auth as the credential/session authority and the first-party OAuth 2.1/OIDC authorization-code flow with PKCE. Its project-level OAuth server and client registration are not enabled/verified yet: the active project's `auth.oauth_clients` table currently has no registered clients.

The Shop source still contains legacy Manus OAuth/session code. It must not be treated as Neweix Account authentication. Replace it only after Account's OAuth server is enabled, the exact Shop redirect URI is registered, the issuer/audience/JWKS contract is verified, and end-to-end PKCE tests pass. Never map Manus `openId` to Account UUID by guesswork. Do not accept client-supplied roles.

## Shop database

The additive Shop commerce foundation is installed in the active Neweix Supabase project `grhybvlhdnzlopwbaqun` under the `public.shop_*` tables. The migration source is in `supabase/migrations/`.

Tables include products, variants, inventory, customer addresses, orders, order items, payment attempts, delivery jobs, order events, and returns. All tables have RLS enabled. Public users can read active catalog rows; authenticated users can read only their own addresses, orders, order items, order events, and returns. There are no client-side write policies. Inventory, payment, delivery and order mutations are server-only.

The database is an additive commerce foundation. Guest checkout is supported without login using name, Bangladesh phone, and delivery address. Guest order tracking requires the Order UUID plus the same phone number. The server-side COD RPC validates live product variants and stock, locks inventory rows, reserves stock atomically, records immutable item snapshots, and creates a manual-delivery-review order. Account-linked order history is separately protected by RLS. Refund, return-approval, and staff administration mutation APIs are not yet available. The current public catalog is empty; the preview's hard-coded sample catalog is not yet synchronized to Shop's database, so the frontend intentionally does not submit demo product IDs as real orders.

## Shop API status

The Supabase Edge Function `shop-api` is deployed and its `GET /health` endpoint was tested successfully.

- `GET /products`: active product catalogue read.
- `GET /orders`: requires an Account-issued Supabase access token and uses RLS for owner-scoped order reads.
- `POST /checkout`: accepts guest Cash on Delivery only and calls the atomic order RPC. Other methods return HTTP 503 until their respective contracts and approvals are active.
- `POST /track`: guest tracking requires both the Order UUID and checkout phone; attempts are rate-limited in the database.

The function has platform JWT verification disabled only because it performs explicit user-token validation for protected routes while exposing public catalogue and health routes. Do not remove the explicit `auth.getUser(token)` check or rely on unverified JWT claims.

## Eixon payment boundary

Eixon is the only approved Shop checkout payment route. Eixon owns all wallet balances and financial records. Shop must not offer Cash on Delivery, bKash, Nagad, Rocket, card gateways, or any alternative checkout route under the current policy.

The Eixon Supabase project is currently inactive and no approved Shop payment API/client credentials or signed webhook contract have been verified. Eixon Wallet checkout therefore remains disabled. COD guest orders are created with `due_on_delivery` and `manual_review`; no online payment is claimed. bKash, Nagad, and card checkout remain disabled until provider/legal approvals, credentials, signed webhooks, and end-to-end reconciliation tests are complete. Do not mark online payments paid from a browser redirect.

## Pathao and notifications

Pathao credentials, coverage, quote, booking and tracking APIs have not been verified. Do not fabricate delivery rates or coverage. Implement a server-side adapter after official credentials and geography mappings are available. Until then delivery must be explicitly marked manual review.

Notifications must use the approved Neweix Connect/notification service contract. No live notification provider is configured in this Shop deployment.

## Deployment and release gate

The Cloudflare Worker previously returned HTTP 503 and had no production bindings. Do not replace it with a storefront until the frontend and server API are connected, Account SSO is tested, Eixon payment verification is live, Pathao/manual delivery is defined, migrations are reproducible, monitoring/backups are configured, and production smoke tests pass.

A green frontend build or a healthy read-only API does not mean the Shop is production-ready.
