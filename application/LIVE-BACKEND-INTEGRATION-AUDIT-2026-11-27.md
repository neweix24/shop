# Live Backend Integration Audit

Audit date: 2026-11-27 (UTC)

This document records read-only observations from the connected Neweix and Eixon Supabase projects. It does not authorize migrations, production writes, checkout activation, or changes to security policy.

## Executive result

- Neweix Supabase project `grhybvlhdnzlopwbaqun`: `ACTIVE_HEALTHY`.
- Eixon Supabase project `fkptltfuivkniypknosa`: `ACTIVE_HEALTHY`.
- Neweix has the Shop schema and the Eixon-only payment-policy migration `20261127085334_shop_eixon_only_payment_policy` recorded in live migration history.
- The deployed Neweix Edge Function `shop-api` is ACTIVE at version 6. It exposes public health/catalog and guest tracking routes, rejects COD with HTTP 410, and rejects checkout with HTTP 503. Account order access returns HTTP 503 until Account SSO is implemented.
- The deployed Eixon Edge Function `supreme-eixon-api` is ACTIVE at version 5. It is restricted to signed internal GET requests and provides read-only ledger overview/accounts/journal-entry routes. It has no Shop payment-intent, confirmation, refund, webhook, or reconciliation write route.
- Eixon schema usage is not granted to `anon` or `authenticated`; it is granted to `service_role` and `postgres`. The Eixon tables have RLS enabled, no client-facing policies, and no direct grants to `anon` or `authenticated`.
- No Shop payment integration or customer SSO was activated during this audit.

## Shop database state

The live migration history includes the Shop foundation, privileges/indexes, guest checkout, legacy COD RPC, catalog metadata, and Eixon-only payment-policy migrations. The Eixon-only policy migration is present in live history.

The live Shop database currently has no catalog, order, or payment activity recorded in the readiness snapshot. Product and variant tables are empty. Checkout must remain disabled until the complete payment and identity contracts are deployed and tested.

The live Shop API function source confirms:
- `GET /health` advertises catalog-read and guest-order-tracking only.
- `GET /ready` checks database availability and reports an empty catalog as empty, not as an operational failure.
- `GET /products` returns active products only.
- `GET /orders` fails closed with `ACCOUNT_SSO_NOT_CONFIGURED`.
- `POST /checkout/cod` returns HTTP 410 with `SHOP_COD_PROHIBITED`.
- `POST /checkout` returns HTTP 503 with `SHOP_CHECKOUT_DISABLED`.
- Guest tracking validates order ID and Bangladesh phone format and applies a database-backed rate limit.
- The function has `verify_jwt=false`; public routes are intentionally unauthenticated. Sensitive customer order access and checkout are not enabled. CORS is not treated as an authorization boundary.

## Eixon integration boundary

The live Eixon function authenticates internal requests with an HMAC signature, timestamp freshness check, and GET-only method restriction. It returns read-only ledger information. This is not a payment contract.

A separate versioned Shop-to-Eixon server-to-server contract is still required. It must define:
1. Payment intent creation with a unique idempotency key and immutable order amount/currency binding.
2. Payment confirmation from Eixon-owned ledger state, never from a Shop client assertion.
3. Signed webhook delivery, replay protection, retry behavior, and event ordering.
4. Refund/void operations and authorization rules.
5. Reconciliation and exception handling.
6. Ownership of ledger writes by Eixon only.
7. Contract versioning, audit correlation IDs, timeout behavior, and negative tests.

Shop must not create or update EIX balances, ledger accounts, journal entries, or postings.

## Security advisor findings and interpretation

### Neweix project

The current Supabase Security Advisor reports:
- 23 RLS-enabled tables without policies.
- 6 SECURITY DEFINER functions executable by `authenticated`.
- Leaked-password protection disabled.

Read-only privilege inspection found that the RLS-without-policy group is mixed:
- Private Account security/rate-limit tables have no application-role table grants; the observed table grants are owned by `postgres`.
- Shop internal tables without policies (rate limits, carts/cart items, delivery jobs, inventory, and payment attempts) have `service_role` grants, but no `anon` or `authenticated` grants.
- Supreme internal tables are in a separate schema and have no observed client-role table grants.
- Public Shop catalog tables have explicit public SELECT grants and active-catalog RLS policies. Customer order-related tables have owner-read policies and authenticated SELECT grants.

Therefore the advisor count must not be "fixed" by adding broad policies. First classify each table by intended access path, confirm schema exposure and grants, then add only narrowly scoped policies where direct client access is actually required. Server-only tables should remain server-only.

The six SECURITY DEFINER functions have an empty search_path and explicitly bind user-scoped operations to `auth.uid()` and the active session. Their current behavior includes username change, listing/revoking the caller's sessions, password-change event recording, session validation, and a Supreme-ruler identity check. These are not to be blindly revoked: review each function's caller contract, ownership checks, and tests, then narrow grants if any caller is unnecessary.

Leaked-password protection is disabled. Enablement should be planned as an Auth security configuration change with a user-facing password-reset/registration impact review and tested before production rollout.

### Eixon project

The current Security Advisor reports six RLS-enabled tables without policies. Read-only privilege inspection confirms:
- The `eixon` schema has no USAGE grant for `anon` or `authenticated`.
- The `eixon` schema is usable by `service_role` and `postgres`.
- Eixon tables have no direct grants to `anon` or `authenticated`.
- Eixon server-side access is through the signed internal function.

These findings are consistent with a server-only ledger boundary. Do not add client-facing policies or expose the schema to PostgREST merely to silence the advisor. Recheck this boundary after any future grant or schema-exposure change.

## Release gates that remain open

1. Deploy and verify the production Shop API runtime behind the canonical Shop API route.
2. Complete Account-issued OIDC/PKCE token validation and positive/negative end-to-end tests.
3. Implement Supreme-approved scoped Admin Grant validation and audit trail.
4. Design and approve the versioned Eixon payment/refund/reconciliation contract.
5. Implement order reservation expiry, cancellation, refunds, and recovery tests.
6. Verify delivery fees, booking, and tracking credentials.
7. Enter only Supreme/Admin-approved real catalog data.
8. Review the security findings above with function-level tests and intended-access documentation.
9. Reconcile the Shop implementation branch with `main` by path-scoped review; do not merge the divergent branch wholesale.

## Change control

This audit performed read-only database inspection and repository documentation work only. No database migration was applied, no live payment or ledger write was performed, no Edge Function was redeployed, and no checkout or production API capability was enabled.
