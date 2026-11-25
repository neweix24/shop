# NEWEIX delivery TODO

## Storefront and navigation

- [ ] Deliver homepage, product listing/category and search results, product detail, cart, checkout, authentication, customer account, order list/detail/tracking, wishlist, FAQ, contact, privacy/consent, and system/error/loading/empty states.
- [ ] Keep English as the default UI language, structure labels and data for future Bengali support, keep homepage search visible as designed, omit an account menu from the right side of the homepage, provide mobile bottom navigation, and provide a hamburger feature menu.
- [ ] Keep personal profile settings in the account page without a sidebar; keep hamburger links for My Orders, Order Track, Wishlist, Shopping Cart, Language, Wallet, Neweix+, eixverse, FAQ, and Contact; keep Neweix+ separate from financial/payment features.

## Catalog and customer actions

- [ ] Product cards support Add to Cart and Buy Now; Buy Now adds the item and uses the same cart-to-checkout flow; cart persistence survives reloads.
- [ ] Product reviews are viewable without login; review submission can require authentication. Variant stock, quantities, prices, discounts, product imagery, related products, BDT formatting, and visible discount percentages are implemented.
- [ ] Wishlist hearts visibly change state and color; card actions remain balanced and usable on mobile and desktop.

## Bangladesh checkout and integrations

- [ ] Checkout models Bangladesh division → district → upazila → union selection with an extensible geographic data adapter and a safe unsupported-area/manual fallback.
- [ ] Delivery origin is configurable and may be Mymensingh, Dhaka, or another dispatch city; Pathao live pricing is only used through configured API/verified rules and never fabricated.
- [ ] Checkout supports Cash on Delivery, bKash, Nagad, and Rocket. Payment success is never claimed until verified by a provider; secrets remain server-side.

## Authentication, security, and account boundaries

- [ ] Preserve Supabase-compatible/server-side session integration seams, the existing Manus OAuth foundation, callback/session persistence, protected routes, logout, secure cookie behavior, and browser-reopen/back-navigation resilience.
- [ ] Never put service-role keys or secrets in client code. Server operations validate inputs and enforce authorization. Customer identity stays separate from staff identity.
- [ ] Wallet is a feature-menu link; wallet methods in account cover MFS, Card, and Eixon where applicable; Eixon stays distinct from Neweix+.

## Documentation and verification

- [ ] Include README setup, environment variables, local development, database/schema/migrations/seed instructions, Supabase setup, OAuth callback configuration, payment-provider configuration, Pathao configuration, build/test/deploy guidance, owner actions, assumptions, and compatibility gaps.
- [ ] Include focused tests for cart calculations, checkout validation, auth/session helpers, permissions, and pricing behavior where feasible.
- [ ] Run and record typecheck, lint/format checks where available, tests, production build, `/api/health`, and `/manus-routes.json` checks. Package the full source ZIP without committing, pushing, merging, or deploying.
