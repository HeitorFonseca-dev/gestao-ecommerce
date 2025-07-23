import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryParamsDTO {
  @ApiPropertyOptional({ description: 'Order status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  items?: string;
}
