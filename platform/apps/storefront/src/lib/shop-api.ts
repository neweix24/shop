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
  currency: "BDT";
  variants: CatalogVariant[];
}

export type CatalogState =
  | { status: "not_configured"; products: [] }
  | { status: "unavailable"; products: [] }
  | { status: "ready"; products: CatalogProduct[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCatalogProduct(value: unknown): value is CatalogProduct {
  if (!isRecord(value)) return false;
  if (
    typeof value.id !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.title !== "string" ||
    value.currency !== "BDT" ||
    !Array.isArray(value.variants)
  ) {
    return false;
  }

  return value.variants.every(variant =>
    isRecord(variant) &&
    typeof variant.id === "string" &&
    typeof variant.title === "string" &&
    typeof variant.unitPriceMinor === "number" &&
    Number.isSafeInteger(variant.unitPriceMinor) &&
    variant.unitPriceMinor >= 0 &&
    typeof variant.stock === "number" &&
    Number.isSafeInteger(variant.stock) &&
    variant.stock >= 0
  );
}

function catalogEndpoint(rawBaseUrl: string | undefined): URL | null {
  const value = rawBaseUrl?.trim();
  if (!value) return null;

  const base = new URL(value);
  const localDevelopment =
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1"].includes(base.hostname);

  if (
    (base.protocol !== "https:" && !localDevelopment) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  ) {
    throw new Error("SHOP_API_BASE_URL_INVALID");
  }

  return new URL("/api/v1/catalog/products?limit=24", base.origin);
}

export async function loadCatalog(): Promise<CatalogState> {
  let endpoint: URL | null;
  try {
    endpoint = catalogEndpoint(process.env.SHOP_API_BASE_URL);
  } catch {
    return { status: "unavailable", products: [] };
  }

  if (!endpoint) return { status: "not_configured", products: [] };

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { status: "unavailable", products: [] };

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.products)) {
      return { status: "unavailable", products: [] };
    }

    return {
      status: "ready",
      products: payload.products.filter(isCatalogProduct),
    };
  } catch {
    return { status: "unavailable", products: [] };
  }
}

export function formatBDT(minorUnits: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(minorUnits / 100);
}
