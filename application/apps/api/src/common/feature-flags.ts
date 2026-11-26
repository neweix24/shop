/**
 * Guest COD is deliberately blocked by a source-level release gate.
 * Runtime environment configuration is not a payment-policy decision,
 * Supreme-approved Admin grant, or proof that order/inventory operations work.
 */
export const SHOP_CHECKOUT_RELEASE_BLOCKERS = Object.freeze([
  "authoritative_payment_policy",
  "supreme_approved_admin_grant",
  "order_review_cancellation_and_audit",
  "reserved_inventory_release",
  "verified_delivery_fee_and_fulfilment",
] as const);

const CHECKOUT_RELEASE_APPROVED_IN_CODE = false;

export function isGuestCodCheckoutEnabled(): boolean {
  return CHECKOUT_RELEASE_APPROVED_IN_CODE;
}

export function getGuestCheckoutStatus() {
  return {
    guestCodCheckoutEnabled: isGuestCodCheckoutEnabled(),
    status: "disabled" as const,
    blockers: [...SHOP_CHECKOUT_RELEASE_BLOCKERS],
  };
}
