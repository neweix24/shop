import {
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Post,
  Body,
  Req,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request } from "express";
import { createHash } from "node:crypto";
import { SupabaseRestService } from "../database/supabase-rest.service";
import { normalizeBangladeshPhone } from "../common/phone";
import { getShopCheckoutStatus } from "../common/feature-flags";

const ORDER_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

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
        limit: "100",
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
          .flatMap(variant => {
            const unitPrice = Number(variant.unit_price_minor);
            if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) return [];
            const inventory = Array.isArray(variant.shop_inventory)
              ? variant.shop_inventory[0]
              : variant.shop_inventory;
            const onHand = Number(inventory?.quantity_on_hand);
            const reserved = Number(inventory?.quantity_reserved);
            const inventoryValid =
              Number.isSafeInteger(onHand) &&
              Number.isSafeInteger(reserved) &&
              onHand >= 0 &&
              reserved >= 0 &&
              reserved <= onHand;
            return [{
              id: variant.id,
              title: variant.title,
              unit_price_minor: unitPrice,
              is_active: true,
              stock: inventoryValid ? onHand - reserved : 0,
            }];
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
  @Get("status")
  status() {
    return getShopCheckoutStatus();
  }

  @Post("cod")
  cod(): never {
    throw new HttpException({
      code: "SHOP_COD_PROHIBITED",
      message: "Cash on Delivery is not an approved Neweix Shop payment method.",
    }, 410);
  }

  @Post()
  checkout(): never {
    throw new ServiceUnavailableException({
      code: "SHOP_CHECKOUT_DISABLED",
      message: "Checkout is disabled until the Supreme-approved Eixon server-to-server payment contract and release gates are complete.",
    });
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
    SupabaseRestService, ShopRateLimit, CatalogService, TrackingService,
  ],
})
export class ShopModule {}
