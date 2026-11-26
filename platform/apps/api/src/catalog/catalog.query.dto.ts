import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class CatalogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  limit = 24;
}
