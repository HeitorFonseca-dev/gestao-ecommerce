import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryParamsDTO {
  @ApiPropertyOptional({ description: 'Product name' })
  productName?: string;

  @ApiPropertyOptional({ description: 'Product description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Created by' })
  createdBy?: string;
}
