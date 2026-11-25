# Uploaded NEWEIX storefront source — integration assessment

**Target repository:** `neweix24/shop`  
**Target branch:** `main`  
**Existing deployment binding:** Cloudflare Worker `neweix-shop`  
**Assessment date:** 2026-11-25

## Decision

Do not copy the uploaded project over the repository root or deploy it unchanged. The archive is a standalone React/Vite + Express + tRPC + Drizzle + MySQL application initialized from a Manus starter. The Shop repository is currently a deployment/domain shell for a Cloudflare Worker and contains only `DOMAIN.md` and the ecosystem blueprint. The archive's own `plan.md` also says the GitHub repository was not inspected and describes the project as a standalone deliverable, not a verified drop-in replacement.

The storefront UI is a useful source foundation, but its server runtime is not a Cloudflare Worker implementation.

## Archive inventory

- React 19, TypeScript, Vite 7, Tailwind CSS 4, wouter.
- Express 4, tRPC 11, Drizzle ORM, MySQL2.
- Manus OAuth/session foundation and `webdev_app_session` cookie.
- Client routes for homepage, shop, search, product, cart, checkout, sign-in/up, account, orders, wishlist, FAQ, contact, privacy, wallet, Neweix+, and eixverse.
- Bangladesh address selector fixture with 64 district names and partial upazila/union hierarchy.
- Checkout options for COD, bKash, Nagad, and Rocket.
- Local browser persistence for cart, wishlist, and order requests.
- Focused unit tests and setup/integration documentation.

## Runtime and production gaps

1. **Cloudflare compatibility:** `server/_core/index.ts` starts an Express server; `mysql2` and the Manus server SDK are Node-oriented dependencies. This is not a Worker entry point.
2. **Persistence:** cart, wishlist, and order-request state is browser-local. The archive does not provide durable catalog, inventory, checkout, or order persistence.
3. **Identity:** the existing authentication is Manus OAuth, not the ecosystem Account service contract. Customer identity must be integrated through Account; staff/Admin/Supreme identities must remain separate.
4. **Payments:** bKash/Nagad/Rocket are UI choices and environment placeholders only. No verified provider checkout/webhook implementation is present.
5. **Delivery:** Pathao is an adapter/documentation placeholder; no verified live quote or booking is implemented.
6. **Geography:** all 64 district names are represented, but upazila/union data is explicitly partial and must not be presented as complete.
7. **Eixon:** the UI mentions Eixon in the ecosystem context, but there is no production Eixon payment integration. Shop must call approved Eixon APIs and must not create or maintain its own shadow financial ledger.
8. **Security:** server-side authorization, idempotent order/payment writes, audit events, rate limits, and durable customer ownership checks must be implemented before production use.

## Required integration architecture

Preserve the repository's Cloudflare Worker deployment target and adapt the application in stages:

- Keep the React storefront routes and visual components as the client foundation.
- Replace the Express bootstrap with a Cloudflare Worker entry point and explicit route/API handlers.
- Use the approved persistence services (for example D1 for relational Shop data, R2 for media, and Durable Objects only where coordination/strong consistency is required) after schema and operational review.
- Integrate customer authentication through the Account service's versioned contract. Do not reuse Manus OAuth as the production identity authority.
- Integrate Eixon only through its approved payment contract; no P2P transfer or client-side balance mutation.
- Implement COD and payment provider flows with server-side verification, webhook signature checks, idempotency, and audit records.
- Implement Pathao as a server-side adapter with verified coverage, dispatch origin, quote expiry, and manual fallback.
- Keep Neweix+ membership separate from payment/wallet features.
- Keep the Shop service's data and authorization boundary independent; Neweix may aggregate status but must not write directly to Shop's private data.

## Import hygiene

When importing the archive's source files, exclude the nested `neweix-source.zip` and `neweix-source.tar.gz` archives, the generated `client/public/__manus__/debug-collector.js`, and the backup `vite.config.ts.bak`. Keep `.env.example` placeholders only; never commit real credentials.

## Validation status

The archive's `COMPLETION_REPORT.md` records a successful TypeScript check, 12 tests, formatting check, and production build for its original standalone Express environment. Those results are not evidence of Cloudflare Worker compatibility and have not been independently rerun against this repository.

No application source has been deployed, no DNS has been changed, and no Cloudflare Worker has been modified by this assessment.
