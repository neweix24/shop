# Neweix Shop ecosystem alignment

**Canonical authority:** [Supreme Ecosystem Governance Charter](https://github.com/neweix24/supreme/blob/main/docs/ecosystem-governance-charter.md)

- Supreme is the highest and final authority. Admin conducts normal daily Shop operations through a Supreme-approved, scoped Admin grant.
- Shop owns catalogue, pricing data, cart, orders, inventory, fulfilment, delivery, returns, and Shop customer support.
- Account owns customer identity, credentials, and sessions. Shop must use the approved first-party Account service-client/OIDC contract and must not create competing customer credentials.
- Eixon owns EIX and the authoritative EIX unit ledger. Shop must use an approved Eixon payment contract and must never hold an EIX balance or write an Eixon ledger entry.
- Current Shop checkout policy is Eixon-only. COD and direct MFS/card/other checkout gateways are not allowed.
- Admin product publication and privileged order operations require a verified Supreme-approved Admin grant. Supreme handles reserved approvals; Admin handles routine operations.
- Connect owns communication notifications; Shop may call an approved Connect API but must not duplicate message storage.
- Shop is Neweix's single-vendor store, not a multi-vendor marketplace.
- Production checkout remains disabled until Account SSO, Admin grants, Eixon intent/confirmation/refund/reconciliation, order lifecycle, delivery and database policy gates are verified.
