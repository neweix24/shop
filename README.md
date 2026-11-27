# Neweix Shop

Neweix Shop is Neweix's own single-vendor commerce service.

## Repository status

The reviewed storefront and NestJS commerce implementation is maintained on `neweix24-patch-1` following the squash merge of [PR #2](https://github.com/neweix24/shop/pull/2). The implementation is **not yet integrated into `main`**. The two branches have diverged, so do not merge the entire source-import branch blindly. Use a reviewed, path-scoped integration of the application and its required workflows after reconciling the baseline.

## Production status

- Canonical storefront: [https://www.shop.neweix.com](https://www.shop.neweix.com)
- Cloudflare Worker serves the static storefront.
- `/api` intentionally returns HTTP 503 until the NestJS API runtime is deployed and verified.
- Checkout remains disabled.
- The Supabase payment schema is Eixon-only; this does not mean the Eixon payment integration is complete.
- No real products, variants, or inventory are currently published.

## Release gates

1. Reconcile the application branch with `main` without importing duplicate archives or the legacy `source-import/` tree.
2. Deploy and verify the NestJS API runtime.
3. Integrate Neweix Account OIDC/PKCE; do not create a separate Shop identity system.
4. Enforce Supreme-approved, scoped Admin grants for privileged operations.
5. Complete Eixon's server-to-server payment, refund, webhook, and reconciliation contract. Shop must never write Eixon's ledger.
6. Complete inventory reservation, order lifecycle, delivery, security, monitoring, and rollback tests.
7. Publish only real, approved product and stock data.

## Governance

- Supreme is the ecosystem's highest authority.
- Admin operates day-to-day Shop activities only through Supreme-approved, scoped, auditable grants.
- Shop owns commerce-domain data; Account owns identity; Eixon owns EIX and its financial ledger.
- Cross-service integration must use authenticated, versioned contracts. No direct cross-service database writes.

Canonical governance: [Supreme Ecosystem Governance Charter](https://github.com/neweix24/supreme/blob/main/docs/ecosystem-governance-charter.md).
