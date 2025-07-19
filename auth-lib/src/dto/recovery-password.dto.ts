import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RecoveryPasswordDto {
  @IsEmail()
  @IsString({ message: '[email] - Campo do tipo string' })
  @ApiProperty({ required: true })
  email: string;
}
