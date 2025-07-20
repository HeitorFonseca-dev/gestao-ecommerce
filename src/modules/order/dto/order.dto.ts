import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enum/order-status.enum';

export class CreateOrderProduct {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: 'Quantity' })
  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsInt()
  customer_id: number;

  @ApiProperty({ description: 'Status of the order', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ description: 'Total amount of the order' })
  @IsOptional()
  total_amount: number;

  @ApiProperty({
    description: 'Products of the order',
    type: [CreateOrderProduct],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProduct)
  products: CreateOrderProduct[];
}
