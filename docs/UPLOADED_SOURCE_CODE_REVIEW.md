# Source-level review of the uploaded NEWEIX Shop archive

**Review date:** 2026-11-25  
**Archive:** `code.zip` (143 entries, approximately 1.35 MB uncompressed)  
**Target:** `neweix24/shop`

## Executive finding

The archive is a substantial storefront UI prototype/source project, but it is not a completed production commerce backend and is not a Cloudflare Worker deployment package. Its own completion report and implementation plan explicitly state that the GitHub repository was not inspected, the project was not committed or deployed, and durable commerce operations and live integrations remain owner tasks.

## Direct source findings

### Runtime and deployment mismatch
- `package.json` builds the API with `esbuild server/_core/index.ts --platform=node` and starts it with `node dist/index.js`.
- `server/_core/index.ts` creates an Express application, an HTTP server, registers Express tRPC middleware, and calls `server.listen(...)`.
- The currently active Cloudflare Worker uses a module entrypoint and does not run this Express process. A Worker-native API boundary and static asset configuration are required; changing a build command alone will not make this runtime compatible.

### Identity and authorization mismatch
- `server/_core/oauth.ts` implements a Manus OAuth callback.
- `server/_core/sdk.ts` validates Manus-issued session JWTs and synchronizes users by Manus `openId`.
- `drizzle/schema.ts` makes Manus `openId` the unique identity key and only defines `user/admin` roles.
- `server/routers.ts` currently exposes only the starter system router and `auth.me/logout`; it does not implement the Shop commerce API.
- This does not meet the ecosystem rule that Account owns customer identity and that Customer, Employee, Admin, and Supreme authorities are distinct. Do not map Manus `admin` or a browser-supplied role into NEWEIX authority.

### Persistence gap
- `server/db.ts` opens a MySQL Drizzle connection only when `DATABASE_URL` exists.
- `drizzle/schema.ts` contains only the users table.
- `server/db.ts` itself ends with a TODO to add feature queries.
- The archive's plan says cart, wishlist, profile, and order-request demo state is kept in browser storage. This is not authoritative order, inventory, payment, or customer-address persistence.

### Payment and delivery gap
- `docs/integrations.md` describes future adapters and webhook verification rather than implemented provider integrations.
- `.env.example` contains empty placeholders for Pathao, bKash, Nagad, Rocket, Eixon, and Supabase.
- The completion report explicitly says live Pathao pricing, payment provider verification, Eixon, durable orders/reviews, and dispatch-origin logic still require implementation and credentials.
- The checkout must not mark payment paid from a browser redirect, invent a Pathao quote, or create an EIX shadow ledger.

### Geography and assets
- `client/src/data/bangladesh.ts` is described by the completion report as 64 districts with representative seeded children and unsupported-area messaging, not a verified complete upazila/union dataset.
- Product photography uses remote Unsplash URLs according to the completion report; production assets need approved/licensed project storage.

### Archive hygiene
Exclude nested source archives, `client/public/__manus__/debug-collector.js`, and `vite.config.ts.bak` from the eventual source import unless an explicit review establishes a legitimate need. Keep `.env.example` as placeholders only. No real secret file was identified in the archive listing.

## Safe implementation plan

1. Import the reviewed source into a dedicated integration branch without overwriting existing Shop files.
2. Keep the React storefront, after verifying its routes and assets against the target repository.
3. Replace the Express runtime with a Worker-compatible entrypoint and route adapters.
4. Select and approve Shop-owned persistence (for example, D1 only after schema/transaction review) and add commerce migrations.
5. Replace Manus customer authentication with a verified Account service contract; no endpoints or token formats should be invented.
6. Add Shop-owned product, inventory, cart, order, address, payment-attempt, delivery, review, and audit operations with server-side authorization and idempotency.
7. Add Eixon only through an approved Shop payment contract. EIX is not an external payment instrument, virtual currency, or P2P transfer mechanism.
8. Add bKash/Nagad/Rocket/Pathao only after obtaining their real server-side credentials, contracts, webhook verification rules, and test environments.
9. Verify official Bangladesh geography data and dispatch-origin configuration.
10. Run typecheck, tests, Worker build, staging smoke tests, security checks, migration/restore tests, then stage and deploy with rollback.

## Publication status

This review is documentation, not an implementation claim. The ZIP source has not been imported into GitHub. The production Worker and DNS were not changed. Production release remains blocked until the implementation and release gates in `docs/PRODUCTION_RELEASE_BLOCKERS.md` are satisfied.
