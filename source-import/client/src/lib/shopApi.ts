const DEFAULT_API_URL = "https://grhybvlhdnzlopwbaqun.supabase.co/functions/v1/shop-api";
const PRODUCT_PLACEHOLDER = "/images/shop-product-placeholder.svg";

function apiUrl() {
  const configured = import.meta.env.VITE_SHOP_API_URL?.trim();
  return (configured || DEFAULT_API_URL).replace(/\/$/, "");
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "Shop service is temporarily unavailable.";
    throw new Error(message);
  }
  return payload as T;
}

export type GuestOrderTracking = {
  order: {
    id: string;
    order_number: string;
    status: string;
    currency: string;
    subtotal_minor: number;
    delivery_fee_minor: number;
    total_minor: number;
    payment_method: string;
    payment_status: string;
    created_at: string;
  };
  items: Array<{
    product_title_snapshot: string;
    variant_title_snapshot: string;
    quantity: number;
    line_total_minor: number;
  }>;
  delivery: {
    status: string;
    tracking_url?: string | null;
  };
};

type ApiCatalogProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  is_featured: boolean;
  shop_product_variants: Array<{
    id: string;
    title: string;
    unit_price_minor: number;
    is_active: boolean;
    stock: number;
  }>;
};

export type GuestCodOrderResult = {
  id: string;
  order_number: number | string;
  status: string;
  payment_method: "cod";
  payment_status: string;
  subtotal_minor: number;
  delivery_fee_minor: number;
  total_minor: number;
  replayed: boolean;
};

export async function fetchCatalog() {
  const payload = await requestJson<{ products: ApiCatalogProduct[] }>("/products");
  if (!Array.isArray(payload.products)) {
    throw new Error("The Shop catalog returned an invalid response.");
  }
  return payload.products.flatMap(product => {
    const variants = (product.shop_product_variants ?? [])
      .filter(variant => variant.is_active)
      .map(variant => ({
        id: variant.id,
        label: variant.title,
        stock: Math.max(0, variant.stock ?? 0),
        price: Number(variant.unit_price_minor) / 100,
      }))
    if (!variants.length) return [];
    const image = product.image_url || PRODUCT_PLACEHOLDER;
    return [{
      id: product.id,
      slug: product.slug,
      name: product.title,
      category: product.category || "Other",
      eyebrow: product.category || "NEWEIX Shop",
      description: product.description || "",
      details: [],
      image,
      gallery: [image],
      color: variants.map(variant => variant.label).join(" / "),
      variants,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      tags: product.is_featured ? ["featured"] : [],
      featured: product.is_featured,
    }];
  });
}

export async function createGuestCodOrder(input: {
  guestName: string;
  phone: string;
  address: {
    division: string;
    district: string;
    upazila: string;
    unionOrArea?: string;
    addressLine: string;
    postalCode?: string;
  };
  items: Array<{ variantId: string; quantity: number }>;
  note?: string;
  idempotencyKey: string;
}) {
  return requestJson<{ success: true; order: GuestCodOrderResult }>("/checkout", {
    method: "POST",
    body: JSON.stringify({
      paymentMethod: "cod",
      ...input,
    }),
    headers: { "Idempotency-Key": input.idempotencyKey },
  });
}

export async function trackGuestOrder(
  orderId: string,
  phone: string
): Promise<GuestOrderTracking> {
  const payload = await requestJson<GuestOrderTracking>("/track", {
    method: "POST",
    body: JSON.stringify({ orderId: orderId.trim(), phone: phone.trim() }),
  });
  if (!payload?.order || !Array.isArray(payload.items)) {
    throw new Error("The tracking service returned an invalid response.");
  }
  return payload;
}
