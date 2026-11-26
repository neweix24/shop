import { Injectable, ServiceUnavailableException } from "@nestjs/common";

export type ShopTable = "shop_products";

@Injectable()
export class SupabaseRestClient {
  private readonly restBaseUrl: URL | null;
  private readonly serviceRoleKey: string | null;
  private readonly setupIssue: string | null;

  constructor() {
    const rawUrl = process.env.SUPABASE_URL?.trim();
    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    this.serviceRoleKey = rawKey || null;

    if (!rawUrl || !rawKey) {
      this.restBaseUrl = null;
      this.setupIssue = "SUPABASE_SERVER_CONFIGURATION_MISSING";
      return;
    }

    try {
      const parsed = new URL(rawUrl);
      const localDevelopment =
        process.env.NODE_ENV !== "production" &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname);

      if (parsed.protocol !== "https:" && !localDevelopment) {
        this.restBaseUrl = null;
        this.setupIssue = "SUPABASE_URL_MUST_USE_HTTPS";
        return;
      }
      if (parsed.username || parsed.password || parsed.search || parsed.hash) {
        this.restBaseUrl = null;
        this.setupIssue = "SUPABASE_URL_INVALID";
        return;
      }

      this.restBaseUrl = new URL("/rest/v1/", parsed.origin);
      this.setupIssue = null;
    } catch {
      this.restBaseUrl = null;
      this.setupIssue = "SUPABASE_URL_INVALID";
    }
  }

  get isConfigured(): boolean {
    return this.restBaseUrl !== null && this.serviceRoleKey !== null;
  }

  get configurationStatus(): string {
    return this.isConfigured ? "configured" : (this.setupIssue ?? "not_configured");
  }

  async ping(): Promise<void> {
    await this.getRows("shop_products", { select: "id", limit: "1" });
  }

  async getRows<T>(table: ShopTable, query: Record<string, string>): Promise<T[]> {
    if (!this.restBaseUrl || !this.serviceRoleKey) {
      throw new ServiceUnavailableException({
        code: "SHOP_DATABASE_NOT_CONFIGURED",
        message: "The Shop database connection is not configured on the API server.",
      });
    }

    const endpoint = new URL(table, this.restBaseUrl);
    for (const [key, value] of Object.entries(query)) {
      endpoint.searchParams.set(key, value);
    }

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: this.serviceRoleKey,
          Authorization: \`Bearer \${this.serviceRoleKey}\`,
          Accept: "application/json",
          "Cache-Control": "no-store",
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ServiceUnavailableException({
        code: "SHOP_DATABASE_UNAVAILABLE",
        message: "The Shop database could not be reached.",
      });
    }

    if (!response.ok) {
      throw new ServiceUnavailableException({
        code: "SHOP_DATABASE_QUERY_FAILED",
        message: "The Shop database query could not be completed.",
      });
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!Array.isArray(payload)) {
      throw new ServiceUnavailableException({
        code: "SHOP_DATABASE_RESPONSE_INVALID",
        message: "The Shop database returned an invalid response.",
      });
    }
    return payload as T[];
  }
}
