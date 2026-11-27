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


## Cloudflare Pages preview

The separate project `neweix-shop-preview` builds only this Next.js storefront workspace:
- Root: `application`
- Command: `pnpm --filter @neweix/shop-storefront build`
- Output: `apps/storefront/out`
- Node: `22.16.0`
- Production deployments: disabled
- Preview API URL: intentionally unset; therefore no Production Shop data is requested.

The static app keeps the ZIP-derived Wouter routes with a Pages `_redirects` fallback. API traffic must not be enabled in Preview until a dedicated staging API exists.


Preview deployment trigger reconfigured to rebuild this branch on every push while production deploys remain disabled.


## API security and checkout release gate (2026-11-26)

- NestJS JSON and URL-encoded request bodies are capped at 16 KiB before controller logic.
- API responses receive baseline browser security headers and no-store caching. CORS uses exact configured HTTPS origins; HTTP localhost is permitted only outside production.
- The server-side Supabase adapter accepts HTTPS `.supabase.co` project hosts in production (localhost HTTP is development-only), rejects URL credentials/query/hash/path overrides and redirects, and applies an eight-second upstream timeout.
- Catalog reads are bounded to 100 rows. Unsafe/negative prices are excluded; malformed or missing inventory is shown as zero stock.
- Shop follows an Eixon-only payment policy. COD and external gateways are not allowed. Checkout is blocked by a source-level release gate; setting `SHOP_GUEST_CHECKOUT_ENABLED=true` cannot enable it. The Eixon Shop payment contract, Supreme-approved Admin grant, audited order lifecycle, inventory reservation release, and verified delivery fee/fulfilment remain unresolved.

These are source changes only. No live API, Supabase database, Production Worker, domain, or Supreme registry has been changed.
