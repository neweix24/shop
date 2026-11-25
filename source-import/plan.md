# NEWEIX Shop — implementation plan

## Scope and assumptions

This project is a fresh source deliverable initialized from Manus's React/Express/tRPC/Drizzle web starter. The named GitHub repository was not inspected or modified; this is therefore a coherent standalone implementation, not a verified drop-in replacement. The customer-facing experience defaults to English and keeps copy/data structures ready for a future Bengali locale. The managed server/database capabilities remain enabled for real auth, order persistence, payment callbacks, and delivery integrations, but no external credential is assumed.

## Implementation approach

- Build a responsive React storefront with wouter routes for the homepage, catalog/search, product detail, cart, checkout, auth, account, wishlist, orders/tracking, FAQ, contact, privacy, wallet, membership, eixverse, and system states.
- Keep the existing Manus OAuth/session implementation intact and use its `webdev_app_session` cookie behavior. Account and order pages are protected at the UI boundary and server-side tRPC remains the authorization seam.
- Define typed product, cart, wishlist, address, order, and pricing helpers in small client modules. Persist cart/wishlist/profile/order-request state locally for a usable no-credential demo while keeping server procedures and database migration seams documented for production persistence.
- Use BDT formatting, explicit discount percentages, variant and stock handling, viewable public reviews, a polished editorial-commerce visual system, and mobile bottom navigation plus feature drawer.
- Model Bangladesh address selection as an official-data adapter boundary with a seed dataset and unsupported-area fallback. Delivery pricing stays manual/unknown unless a configured Pathao adapter returns a verified result; no fabricated live quote is shown.
- Use payment choices Cash on Delivery, bKash, Nagad, and Rocket. Checkout only records an order request/awaiting-confirmation state; it never claims a provider payment succeeded.
- Include server-side configuration seams for Supabase, provider webhooks, Pathao, payments, and future schema migration. No service-role key is placed in browser code.

## Design system

### Considered styles

1. Swiss editorial commerce — 0.07 probability: disciplined type, asymmetric product storytelling, and a quiet premium palette.
2. Warm atelier catalog — 0.06 probability: tactile paper surfaces, earthy ink, and craft-market warmth.
3. Neo-retail utility — 0.05 probability: high-contrast grids, loud labels, and dense merchandising.

Chosen: **Swiss editorial commerce**.

- **Design Movement:** Contemporary Swiss editorial design translated into a Bangladeshi independent commerce context.
- **Core Principles:** precise hierarchy, tactile product focus, calm confidence, and useful motion.
- **Color Philosophy:** ink black and parchment create trust and focus; a single saffron-lime accent gives NEWEIX a recognizable retail signal without making the interface noisy.
- **Layout Paradigm:** offset editorial spreads and full-bleed image moments rather than a centered template grid; product cards sit in measured rows with generous negative space.
- **Signature Elements:** fine hairline rules, oversized condensed headings, and small saffron-lime utility tabs for offers and state.
- **Interaction Philosophy:** every action gives clear feedback; cart, wishlist, and checkout changes are reversible and never imply external success without verification.
- **Animation:** restrained 180–260ms ease-out transitions, soft image scale on hover, drawer slide, and no looping decorative motion.
- **Typography System:** `DM Sans` for interface and body copy, `Space Grotesk` for display headlines, uppercase micro-labels with tracking for commerce metadata.
- **Brand Essence:** an independent edit of useful, well-made objects for modern Bangladesh; precise, optimistic, considered.
- **Brand Voice:** headlines are short and editorial; CTAs are direct and specific. Example lines: “A better edit of everyday.” / “Keep it in your orbit.”
- **Wordmark & Logo:** an all-caps NEWEIX wordmark paired with a notched six-point spark mark, suggesting a considered find without imitating a generic marketplace icon.
- **Signature Brand Color:** saffron-lime `#d7e65f`, used sparingly for offer chips, active states, and the brand spark.

## Project structure

- `client/src/App.tsx` — route map, shared layout, drawers, responsive navigation, page modules.
- `client/src/index.css` — editorial visual system and responsive states.
- `client/src/lib/catalog.ts` — typed product catalog, pricing, and search helpers.
- `client/src/lib/store.ts` — cart/wishlist/order-request persistence and calculation helpers.
- `client/src/data/bangladesh.ts` — extensible division/district/upazila/union adapter fixture and unsupported-area messaging.
- `server/_core/*` — preserved starter OAuth/session/runtime foundation.
- `server/routers.ts`, `server/db.ts`, `drizzle/*` — server/database seams and user persistence foundation.
- `tests/*` — pure critical behavior tests for cart, pricing, checkout validation, and permission helpers.
- `README.md`, `.env.example`, `docs/*` — setup, schema, integration, deployment, and limitations.

## Build workflow

Run `pnpm check`, `pnpm test`, `pnpm build`, and a local `pnpm dev` health check. Package the complete source tree (excluding `node_modules`, build output, local logs, and git metadata) as `/home/ubuntu/neweix/neweix-source.zip`. Do not commit, push, checkpoint, merge, or deploy.
