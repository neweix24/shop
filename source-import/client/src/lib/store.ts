import type { Product, ProductVariant } from "./catalog";

export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};
export type DeliveryAddress = {
  name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  line1: string;
  note?: string;
};
export type OrderRequest = {
  id: string;
  createdAt: string;
  items: CartItem[];
  address: DeliveryAddress;
  paymentMethod: string;
  subtotal: number;
  deliveryStatus: "manual-review" | "awaiting-quote";
  paymentStatus: "not-started" | "awaiting-verification";
  note: string;
};

const CART_KEY = "neweix-cart-v1";
const WISHLIST_KEY = "neweix-wishlist-v1";
const ORDERS_KEY = "neweix-order-requests-v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent("neweix-store-change", { detail: { key } })
  );
}

export function getCart() {
  return read<CartItem[]>(CART_KEY, []);
}
export function setCart(items: CartItem[]) {
  write(
    CART_KEY,
    items.filter(item => item.quantity > 0)
  );
}
export function getWishlist() {
  return read<string[]>(WISHLIST_KEY, []);
}
export function isWishlisted(productId: string) {
  return getWishlist().includes(productId);
}
export function toggleWishlist(productId: string) {
  const current = getWishlist();
  const next = current.includes(productId)
    ? current.filter(id => id !== productId)
    : [...current, productId];
  write(WISHLIST_KEY, next);
  return next.includes(productId);
}
export function addToCart(
  productId: string,
  variantId: string,
  quantity = 1,
  maxQuantity = Number.POSITIVE_INFINITY
) {
  const items = getCart();
  const existing = items.find(
    item => item.productId === productId && item.variantId === variantId
  );
  const requested = Math.max(0, Math.floor(quantity));
  if (existing) {
    existing.quantity = Math.min(maxQuantity, existing.quantity + requested);
  } else if (requested > 0) {
    items.push({
      productId,
      variantId,
      quantity: Math.min(maxQuantity, requested),
    });
  }
  setCart(items);
  return items;
}
export function updateCartQuantity(
  productId: string,
  variantId: string,
  quantity: number,
  maxQuantity = Number.POSITIVE_INFINITY
) {
  const safeQuantity = Math.min(maxQuantity, Math.max(0, Math.floor(quantity)));
  setCart(
    getCart().map(item =>
      item.productId === productId && item.variantId === variantId
        ? { ...item, quantity: safeQuantity }
        : item
    )
  );
}
export function removeFromCart(productId: string, variantId: string) {
  setCart(
    getCart().filter(
      item => !(item.productId === productId && item.variantId === variantId)
    )
  );
}
export function cartCount(items = getCart()) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
export function cartSubtotal(
  items: CartItem[],
  getProduct: (id: string) => Product | undefined,
  getVariant: (product: Product, id: string) => ProductVariant | undefined
) {
  return items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    const variant = product ? getVariant(product, item.variantId) : undefined;
    return sum + (variant?.price ?? 0) * item.quantity;
  }, 0);
}
export function getOrderRequests() {
  return read<OrderRequest[]>(ORDERS_KEY, []);
}
export function saveOrderRequest(order: OrderRequest) {
  write(ORDERS_KEY, [order, ...getOrderRequests()]);
  setCart([]);
}
export function makeOrderId() {
  return `NX-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function validateCheckout(
  address: Partial<DeliveryAddress>,
  paymentMethod: string
) {
  const required: Array<keyof DeliveryAddress> = [
    "name",
    "phone",
    "division",
    "district",
    "upazila",
    "line1",
  ];
  const missing = required.filter(
    field => !String(address[field] ?? "").trim()
  );
  return {
    valid: missing.length === 0 && Boolean(paymentMethod),
    missing,
    paymentMissing: !paymentMethod,
  };
}

export function supportsLiveDeliveryQuote() {
  return Boolean(
    typeof window !== "undefined" &&
      (window as Window & { __PATHAO_CONFIG__?: { enabled?: boolean } })
        .__PATHAO_CONFIG__?.enabled
  );
}
