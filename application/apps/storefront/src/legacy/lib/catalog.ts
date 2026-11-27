export type ProductVariant = {
  id: string;
  label: string;
  stock: number;
  price: number;
  compareAt?: number;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  date: string;
  title: string;
  body: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  eyebrow: string;
  description: string;
  details: string[];
  image: string;
  gallery: string[];
  color: string;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  tags: string[];
  featured?: boolean;
  editorial?: string;
};

export let products: Product[] = [];
export let categories: string[] = ["All"];

export function setCatalogProducts(nextProducts: Product[]) {
  products = nextProducts;
  categories = [
    "All",
    ...Array.from(new Set(nextProducts.map(product => product.category))).sort(),
  ];
}

export function getProduct(slug: string | undefined) {
  return products.find(product => product.slug === slug || product.id === slug);
}

export function getVariant(product: Product, variantId?: string) {
  const variant = product.variants.find(item => item.id === variantId) ?? product.variants[0];
  if (!variant) {
    throw new Error("This product has no active purchasable variant.");
  }
  return variant;
}

export function discountPercent(variant: ProductVariant) {
  if (!variant.compareAt || variant.compareAt <= variant.price) return 0;
  return Math.round(((variant.compareAt - variant.price) / variant.compareAt) * 100);
}

export function searchProducts(query: string, category = "All") {
  const normalized = query.trim().toLowerCase();
  return products.filter(product => {
    const categoryMatch = category === "All" || product.category === category;
    if (!categoryMatch) return false;
    if (!normalized) return true;
    return [
      product.name,
      product.category,
      product.description,
      product.tags.join(" "),
    ].join(" ").toLowerCase().includes(normalized);
  });
}

export function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(value);
}
