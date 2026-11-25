# Shop ecosystem alignment audit

**Authority:** Supreme  
**Architecture source:** `docs/ECOSYSTEM_MASTER_BLUEPRINT.md`  
**Status:** remediation required; not production-ready.

## Approved ownership

Shop is the ecosystem's Online Store service. It owns catalog, cart, checkout, orders, inventory, delivery, returns, customer support, and sales reporting. It must use versioned service APIs and must not write directly to Account, Eixon, Supreme, or other services' private databases.

- Account owns customer credentials, sessions, verification, and canonical customer identity.
- Eixon owns EIX, wallets, balances, financial ledger, payment lifecycle, settlement, and reconciliation.
- Supreme owns highest-level governance, reserved approvals, policy, and audit authority.
- Neweix is the central headquarters, service directory, and administration coordination layer.
- Shop initially serves Neweix's own store. Multi-vendor support is not part of launch scope.

## Approved Shop payment boundary

Eixon is the only approved Neweix ecosystem payment route for Shop checkout. Shop must never maintain a shadow EIX balance or ledger, perform wallet-to-wallet transfers, or claim payment success from a browser redirect. A payment must be confirmed server-to-server through an approved Eixon Shop payment contract, with idempotency and auditable references.

Direct payment providers used to load EIX are Eixon's responsibility, not alternate Shop checkout methods. Cash on Delivery, bKash, Nagad, and Rocket must not be presented as Shop checkout methods unless a later Supreme-approved policy explicitly changes this boundary.

## Required integrations

1. Account: first-party customer authentication and verified identity claims.
2. Eixon: server-side payment intent, confirmation, refund/void contract as approved, and reconciliation reference.
3. Pathao: server-side delivery quote/booking/tracking adapter; manual handling only as a clearly labelled fallback.
4. Connect/notification capability: order and delivery notifications through approved service contracts.
5. Supreme: governance and auditable approval for reserved/high-impact actions.
6. Neweix: central service directory and admin navigation; no direct cross-service database writes.

## Confirmed gaps in imported source

- The imported source uses Manus OAuth and a Manus-specific user identifier. This conflicts with the Account identity architecture.
- The Drizzle schema contains only a starter `users` table. It is not a Shop commerce schema.
- The tRPC router contains only starter system and auth procedures. Durable catalog, cart, checkout, order, inventory, returns, and payment APIs are absent.
- Checkout currently saves an order request in browser storage. This is not a durable order and must never be represented as one.
- Checkout currently offers Cash on Delivery, bKash, Nagad, and Rocket. These conflict with the approved Eixon-only Shop payment boundary.
- Bangladesh geography data is incomplete below district level. Unseeded areas must not be fabricated.
- Pathao, Account, Eixon, notification, and Supreme credentials/contracts are not verified as configured in this repository.
- The Cloudflare Worker was previously verified as a 503 placeholder with no bindings. It is not a production storefront.

## Remediation rules

- Remove Manus-specific authentication and use Account's approved first-party OIDC/OAuth contract only after the Account OAuth server and Shop client registration are enabled and verified.
- Remove alternate Shop checkout methods and fail closed until Eixon's server-side Shop payment contract is available.
- Replace browser-only order requests with authenticated, durable Shop APIs and reviewed database migrations.
- Keep secrets server-side. Never put service-role keys, payment secrets, or provider tokens in browser variables.
- Add ownership checks, idempotency, audit events, webhook signature verification, and integration tests.
- Use a verified Bangladesh administrative geography dataset and Pathao coverage/pricing data. Never infer delivery availability.
- Do not deploy the Worker until it has the complete application, required bindings, health checks, and passing production smoke tests.
- Do not introduce cancelled Developer Marketplace, Developer Portal, third-party developer API, onboarding, billing, or publishing features.

## Release gate

A green frontend build is not a production release. Production is blocked until Account login, durable commerce persistence, Eixon payment verification, Pathao/manual-delivery rules, operational monitoring, and Cloudflare deployment are integration-tested. Any unavailable provider must be explicitly disabled rather than simulated.
