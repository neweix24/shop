import { describe, expect, it } from "vitest";
import { resolveShopApiUrl } from "./shopApi";

describe("resolveShopApiUrl", () => {
  it("uses the approved Shop API in a production build when no override is set", () => {
    expect(resolveShopApiUrl("production")).toBe(
      "https://grhybvlhdnzlopwbaqun.supabase.co/functions/v1/shop-api"
    );
  });

  it("uses an explicit isolated API URL when configured", () => {
    expect(
      resolveShopApiUrl("preview", "https://shop-api-staging.example.test/")
    ).toBe("https://shop-api-staging.example.test");
  });

  it("never falls back to the production API in a preview build", () => {
    expect(() => resolveShopApiUrl("preview")).toThrow(
      "SHOP_API_NOT_CONFIGURED"
    );
  });

  it("rejects invalid API URLs", () => {
    expect(() => resolveShopApiUrl("preview", "not a URL")).toThrow(
      "SHOP_API_URL_INVALID"
    );
  });

  it("requires HTTPS outside local development", () => {
    expect(() =>
      resolveShopApiUrl("preview", "http://shop-api.example.test")
    ).toThrow("SHOP_API_URL_MUST_USE_HTTPS");
  });

  it("allows an HTTP localhost endpoint only in development", () => {
    expect(resolveShopApiUrl("development", "http://localhost:54321/")).toBe(
      "http://localhost:54321"
    );
  });
});
