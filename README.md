# Neweix Shop

Neweix Shop is Neweix's own single-vendor e-commerce service.

The active application work is maintained in `feat/shop-ecosystem-remediation`. Draft PR #2 currently targets `neweix24-patch-1`, the source-import baseline. The PR remains draft and unmerged; this branch is not yet part of main.

- Canonical governance: [Supreme Ecosystem Governance Charter](https://github.com/neweix24/supreme/blob/main/docs/ecosystem-governance-charter.md)
- Service ownership: [ECOSYSTEM_ALIGNMENT.md](./ECOSYSTEM_ALIGNMENT.md)
- Application: [application/README.md](./application/README.md)
- Release status: [application/PRODUCTION-READINESS.md](./application/PRODUCTION-READINESS.md)
- Canonical host: `https://www.shop.neweix.com`

The deployed Worker serves the static Storefront while `/api` intentionally returns 503. Product catalogue, inventory, Account SSO, Supreme Admin grant, Eixon payment contract, delivery, and order lifecycle remain release gates. Do not enable checkout or claim full production commerce before every acceptance gate passes.
