import { Controller, Get, Query } from "@nestjs/common";
import { CatalogQueryDto } from "./catalog.query.dto";
import { CatalogService } from "./catalog.service";

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("products")
  listProducts(@Query() query: CatalogQueryDto) {
    return this.catalog.listProducts(query.limit);
  }
}
