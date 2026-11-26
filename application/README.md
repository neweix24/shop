# Neweix Shop application workspace

This is the new production-target application. The ZIP-derived Vite client remains preserved under `apps/storefront/src/legacy` and `../source-import`; it is source material, not a production server.

- `apps/storefront`: Next.js 15 static-export storefront mounting the ZIP-derived UI.
- `apps/api`: NestJS 12 modular monolith API for Shop-owned catalogue, COD checkout, guest order tracking, health/readiness and fail-closed integration boundaries.

## Ownership boundaries

Account owns customer identity. Eixon owns EIX and the financial ledger. Supreme owns governance and reserved approvals. Shop owns catalogue, inventory, carts, orders, delivery, returns and support. The Shop API must never write to another service's private database.

No local/Manus identity is accepted as customer authentication. Product publishing remains disabled until the Supreme-approved Admin grant is implemented and verified. Eixon payment remains disabled until the approved server-to-server contract exists. Pathao remains disabled until verified credentials and coverage exist.

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
