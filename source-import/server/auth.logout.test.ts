import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("guest-safe auth boundary", () => {
  it("does not manufacture a signed-in identity before Account SSO is configured", async () => {
    const ctx = {
      user: null,
      req: { protocol: "https", headers: {} },
      res: {},
    } as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    expect(await caller.auth.me()).toBeNull();
  });

  it("logout is safe when the guest has no Shop session", async () => {
    const ctx = {
      user: null,
      req: { protocol: "https", headers: {} },
      res: {},
    } as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    expect(await caller.auth.logout()).toEqual({ success: true });
  });
});
