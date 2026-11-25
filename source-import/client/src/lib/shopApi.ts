const DEFAULT_API_URL = "https://grhybvlhdnzlopwbaqun.supabase.co/functions/v1/shop-api";

function apiUrl() {
  const configured = import.meta.env.VITE_SHOP_API_URL?.trim();
  return (configured || DEFAULT_API_URL).replace(/\/$/, "");
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

export async function trackGuestOrder(
  orderId: string,
  phone: string
): Promise<GuestOrderTracking> {
  const response = await fetch(`${apiUrl()}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: orderId.trim(), phone: phone.trim() }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "Order tracking is temporarily unavailable.";
    throw new Error(message);
  }
  if (!payload?.order || !Array.isArray(payload.items)) {
    throw new Error("The tracking service returned an invalid response.");
  }
  return payload as GuestOrderTracking;
}
