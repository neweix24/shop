import assert from "node:assert/strict";
import { test } from "node:test";
import { isGuestCodCheckoutEnabled } from "./feature-flags";

test("guest COD checkout stays disabled unless explicitly enabled", () => {
  assert.equal(isGuestCodCheckoutEnabled(undefined), false);
  assert.equal(isGuestCodCheckoutEnabled(""), false);
  assert.equal(isGuestCodCheckoutEnabled("false"), false);
  assert.equal(isGuestCodCheckoutEnabled("TRUE"), false);
  assert.equal(isGuestCodCheckoutEnabled("true"), true);
});
