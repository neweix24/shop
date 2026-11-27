# Neweix Shop Governance Boundary

**Canonical authority:** [Supreme-led Neweix Ecosystem Governance](https://github.com/neweix24/supreme/blob/main/GOVERNANCE.md)  
**Canonical registry:** [Ecosystem Service Registry](https://github.com/neweix24/supreme/blob/main/config/ecosystem-service-registry.json)  
**Service repository:** `neweix24/shop`

## Service responsibility

Single-vendor Neweix store. Own catalog, variants, inventory, carts, orders and fulfilment. Guest ordering remains a product requirement, with identity optional where policy allows.

## Observed implementation status

Storefront deployed from feat/shop-ecosystem-remediation; API runtime and checkout remain disabled. PR #2 is draft/unmerged; do not assume main contains the application.

## Required dependencies

Account identity/SSO when a customer chooses to sign in; Eixon payment intent/confirmation/refund/reconciliation; Supreme-approved scoped Admin grants; verified delivery contract.

## Explicit boundaries

Store EIX balance or ledger, implement a second customer identity system, enable COD/MFS/card fallback, or activate checkout before all release gates pass.

## Authority model

- **Supreme is the highest authority** for ecosystem policy, service registration, privileged approval, top-level Admin grants, security exceptions and high-risk production activation.
- **Admin operates day-to-day activities across the ecosystem** only through explicit, scoped, time-bounded and auditable grants issued under Supreme policy.
- Service maintainers and service automation may operate only their own service resources. Repository write access does not confer production Admin authority.
- This repository may define service-specific operational roles, but may not redefine the global hierarchy or override the canonical registry.

## Change discipline

Changes to global policy or cross-service contracts must be proposed against the canonical governance repository and reviewed for impact on every affected service. Local documentation is subordinate to the canonical governance baseline. Do not copy the full ecosystem blueprint into this repository.

Production activation remains blocked wherever the observed status above or the canonical registry lists incomplete security, identity, payment, data or deployment gates.
