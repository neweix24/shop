export interface CatalogVariant {
  id: string;
  title: string;
  unitPriceMinor: number;
  stock: number;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  currency: "BDT";
  variants: CatalogVariant[];
}

export interface InventoryRow {
  quantity_on_hand?: unknown;
  quantity_reserved?: unknown;
}

export interface ProductVariantRow {
  id?: unknown;
  title?: unknown;
  unit_price_minor?: unknown;
  is_active?: unknown;
  shop_inventory?: unknown;
}

export interface ProductRow {
  id?: unknown;
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  category?: unknown;
  image_url?: unknown;
  is_featured?: unknown;
  currency?: unknown;
  shop_product_variants?: unknown;
}

export function safeNonNegativeInteger(value: unknown): number | null {
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : Number.NaN;

  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function inventoryFromVariant(value: unknown): InventoryRow | null {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? first as InventoryRow : null;
  }
  return value && typeof value === "object" ? value as InventoryRow : null;
}

export function mapCatalogProduct(row: ProductRow): CatalogProduct | null {
  if (
    typeof row.id !== "string" ||
    typeof row.slug !== "string" ||
    typeof row.title !== "string" ||
    row.currency !== "BDT"
  ) {
    return null;
  }

  const rawVariants = Array.isArray(row.shop_product_variants)
    ? row.shop_product_variants as ProductVariantRow[]
    : [];

  const variants = rawVariants.flatMap((variant): CatalogVariant[] => {
    if (
      variant.is_active !== true ||
      typeof variant.id !== "string" ||
      typeof variant.title !== "string"
    ) {
      return [];
    }

    const unitPriceMinor = safeNonNegativeInteger(variant.unit_price_minor);
    if (unitPriceMinor === null) return [];

    const inventory = inventoryFromVariant(variant.shop_inventory);
    const onHand = safeNonNegativeInteger(inventory?.quantity_on_hand);
    const reserved = safeNonNegativeInteger(inventory?.quantity_reserved);
    const stock = onHand === null || reserved === null
      ? 0
      : Math.max(0, onHand - reserved);

    return [{
      id: variant.id,
      title: variant.title,
      unitPriceMinor,
      stock,
    }];
  });

  if (variants.length === 0) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: typeof row.description === "string" ? row.description : null,
    category: typeof row.category === "string" ? row.category : null,
    imageUrl: typeof row.image_url === "string" ? row.image_url : null,
    isFeatured: row.is_featured === true,
    currency: "BDT",
    variants,
  };
}
