/**
 * Shop follows the owner-approved Eixon-only payment policy.
 * Checkout remains disabled until Eixon exposes a tested server-to-server
 * intent, confirmation, refund and reconciliation contract.
 */
export const SHOP_CHECKOUT_RELEASE_BLOCKERS = Object.freeze([
  "eixon_shop_payment_contract",
  "supreme_approved_admin_grant",
  "order_review_cancellation_and_audit",
  "reserved_inventory_release",
  "verified_delivery_fee_and_fulfilment",
] as const);

export function isGuestCodCheckoutEnabled(): boolean {
  return false;
}

export function getGuestCheckoutStatus() {
  return {
    checkoutEnabled: false,
    paymentPolicy: "eixon_only" as const,
    status: "disabled" as const,
    blockers: [...SHOP_CHECKOUT_RELEASE_BLOCKERS],
  };
}
