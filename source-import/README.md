# Shop source import

This directory contains the imported legacy Shop application and the active Shop API function. The target production architecture and integration gates are documented below.

## Architecture status

The imported storefront is a legacy Vite/React client with an Express/tRPC server. It is not the approved production architecture. The approved target is a Next.js storefront with a NestJS modular monolith and PostgreSQL, integrated with the central Neweix Account service.

## Current implementation status

- The storefront reads only active products from the Shop API; hard-coded sample products have been removed.
- Public catalog responses include server-calculated available stock. Products without an active variant are not shown.
- The storefront cart is reconciled against the latest published product and stock data.
- Guest COD checkout submits real variant IDs and quantities to the Shop API. The database calculates prices, reserves stock atomically, enforces an idempotency key, and creates an order for manual review.
- The guest order tracking page uses the Order ID and the checkout phone number.
- Product category, image URL, and featured metadata are available in the Shop product schema.
- The Shop API Edge Function is deployed as version 4. GitHub Actions validates TypeScript, unit tests, the frontend production build, and Deno types.
- The live Shop catalog currently has zero active products, zero variants, and zero inventory rows. The storefront therefore correctly displays an empty catalog and cannot accept a real order yet.

## Identity

Neweix Account is the sole identity authority. Shop must not create a separate password store, session system, or Manus OAuth flow. Account SSO is not yet registered or verified for Shop, so authenticated account features remain unavailable. Guest checkout is limited to Cash on Delivery.

## Payments

Eixon is the only approved Neweix wallet/payment integration for Shop, but the production Eixon contract is not yet available. Eixon Wallet, bKash, Nagad, and card payments must remain disabled until their official integrations, reconciliation, security controls, and approvals are complete. Cash on Delivery orders are created for manual review and must not be represented as confirmed fulfilment.

## Data ownership

Shop owns catalogue, variants, inventory, carts, orders, delivery, returns, and support data. Eixon owns EIX balances and ledger entries. Account owns identity and sessions. Client requests cannot assign roles or mutate protected inventory and order state.

## Delivery and notifications

Pathao API credentials, coverage, pricing, booking, and tracking have not been verified. COD orders therefore enter manual review; no delivery price is fabricated. Notification delivery through Neweix Connect is not yet configured.

## Verification

GitHub Actions validates the imported frontend TypeScript, unit tests, production build, and the Shop Edge Function Deno types. A successful build or healthy read-only API is not a production release.

## Remaining production blockers

1. Rebuild the legacy Vite/Express starter into the approved Next.js/NestJS architecture.
2. Register and test Neweix Account SSO with exact production redirect URIs and PKCE.
3. Supply and publish real Shop products, variant SKUs, BDT prices, images, and verified inventory through an authorized admin workflow. No sample products or prices may be invented.
4. Resolve the canonical commerce ownership conflict with the Supreme service registry before production traffic is switched.
5. Restore Eixon service, approve the Shop payment contract, and test Eixon Wallet end to end.
6. Obtain and approve bKash/Nagad/card gateway integrations before enabling them.
7. Verify Pathao credentials, official geography coverage, quotes, booking, tracking, and return workflows.
8. Configure Connect notifications, operational monitoring, backups, and production smoke tests.
9. Replace the Cloudflare 503 placeholder and deploy the storefront only after the release gates above pass.

The production Shop URL is intended to be `https://www.shop.neweix.com`. Do not claim production readiness or switch production traffic before the blockers above are closed.
