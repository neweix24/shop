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
