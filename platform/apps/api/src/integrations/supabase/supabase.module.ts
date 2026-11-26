import { Module } from "@nestjs/common";
import { SupabaseRestClient } from "./supabase-rest.client";

@Module({
  providers: [SupabaseRestClient],
  exports: [SupabaseRestClient],
})
export class SupabaseModule {}
