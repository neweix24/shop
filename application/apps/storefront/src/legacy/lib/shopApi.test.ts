import { describe, expect, it } from "vitest";
import { resolveShopApiUrl } from "./shopApi";

describe("resolveShopApiUrl", () => {
  it("requires an explicit API origin", () => {
    expect(() => resolveShopApiUrl()).toThrow("SHOP_API_NOT_CONFIGURED");
  });
  it("accepts a same-origin API path", () => {
    expect(resolveShopApiUrl("/api/v1/shop")).toBe("/api/v1/shop");
  });
  it("accepts HTTPS API origins", () => {
    expect(resolveShopApiUrl("https://shop-api.example.test/api/v1/shop"))
      .toBe("https://shop-api.example.test/api/v1/shop");
  });
  it("rejects non-local insecure origins", () => {
    expect(() => resolveShopApiUrl("http://shop-api.example.test"))
      .toThrow("SHOP_API_URL_MUST_USE_HTTPS");
  });
});
