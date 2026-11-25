# Cross-service integration contract audit

**Date:** 2026-11-25  
**Target:** `neweix24/shop`  
**Branch:** `feat/neweix-storefront-integration`  
**Status:** repository-source audit only; no production systems changed.

## Executive decision

The Shop integration must not begin by inventing new identity or payment APIs. The Account repository documents a central identity model and a first-party OIDC/PKCE service-client design. Eixon source contains transfer-request UI/API code, but that behavior conflicts with the latest approved NEWEIX Eixon policy. Shop must not call or expose that transfer functionality.

The separate Shop source archive is still absent from this branch, so implementation against its actual files remains blocked.

## Account contract verified from source documentation

Repository: `neweix24/account`, `docs/identity-architecture.md`.

- Supabase Auth owns credentials, password hashes, verification, sessions, refresh tokens and MFA.
- `public.account` is the canonical profile and references `auth.users(id)`.
- Service-specific business roles remain in the owning service; user-editable Auth metadata must not grant permissions.
- First-party SSO is designed around Supabase OAuth 2.1 / OIDC authorization-code flow with PKCE.
- Clients require exact redirect URI allowlists and least-privilege scopes. Tokens must be checked for issuer, audience, signature, expiry, state/nonce and PKCE; refresh tokens must be rotated and revocable.
- Service registration is explicit. Arbitrary redirect URIs are not allowed.
- The architecture document says enabling the OAuth server and registering clients is a project-level Auth configuration step. Therefore, the documented design is not proof that OIDC is enabled or that Shop is registered.

### Shop requirements

1. Treat Account UUID as the canonical customer identity key; do not create a second customer identity table as an authority.
2. Do not assume a token format, issuer URL, audience, client ID, scope, callback URL or JWKS URL. Obtain the live Account configuration and register Shop as an approved first-party client before implementing SSO.
3. Validate sessions server-side and enforce Account status/service access on protected requests.
4. Keep Shop's Employee/Admin permissions in Shop-owned server-side authorization. Never accept a client-supplied role or promote a customer based on Account profile metadata.
5. Keep Supreme identity and privileged governance completely separate from customer Account login.

## Eixon contract conflict found

Repository: `neweix24/eixon`.

The source currently contains:
- `app/api/eixpay/transfers/route.ts`, with GET/POST/DELETE transfer-request operations and RPC calls `eixpay_list_my_transfers`, `eixpay_request_transfer`, and `eixpay_cancel_transfer`.
- `features/eixpay/eixpay-wallet.tsx`, which imports a transfer-request form and describes EIX ID-based transfers. The UI also describes Eixon as an internal reward unit.

This is source-code evidence, not proof that transfer execution is live. However, it conflicts with the latest approved NEWEIX policy for Eixon.

### Binding policy for Shop integration

- EIX is a Neweix-only token intended to make purchases of Neweix products/services easier. It is not to be described or implemented as virtual currency, a general virtual asset, or an external transaction medium.
- No ordinary P2P sending, wallet-to-wallet transfer, Account ID/username/QR transfer, or merchant-based EIX acquisition.
- Only the designated, controlled gift flow is permitted. Supreme controls the maximum gift limit; the current approved maximum is BDT 1,000.
- Loading/acquisition uses the approved direct online payment flow. Shop must not create an EIX balance, ledger, top-up, transfer or settlement implementation.
- Shop may only consume a documented, approved Eixon Shop-payment contract. No such live contract was verified in the inspected sources.

### Required action before Eixon integration

Eixon's existing transfer UI/API and any underlying RPC/database functions must be reconciled by the Eixon owner with the latest Supreme-approved policy. Shop must not expose or invoke these transfer endpoints. The gift flow must be a separate, Supreme-controlled capability and must not be implemented by reusing a generic transfer endpoint without a policy review.

## Commerce ownership conflict to resolve

Supreme's `docs/ecosystem-feature-inventory.md` and `config/ecosystem-capabilities.json` currently describe `neweix24/neweix` as the owner of storefront, catalog, cart/checkout, orders/payments, Pathao delivery, inventory, customer account and staff operations.

That inventory may be a source inventory or may be stale; it does not by itself prove all those capabilities are deployed and operational. Nevertheless, it creates an ownership conflict with the separate `neweix24/shop` target.

Before production implementation, Supreme/Neweix governance must explicitly designate one canonical commerce owner:
- If `neweix24/shop` becomes canonical, migrate/retire overlapping Neweix commerce routes and data ownership through a controlled migration.
- If `neweix24/neweix` remains canonical, the Shop repository should become a UI/service shell or be retired, not a second order/payment system.

Do not run two independent order ledgers, inventory authorities, payment states, or customer-role systems.

## Work completed in this step

- Verified the Account identity architecture document.
- Verified the Eixon transfer route and wallet UI source.
- Compared those source findings against the latest approved Eixon policy and Supreme's commerce capability inventory.
- Recorded the conflicts and implementation gates in this document.

## Still blocked

- `code.zip` is not present on `feat/neweix-storefront-integration`; source import workflow has not run.
- Live Account OIDC settings and Shop client registration are not verified.
- No approved Eixon Shop-payment API contract or test credentials were found.
- Canonical ownership between `neweix24/neweix` and `neweix24/shop` needs an explicit governance decision.
- No production Worker, DNS, database, payment, Account or Eixon configuration was changed.
