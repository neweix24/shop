import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeBangladeshPhone } from "./phone";

test("normalizes local Bangladesh mobile numbers", () => {
  assert.equal(normalizeBangladeshPhone("01712345678"), "+8801712345678");
  assert.equal(normalizeBangladeshPhone("+8801712345678"), "+8801712345678");
  assert.equal(normalizeBangladeshPhone("8801712345678"), "+8801712345678");
});

test("rejects invalid Bangladesh mobile numbers", () => {
  assert.equal(normalizeBangladeshPhone("01212345678"), null);
  assert.equal(normalizeBangladeshPhone("0171234567"), null);
  assert.equal(normalizeBangladeshPhone("not a phone"), null);
  assert.equal(normalizeBangladeshPhone(null), null);
});
