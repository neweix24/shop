> **Historical audit snapshot, dated 2026-11-26.** This document records the state observed at that time and is not the current release status. It is superseded for current deployment facts by [application/PRODUCTION-READINESS.md](../application/PRODUCTION-READINESS.md), last verified 2026-11-27, and for governance/payment policy by the [Supreme Ecosystem Governance Charter](https://github.com/neweix24/supreme/blob/main/docs/ecosystem-governance-charter.md). The 2026-11-27 Worker deployment now serves the static Storefront; `/api` still returns HTTP 503 and checkout remains disabled. Current Shop payment policy is Eixon-only; COD is not permitted.

# Neweix Shop — ecosystem research and remediation baseline

**Audit date:** 2026-11-26  
**Repository:** `neweix24/shop`  
**Working branch:** `feat/shop-ecosystem-remediation`  
**Baseline branch:** `neweix24-patch-1` at `639f186c9143cd24f075dc4d46d48ee1c0981905`  
**Authority:** Supreme  
**Status:** Research baseline; implementation and production release remain incomplete.

## 1. Ownership and release authority

The owner decision recorded in [Supreme issue #73](https://github.com/neweix24/supreme/issues/73) designates `neweix24/shop` as the canonical independent Commerce Service and `https://www.shop.neweix.com` as its production hostname. Commerce ownership must be transitioned from the legacy `neweix24/neweix` assignment through Supreme's protected registry/control plane.

That approval is conditional, not a completed deployment. The registry requires a fresh AAL2, device-bound Supreme ruler session and an approved control request. This work must not bypass that control plane or directly mutate Supreme-owned tables.

The Shop is Neweix's own single-vendor store. Multi-vendor marketplace features are out of launch scope. Customer, Employee, Admin, Supreme, and service identities remain separate. Product publishing stays disabled until the delegated Admin identity/grant contract is implemented and tested.

## 2. Repository and branch findings

- The uploaded `code.zip` is present on `neweix24-patch-1` (754,991 bytes).
- The ZIP has already been extracted into `source-import/` on that branch.
- The extracted project is a legacy Vite/React client with an Express/tRPC server and a Drizzle starter schema. It is not the approved Next.js/NestJS target architecture and is not a drop-in replacement for the existing Shop service.
- The ZIP's own completion report describes a rich, reviewable storefront UI, but explicitly says its Account, payment, delivery, geography, durable persistence, and production compatibility were not verified.
- The older `feat/neweix-storefront-integration` branch and open Draft PR #1 predate the upload on `neweix24-patch-1`; their statements that the archive is absent are stale. Do not merge that PR or use it as the current source baseline without a fresh comparison.
- The current ZIP import workflow deletes and recreates `source-import/` before extracting. Do not rerun it after code remediation begins until the workflow is made non-destructive and its archive/path checks are reviewed.

## 3. Current Shop application and API

The imported UI includes homepage, catalog/category browsing, search, product details, cart, checkout, sign-in/account screens, order views/tracking, wishlist, FAQ, and contact pages. It also has cart and wishlist browser persistence and responsive navigation.

Important limitations:
- The client catalog is API-backed and currently receives no published products; it must not be populated with invented product data.
- Some account/order state in the imported UI is browser-local and is not a durable customer/order service.
- The Bangladesh dataset lists district names but only seeds selected upazila/area children. It is not a verified complete administrative geography source.
- Product imagery includes remote placeholder/editorial URLs. Production assets require approved, licensed, resilient storage.
- The original Express/tRPC backend is a starter, not a complete commerce backend.

The deployed Supabase Edge Function `shop-api` is active at version 4. Its current behavior is:
- `GET /health`: reports the Shop API and disabled payment integrations.
- `GET /ready`: checks database connectivity and catalog emptiness.
- `GET /products`: returns active products and variants with server-calculated available stock.
- `GET /orders`: deliberately fails closed with `ACCOUNT_SSO_NOT_CONFIGURED`.
- `POST /track`: guest order lookup by Order ID and checkout phone.
- `POST /checkout`: currently accepts COD only, performs server-side validation, rate limiting, server-side price/inventory calculation, and idempotent order creation for manual review.

A green build does not prove that these flows have passed live end-to-end acceptance with real products, stock, or customer data.

## 4. Live database and runtime evidence

The Neweix Supabase project `grhybvlhdnzlopwbaqun` is active and contains the Shop commerce schema. At audit time, all Shop catalog, inventory, cart, order, payment-attempt, delivery, return, and order-event tables contained zero rows. There are no real products, variants, SKUs, prices, or stock quantities to publish.

The Shop API Edge Function is deployed and active, but Account order access is intentionally unavailable until the first-party Account contract is established. Do not substitute a standalone Supabase Auth identity, Manus OAuth, or a client-provided Account ID.

The Cloudflare Worker `neweix-shop` is still a 503 placeholder. The canonical custom domain `www.shop.neweix.com` is already provisioned and mapped to that Worker in production; the hostname binding is not the problem. The separate Pages project `neweix-shop-preview` is a preview-only deployment of the imported frontend. Production deployments remain disabled for that preview project.

## 5. Cross-service boundaries and verified gaps

### Account

Account is the sole customer identity authority. Its design uses Supabase Auth and a first-party OIDC/OAuth authorization-code flow with PKCE, exact redirect allowlists, token validation, short-lived access tokens, and revocable refresh tokens.

Live configuration and data reviewed for this audit show:
- The Account Supabase project is active.
- The private Shop/service-access table currently has zero rows.
- No Shop first-party client registration or usable Shop OIDC contract was verified.
- The `private.neweix_service_clients` table described in the architecture document is not present in the current private schema.
- No Shop Admin grant contract is registered or tested.

Therefore customer SSO and Admin publishing must remain disabled until Account and Shop have an approved, tested service contract. Customer identity and staff/Admin authorization must not be conflated.

### Eixon

Eixon owns EIX financial state and the ledger. Shop must not keep its own EIX balance, journal, or settlement implementation.

The separate Eixon Supabase project is active, but its principal, external-identity, ledger-account, journal-entry, and posting tables were empty at audit time. The deployed `supreme-eixon-api` is a read-only Supreme/ruler adapter, not a Shop payment API. No approved, live Shop-payment intent/confirmation/refund contract was verified.

Eixon's current financial writes and Shop payment integration must remain disabled until the approved contract, identity binding, idempotency, provider confirmation, refund handling, audit, and reconciliation are implemented and tested.

### Payment-policy alignment

The current Shop API only accepts COD, while the Shop ecosystem-alignment audit says Eixon is the only approved Shop payment route and excludes COD and external gateway methods unless Supreme later approves a policy change. Earlier owner instructions also describe guest COD checkout as permitted. This is a real policy inconsistency, not a technical assumption to settle silently.

Until the authoritative decision is reconciled, do not add or enable any new payment method, do not claim a payment succeeded, and keep all non-verified provider flows disabled. The UI, API, SQL constraints, and policy documentation must eventually express one consistent approved payment policy.

### Supreme

The live Supreme registry currently lists:
- `neweix`: active, production enabled, repository `neweix24/neweix`.
- `neweix-shop`: planned, only a disabled development environment.
- No registered service capabilities or secret references were present in the capability/secret-reference tables.

The owner-approved transition to Shop has not yet been applied through the protected Supreme control plane. A capability catalogue entry is not permission to execute an operation; every enabled capability requires a narrow service API, adapter, authorization check, and audit coverage.

### Neweix headquarters

The Neweix public website is a separate Next.js application and its `/shop` page is currently a Coming Soon introduction to the independent Shop service. That page is not the Shop storefront. Once Shop is accepted for public use, Neweix should link to the canonical Shop hostname rather than duplicating the storefront or claiming that the service is live prematurely.

### Connect and Neweix+

Connect's current delivery plan shows only the foundation phase complete; Account integration, messaging persistence, real-time delivery, attachments, notifications, UI integration, and release verification remain incomplete or blocked. Shop may later consume an approved Connect notification contract, but must not couple its order database to Connect.

The `neweix-plus` repository currently contains domain/architecture documentation rather than a standalone subscription application. Neweix+ subscription state and Eixon payment processing must remain separate domains. Shop remediation must not absorb Neweix+ membership logic.

### Employees

The `employees` repository currently contains only domain documentation. Do not invent employee records or treat a customer Account as an Admin identity. The first Admin grant model must be explicitly approved, server-enforced, and audited before privileged Shop operations are enabled.

## 6. Security and database review notes

- Shop tables have RLS enabled and server-side mutations are intended to use service-role-only operations. That boundary must be preserved and reviewed for every new RPC/API.
- Supabase Security Advisor reports expected no-policy findings for server-only/private tables as well as Shop internals. Do not add broad client RLS policies just to silence those findings.
- Security Advisor also reports authenticated-executable `SECURITY DEFINER` Account/Supreme functions; Account's production audit documents code/grant review and runtime tests still pending. Keep these functions scoped; do not modify them from Shop.
- Performance findings include RLS `auth.uid()` init-plan warnings on Shop owner-read policies and unindexed Supreme foreign keys. These should be assessed with the owning service, not fixed by broad cross-service changes.
- Keep service-role keys, Eixon credentials, Pathao credentials, and Admin secrets out of client bundles, source control, and logs.
- Guest tracking must continue to require both a high-entropy Order ID and checkout phone, with rate limiting and non-enumerating error behavior.
- Product publishing must deny by default until the server validates the Admin grant independently of the UI.

## 7. Remediation order

1. Preserve the ZIP-derived UI and current API as source material; make the importer non-destructive before any future archive refresh.
2. Define the production target structure using the approved Next.js/NestJS modular-service architecture. Port useful ZIP UI components rather than deploying its legacy Express/tRPC server as the production backend.
3. Complete the Shop-owned schema/API: catalog, variants, inventory, cart, checkout, orders, tracking, delivery, returns, reviews, admin audit, and tested transactional invariants. Keep migrations additive and reviewed.
4. Implement fail-closed Account integration and server-side customer ownership checks after the Account OIDC client contract is actually registered.
5. Design the Shop Admin grant/role contract with Supreme and the owner; enable no product-publishing endpoint before enforcement and tests pass.
6. Reconcile the COD versus Eixon-only policy with the authoritative owner/Supreme record. Then implement only the approved payment workflow using server-to-server Eixon confirmation.
7. Implement a verified Bangladesh geography adapter and approved Pathao/manual-delivery contract. Do not fabricate areas, rates, booking references, or tracking.
8. Add approved Connect notifications as a separate, retryable integration; do not make Shop availability depend on an unbuilt messaging product.
9. Run CI, security/IDOR tests, migration validation, preview smoke tests, and explicit release acceptance.
10. Only after the Supreme registry transition and all release gates pass may the production Worker be replaced and the existing canonical hostname serve the new application.

## 8. Audit scope and non-actions

This audit used repository, branch, issue, Cloudflare, and Supabase read-only evidence. It did not apply database migrations, create products or inventory, register OAuth clients, grant Admin access, modify Supreme registry records, change DNS, alter the production Worker, or enable any payment/delivery integration.

A production release is not authorized merely because the owner-approved direction is recorded in an issue comment. The protected Supreme control-plane decision and service-level release tests remain mandatory.


## 9. Additional source-level findings confirmed after baseline

### Authentication callback is intentionally non-functional until Account SSO exists

The current source was checked directly after the baseline audit:
- `server/_core/oauth.ts` has retired the legacy Manus OAuth callback and returns HTTP 410 with `ACCOUNT_SSO_NOT_CONFIGURED`.
- `server/_core/context.ts` always returns `user: null`; it does not authenticate a customer or Admin.
- `server/routers.ts` only exposes starter `auth.me` and `auth.logout` procedures; there is no working Shop sign-in implementation.
- The client sign-in/sign-up screens explicitly state that Account SSO is unavailable.
- The prior `/auth/callback` screen incorrectly claimed to restore a session. It has now been corrected to state that no session was created, and it removes query parameters from browser history without exchanging or trusting callback data.

Therefore no Shop login or authenticated order API is active. This is a deliberate fail-closed state, not a functioning SSO integration.

### Preview environment isolation

The original client API resolver defaulted to the production Supabase Shop API for any Vite build mode. This meant a preview deployment without an explicit API override could silently call the production Shop service.

The remediation branch now:
- resolves the production API fallback only for Vite `production` mode;
- requires an explicit HTTPS API URL for preview/test modes;
- permits HTTP only for localhost during local development;
- has unit tests for production default, explicit staging URL, preview fail-closed behavior, invalid URL, HTTPS enforcement, and local development.
- configures the separate Pages preview project to build with `--mode preview` and disables production deployment for that project.

No staging Shop API has been provisioned. The preview therefore displays a persistent explanatory notice and does not request production products, track production orders, or submit production checkouts.

### Importer safety remediation

The original ZIP importer deleted and recreated `source-import/` and used `rsync --delete`. The remediation branch replaced that behavior with a validated, temporary extraction and non-destructive, conflict-failing import:
- CRC, path traversal, symlink and special-file checks;
- exclusions for secret files, VCS metadata, generated output, nested archives, dependencies and backup/debug files;
- identical existing files are preserved;
- different existing files cause a conflict and stop the import;
- only new files are added;
- the archive is not deleted;
- the workflow now checks out and pushes to the selected branch rather than hard-coding the old import branch.

The import workflow itself has not yet been run against a new archive in this remediation branch; the normal source validation workflow does not execute the ZIP importer. A separate controlled test of the importer is still required before relying on it for another upload.

## 10. Remediation work recorded on `feat/shop-ecosystem-remediation`

- `d72fad0` — ecosystem research baseline report.
- `6555cac` — non-destructive ZIP importer.
- `6942f43` — branch-aware Shop validation workflow.
- `803562d` — preview API isolation guard.
- `827fac9` — API URL resolver tests.
- `09b5a58` — preview API isolation documentation.
- `1991f74` — honest Account callback state.
- `389026e` — persistent preview catalogue/API configuration notice.

Observed GitHub Actions validation:
- Run #86, `45837317190`: importer/workflow changes with Deno check, TypeScript, tests and production build — passed.
- Run #89, `45837882359`: preview API resolver tests and production build — passed.
- Run #90, `45838640787`: Account callback and persistent catalogue/API notice changes, Deno check, TypeScript, tests and production build — passed.

Cloudflare Pages project `neweix-shop-preview` currently builds branch `feat/shop-ecosystem-remediation` using `pnpm build:static --mode preview`. Its latest verified preview deployment is `07fa35e1-0668-4024-9507-265fb9244901`, with successful build and deploy stages. The project has `production_deployments_enabled=false`; the custom domain `www.shop.neweix.com` and production Worker were not changed.

The preview URL is `https://feat-shop-ecosystem-remediat.neweix-shop-preview.pages.dev`. Cloudflare API confirms the deployment and uploaded frontend assets; independent browser rendering could not be verified from this session.

## 11. Remaining high-priority implementation gaps

1. Agree and document the single authoritative Shop checkout policy. The Supreme-authority audit says Eixon-only and excludes COD unless policy changes; prior owner instructions and the current API treat guest COD as allowed. Do not silently reconcile this by code changes.
2. Replace the legacy Vite/React + Express/tRPC starter as the production application with the approved Next.js + NestJS modular architecture, preserving and porting useful ZIP UI components.
3. Define the approved Account OIDC client, PKCE flow, issuer/audience/JWKS, redirects, scopes, claims, revocation and user-service access contract. Then test customer-owned order access.
4. Define the Shop Admin identity/grant contract through Supreme/Employees; add server-side product and inventory operations with deny-by-default authorization, auditable grants, and access tests.
5. Keep product publishing disabled until Admin grants are verified. The catalog is empty; do not seed invented products or stock.
6. Define and test a versioned Eixon Shop payment API only after the checkout policy is approved; keep a single financial ledger in Eixon.
7. Replace sample district/upazila/union data with an approved, verified geography source; configure and test Pathao only with real provider credentials and coverage responses.
8. Replace browser-local order requests with durable server-side order state. Preserve guest tracking only through the existing high-entropy Order ID + checkout phone controls.
9. Add review persistence, order event/audit trail, return lifecycle, notifications, image storage and support workflows only through explicit Shop-owned schemas and approved service contracts.
10. Build the approved production runtime, bind secrets server-side, run security/IDOR tests and migration rollback/restore tests, then pass the Supreme registry transition and production smoke-test gates before deploying the existing www custom domain.


## 12. Deployment target research: Next.js + NestJS on the existing Cloudflare estate

The user's approved architecture target is a Next.js storefront with a NestJS modular monolith API. The current legacy Vite/React + Express/tRPC server is not the production target.

The current Neweix HQ Cloudflare Pages project provides a usable reference for deploying Next.js with OpenNext/Cloudflare. Shop should follow the same Next.js deployment approach for the storefront rather than making the Vite preview its production foundation.

NestJS runtime decision:
- Nest's official Cloudflare Workers FAQ says Nest can run inside Workers, but it is not officially supported and is rarely the best fit. It describes Nest as a backend that typically runs as a long-lived Node.js process.
- Cloudflare's documented option for a long-running containerized backend is Workers + Cloudflare Containers, with the Worker routing requests to the container.
- Cloudflare Containers documentation states that Containers are available on the Workers Paid plan. The Cloudflare account's current plan entitlement has not yet been confirmed.

Recommended target:
1. Next.js storefront on the approved Cloudflare/OpenNext route.
2. NestJS modular monolith API in a long-running Node.js runtime; Cloudflare Container is a candidate only after confirming Workers Paid entitlement and costs. A separate approved Node host is the fallback if Containers are unavailable.
3. The existing `neweix-shop` Worker remains the public edge entry point and should route to the verified API runtime after the service is ready. Do not replace its current 503 placeholder until the staging API and its health/security tests exist.
4. NestJS modules should own Shop catalog, inventory, cart, orders, delivery, returns and support. Payment orchestration must call Eixon's approved API; Account remains the identity provider; Admin permissions must be verified through the approved delegated grant contract.
5. NestJS must not connect directly to Eixon, Account or Supreme private schemas. Use versioned APIs/service identities and audit references.

Research references:
- NestJS Cloudflare Workers guidance: https://docs.nestjs.com/faq/cloudflare-workers
- Cloudflare Node.js compatibility: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
- Cloudflare Containers overview and plan availability: https://developers.cloudflare.com/containers/
- Cloudflare Containers deployment: https://developers.cloudflare.com/containers/guides/deploy/

No paid plan, new runtime, production Worker, or domain configuration has been activated as part of this research.


## Follow-up code remediation (2026-11-26)

The checkout guardrails and request-hardening changes are committed on `feat/shop-ecosystem-remediation`:

- Checkout health now reports guest COD availability only when the server-only `SHOP_GUEST_CHECKOUT_ENABLED` flag is explicitly `true`; the checkout POST route returns HTTP 503 by default until order review, cancellation, and reserved-stock release are in place.
- The frontend consumes this health state and presents a paused checkout rather than allowing an order request that has no operational fulfilment path.
- JSON request bodies are bounded while streaming, before they are buffered or parsed. Deno tests cover the request guard and flag semantics.
- Unapproved delivery claims have been removed. Pending manual-review orders show product subtotal, unconfirmed delivery fee, and pending final payable amount separately.
- A new additive migration optimizes five Shop owner-read RLS policies with `(select auth.uid())`. It has not been applied to the live database because the migration-history query did not return the existing Shop migration versions.
- CI run [#94](https://github.com/neweix24/shop/actions/runs/45840729259) passed TypeScript, Unit Tests, frontend Production Build, Edge Function type-check, and Deno request-guard tests. Cloudflare Pages Preview deployment [696f3098](https://696f3098.neweix-shop-preview.pages.dev) also succeeded from this commit. These changes do not alter the production Worker, domain, Supreme registry, live Edge Function, or live database.


## 13. Owner policy and deployment update (2026-11-27)

The owner has now explicitly confirmed the authoritative Shop payment policy: **Eixon only**. COD, wallet-to-wallet settlement inside Shop, bKash, Nagad, cards, and other external payment gateways are not approved Shop payment routes. Shop must create a payment intent through Eixon's approved server-to-server contract; Eixon remains the sole owner of EIX balances and the financial ledger.

Repository changes on `feat/shop-ecosystem-remediation` now:
- Make the legacy Shop Edge Function COD gate permanently return false; no environment variable can enable COD.
- Change the Edge Function health response to report `paymentPolicy: eixon_only`, COD as not allowed, and Eixon as unavailable until the approved payment contract is implemented.
- Update Deno tests to assert that COD cannot be enabled through runtime configuration.
- Update the NestJS API release status and tests to express Eixon-only policy and retain a fail-closed checkout gate.
- Update application documentation to remove the former COD-as-supported-route language.

These are repository changes only. The live Supabase Edge Function and database have not been modified by these commits. The deployed Cloudflare Worker continues to serve the Storefront; its `/api` path intentionally returns 503 until a verified API runtime is deployed. The Worker does not yet execute the NestJS API.

Current verified blockers remain:
1. Eixon has no approved Shop payment intent/confirmation/refund/reconciliation API contract.
2. Account has no registered Shop OIDC/PKCE client and tested token validation contract.
3. Supreme has not completed the protected Shop service-registry ownership transition or issued a tested Shop Admin grant.
4. Shop's active product, variant and inventory counts remain zero.
5. Delivery pricing, Pathao credentials/coverage and order fulfilment acceptance are not verified.
6. Production HTTP smoke test of `www.shop.neweix.com` remains unverified from this environment.

No production checkout, payment, catalog publishing, or privileged Admin action is enabled.
