# Shop Consumer Contract: Eixon Payment v1

Status: **Draft / blocked / not deployed**

Canonical proposed contract: [Eixon Shop Payment Contract v1](https://github.com/neweix24/eixon/blob/docs/shop-payment-contract-v1/docs/contracts/shop-payment-v1.md).

## Ownership

- Shop owns order, immutable item/price snapshot, inventory reservation, delivery, cancellation, returns, and customer-visible order state.
- Account owns identity and issues the immutable customer subject used by Shop.
- Eixon alone owns EIX balances, holds, payment capture, refunds, reversals, and ledger journal entries.
- Supreme is final authority. Admin operates only with Supreme-approved scoped grants.

Shop must never store an authoritative EIX balance or write to Eixon tables. Shop must not treat a client redirect, browser flag, or unverified webhook as proof of payment.

## Proposed Shop flow

1. Complete Account SSO and resolve the immutable Account subject server-side.
2. Validate cart and inventory, create a pending order, and freeze an immutable order snapshot/hash.
3. Request an Eixon quote bound to order ID, Account subject, and snapshot hash.
4. If Eixon returns an approved, unexpired quote, request an idempotent EIX hold.
5. Persist the Eixon payment-intent reference and hold expiry on the Shop order.
6. Confirm inventory reservation and invoke capture only after all Shop preconditions are satisfied.
7. Query Eixon authoritative status after timeouts. Never retry an uncertain capture with a new idempotency key.
8. Mark the order paid only after a verified Eixon captured state or verified signed event followed by status confirmation.
9. On cancellation before capture, release the hold. After capture, use the approved refund workflow; never edit the Eixon ledger.

## Required Shop-side persistence

The implementation should retain:
- Shop order ID and immutable order snapshot hash.
- Account subject reference (not credentials or raw bearer tokens).
- Eixon quote ID, policy version, quoted EIX units, and quote expiry.
- Eixon payment-intent ID, state, EIX units, hold expiry, and final Eixon reference.
- Idempotency keys or safe one-way references sufficient to resolve retries.
- Webhook event IDs and monotonic aggregate version for deduplication.
- Correlation IDs, timestamps, and audit outcomes.

Do not store Eixon secret keys or customer access tokens in Shop rows or browser code.

## Mandatory blockers before implementation

1. **Resolved by Supreme on 2026-11-27:** the nominal denomination is 1 BDT = 1 EIX. Eixon must issue the authoritative quote using the exact BDT order amount, with no silently applied rounding or unapproved spread. If exact precision cannot be represented, reject the quote.
2. Approval of eligible products/categories and exclusion rules.
3. Approval of hold lifetime, inventory reservation, expiry, cancellation, and refund policies.
4. Account issuer, audience, immutable subject, and service-client authentication contract.
5. Supreme-approved Admin Grant scopes for refunds, manual review, and order overrides.
6. Eixon webhook signing, key rotation, retry, and reconciliation contract.
7. Verified delivery fee and fulfilment behavior.

The current Shop catalog uses BDT minor-unit price fields while EIX is a Neweix-only purchase utility token, not money. The approved nominal mapping is 1 BDT = 1 EIX, but Shop must not calculate or authoritatively convert the amount itself. Eixon must return the quote bound to the order snapshot. This decision alone does not enable checkout; all remaining blockers and release gates still apply.

## Failure semantics

- Quote rejected/expired: leave order unpaid; no ledger mutation.
- Hold rejected: leave order unpaid; no ledger mutation.
- Inventory reservation failure after hold: release hold idempotently.
- Capture timeout: state is unknown; query Eixon by original idempotency key/payment-intent ID before retry.
- Capture succeeded but Shop persistence failed: reconcile Eixon status and repair Shop order from authoritative Eixon result.
- Duplicate webhook: ignore after durable event-ID deduplication.
- Invalid/out-of-order webhook: do not mark paid; query Eixon status.
- Refund failure: retain an explicit pending/manual-review state; never claim refund complete.

## Current production state

The deployed Shop API remains fail-closed:
- COD returns HTTP 410.
- Checkout returns HTTP 503.
- Account order access returns HTTP 503 until Account SSO is implemented.

The deployed Eixon internal API is read-only and does not currently expose the proposed Shop payment routes. This document is a consumer integration plan, not an active integration. No production payment or ledger write is authorized by this document.
