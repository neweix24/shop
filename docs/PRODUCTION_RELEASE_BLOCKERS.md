# Production release blockers and ecosystem integration plan

**Service:** NEWEIX Shop  
**Repository:** `neweix24/shop`  
**Review date:** 2026-11-25  
**Authority baseline:** `docs/ECOSYSTEM_MASTER_BLUEPRINT.md`

## Release decision

**Do not promote the uploaded standalone storefront to production yet.** The currently deployed Cloudflare Worker `neweix-shop` was inspected through the Cloudflare API and its active script returns HTTP 503 with the body `Service is not configured yet.`. The existing production deployment is therefore a service shell, not the uploaded storefront.

No production Worker, DNS record, database, payment provider, or Account/Eixon integration was changed by this review.

## Verified archive facts

The uploaded archive is a React/Vite + Express + tRPC + Drizzle/MySQL application. Its own completion report records a successful standalone build and tests, but also explicitly says that the GitHub repository was not inspected and that durable orders, provider payments, Pathao live delivery, Eixon, and production Account authentication are not implemented.

The Express entry point and MySQL2 connection are not a ready Cloudflare Worker deployment. Browser-local order requests are not authoritative orders and must not be represented as confirmed purchases.

## Ecosystem rules that Shop must preserve

1. **Account owns customer identity.** Shop may consume Account-issued, verifiable identity claims through an approved service contract. Shop must not become a parallel identity provider.
2. **Employee/Admin/Supreme identities remain distinct.** Customer role data must never grant staff or Supreme permissions. All privileged authorization is server-side and deny-by-default.
3. **Eixon owns financial state.** Shop must not create a shadow EIX ledger, alter balances, or implement P2P transfer. EIX is not a medium for external transactions or virtual currency. Any permitted Shop payment flow must use an explicitly approved Eixon contract and Supreme-controlled gifting limits remain outside Shop's authority.
4. **Supreme retains reserved authority.** Shop Admin functions may operate routine store workflows only within delegated permissions. High-impact actions and governance controls cannot be self-granted by Shop.
5. **Shop owns commerce data.** Catalog, cart, checkout, orders, inventory, delivery, returns, customer support, and sales reporting remain Shop-owned. Neweix may aggregate status through APIs but must not write directly to Shop's private database.
6. **Initial business model is Neweix's own store.** Multi-vendor functionality is not a launch assumption.
7. **No cancelled developer-facing platform features** may be introduced as part of this integration.

## Required implementation sequence

### 1. Establish a Worker-compatible application boundary
- Preserve the React storefront as a UI source, not as proof of backend readiness.
- Replace the Express bootstrap with a Cloudflare Worker module entry point and Worker-compatible API handlers.
- Remove Node-only server runtime assumptions and validate all dependencies against the Workers runtime.
- Configure static assets and SPA fallback without replacing the current production service until a staged deployment is verified.

### 2. Establish Shop persistence
- Approve and document the production database choice before migration.
- Add Shop-owned schema and migrations for catalog, variants, inventory events, carts, addresses, orders, order items, payment attempts, delivery quotes, reviews, consent, and audit events as appropriate.
- Enforce ownership and stock checks in server-side transactions.
- Treat browser storage only as an optional cart convenience, never as authoritative order or payment state.

### 3. Integrate Account
- Obtain the Account service's current, versioned authentication/identity contract from its maintainers.
- Verify issuer, audience, signature/JWKS or equivalent, expiry, revocation/session semantics, and customer Account ID mapping.
- Do not invent endpoint URLs, token formats, or role claims.
- Do not reuse Manus OAuth as the production identity authority unless Supreme and Account explicitly approve a migration exception.

### 4. Integrate Eixon and payment providers
- Obtain an approved Eixon Shop payment contract and test environment.
- Keep EIX out of external transaction settlement and do not create P2P transfer.
- Implement only approved payment methods with provider-side verification, signed webhooks, idempotency, reconciliation, and audit records.
- Never mark payment successful based only on a browser redirect.
- Until real credentials and contracts exist, payment methods must remain explicitly unavailable or manual-review; no success may be fabricated.

### 5. Integrate delivery and Bangladesh address data
- Use verified division/district/upazila/union data and a manual fallback for unsupported areas.
- Obtain Pathao credentials, coverage rules, dispatch origin, quote expiry, and booking contract.
- Keep all provider credentials server-side.
- Do not display fabricated live prices or booking confirmations.

### 6. Security and operations
- Separate customer and staff authorization.
- Add rate limits, CSRF/session protections as applicable, strict input validation, secure cookies, audit events, and secret isolation.
- Add staging and production environment separation, backups/restore procedures, monitoring, and rollback plan.

## Production release gates

Production publication is blocked until all of the following are verified:

- Worker build and runtime smoke tests pass on the actual Cloudflare runtime.
- Static assets, API routes, and SPA routes work on the staging hostname.
- Database migrations and rollback/recovery are tested.
- Account authentication and resource ownership checks pass.
- Order creation and inventory changes are atomic and idempotent.
- Payment callbacks are cryptographically verified and reconciled.
- Pathao quotes/bookings use verified coverage and server-side credentials.
- No secrets are committed or exposed to client bundles.
- Tests, typecheck, security checks, and production build pass.
- Existing production traffic can be rolled back without data loss.

## Current blockers

- The active `neweix-shop` Worker script is a 503 placeholder.
- The uploaded ZIP has not been imported into this repository.
- This environment has no supported local-directory-to-GitHub upload path for the 143-file archive; the GitHub connector's file-write operations accept text content, not a local ZIP/directory.
- No Account or Eixon service contract was verified from the available repository documentation.
- Real payment and Pathao credentials/contracts and complete geographic data are not present in the archive.

These are implementation blockers, not assumed completed work. The existing production Worker and DNS must remain unchanged until a tested replacement is available.
