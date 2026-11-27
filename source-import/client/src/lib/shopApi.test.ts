import { describe, expect, it } from "vitest";
import { isGuestCodCheckoutEnabled, resolveShopApiUrl } from "./shopApi";

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


describe("isGuestCodCheckoutEnabled", () => {
  it("is fail-closed when the health response omits checkout status", () => {
    expect(isGuestCodCheckoutEnabled({ status: "ok" })).toBe(false);
    expect(isGuestCodCheckoutEnabled(null)).toBe(false);
    expect(isGuestCodCheckoutEnabled({ checkout: { guestCod: true } })).toBe(false);
  });

  it("enables guest COD only for the explicit enabled state", () => {
    expect(isGuestCodCheckoutEnabled({ checkout: { guestCod: "enabled" } })).toBe(true);
    expect(isGuestCodCheckoutEnabled({ checkout: { guestCod: "disabled" } })).toBe(false);
  });
});
