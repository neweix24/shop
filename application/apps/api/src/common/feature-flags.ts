/**
 * Release flags are deny-by-default. A feature remains unavailable until the
 * owning service contract and policy approval are present in the environment.
 */
export function isGuestCodCheckoutEnabled(
  value: string | undefined = process.env.SHOP_GUEST_CHECKOUT_ENABLED,
): boolean {
  return value === "true";
}
