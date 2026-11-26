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

### Live production gate audit (2026-11-26)

A read-only audit of the shared Supreme registry and Cloudflare account confirmed:

- Supreme registry service `neweix` is active and points to `neweix24/neweix`, with an enabled production environment.
- Supreme registry service `neweix-shop` is still planned. Its only registered environment is disabled development; it has no API base URL and no registered capabilities.
- Supreme's ecosystem capability inventory still describes Neweix as the commerce-and-operations owner. A Supreme governance decision is required before treating the separate Shop repository as the canonical production commerce owner.
- Cloudflare Custom Domain `www.shop.neweix.com` is already enabled and mapped to Worker `neweix-shop` in its production environment. Its DNS record is Cloudflare-managed; no ordinary Worker Route is expected for this Custom Domain.
- The deployed `neweix-shop` Worker code is still a placeholder that returns HTTP 503. The hostname being provisioned does not mean the storefront is deployed.
- A governance decision request was opened in [Supreme issue #73](https://github.com/neweix24/supreme/issues/73). This request does not itself approve or execute a production change.

Do not activate the registry service, publish a product-management API, or replace the production Worker until Supreme confirms canonical ownership, approves the production contract and capability allow-list, and the Admin authorization contract is implemented and tested.

## Remaining production blockers

1. Rebuild the legacy Vite/Express starter into the approved Next.js/NestJS architecture.
2. Obtain Supreme's canonical commerce ownership and production service-registration decision (tracked in [Supreme issue #73](https://github.com/neweix24/supreme/issues/73)).
3. Define and implement the Supreme-approved delegated Admin identity/grant contract and service-side authorization tests before product publishing is enabled.
4. Register and test Neweix Account SSO with exact production redirect URIs and PKCE.
5. Supply real Shop products, variant SKUs, BDT prices, images, and verified inventory through an authorized admin workflow. No sample products or prices may be invented.
6. Restore Eixon service, approve the Shop payment contract, and test Eixon Wallet end to end.
7. Obtain and approve bKash/Nagad/card gateway integrations before enabling them.
8. Verify Pathao credentials, official geography coverage, quotes, booking, tracking, and return workflows.
9. Configure Connect notifications, operational monitoring, backups, and production smoke tests.
10. Replace the Cloudflare 503 placeholder and deploy the storefront only after the release gates above pass. The `www.shop.neweix.com` Custom Domain is already configured.

The production Shop URL is intended to be `https://www.shop.neweix.com`. Do not claim production readiness or switch production traffic before the blockers above are closed.


### Supreme decision update (2026-11-26)

The canonical ownership direction has been confirmed by the Neweix owner: `neweix24/shop` is intended to become the independent Commerce Service, and `https://www.shop.neweix.com` remains the production hostname. This direction is recorded in [Supreme issue #73](https://github.com/neweix24/supreme/issues/73).

This ChatGPT confirmation is not a substitute for the Supreme app's required fresh AAL2, device-bound ruler authorization. The Supreme registry must be changed through its protected control plane; no direct database bypass is permitted. Until that authenticated control request is approved, the registry transition is not complete.

Production is still blocked: the Cloudflare Worker returns HTTP 503, the imported storefront is legacy Vite/React + Express/tRPC rather than the approved Next.js/NestJS target, the live catalog is empty, and the Shop Admin grant contract has not been implemented and tested. Keep production traffic and product publishing disabled until those gates pass.


## Full application preview deployment

The complete imported application is built from this directory for a separate Cloudflare Pages preview project:

- Project: `neweix-shop-preview`
- Preview branch: `neweix24-patch-1`
- Build command: `pnpm build:static`
- Output directory: `dist/public`
- Preview hostname: `https://neweix-shop-preview.pages.dev`
- Production deployments are disabled; this project does not own or change `www.shop.neweix.com`.

This is a frontend preview, not a production release. The catalog is loaded from the Shop API and currently has no published products. Checkout, Account SSO, Eixon, payment providers, delivery quotes, and Admin publishing remain subject to the production gates above. No demo product data or payment success is fabricated.
