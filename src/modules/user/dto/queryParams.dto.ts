import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryParamsDTO {
  @ApiPropertyOptional({ description: 'User status' })
  is_active?: string;

  @ApiPropertyOptional({ description: 'User name' })
  name?: string;

  @ApiPropertyOptional({ description: 'User email' })
  email?: string;

  @ApiPropertyOptional({ description: 'User phone' })
  phone?: string;
}
