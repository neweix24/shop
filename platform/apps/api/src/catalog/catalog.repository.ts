import { Injectable } from "@nestjs/common";
import { SupabaseRestClient } from "../integrations/supabase/supabase-rest.client";
import { mapCatalogProduct, ProductRow } from "./catalog.types";
import { CatalogProduct } from "./catalog.types";

@Injectable()
export class CatalogRepository {
  constructor(private readonly supabase: SupabaseRestClient) {}

  async listActiveProducts(limit: number): Promise<CatalogProduct[]> {
    const rows = await this.supabase.getRows<ProductRow>("shop_products", {
      select: [
        "id",
        "slug",
        "title",
        "description",
        "category",
        "image_url",
        "is_featured",
        "currency",
        "shop_product_variants(id,title,unit_price_minor,is_active,shop_inventory(quantity_on_hand,quantity_reserved))",
      ].join(","),
      status: "eq.active",
      order: "created_at.desc",
      limit: String(limit),
    });

    return rows.flatMap(row => {
      const product = mapCatalogProduct(row);
      return product ? [product] : [];
    });
  }
}
