import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapCatalogProduct, safeNonNegativeInteger } from "./catalog.types";

describe("catalog mapping", () => {
  it("calculates available stock from server inventory", () => {
    const product = mapCatalogProduct({
      id: "product-1",
      slug: "item-one",
      title: "Item One",
      currency: "BDT",
      shop_product_variants: [{
        id: "variant-1",
        title: "Standard",
        unit_price_minor: "12500",
        is_active: true,
        shop_inventory: [{
          quantity_on_hand: 8,
          quantity_reserved: 3,
        }],
      }],
    });

    assert.equal(product?.variants[0]?.stock, 5);
    assert.equal(product?.variants[0]?.unitPriceMinor, 12500);
  });

  it("fails closed when inventory is missing", () => {
    const product = mapCatalogProduct({
      id: "product-1",
      slug: "item-one",
      title: "Item One",
      currency: "BDT",
      shop_product_variants: [{
        id: "variant-1",
        title: "Standard",
        unit_price_minor: 100,
        is_active: true,
        shop_inventory: [],
      }],
    });

    assert.equal(product?.variants[0]?.stock, 0);
  });

  it("does not publish inactive variants or invalid prices", () => {
    const product = mapCatalogProduct({
      id: "product-1",
      slug: "item-one",
      title: "Item One",
      currency: "BDT",
      shop_product_variants: [
        { id: "inactive", title: "Inactive", unit_price_minor: 100, is_active: false },
        { id: "invalid", title: "Invalid", unit_price_minor: "1.5", is_active: true },
      ],
    });

    assert.equal(product, null);
  });

  it("rejects unsafe integers and negative prices", () => {
    assert.equal(safeNonNegativeInteger(-1), null);
    assert.equal(safeNonNegativeInteger("1.2"), null);
    assert.equal(safeNonNegativeInteger(Number.MAX_SAFE_INTEGER + 1), null);
    assert.equal(safeNonNegativeInteger("250"), 250);
  });
});
