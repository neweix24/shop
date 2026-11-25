# Production integration contract

## Identity: Neweix Account

Account is the sole customer identity provider. Shop must use the approved first-party OAuth 2.1/OIDC authorization-code flow with PKCE after Account enables its OAuth server and explicitly registers the Shop client and exact redirect URIs. Validate issuer, audience, signature, expiry, nonce/state, and PKCE. Use short-lived access tokens and revocable, rotated refresh tokens. Never use Manus OAuth, social login, a Shop-local password store, or client-supplied roles. Account currently documents this architecture; enabling the OAuth server and registering Shop remain external prerequisites.

The Shop server maps the verified Account subject to its own customer record. Shop owns commerce authorization and customer order data; Account owns credentials and canonical identity.

## Payments: Eixon only

Eixon owns EIX, wallet balances, the financial ledger, payment lifecycle, settlement, and reconciliation. Shop must not create a shadow wallet, balance, token ledger, or wallet-transfer endpoint. Shop checkout must not offer Cash on Delivery, bKash, Nagad, Rocket, card gateways, or alternate payment methods under the current approved policy.

Implement a server-to-server Eixon Shop payment contract only after Eixon publishes and approves its API, client registration, scopes, webhook signature scheme, idempotency requirements, and refund/void semantics. A browser redirect is never proof of payment. Persist Shop payment attempts with Eixon references, verify signed callbacks or server-side status lookups, and reconcile idempotently. Until the contract and credentials are verified, checkout must remain unavailable and must not create a confirmed order.

Direct online payment methods used to load EIX belong to Eixon, not Shop.

## Delivery: Pathao

Create a server adapter that receives a validated address, selected dispatch origin, and parcel facts. Request a live quote only after official administrative geography and Pathao coverage are verified. Persist provider request/response, quote expiry, and provider reference on the server. If coverage is unsupported or the provider is unavailable, return an explicit manual-review state. Never fabricate a delivery quote or expose provider credentials to the browser.

## Notifications

Order and delivery notifications use the approved Neweix Connect/notification contract. Do not build an independent identity or messaging system inside Shop. If the provider contract is unavailable, record a retryable outbox event and report delivery as pending.

## Commerce data ownership

Shop owns catalog, product variants, cart, checkout, orders, order items, inventory, dispatch, returns, reviews, support, and sales reporting. These records require durable server-side storage, authenticated customer ownership checks, staff permission checks, idempotency, and audit events. Other services must not write directly to Shop's private database.

Recommended additive tables: products, product_variants, inventory_events, carts, cart_items, customer_addresses, orders, order_items, payment_attempts, delivery_quotes, returns, reviews, consents, outbox_events, and audit_events. Review and version all migrations before applying them to production. Seed operations must be idempotent and must not overwrite customer data.

## Supreme governance and Neweix coordination

Supreme remains the highest authority for reserved policy and high-impact approvals. Neweix provides central navigation, service directory, and administration coordination. Shop exposes narrowly scoped, auditable service APIs; it must not expose Supreme secrets or let Admin override reserved Supreme decisions.

## Release gate

Do not deploy until Account SSO, durable Shop commerce APIs/database, Eixon payment verification, Pathao/manual-delivery rules, notifications, monitoring, backups, and production smoke tests are implemented and integration-tested. Missing credentials or unavailable providers must disable the corresponding action, not trigger a simulated success.
