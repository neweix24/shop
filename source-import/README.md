# Neweix Shop

Neweix Shop is the ecosystem's customer-facing online store. Its approved checkout contract supports guest orders without login, Eixon Wallet for signed-in Neweix Account customers, Cash on Delivery, and (after provider and legal approval) bKash, Nagad, and debit/credit cards.

## Approved architecture

The approved target architecture is Next.js/TypeScript storefront, NestJS modular-monolith API, PostgreSQL, Redis, Central Neweix Account authentication, and Eixon-owned financial processing. Shop owns commerce records; Account owns credentials and sessions; Eixon owns EIX, wallets, balances, and financial ledger; Supreme retains highest governance authority.

The imported source in `source-import/` is a legacy Vite/React + Express/tRPC starter and is not yet the approved final architecture. Its Manus OAuth and Manus notification paths have been disabled/removed. Do not deploy this legacy app as the production Shop.

## Current live foundation

The active Neweix Supabase project contains an additive Shop data model under `public.shop_*`:

- products and variants
- inventory and reservation counts
- guest and Account-linked orders
- order items and immutable purchase snapshots
- payment attempts
- delivery jobs
- order events
- customer addresses and returns
- guest carts and rate-limit records

All Shop tables have RLS enabled. Public access is limited to active catalogue reads. Customer order/address reads are owner-scoped. Order, payment, inventory, delivery, and cart mutations are server-only.

The deployed Supabase Edge Function is `shop-api`:

- `GET /health`: service readiness and payment-method status.
- `GET /products`: active Shop catalogue.
- `GET /orders`: Account-token protected order history.
- `POST /checkout`: guest COD checkout, server-side validation and atomic stock reservation.
- `POST /track`: guest order tracking using Order UUID plus checkout phone, with database-backed rate limiting.

The catalogue is currently empty. The legacy storefront still contains sample catalogue data with non-database variant IDs. The frontend does not submit those sample IDs as real orders.

## Payment policy

- Eixon Wallet: requires Neweix Account and an active, approved Eixon Shop payment contract. Currently unavailable because the Eixon Supabase project is inactive and no Shop payment contract is verified.
- Cash on Delivery: implemented for guest orders. Orders enter manual delivery review until dispatch operations and delivery charges are confirmed.
- bKash and Nagad: disabled until provider credentials, webhook verification, reconciliation, and legal approval.
- Debit/credit cards: disabled until a compliant gateway, webhook verification, reconciliation, and legal approval.

Shop never stores EIX balances or operates a shadow wallet/ledger. No online payment is marked paid from a browser redirect.

## Identity

Neweix Account is the sole identity authority. The Account repository documents Supabase Auth and first-party OAuth 2.1/OIDC with PKCE. The Shop OAuth client has not been registered and the Account OAuth server configuration has not been verified. Legacy Manus OAuth has been retired from the active request path. Guest checkout remains available without login.

## Delivery and notifications

Pathao API credentials, coverage, pricing, booking, and tracking have not been verified. COD orders therefore enter manual review; no delivery price is fabricated. Notification delivery through Neweix Connect is not yet configured.

## Verification

GitHub Actions validates the imported frontend build, TypeScript, unit tests, and the Shop Edge Function. A successful build or healthy read-only API is not a production release.

## Production blockers

1. Rebuild the legacy Vite/Express starter into the approved Next.js/NestJS architecture.
2. Register and test Neweix Account SSO with exact production redirect URIs and PKCE.
3. Publish real product catalogue and inventory through a protected Shop admin workflow.
4. Connect the frontend to the live catalogue, guest COD checkout, and Order ID + phone tracking APIs.
5. Restore Eixon service, approve the Shop payment contract, and test Eixon Wallet end to end.
6. Obtain and approve bKash/Nagad/card gateway integrations before enabling them.
7. Verify Pathao credentials, official geography coverage, quotes, booking, tracking, and return workflows.
8. Configure Connect notifications, operational monitoring, backups, and production smoke tests.
9. Replace the Cloudflare 503 placeholder only after all release gates pass.

The production Shop URL is intended to be `https://www.shop.neweix.com`. Do not claim production readiness or switch production traffic before the blockers above are closed.
