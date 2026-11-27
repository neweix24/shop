import { createClient } from "npm:@supabase/supabase-js@2";
import { readBoundedJson } from "./_shared/request.ts";

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
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function serviceClient() {
  if (!serviceRoleKey) throw new Error("Shop server database key is unavailable.");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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
      capabilities: ["catalog-read", "guest-order-tracking"],
      checkout: { enabled: false, paymentPolicy: "eixon_only" },
      paymentMethods: {
        cod: "not_allowed",
        eixon: "disabled-until-approved-shop-payment-contract-is-implemented",
        external_gateways: "not_allowed",
      },
    });
  }

  if (request.method === "GET" && path === "/ready") {
    try {
      const client = serviceClient();
      const { count, error } = await client
        .from("shop_products")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      if (error) return json({ service: "shop-api", status: "not_ready", dependency: "database" }, 503);
      return json({
        service: "shop-api",
        status: "ready",
        catalog: count && count > 0 ? "available" : "empty",
      });
    } catch {
      return json({ service: "shop-api", status: "not_ready", dependency: "database" }, 503);
    }
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
    // Neweix Account is the only identity authority. Do not accept Supabase Auth
    // identities as a substitute; enable this route only after Account SSO and
    // the approved token-validation adapter are implemented and verified.
    return json({
      error: "Account order access is not configured yet.",
      code: "ACCOUNT_SSO_NOT_CONFIGURED",
    }, 503);
  }

  if (request.method === "POST" && path === "/track") {
    const body = await readBoundedJson(request, 4096);
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

  if (request.method === "POST" && path === "/checkout/cod") {
    return json({
      error: "Cash on Delivery is prohibited by the current Neweix Shop payment policy.",
      code: "SHOP_COD_PROHIBITED",
    }, 410);
  }

  if (request.method === "POST" && path === "/checkout") {
    return json({
      error: "Shop checkout is disabled until the Supreme-approved Eixon payment contract, Account integration, Admin grant, and operational release gates are verified.",
      code: "SHOP_CHECKOUT_DISABLED",
    }, 503);
  }

  return json({ error: "Not found." }, 404);
});
