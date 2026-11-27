# Neweix Shop — implementation status and remaining work

This checklist describes verified code and live integration state. A UI route is not treated as a completed business workflow unless it is connected to an authoritative service and tested end to end.

## ZIP-derived storefront currently present
- [x] Responsive homepage, catalog/category browsing, search, product details, cart, wishlist, FAQ, contact, privacy, and tracking UI.
- [x] Cart and wishlist browser persistence.
- [x] API-backed catalog rendering with an honest empty state; no demo products, prices, SKUs, or inventory are fabricated.
- [x] BDT price formatting and server-returned variant/stock display.
- [x] Guest COD order form UI and API integration seam; order submission is now fail-closed by default pending verified Shop operations.
- [x] Guest order tracking requires both Order ID and the checkout phone number.
- [x] Preview API isolation: Cloudflare Pages builds preview mode and does not fall back to production data.
- [x] Request-size, JSON-shape, and checkout feature-flag tests are part of Deno validation.

## Shop-owned commerce foundation
- [x] Shop-owned catalog, variants, inventory, guest/customer addresses, orders, order items, payment attempts, delivery jobs, order events, returns, carts, and rate-limit schema exists in migrations.
- [x] Guest COD RPC calculates prices from database state, checks stock under row locks, reserves stock atomically, and is idempotent.
- [x] Public product endpoint returns active catalog records and server-calculated available stock.
- [x] Account order-read endpoint fails closed until the first-party Neweix Account SSO contract is registered and verified.
- [ ] Build complete order operations: accept/reject/cancel, refund/reversal, reservation expiry/release, fulfilment status, and audited manual review.
- [ ] Add durable server-side customer cart and verified account-address workflows; current browser cart is local storage.
- [ ] Add reviews, customer support/order notes, reporting, and full returns/refunds workflows with service-side authorization.
- [ ] Apply the reviewed owner-read RLS init-plan migration only after reconciling the live Supabase migration baseline.

## Ecosystem integration and production architecture
- [ ] Port the useful ZIP UI into the approved Next.js frontend and NestJS modular-monolith backend. The current ZIP app remains Vite/React + Express/tRPC starter code and is preview-only.
- [ ] Register Shop as the canonical commerce service through Supreme's protected control plane after fresh AAL2/device-bound ruler authorization. Track the decision in Supreme issue #73.
- [ ] Implement and test Neweix Account first-party SSO, exact service audience, account-status checks, and customer ownership validation.
- [ ] Define and test the Supreme-approved Shop Admin identity/grant contract before enabling product publishing or order operations.
- [ ] Integrate Eixon only through an approved server-to-server payment intent/confirmation/refund/reconciliation contract. No EIX ledger or balance is stored in Shop.
- [ ] Verify Pathao credentials, coverage, quotes, booking, tracking, cancellation, and returns. Until then, show no fabricated delivery quote or nationwide-delivery promise.
- [ ] Connect Connect notifications through an approved contract; do not store Connect's message data in Shop.
- [ ] Replace remote editorial placeholder imagery with approved, licensed, durable Shop-managed assets.
- [ ] Add backup/restore drills, monitoring, rate-limit cleanup, audit review, security testing, and production smoke tests.

## Current live blockers
- Live catalog has zero active products, variants, and inventory rows.
- Live Account SSO and Shop Admin grant/order-operation contracts are not verified.
- Eixon Shop payment contract and Pathao delivery credentials/coverage are not verified.
- The canonical Cloudflare Worker for `www.shop.neweix.com` still returns HTTP 503.
- The separate `neweix-shop-preview` Pages project is preview-only; production deployments are disabled.
- `SHOP_GUEST_CHECKOUT_ENABLED` must remain unset/false until Admin order operations and stock-release invariants are implemented and tested.
