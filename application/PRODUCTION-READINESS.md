# Neweix Shop Production Readiness

Last verified: 2026-11-27 (UTC)

## Verified live deployment

- Production storefront is deployed to the existing Cloudflare Worker `neweix-shop`.
- Canonical hostname: `https://www.shop.neweix.com`.
- Worker Static Assets serve the storefront. Requests under `/api` intentionally return HTTP 503 until an authenticated, production-ready API runtime is deployed.
- Supabase project: `Neweix` (`grhybvlhdnzlopwbaqun`), region `ap-southeast-1`, status `ACTIVE_HEALTHY`.
- Supabase Edge Function `shop-api` is ACTIVE at version 5. Its checkout handler is fail-closed; guest Account order access returns `ACCOUNT_SSO_NOT_CONFIGURED`.
- GitHub remediation branch: `feat/shop-ecosystem-remediation`. PR #2 remains Draft and unmerged.

## Live database observations

- Shop catalog currently has zero products, zero variants, and zero inventory rows.
- The production migration history contains six Shop migrations:
  - `20261125162546_shop_commerce_foundation`
  - `20261125162610_shop_commerce_privileges_and_indexes`
  - `20261125162938_shop_guest_checkout_and_payment_methods`
  - `20261125163016_shop_guest_cod_order_rpc`
  - `20261125165502_shop_catalog_metadata`
- Legacy database constraints still enumerate COD and external payment methods in Shop order/payment tables. This is a policy/schema mismatch even though the deployed Edge Function and current application source reject/disable those methods.
- Do not modify production schema until the migration files and remote migration history are reconciled. A corrective migration must remove COD and external gateway options and retire the guest COD RPC atomically, with a reviewed rollback/forward-fix plan.

## Release blockers

1. **API runtime:** the NestJS API is built and tested in CI but is not deployed as a live runtime. The Cloudflare Worker currently serves only static assets and a deliberate 503 API boundary.
2. **Account SSO:** no verified Account-issued OIDC/PKCE token validation adapter is wired into Shop. Shop must not substitute Supabase Auth identities or accept local identities.
3. **Supreme Admin authorization:** product publishing and privileged order operations require a verified Supreme-approved Admin grant, including the protected registry authorization flow and audit trail.
4. **Eixon integration:** Eixon must expose and approve a Shop server-to-server payment contract covering intent creation, confirmation, idempotency, webhook/signature verification, refunds, reconciliation, and transaction ownership. Shop must never write Eixon's ledger.
5. **Order lifecycle:** reservation expiry/release, cancellation, returns/refunds, audit events, and recovery paths need end-to-end tests against the final payment flow.
6. **Delivery:** verified delivery fee/coverage and booking/tracking credentials are required before shipping can be quoted or booked. No provider credentials are assumed.
7. **Catalog:** real approved product descriptions, images, SKU/variant prices, and stock counts must be entered by an authorized Admin. No sample products or invented stock may be published.
8. **Database policy alignment:** legacy payment-method constraints and the guest COD RPC remain in the production schema. Correct them only after migration reconciliation and a reviewed migration.

## Security and operational notes

- Supabase security advisor currently reports 23 RLS-enabled tables without policies (including internal/private tables and Shop operational tables), six authenticated-executable SECURITY DEFINER functions in the Account schema, and leaked-password protection disabled. These findings require ownership-aware review; do not blindly add broad policies or revoke Account functions without their owners' approval.
- Service-role credentials must remain server-side and must never be included in storefront bundles.
- The current public Shop catalog is empty. The absence of public rows is not a deployment failure.
- Do not enable checkout, publish products, or mark the release ready while any blocker above remains unresolved.

## Release acceptance criteria

A release can be considered complete only after:
- a production API runtime passes health/readiness checks and end-to-end tests;
- Account SSO and Supreme Admin grant validation pass positive and negative authorization tests;
- Eixon payment/refund/reconciliation contract passes idempotency, signature, replay, timeout, and failure tests;
- schema constraints match Eixon-only policy and the COD RPC is retired;
- inventory reservation and order lifecycle tests pass under concurrency;
- delivery fees and booking/tracking are verified;
- real product/catalog data is approved and reconciled;
- security advisor findings are reviewed and documented;
- production domain, API, checkout-disabled/enabled state, monitoring, and rollback are independently verified.
