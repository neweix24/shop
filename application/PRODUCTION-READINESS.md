# Neweix Shop Production Readiness

Last verified: 2026-11-27 (UTC)

## Verified live deployment

- Production storefront is deployed to the existing Cloudflare Worker `neweix-shop`.
- Canonical hostname: `https://www.shop.neweix.com`.
- Worker Static Assets serve the storefront. Requests under `/api` intentionally return HTTP 503 until the NestJS API runtime is deployed and verified.
- Supabase project: `Neweix` (`grhybvlhdnzlopwbaqun`), region `ap-southeast-1`, status `ACTIVE_HEALTHY`.
- Supabase Edge Function `shop-api` is ACTIVE at version **6**. The live source now returns HTTP 410 for `POST /checkout/cod` and HTTP 503 for `POST /checkout`. The old COD order-creation call has been removed from the deployed function.
- GitHub remediation branch: `feat/shop-ecosystem-remediation`. PR #2 remains Draft and unmerged.

## Live database observations

- Shop catalogue currently has zero products, zero variants, and zero inventory rows.
- Orders: 0. Payment attempts: 0.
- The live migration history now contains seven Shop migrations, including:
  - `20261125162546_shop_commerce_foundation`
  - `20261125162610_shop_commerce_privileges_and_indexes`
  - `20261125162938_shop_guest_checkout_and_payment_methods`
  - `20261125163016_shop_guest_cod_order_rpc`
  - `20261125165502_shop_catalog_metadata`
  - `20261127085334_shop_eixon_only_payment_policy`
- The Eixon-only policy migration applied successfully on 2026-11-27.
- `shop_orders.payment_method` now accepts only `eixon_wallet`.
- `shop_orders.payment_status` no longer accepts `due_on_delivery`.
- `shop_payment_attempts.provider` now accepts only `eixon`, matching the column default.
- The legacy `shop_create_guest_cod_order` RPC remains only as a compatibility rejection stub. It is SECURITY INVOKER and has no EXECUTE privilege for `anon`, `authenticated`, or `service_role`.
- No existing order or payment-attempt rows were rewritten or deleted. The migration included a precondition that would abort if non-Eixon/legacy COD records existed.

## Release blockers

1. **API runtime:** the NestJS API is built in CI but is not deployed as a live runtime. The Cloudflare Worker currently serves only static assets and a deliberate 503 API boundary.
2. **Account SSO:** no verified Account-issued OIDC/PKCE token-validation adapter is wired into Shop. Shop must not substitute Supabase Auth identities or accept local identities.
3. **Supreme Admin authorization:** product publishing and privileged order operations require a verified Supreme-approved Admin grant, including protected registry authorization and audit trail.
4. **Eixon integration:** the currently deployed `supreme-eixon-api` is a signed, internal, GET-only, read-only adapter. It has no Shop payment intent, confirmation, refund, webhook, or reconciliation write contract. Eixon must design and approve a separate least-privilege Shop server-to-server contract covering intent creation, confirmation, idempotency, webhook/signature verification, refunds, reconciliation, and transaction ownership. Shop must never write Eixon's ledger.
5. **Order lifecycle:** reservation expiry/release, cancellation, returns/refunds, audit events, and recovery paths need end-to-end tests against the final payment flow.
6. **Delivery:** verified delivery fee/coverage and booking/tracking credentials are required before shipping can be quoted or booked. No provider credentials are assumed.
7. **Catalog:** real approved product descriptions, images, SKU/variant prices, and stock counts must be entered by an authorized Admin. No sample products or invented stock may be published.
8. **Admin authority:** the Supreme-approved Admin Grant Contract is currently design-only. No Admin principal or production grant is issued yet.
9. **Source branch:** PR #2 still targets `neweix24-patch-1` rather than `main`. The branch relationship requires an explicit reconciliation and review before merge.

## Security and operational notes

- Supabase security advisor has previously reported RLS-without-policy findings and Account SECURITY DEFINER function findings. These require ownership-aware review; do not blindly add broad policies or revoke Account functions.
- Service-role credentials must remain server-side and must never be included in storefront bundles.
- The current public Shop catalog is empty. The absence of public rows is not a deployment failure.
- Do not enable checkout, publish products, or mark the release ready while any blocker above remains unresolved.

## Release acceptance criteria

A release can be considered complete only after:
- a production API runtime passes health/readiness checks and end-to-end tests;
- Account SSO and Supreme Admin grant validation pass positive and negative authorization tests;
- the Eixon payment/refund/reconciliation contract passes idempotency, signature, replay, timeout, and failure tests;
- the live schema remains Eixon-only and the COD RPC remains non-executable by application roles;
- inventory reservation and order lifecycle tests pass under concurrency;
- delivery fees and booking/tracking are verified;
- real product/catalog data is approved and reconciled;
- security findings are reviewed and documented;
- production domain, API, checkout-disabled/enabled state, monitoring, and rollback are independently verified.

**Current decision:** Storefront deployed; API and checkout remain disabled. The database payment policy is now Eixon-only, but the payment contract and remaining release gates are not complete.
