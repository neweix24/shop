# Neweix Shop

Neweix Shop is Neweix's own single-vendor e-commerce service.

The main branch currently contains the repository's domain declaration and canonical governance pointer. The active application work is maintained in the reviewed working branch `feat/shop-ecosystem-remediation`; its Draft PR #2 currently targets the source-import baseline branch `neweix24-patch-1`. This working branch is not yet merged into main.

- Canonical governance: [Supreme Ecosystem Governance Charter](https://github.com/neweix24/supreme/blob/main/docs/ecosystem-governance-charter.md)
- Service ownership: [ECOSYSTEM_ALIGNMENT.md](./ECOSYSTEM_ALIGNMENT.md)
- Canonical host: `https://www.shop.neweix.com`; storefront Worker mapping is documented on the remediation branch.

Do not treat the existence of the hostname or Worker as proof that checkout is active. The current deployed Worker serves the Storefront while `/api` intentionally returns 503. Product catalogue, inventory, Account SSO, Supreme Admin grant, Eixon payment contract, delivery, and order lifecycle remain release gates.
