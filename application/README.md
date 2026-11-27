# Neweix Shop application workspace

This is the production-target application. The ZIP-derived Vite client remains preserved under `apps/storefront/src/legacy` and `../source-import`; it is source material, not the production server.

- `apps/storefront`: Next.js 15 static-export storefront mounting the ZIP-derived UI.
- `apps/api`: NestJS 12 modular monolith API for Shop-owned catalogue, guest order tracking, health/readiness and fail-closed integration boundaries.

## Ownership boundaries

Supreme is the highest and final authority. Admin conducts day-to-day Shop operations within a Supreme-approved, scoped Admin grant. Shop owns catalogue, inventory, carts, orders, delivery, returns and support. Account owns customer identity. Eixon owns EIX and the payment/ledger. The Shop API must not write to another service's private database.

Canonical rules: [Supreme Ecosystem Governance Charter](https://github.com/neweix24/supreme/blob/main/docs/ecosystem-governance-charter.md), [Admin Grant Contract v1](https://github.com/neweix24/supreme/blob/main/docs/contracts/admin-grant-v1.md), and [ECOSYSTEM_ALIGNMENT.md](../ECOSYSTEM_ALIGNMENT.md).

## Payment and checkout policy

- Eixon is the only approved Shop payment route.
- COD, bKash, Nagad, card gateways and other external checkout methods are prohibited.
- The live database now restricts order payment method to `eixon_wallet`, payment attempts to provider `eixon`, and excludes `due_on_delivery`.
- The legacy COD RPC is an inaccessible compatibility stub and has no application-role EXECUTE grants.
- NestJS `POST /checkout/cod` returns HTTP 410. `POST /checkout` returns HTTP 503 until the approved Eixon payment contract and release gates are implemented.
- Supabase Edge Function `shop-api` version 6 returns HTTP 410 for `/checkout/cod` and HTTP 503 for `/checkout`.
- Checkout is not enabled. Do not add an environment variable or feature flag to bypass this policy.

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

## Cloudflare Worker

The canonical production hostname `https://www.shop.neweix.com` is mapped to the existing Worker `neweix-shop`. Workers Static Assets serve the storefront. Requests under `/api` return HTTP 503 until the NestJS API runtime is deployed. The legacy Pages preview projects were deleted at the owner's request; do not recreate a Pages project as the production Shop host.

Preview deployment rebuilds this remediation branch; production application API deployment remains disabled.

## API security

- JSON and URL-encoded request bodies are capped at 16 KiB.
- API responses receive browser security headers and no-store caching.
- CORS uses exact configured HTTPS origins; HTTP localhost is permitted only outside production.
- The server-side Supabase adapter accepts HTTPS `.supabase.co` hosts in production, rejects URL credentials/query/hash/path overrides and redirects, and applies an eight-second upstream timeout.
- Catalogue reads are bounded to 100 rows. Unsafe/negative prices are excluded; malformed or missing inventory is shown as zero stock.

## Release status

Production status is tracked in [PRODUCTION-READINESS.md](./PRODUCTION-READINESS.md). The storefront is deployed and the Supabase Edge Function checkout policy is aligned. The NestJS API runtime, Account SSO, Supreme Admin grant, Eixon payment contract, delivery verification, and real catalog data remain release blockers. Do not enable checkout or mark the release ready until every acceptance criterion is verified.
