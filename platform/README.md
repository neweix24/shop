# Neweix Shop platform foundation

This folder introduces the approved Next.js storefront + NestJS modular-monolith API without replacing the ZIP-derived application or changing the existing production service.

## Runtime layout

\`\`\`text
platform/
  apps/
    storefront/   Next.js App Router + OpenNext/Cloudflare adapter
    api/          NestJS modular monolith (Node.js HTTP runtime)
  README.md
\`\`\`

### Storefront

- Next.js App Router, server-rendered catalog page, responsive layout.
- Reads catalog only from the server-side \`SHOP_API_BASE_URL\`.
- Rejects non-HTTPS API origins outside local development and refuses redirects.
- Does not expose API credentials to browser code.
- Does not invent example products, prices, images, stock or delivery offers.
- Cloudflare Worker configuration is preview-only (\`workers_dev: true\`, no custom domain and no production route).

### API

- NestJS modules are separated by domain; this first slice includes Health, Catalog, Checkout, and a shared Supabase REST adapter.
- Catalog is read-only and uses the Shop-owned \`shop_products\` tables through the server-only service-role credential.
- Available stock is calculated as \`quantity_on_hand - quantity_reserved\`; missing inventory means zero available stock.
- Only active products, active variants and BDT values are returned.
- Request bodies are capped at 16 KiB, DTO validation rejects unknown input, CORS is deny-by-default, and Helmet security headers are enabled.
- Liveness and readiness are separate. Readiness checks the Supabase Shop catalog endpoint; an empty catalog can still be ready.
- Guest COD checkout returns HTTP 503 with explicit blockers. No feature flag can override the missing Admin/order/inventory/delivery controls in this foundation.

## Local setup

Requires Node.js 22.11+ and npm 10.9+.

1. Copy \`apps/api/.env.example\` to \`apps/api/.env\` and set server-side Supabase values only when you have the real values.
2. Copy \`apps/storefront/.env.example\` to \`apps/storefront/.env.local\`. Leave the API URL empty until an isolated API environment is deployed.
3. Install from this directory: \`npm install\`.
4. API: \`npm run build:api\`, then \`npm run start --workspace @neweix/shop-api\`.
5. Storefront: \`npm run dev --workspace @neweix/shop-web\`.

API endpoints:
- \`GET /api/v1/health/live\`
- \`GET /api/v1/health/ready\`
- \`GET /api/v1/catalog/products?limit=24\`
- \`GET /api/v1/checkout/status\`
- \`POST /api/v1/checkout/guest-cod\` (intentionally disabled; returns 503)

## Environment contract

API process only:
- \`SUPABASE_URL\`
- \`SUPABASE_SERVICE_ROLE_KEY\` (secret; never expose to Next.js or browsers)
- \`SHOP_ALLOWED_ORIGINS\` (optional, comma-separated exact browser origins)
- \`PORT\`, \`NODE_ENV\`

Next.js server only:
- \`SHOP_API_BASE_URL\` (the base origin of a separately deployed Shop API)

Do not set production secrets in a preview environment. The current preview project has no isolated API, so the Next.js page reports that the catalog connection is not configured.

## Important boundaries

- Customer authentication belongs to Neweix Account. This API does not accept client-supplied Account IDs or implement a substitute login.
- Admin and Employee authority are not inferred from customer identity. Product publishing and privileged order actions stay unavailable until Supreme-approved Admin grant validation exists.
- Eixon owns EIX balances and ledger operations. Shop must call an approved Eixon service contract; it must not maintain an EIX ledger.
- Delivery prices and coverage must come from an approved provider/verified manual workflow. The storefront makes no free-delivery or nationwide-coverage promises.
- No real product or stock records are seeded.

## Build and verification

The GitHub Actions workflow \`.github/workflows/validate-platform.yml\` installs the pinned direct workspace dependencies, runs TypeScript checks and API unit tests, builds Next.js, then runs the OpenNext Cloudflare build.

A resolved npm dependency lockfile still needs to be generated and committed before production use. The execution environment used for this change has no npm registry network access, so dependency installation and local framework builds cannot be performed here. CI is the first actual dependency-resolution/build verification; do not treat this foundation as production-ready until that CI passes and the lockfile is checked in.

## Not included in this phase

The ZIP-derived UI remains under \`source-import/\` and remains the existing Pages preview source. It has not yet been fully ported to Next.js. Account OIDC/PKCE, Admin grant enforcement, durable carts, order lifecycle, inventory reservation/release, refunds, Eixon payment, Pathao delivery, Connect notifications, asset storage and monitoring are follow-on implementation phases. No live Edge Function, database migration, production Worker, Supreme registry or custom domain has been changed.
