import {
  IsString,
  IsNumber,
  IsInt,
  IsPositive,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  product_name: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price', example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Quantity in stock', example: 10 })
  @IsInt()
  @IsPositive()
  stock_quantity: number;
}

export class UpdateProductDto extends CreateProductDto {}
