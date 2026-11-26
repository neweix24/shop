import { Injectable } from "@nestjs/common";
import { CatalogRepository } from "./catalog.repository";

@Injectable()
export class CatalogService {
  constructor(private readonly repository: CatalogRepository) {}

  async listProducts(limit = 24) {
    const products = await this.repository.listActiveProducts(limit);
    return { products };
  }
}
