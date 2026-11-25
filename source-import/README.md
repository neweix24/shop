# NEWEIX Shop

NEWEIX is a premium editorial-commerce storefront for useful objects in Bangladesh. This source project is a fresh React/Express/tRPC/Drizzle implementation initialized from the Manus web starter. The named GitHub repository (`github.com/neweix24/neweix`) was not inspected or modified, so this should be treated as a standalone reviewable source deliverable, not a verified drop-in replacement.

## Local development

Requirements: Node 20+, pnpm 10.18.0, and the environment values needed for any enabled integration. Install with `pnpm install`, then start the full development server with `pnpm dev`. The app listens on `PORT` (default 3000) and exposes `GET /api/health`. The frontend route manifest is available at `GET /manus-routes.json`.

Useful commands are `pnpm check` for TypeScript, `pnpm test` for focused unit tests, `pnpm build` for the Vite frontend plus Express bundle, `pnpm start` for the production bundle, `pnpm format` for Prettier, `pnpm db:migrate` to apply checked-in migrations, and `pnpm db:push` to generate/apply schema changes after review.

## What is implemented

The project includes the responsive homepage, catalog/category/search, product detail with variants/stock/discounts/reviews, persistent local cart, Buy Now routed through cart, wishlist, checkout, Bangladesh division/district/upazila/union selectors, payment method choices, safe delivery/payment pending states, auth screens wired to the existing Manus OAuth foundation, account settings, orders/order requests/tracking, FAQ, contact, privacy/consent, Wallet, Neweix+, eixverse, responsive mobile navigation, feature drawer, loading/error/empty states, a static route manifest, and a restrained editorial design system.

Local browser persistence makes the source usable without credentials. `neweix-cart-v1`, `neweix-wishlist-v1`, and `neweix-order-requests-v1` are local demo/persistence keys. Checkout deliberately stores an **order request** and never claims a payment succeeded or displays a fabricated live delivery quote. Production persistence should be connected through protected server procedures before treating the request as an official order.

## Auth and session behavior

The starter's Manus OAuth routes, `webdev_app_session` cookie contract, server-side JWT validation, tRPC context, and logout behavior are preserved. The UI uses `/signin`, `/signup`, `/forgot-password`, and `/auth/callback` routes. The auth callback returns to `/account` using `history.replaceState` so browser back navigation does not expose the login screen. For a Supabase-based customer auth adapter, use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only for browser-safe values and keep `SUPABASE_SERVICE_ROLE_KEY` server-side. Implement refresh/cookie persistence in the server adapter, not in client storage.

## Bangladesh delivery and payment

`client/src/data/bangladesh.ts` is an adapter-shaped geography layer for the UI. It exposes all 64 district names, seeds representative hierarchy examples, and leaves unseeded upazila/union children empty so unsupported areas go to manual handling rather than being invented. Replace or extend the children from the owner's verified authoritative division/district/upazila/union dataset before launch. The UI never converts this fixture into a live delivery quote.

Configure a server-side Pathao adapter with `PATHAO_CLIENT_ID`, `PATHAO_CLIENT_SECRET`, and `PATHAO_BASE_URL` only after verifying the owner's Pathao account, origin city, coverage, and pricing rules. The UI falls back to manual handling when Pathao is unavailable or an area is unsupported. Delivery origin is intentionally not hardcoded and should be stored per order/dispatch location.

Payment choices are Cash on Delivery, bKash, Nagad, and Rocket. Configure provider secrets server-side (`BKASH_*`, `NAGAD_*`, `ROCKET_*`) and add webhook/signature verification before changing an order from pending to verified. Never expose provider secrets in `VITE_*` variables or claim success from a client redirect alone. Eixon is intentionally separate from the Neweix+ membership surface.

## Database, migrations, and seed

The selected Webdev resource provides a managed MySQL-compatible database through `DATABASE_URL`. The starter `users` table migration remains in `drizzle/0000_initial_users.sql`. A production handoff should add reviewed tables for products, variants, inventory, wishlists, carts, addresses, orders, order items, payment attempts, delivery quotes, and review moderation. Every customer-owned table must include an authenticated user key and server-side ownership checks. Run `pnpm db:push` only after reviewing the generated migration against the shared managed database; `pnpm db:migrate` applies checked-in migrations. Seed data should be idempotent and must not overwrite customer edits.

## Owner actions still required

The owner must review the standalone implementation against the existing repository, merge or adapt it as desired, provide/enable the Supabase and OAuth callback configuration, replace the geography fixture with verified authoritative Bangladesh data, configure production Pathao and payment provider credentials through protected server secrets, decide the dispatch-origin model, add durable product/order/review procedures, confirm staff/customer permission boundaries, and run provider webhook/sandbox verification. This deliverable intentionally does not commit, push, merge, or deploy.

## Checks

The delivery report records the latest `pnpm check`, `pnpm test`, `pnpm build`, `/api/health`, and `/manus-routes.json` checks. The full source archive should exclude `node_modules`, `dist`, `.manus-logs`, `.git`, local secret files, and generated build output.
