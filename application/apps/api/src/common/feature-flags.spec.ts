import assert from "node:assert/strict";
import { test } from "node:test";
import { getShopCheckoutStatus, SHOP_CHECKOUT_RELEASE_BLOCKERS } from "./feature-flags";

test("Shop checkout is disabled and Eixon is the only approved payment policy", () => {
  const status = getShopCheckoutStatus();
  assert.equal(status.checkoutEnabled, false);
  assert.equal(status.paymentPolicy, "eixon_only");
  assert.equal(status.status, "disabled");
});

test("runtime variables cannot enable Shop checkout", () => {
  const names = ["SHOP_GUEST_CHECKOUT_ENABLED", "SHOP_CHECKOUT_ENABLED"];
  const originals = new Map(names.map(name => [name, process.env[name]]));
  try {
    for (const name of names) process.env[name] = "true";
    assert.equal(getShopCheckoutStatus().checkoutEnabled, false);
    assert.equal(getShopCheckoutStatus().status, "disabled");
  } finally {
    for (const name of names) {
      const value = originals.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("checkout status names all release blockers", () => {
  assert.deepEqual(getShopCheckoutStatus().blockers, [
    "eixon_shop_payment_contract",
    "supreme_approved_admin_grant",
    "account_customer_identity_contract",
    "order_review_cancellation_and_audit",
    "reserved_inventory_release",
    "verified_delivery_fee_and_fulfilment",
  ]);
  assert.equal(SHOP_CHECKOUT_RELEASE_BLOCKERS.length, 6);
});
