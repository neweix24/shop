import { Module } from "@nestjs/common";
import { CatalogModule } from "./catalog/catalog.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HealthModule, CatalogModule, CheckoutModule],
})
export class AppModule {}
