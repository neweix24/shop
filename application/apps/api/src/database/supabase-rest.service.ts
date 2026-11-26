import {
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";

export class SupabaseRestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "SupabaseRestError";
  }
}

@Injectable()
export class SupabaseRestService {
  private readonly baseUrl: URL | null;
  private readonly serviceKey: string | null;
  private readonly configurationIssue: string | null;

  constructor() {
    const rawUrl = process.env.SUPABASE_URL?.trim();
    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    this.serviceKey = rawKey || null;

    if (!rawUrl || !rawKey) {
      this.baseUrl = null;
      this.configurationIssue = "SUPABASE_SERVER_CONFIGURATION_MISSING";
      return;
    }

    try {
      const parsed = new URL(rawUrl);
      const localDevelopment =
        process.env.NODE_ENV !== "production" &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname);
      const approvedProjectHost = parsed.hostname.endsWith(".supabase.co");

      if (
        (parsed.protocol !== "https:" && !(localDevelopment && parsed.protocol === "http:")) ||
        (!localDevelopment && !approvedProjectHost) ||
        parsed.username ||
        parsed.password ||
        parsed.search ||
        parsed.hash ||
        (parsed.pathname !== "/" && parsed.pathname !== "")
      ) {
        this.baseUrl = null;
        this.configurationIssue = "SUPABASE_URL_INVALID_OR_NOT_APPROVED";
        return;
      }

      this.baseUrl = new URL("/rest/v1/", parsed.origin);
      this.configurationIssue = null;
    } catch {
      this.baseUrl = null;
      this.configurationIssue = "SUPABASE_URL_INVALID";
    }
  }

  isConfigured(): boolean {
    return this.baseUrl !== null && this.serviceKey !== null;
  }

  configurationStatus(): string {
    return this.isConfigured()
      ? "configured"
      : (this.configurationIssue ?? "not_configured");
  }

  private buildUrl(path: string): URL {
    if (!this.baseUrl || !this.serviceKey) {
      throw new ServiceUnavailableException({
        code: "SHOP_DATABASE_NOT_CONFIGURED",
        message: "Shop database service is not configured.",
      });
    }

    // The origin is fixed from server configuration; callers can only supply
    // relative Shop-owned paths and cannot redirect the service key elsewhere.
    return new URL(path.replace(/^\/+/, ""), this.baseUrl);
  }

  async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<{ data: T; headers: Headers }> {
    let response: Response;
    try {
      response = await fetch(this.buildUrl(path), {
        ...init,
        headers: {
          apikey: this.serviceKey!,
          Authorization: `Bearer ${this.serviceKey!}`,
          Accept: "application/json",
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          ...(init.headers ?? {}),
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new SupabaseRestError(
        "Shop database request could not be completed.",
        503,
        "SHOP_DATABASE_UNAVAILABLE",
      );
    }

    const raw = await response.text();
    let payload: unknown = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = raw;
      }
    }

    if (!response.ok) {
      const detail = payload && typeof payload === "object"
        ? payload as Record<string, unknown>
        : {};
      throw new SupabaseRestError(
        typeof detail.message === "string" ? detail.message : "Shop database request failed.",
        response.status,
        typeof detail.code === "string" ? detail.code : undefined,
      );
    }
    return { data: payload as T, headers: response.headers };
  }

  async select<T>(resource: string, query: URLSearchParams): Promise<T> {
    const { data } = await this.request<T>(`${resource}?${query.toString()}`);
    return data;
  }

  async rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const { data } = await this.request<T>(`rpc/${name}`, {
      method: "POST",
      body: JSON.stringify(args),
    });
    return data;
  }

  async countActiveProducts(): Promise<number> {
    const { headers } = await this.request<null>(
      "shop_products?select=id&status=eq.active&limit=1",
      { method: "HEAD", headers: { Prefer: "count=exact" } },
    );
    const range = headers.get("content-range");
    if (!range) return 0;
    const total = Number(range.split("/").at(-1));
    return Number.isSafeInteger(total) && total >= 0 ? total : 0;
  }
}
