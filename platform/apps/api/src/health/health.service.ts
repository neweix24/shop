import { Injectable } from "@nestjs/common";
import { SupabaseRestClient } from "../integrations/supabase/supabase-rest.client";

export interface ReadinessReport {
  status: "ready" | "not_ready";
  dependencies: {
    database: "reachable" | "not_configured" | "unavailable";
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly supabase: SupabaseRestClient) {}

  live() {
    return {
      service: "neweix-shop-api",
      status: "live" as const,
    };
  }

  async readiness(): Promise<ReadinessReport> {
    if (!this.supabase.isConfigured) {
      return {
        status: "not_ready",
        dependencies: { database: "not_configured" },
      };
    }

    try {
      await this.supabase.ping();
      return {
        status: "ready",
        dependencies: { database: "reachable" },
      };
    } catch {
      return {
        status: "not_ready",
        dependencies: { database: "unavailable" },
      };
    }
  }
}
