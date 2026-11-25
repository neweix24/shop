import { describe, expect, it } from "vitest";
import { bangladeshAreas } from "../data/bangladesh";
import { discountPercent, getVariant, products } from "./catalog";
import { addToCart, cartSubtotal, validateCheckout } from "./store";

describe("NEWEIX pricing", () => {
  it("calculates a visible discount percentage from compare-at pricing", () => {
    const product = products.find(item => item.slug === "arc-desk-lamp")!;
    expect(discountPercent(getVariant(product))).toBe(13);
  });

  it("calculates subtotal from selected variants and quantities", () => {
    const lamp = products.find(item => item.slug === "arc-desk-lamp")!;
    const notebook = products.find(item => item.slug === "daily-notebook")!;
    expect(
      cartSubtotal(
        [
          { productId: lamp.id, variantId: "standard", quantity: 2 },
          { productId: notebook.id, variantId: "saffron", quantity: 1 },
        ],
        id => products.find(item => item.id === id),
        (product, id) => getVariant(product, id)
      )
    ).toBe(10480);
  });

  it("caps add-to-cart quantity at available stock", () => {
    const items = addToCart("nx-001", "standard", 999, 18);
    expect(items[0]?.quantity).toBe(18);
  });
});

describe("NEWEIX checkout validation", () => {
  it("requires the complete Bangladesh address hierarchy and payment choice", () => {
    expect(
      validateCheckout(
        {
          name: "A",
          phone: "01",
          division: "Dhaka",
          district: "Dhaka",
          upazila: "Dhanmondi",
          union: "Road 2",
          line1: "1 Main Road",
        },
        "Cash on Delivery"
      ).valid
    ).toBe(true);
    expect(validateCheckout({ name: "A" }, "").valid).toBe(false);
  });

  it("exposes all 64 Bangladesh district names across the eight divisions", () => {
    const districts = bangladeshAreas.flatMap(division => division.districts);
    expect(districts).toHaveLength(64);
  });
});
