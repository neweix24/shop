import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigin = Deno.env.get("SHOP_ALLOWED_ORIGIN") ?? "https://www.shop.neweix.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, idempotency-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function serviceClient() {
  if (!serviceRoleKey) throw new Error("Shop server database key is unavailable.");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readJson(request: Request, maxBytes = 16_384): Promise<Record<string, unknown> | null> {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function normalizeBangladeshPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("01") ? `88${digits}` : digits;
  return /^8801[3-9][0-9]{8}$/.test(normalized) ? `+${normalized}` : null;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function consumeRateLimit(request: Request, route: string, limit: number) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const keyHash = await sha256(`shop:${route}:${ip}`);
  const client = serviceClient();
  const { data, error } = await client.rpc("shop_consume_rate_limit", {
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: 600,
  });
  if (error) throw new Error("Rate limit service unavailable.");
  return data === true;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(request.url);
  const path = url.pathname.startsWith("/shop-api") ? (url.pathname.slice(9) || "/") : url.pathname;

  if (request.method === "GET" && path === "/health") {
    return json({
      service: "shop-api",
      status: "ok",
      capabilities: ["catalog-read", "account-order-read", "guest-order-tracking", "guest-cod-checkout"],
      paymentMethods: {
        cod: "manual-review",
        eixon_wallet: "disabled-until-eixon-service-restored-and-contract-approved",
        bkash: "disabled-until-gateway-and-legal-approval",
        nagad: "disabled-until-gateway-and-legal-approval",
        card: "disabled-until-gateway-and-legal-approval",
      },
    });
  }

  if (request.method === "GET" && path === "/products") {
    try {
      const client = serviceClient();
      const { data: rows, error } = await client
        .from("shop_products")
        .select("id,slug,title,description,category,image_url,is_featured,currency,shop_product_variants(id,sku,title,unit_price_minor,is_active,shop_inventory(quantity_on_hand,quantity_reserved))")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) return json({ error: "Catalog is temporarily unavailable." }, 503);
      const products = (rows ?? []).map(product => ({
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        category: product.category,
        image_url: product.image_url,
        is_featured: product.is_featured,
        currency: product.currency,
        shop_product_variants: (product.shop_product_variants ?? [])
          .filter(variant => variant.is_active)
          .map(variant => {
            const inventory = Array.isArray(variant.shop_inventory)
              ? variant.shop_inventory[0]
              : variant.shop_inventory;
            return {
              id: variant.id,
              title: variant.title,
              unit_price_minor: variant.unit_price_minor,
              is_active: true,
              stock: inventory
                ? Math.max(0, inventory.quantity_on_hand - inventory.quantity_reserved)
                : 0,
            };
          }),
      }));
      return json({ products });
    } catch {
      return json({ error: "Catalog is temporarily unavailable." }, 503);
    }
  }

  if (request.method === "GET" && path === "/orders") {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required." }, 401);
    const token = authorization.slice(7);
    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await client.auth.getUser(token);
    if (authError || !user) return json({ error: "Authentication required." }, 401);
    const { data, error } = await client
      .from("shop_orders")
      .select("id,order_number,status,currency,subtotal_minor,delivery_fee_minor,total_minor,payment_method,payment_status,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return json({ error: "Orders are temporarily unavailable." }, 503);
    return json({ orders: data ?? [] });
  }

  if (request.method === "POST" && path === "/track") {
    const body = await readJson(request, 4096);
    if (!body) return json({ error: "Invalid request body." }, 400);
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const phone = normalizeBangladeshPhone(body.phone);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId) || !phone) {
      return json({ error: "Enter a valid Order ID and the phone number used at checkout." }, 400);
    }
    try {
      if (!await consumeRateLimit(request, "track", 12)) return json({ error: "Too many tracking attempts. Try again later." }, 429);
      const client = serviceClient();
      const { data: order, error } = await client
        .from("shop_orders")
        .select("id,order_number,status,currency,subtotal_minor,delivery_fee_minor,total_minor,payment_method,payment_status,created_at")
        .eq("id", orderId)
        .eq("guest_phone", phone)
        .is("account_user_id", null)
        .maybeSingle();
      if (error) return json({ error: "Order tracking is temporarily unavailable." }, 503);
      if (!order) return json({ error: "Order not found. Check the Order ID and phone number." }, 404);
      const [{ data: items }, { data: delivery }] = await Promise.all([
        client.from("shop_order_items").select("product_title_snapshot,variant_title_snapshot,quantity,line_total_minor").eq("order_id", order.id),
        client.from("shop_delivery_jobs").select("status,tracking_url").eq("order_id", order.id).maybeSingle(),
      ]);
      return json({ order, items: items ?? [], delivery: delivery ?? { status: "manual_review" } });
    } catch {
      return json({ error: "Order tracking is temporarily unavailable." }, 503);
    }
  }

  if (request.method === "POST" && path === "/checkout") {
    const body = await readJson(request);
    if (!body) return json({ error: "Invalid request body." }, 400);
    const method = body.paymentMethod;
    if (method !== "cod") {
      const code = method === "eixon_wallet" ? "EIXON_INTEGRATION_UNAVAILABLE" : "PAYMENT_PROVIDER_NOT_APPROVED";
      return json({ error: "This payment method is not active yet. Cash on Delivery is the only currently supported checkout route.", code }, 503);
    }
    const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
    const guestPhone = normalizeBangladeshPhone(body.phone);
    const address = body.address && typeof body.address === "object" && !Array.isArray(body.address)
      ? body.address as Record<string, unknown> : null;
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : "";
    const customerNote = typeof body.note === "string" ? body.note : null;
    if (guestName.length < 2 || guestName.length > 120 || !guestPhone || !address ||
        rawItems.length < 1 || rawItems.length > 20 ||
        !/^[A-Za-z0-9:_-]{8,100}$/.test(idempotencyKey)) {
      return json({ error: "Name, valid Bangladesh phone, delivery address, cart items and idempotency key are required." }, 400);
    }
    const division = typeof address.division === "string" ? address.division.trim() : "";
    const district = typeof address.district === "string" ? address.district.trim() : "";
    const upazila = typeof address.upazila === "string" ? address.upazila.trim() : "";
    const addressLine = typeof address.addressLine === "string" ? address.addressLine.trim() : "";
    if (!division || !district || !upazila || addressLine.length < 4) {
      return json({ error: "Complete the delivery division, district, upazila and address." }, 400);
    }
    const items = rawItems.map((item) => {
      const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
      return { variant_id: row.variantId, quantity: row.quantity };
    });
    if (items.some(item => typeof item.variant_id !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.variant_id) ||
        !Number.isInteger(item.quantity) || (item.quantity as number) < 1 || (item.quantity as number) > 100)) {
      return json({ error: "Cart contains an invalid product variant or quantity." }, 400);
    }
    try {
      if (!await consumeRateLimit(request, "checkout", 8)) return json({ error: "Too many checkout attempts. Try again later." }, 429);
      const client = serviceClient();
      const { data, error } = await client.rpc("shop_create_guest_cod_order", {
        p_guest_name: guestName,
        p_guest_phone: guestPhone,
        p_delivery_address: {
          recipient_name: guestName,
          phone: guestPhone,
          division,
          district,
          upazila,
          union_or_area: typeof address.unionOrArea === "string" ? address.unionOrArea.trim() : null,
          address_line: addressLine,
          postal_code: typeof address.postalCode === "string" ? address.postalCode.trim() : null,
        },
        p_items: items,
        p_idempotency_key: idempotencyKey,
        p_customer_note: customerNote,
      });
      if (error) {
        if (error.code === "22023") return json({ error: "Check the order details and try again." }, 400);
        if (error.code === "P0002") return json({ error: "A product is unavailable." }, 409);
        if (error.code === "P0001") return json({ error: "There is not enough stock for one or more items." }, 409);
        if (error.code === "23505") return json({ error: "This checkout request conflicts with an earlier request." }, 409);
        return json({ error: "Order could not be created. Please try again later." }, 503);
      }
      return json({ success: true, order: data, tracking: "Use the Order ID and checkout phone number to track this guest order." }, 201);
    } catch {
      return json({ error: "Checkout is temporarily unavailable." }, 503);
    }
  }

  return json({ error: "Not found." }, 404);
});
