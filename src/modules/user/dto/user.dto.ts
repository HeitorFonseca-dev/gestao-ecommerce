import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Profiles } from '../enum/profiles.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsOptional()
  role: Profiles;

  @ApiProperty()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsOptional()
  is_active: boolean;

  @ApiProperty()
  @IsOptional()
  password: string;
}

export class UpdateUserDTO extends CreateUserDto {}
