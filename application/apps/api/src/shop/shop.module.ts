import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Post,
  Body,
  Headers,
  Req,
  ServiceUnavailableException,
  TooManyRequestsException,
} from "@nestjs/common";
import type { Request } from "express";
import { createHash } from "node:crypto";
import { SupabaseRestError, SupabaseRestService } from "../database/supabase-rest.service";
import { normalizeBangladeshPhone } from "../common/phone";

const ORDER_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
class ShopRateLimit {
  constructor(private readonly db: SupabaseRestService) {}

  async consume(route: string, ip: string, limit: number) {
    const keyHash = createHash("sha256").update(`shop:${route}:${ip}`).digest("hex");
    try {
      const allowed = await this.db.rpc<boolean>("shop_consume_rate_limit", {
        p_key_hash: keyHash,
        p_limit: limit,
        p_window_seconds: 600,
      });
      if (allowed !== true) throw new TooManyRequestsException("Too many requests. Try again later.");
    } catch (error) {
      if (error instanceof TooManyRequestsException) throw error;
      throw new ServiceUnavailableException("Shop rate-limit service is unavailable.");
    }
  }
}

type RawVariant = {
  id: string;
  sku: string;
  title: string;
  unit_price_minor: number;
  is_active: boolean;
  shop_inventory:
    | Array<{ quantity_on_hand: number; quantity_reserved: number }>
    | { quantity_on_hand: number; quantity_reserved: number }
    | null;
};
type RawProduct = {
  id: string; slug: string; title: string; description: string | null;
  category: string; image_url: string | null; is_featured: boolean; currency: string;
  shop_product_variants: RawVariant[] | null;
};

@Injectable()
class CatalogService {
  constructor(private readonly db: SupabaseRestService) {}

  async listActiveProducts() {
    try {
      const query = new URLSearchParams({
        select: "id,slug,title,description,category,image_url,is_featured,currency,shop_product_variants(id,sku,title,unit_price_minor,is_active,shop_inventory(quantity_on_hand,quantity_reserved))",
        status: "eq.active",
        order: "created_at.desc",
      });
      const rows = await this.db.select<RawProduct[]>("shop_products", query);
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
              unit_price_minor: Number(variant.unit_price_minor),
              is_active: true,
              stock: inventory
                ? Math.max(0, inventory.quantity_on_hand - inventory.quantity_reserved)
                : 0,
            };
          }),
      })).filter(product => product.shop_product_variants.length > 0);
      return { products };
    } catch {
      throw new ServiceUnavailableException({
        code: "SHOP_CATALOG_UNAVAILABLE",
        message: "The Shop catalogue is temporarily unavailable.",
      });
    }
  }
}

@Injectable()
class CheckoutService {
  constructor(private readonly db: SupabaseRestService, private readonly limits: ShopRateLimit) {}

  async createGuestCodOrder(
    input: {
      guestName?: string;
      phone?: string;
      address?: {
        division?: string; district?: string; upazila?: string;
        unionOrArea?: string; addressLine?: string; postalCode?: string;
      };
      items?: Array<{ variantId?: string; quantity?: number }>;
      note?: string;
      paymentMethod?: string;
    },
    idempotencyKey: string | undefined,
    clientIp: string,
  ) {
    const guestName = typeof input?.guestName === "string" ? input.guestName.trim() : "";
    const phone = normalizeBangladeshPhone(input?.phone);
    const address = input?.address;
    const items = input?.items;

    if (guestName.length < 2 || guestName.length > 120 || !phone) {
      throw new BadRequestException("Enter a name and valid Bangladesh mobile number.");
    }
    if (!address || !["division", "district", "upazila", "addressLine"].every(
      key => typeof (address as Record<string, unknown>)[key] === "string" &&
        String((address as Record<string, unknown>)[key]).trim().length > 0
    ) || address.addressLine!.trim().length < 4) {
      throw new BadRequestException("Complete the delivery division, district, upazila and address.");
    }
    if (!Array.isArray(items) || items.length < 1 || items.length > 20) {
      throw new BadRequestException("The cart must contain between 1 and 20 items.");
    }
    if (!idempotencyKey || !/^[A-Za-z0-9:_-]{8,100}$/.test(idempotencyKey)) {
      throw new BadRequestException("A valid Idempotency-Key header is required.");
    }
    if (input.note && input.note.length > 500) throw new BadRequestException("The customer note is too long.");

    const normalizedItems = items.map(item => ({
      variant_id: item?.variantId,
      quantity: item?.quantity,
    }));
    if (normalizedItems.some(item =>
      typeof item.variant_id !== "string" ||
      !ORDER_UUID.test(item.variant_id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity! < 1 || item.quantity! > 100
    )) {
      throw new BadRequestException("The cart contains an invalid product variant or quantity.");
    }
    if (new Set(normalizedItems.map(item => item.variant_id)).size !== normalizedItems.length) {
      throw new BadRequestException("The cart contains duplicate product variants.");
    }

    await this.limits.consume("checkout", clientIp, 8);
    try {
      const order = await this.db.rpc<Record<string, unknown>>("shop_create_guest_cod_order", {
        p_guest_name: guestName,
        p_guest_phone: phone,
        p_delivery_address: {
          recipient_name: guestName,
          phone,
          division: address.division!.trim(),
          district: address.district!.trim(),
          upazila: address.upazila!.trim(),
          union_or_area: address.unionOrArea?.trim() || null,
          address_line: address.addressLine!.trim(),
          postal_code: address.postalCode?.trim() || null,
        },
        p_items: normalizedItems,
        p_idempotency_key: idempotencyKey,
        p_customer_note: input.note?.trim() || null,
      });
      return { success: true, order };
    } catch (error) {
      if (error instanceof SupabaseRestError) {
        if (error.code === "22023") throw new BadRequestException("Check the order details and try again.");
        if (["P0002", "P0001", "23505"].includes(error.code ?? "")) {
          throw new ConflictException("The selected product or stock is unavailable, or this request conflicts with an earlier order.");
        }
      }
      throw new ServiceUnavailableException("Checkout is temporarily unavailable.");
    }
  }
}

@Injectable()
class TrackingService {
  constructor(private readonly db: SupabaseRestService, private readonly limits: ShopRateLimit) {}

  async track(orderId: string, rawPhone: string, ip: string) {
    const phone = normalizeBangladeshPhone(rawPhone);
    if (!ORDER_UUID.test(orderId) || !phone) {
      throw new NotFoundException("Order not found. Check the Order ID and checkout phone number.");
    }
    await this.limits.consume("tracking", ip, 12);
    try {
      const orderQuery = new URLSearchParams({
        select: "id,order_number,status,currency,subtotal_minor,delivery_fee_minor,total_minor,payment_method,payment_status,created_at",
        id: `eq.${orderId}`,
        guest_phone: `eq.${phone}`,
        account_user_id: "is.null",
        limit: "1",
      });
      const orders = await this.db.select<Array<Record<string, unknown>>>("shop_orders", orderQuery);
      const order = orders?.[0];
      if (!order) throw new NotFoundException("Order not found. Check the Order ID and checkout phone number.");

      const itemsQuery = new URLSearchParams({
        select: "product_title_snapshot,variant_title_snapshot,quantity,line_total_minor",
        order_id: `eq.${orderId}`,
      });
      const deliveryQuery = new URLSearchParams({
        select: "status,tracking_url",
        order_id: `eq.${orderId}`,
        limit: "1",
      });
      const [items, deliveries] = await Promise.all([
        this.db.select<Array<Record<string, unknown>>>("shop_order_items", itemsQuery),
        this.db.select<Array<{status:string; tracking_url?:string|null}>>("shop_delivery_jobs", deliveryQuery),
      ]);
      return { order, items: items ?? [], delivery: deliveries?.[0] ?? { status: "manual_review", tracking_url: null } };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof TooManyRequestsException) throw error;
      throw new ServiceUnavailableException("Order tracking is temporarily unavailable.");
    }
  }
}

@Controller()
class HealthController {
  constructor(private readonly db: SupabaseRestService) {}

  @Get("healthz")
  health() {
    return { service: "neweix-shop-api", status: "ok" };
  }

  @Get("readyz")
  async ready() {
    try {
      const activeProducts = await this.db.countActiveProducts();
      return {
        service: "neweix-shop-api",
        status: "ready",
        catalog: activeProducts > 0 ? "available" : "empty",
        activeProducts,
      };
    } catch {
      throw new ServiceUnavailableException({
        service: "neweix-shop-api",
        status: "not_ready",
        dependency: "shop-database",
      });
    }
  }
}

@Controller("catalog")
class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get("products") listProducts() { return this.catalog.listActiveProducts(); }
}

@Controller("checkout")
class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post("cod")
  create(
    @Body() body: Parameters<CheckoutService["createGuestCodOrder"]>[0],
    @Headers("idempotency-key") key: string | undefined,
    @Req() request: Request,
  ) {
    // COD/Eixon-only policy is still awaiting one authoritative ruling.
    // Keep checkout fail-closed unless the approved runtime config explicitly enables it.
    if (process.env.SHOP_GUEST_CHECKOUT_ENABLED !== "true") {
      throw new ServiceUnavailableException({
        code: "SHOP_CHECKOUT_DISABLED",
        message: "Checkout is disabled until the authoritative Shop payment policy is reconciled and approved.",
      });
    }
    if (body?.paymentMethod !== undefined && body.paymentMethod !== "cod") {
      throw new ServiceUnavailableException({
        code: body.paymentMethod === "eixon_wallet" ? "EIXON_INTEGRATION_UNAVAILABLE" : "PAYMENT_METHOD_NOT_ENABLED",
        message: "This payment method is not enabled for Shop.",
      });
    }
    const header = request.headers["cf-connecting-ip"];
    const ip = typeof header === "string" ? header : request.ip || request.socket.remoteAddress || "unknown";
    return this.checkout.createGuestCodOrder(body, key, ip);
  }
}

@Controller("tracking")
class TrackingController {
  constructor(private readonly tracking: TrackingService) {}
  @Post("guest")
  track(@Body() body: {orderId?:string;phone?:string}, @Req() request: Request) {
    const header = request.headers["cf-connecting-ip"];
    const ip = typeof header === "string" ? header : request.ip || request.socket.remoteAddress || "unknown";
    return this.tracking.track(
      typeof body?.orderId === "string" ? body.orderId.trim() : "",
      typeof body?.phone === "string" ? body.phone : "",
      ip,
    );
  }
}

@Controller("account")
class AccountController {
  @Get("orders")
  listOrders(): never {
    throw new ServiceUnavailableException({
      code: "ACCOUNT_SSO_NOT_CONFIGURED",
      message: "Account order access is unavailable until the first-party Neweix Account OIDC contract is registered and verified.",
    });
  }
}

@Controller("admin")
class AdminController {
  @Get("catalog")
  catalog(): never {
    throw new ServiceUnavailableException({
      code: "ADMIN_GRANT_NOT_CONFIGURED",
      message: "Product publishing is disabled until the Supreme-approved Admin grant contract is implemented and verified.",
    });
  }
}

@Controller("payments")
class PaymentsController {
  @Post("eixon")
  createIntent(): never {
    throw new ServiceUnavailableException({
      code: "EIXON_INTEGRATION_NOT_CONFIGURED",
      message: "Eixon Shop payment is disabled until the approved server-to-server payment contract is registered and verified.",
    });
  }
}

@Controller("delivery")
class DeliveryController {
  @Post("quote")
  quote(): never {
    throw new ServiceUnavailableException({
      code: "PATHAO_NOT_CONFIGURED",
      message: "Delivery quotes are unavailable until verified coverage, credentials and server-side Pathao integration are configured.",
    });
  }
}

@Module({
  controllers: [
    HealthController, CatalogController, CheckoutController, TrackingController,
    AccountController, AdminController, PaymentsController, DeliveryController,
  ],
  providers: [
    SupabaseRestService, ShopRateLimit, CatalogService, CheckoutService, TrackingService,
  ],
})
export class ShopModule {}
