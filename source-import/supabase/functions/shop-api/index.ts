import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SHOP_ALLOWED_ORIGIN") ?? "https://www.shop.neweix.com",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
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

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(request.url);
  const path = url.pathname.startsWith("/shop-api") ? (url.pathname.slice(9) || "/") : url.pathname;

  if (request.method === "GET" && path === "/health") {
    return json({ service: "shop-api", status: "ok", capabilities: ["catalog-read", "customer-order-read"], checkout: "disabled-until-eixon-contract" });
  }

  if (request.method === "GET" && path === "/products") {
    const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: products, error } = await client
      .from("shop_products")
      .select("id,slug,title,description,currency,shop_product_variants(id,sku,title,unit_price_minor,is_active)")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) return json({ error: "Catalog is temporarily unavailable." }, 503);
    return json({ products: products ?? [] });
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
      .select("id,order_number,status,currency,subtotal_minor,delivery_fee_minor,total_minor,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return json({ error: "Orders are temporarily unavailable." }, 503);
    return json({ orders: data ?? [] });
  }

  if (request.method === "POST" && path === "/checkout") {
    return json({
      error: "Checkout is disabled until the approved Eixon Shop payment contract is active and verified.",
      code: "EIXON_INTEGRATION_UNAVAILABLE",
    }, 503);
  }

  return json({ error: "Not found." }, 404);
});
