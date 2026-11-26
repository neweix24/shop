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
  private readonly baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  private readonly serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.serviceKey);
  }

  private buildUrl(path: string): string {
    if (!this.baseUrl || !this.serviceKey) {
      throw new ServiceUnavailableException({
        code: "SHOP_DATABASE_NOT_CONFIGURED",
        message: "Shop database service is not configured.",
      });
    }
    return `${this.baseUrl}/rest/v1/${path.replace(/^\//, "")}`;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<{ data: T; headers: Headers }> {
    const response = await fetch(this.buildUrl(path), {
      ...init,
      headers: {
        apikey: this.serviceKey!,
        Authorization: `Bearer ${this.serviceKey!}`,
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });

    const raw = await response.text();
    let payload: unknown = null;
    if (raw) {
      try { payload = JSON.parse(raw); } catch { payload = raw; }
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
    return Number.isFinite(total) ? total : 0;
  }
}
