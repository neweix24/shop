import { describe, expect, it } from "vitest";

type Customer = { id: number; ownerId: number };
const canAccessCustomerRecord = (sessionUserId: number | undefined, record: Customer) => Boolean(sessionUserId && sessionUserId === record.ownerId);

describe("customer record permissions", () => {
  it("only allows the owning authenticated customer", () => {
    expect(canAccessCustomerRecord(42, { id: 1, ownerId: 42 })).toBe(true);
    expect(canAccessCustomerRecord(7, { id: 1, ownerId: 42 })).toBe(false);
    expect(canAccessCustomerRecord(undefined, { id: 1, ownerId: 42 })).toBe(false);
  });
});
