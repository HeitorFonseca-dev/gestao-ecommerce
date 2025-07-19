import {
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Full name of the customer', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Customer contact number', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  contact: string;

  @ApiProperty({ description: 'Customer address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Status of the customer', default: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    description: 'ID of the user who created the customer',
    required: false,
  })
  @IsString()
  @IsOptional()
  created_by?: string;

  @ApiProperty({
    description: 'ID of the user who last updated the customer',
    required: false,
  })
  @IsString()
  @IsOptional()
  updated_by?: string;

  @ApiProperty()
  @IsOptional()
  password: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {}
