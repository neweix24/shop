# Neweix Shop application workspace

This is the new production-target application. The ZIP-derived Vite client remains preserved under `apps/storefront/src/legacy` and `../source-import`; it is source material, not a production server.

- `apps/storefront`: Next.js 15 static-export storefront mounting the ZIP-derived UI.
- `apps/api`: NestJS 12 modular monolith API for Shop-owned catalogue, guest order tracking, health/readiness and fail-closed integration boundaries.

## Ownership boundaries

Account owns customer identity. Eixon owns EIX and the financial ledger. Supreme owns governance and reserved approvals. Shop owns catalogue, inventory, carts, orders, delivery, returns and support. The Shop API must never write to another service's private database.

No local/Manus identity is accepted as customer authentication. Product publishing remains disabled until the Supreme-approved Admin grant is implemented and verified. Eixon is the only approved Shop payment route. Checkout remains disabled until its server-to-server intent, confirmation, refund and reconciliation contract is implemented and verified. COD and external gateways are not allowed. Pathao remains disabled until verified credentials and coverage exist.

## Environment

API:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `SHOP_ALLOWED_ORIGINS`
- `PORT` (default 3100)

Storefront:
- `NEXT_PUBLIC_SHOP_API_URL` must be explicitly configured to enable API calls.
- Preview intentionally omits this value and cannot read or mutate Production data.

Run from this directory: `pnpm install`, `pnpm check`, `pnpm test`, `pnpm build`.


## Cloudflare Worker deployment

The canonical production hostname `www.shop.neweix.com` is mapped to the existing Worker `neweix-shop`. The Next.js static storefront is deployed to that Worker using Workers Static Assets from `apps/storefront/out`. API requests under `/api` return HTTP 503 until a verified Shop API runtime is deployed. The legacy Pages preview projects were deleted at the owner's request; do not recreate a Pages project as the production Shop host.


Preview deployment trigger reconfigured to rebuild this branch on every push while production deploys remain disabled.


## API security and checkout release gate (2026-11-26)

- NestJS JSON and URL-encoded request bodies are capped at 16 KiB before controller logic.
- API responses receive baseline browser security headers and no-store caching. CORS uses exact configured HTTPS origins; HTTP localhost is permitted only outside production.
- The server-side Supabase adapter accepts HTTPS `.supabase.co` project hosts in production (localhost HTTP is development-only), rejects URL credentials/query/hash/path overrides and redirects, and applies an eight-second upstream timeout.
- Catalog reads are bounded to 100 rows. Unsafe/negative prices are excluded; malformed or missing inventory is shown as zero stock.
- Shop follows an Eixon-only payment policy. COD and external gateways are not allowed. Checkout is blocked by a source-level release gate; setting `SHOP_GUEST_CHECKOUT_ENABLED=true` cannot enable it. The Eixon Shop payment contract, Supreme-approved Admin grant, audited order lifecycle, inventory reservation release, and verified delivery fee/fulfilment remain unresolved.

Production status is tracked in [PRODUCTION-READINESS.md](./PRODUCTION-READINESS.md). The storefront is deployed to the existing Production Worker and `shop-api` Edge Function is active with checkout disabled. The NestJS API runtime, Account SSO, Supreme Admin grant, Eixon payment contract, delivery verification, real catalog data, and production schema policy reconciliation remain release blockers. Do not enable checkout or mark the release ready until every acceptance criterion in that document is verified.
