import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHECKOUT_BLOCKERS, getCheckoutReadiness } from "./checkout-readiness";

describe("checkout readiness", () => {
  it("remains disabled until each operational prerequisite is implemented", () => {
    const readiness = getCheckoutReadiness();
    assert.equal(readiness.enabled, false);
    assert.equal(readiness.status, "disabled");
    assert.deepEqual(readiness.blockers, CHECKOUT_BLOCKERS);
    assert.ok(readiness.blockers.includes("reserved_inventory_release"));
  });
});
