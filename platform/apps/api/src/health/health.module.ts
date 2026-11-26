import { Module } from "@nestjs/common";
import { SupabaseModule } from "../integrations/supabase/supabase.module";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

@Module({
  imports: [SupabaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
