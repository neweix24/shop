import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getGuestCheckoutStatus,
  isGuestCodCheckoutEnabled,
  SHOP_CHECKOUT_RELEASE_BLOCKERS,
} from "./feature-flags";

test("COD is never an enabled Shop payment method", () => {
  assert.equal(isGuestCodCheckoutEnabled(), false);
  assert.equal(getGuestCheckoutStatus().checkoutEnabled, false);
  assert.equal(getGuestCheckoutStatus().paymentPolicy, "eixon_only");
  assert.equal(getGuestCheckoutStatus().status, "disabled");
});

test("runtime configuration cannot bypass the source release gate", () => {
  const original = process.env.SHOP_GUEST_CHECKOUT_ENABLED;
  process.env.SHOP_GUEST_CHECKOUT_ENABLED = "true";
  try {
    assert.equal(isGuestCodCheckoutEnabled(), false);
    assert.equal(getGuestCheckoutStatus().checkoutEnabled, false);
  } finally {
    if (original === undefined) delete process.env.SHOP_GUEST_CHECKOUT_ENABLED;
    else process.env.SHOP_GUEST_CHECKOUT_ENABLED = original;
  }
});

test("checkout status names the unresolved Eixon and operational prerequisites", () => {
  assert.deepEqual(getGuestCheckoutStatus().blockers, [
    "eixon_shop_payment_contract",
    "supreme_approved_admin_grant",
    "order_review_cancellation_and_audit",
    "reserved_inventory_release",
    "verified_delivery_fee_and_fulfilment",
  ]);
  assert.equal(SHOP_CHECKOUT_RELEASE_BLOCKERS.length, 5);
});
