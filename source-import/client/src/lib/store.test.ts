import { describe, expect, it } from "vitest";
import { bangladeshAreas } from "../data/bangladesh";
import { discountPercent, getVariant, products, type Product } from "./catalog";
import { addToCart, cartSubtotal, validateCheckout } from "./store";

const lamp: Product = {
  id: "test-lamp",
  slug: "test-lamp",
  name: "Test lamp",
  category: "Desk",
  eyebrow: "Test fixture",
  description: "A test-only product fixture.",
  details: [],
  image: "/test.svg",
  gallery: ["/test.svg"],
  color: "Standard",
  variants: [{ id: "standard", label: "Standard", stock: 18, price: 4850, compareAt: 5600 }],
  rating: 0,
  reviewCount: 0,
  reviews: [],
  tags: [],
};
const notebook: Product = {
  ...lamp,
  id: "test-notebook",
  slug: "test-notebook",
  name: "Test notebook",
  variants: [{ id: "saffron", label: "Saffron", stock: 44, price: 780, compareAt: 950 }],
};

describe("NEWEIX catalog and pricing", () => {
  it("does not expose hard-coded demo products", () => {
    expect(products).toHaveLength(0);
  });

  it("calculates a visible discount percentage from compare-at pricing", () => {
    expect(discountPercent(getVariant(lamp))).toBe(13);
  });

  it("calculates subtotal from selected variants and quantities", () => {
    const fixtures = [lamp, notebook];
    expect(
      cartSubtotal(
        [
          { productId: lamp.id, variantId: "standard", quantity: 2 },
          { productId: notebook.id, variantId: "saffron", quantity: 1 },
        ],
        id => fixtures.find(item => item.id === id),
        (product, id) => getVariant(product, id)
      )
    ).toBe(10480);
  });

  it("caps add-to-cart quantity at available stock", () => {
    const items = addToCart("test-lamp", "standard", 999, 18);
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
