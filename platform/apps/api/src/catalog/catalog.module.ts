import { Module } from "@nestjs/common";
import { SupabaseModule } from "../integrations/supabase/supabase.module";
import { CatalogController } from "./catalog.controller";
import { CatalogRepository } from "./catalog.repository";
import { CatalogService } from "./catalog.service";

@Module({
  imports: [SupabaseModule],
  controllers: [CatalogController],
  providers: [CatalogRepository, CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
