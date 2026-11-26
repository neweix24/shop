export const CHECKOUT_BLOCKERS = [
  "admin_grant_contract",
  "order_review_and_cancellation",
  "reserved_inventory_release",
  "verified_delivery_fee",
  "audited_order_operations",
] as const;

export interface CheckoutReadiness {
  enabled: false;
  status: "disabled";
  blockers: readonly (typeof CHECKOUT_BLOCKERS)[number][];
}

export function getCheckoutReadiness(): CheckoutReadiness {
  return {
    enabled: false,
    status: "disabled",
    blockers: CHECKOUT_BLOCKERS,
  };
}
