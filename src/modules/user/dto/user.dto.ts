import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Profile } from '../enum/profiles.enum';

interface Customer {
  userId: number;
  name: string;
  contact: string;
  address: string;
  status: boolean;
}
export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsOptional()
  role: Profile;

  @ApiProperty()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsOptional()
  is_active: boolean;

  @ApiProperty()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsOptional()
  customer: Customer;
}

export class UpdateUserDTO extends CreateUserDto {}
