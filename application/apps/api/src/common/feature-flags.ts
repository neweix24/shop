/**
 * Shop uses Eixon only for payment, but checkout remains disabled until
 * the Supreme-approved Eixon server-to-server contract and operational
 * release gates have been implemented and verified.
 */
export const SHOP_CHECKOUT_RELEASE_BLOCKERS = Object.freeze([
  "eixon_shop_payment_contract",
  "supreme_approved_admin_grant",
  "account_customer_identity_contract",
  "order_review_cancellation_and_audit",
  "reserved_inventory_release",
  "verified_delivery_fee_and_fulfilment",
] as const);

export function getShopCheckoutStatus() {
  return {
    checkoutEnabled: false,
    paymentPolicy: "eixon_only" as const,
    status: "disabled" as const,
    blockers: [...SHOP_CHECKOUT_RELEASE_BLOCKERS],
  };
}
