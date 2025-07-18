import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class changePasswordDTO {
  @IsOptional({ message: '[token] - Campo do tipo string' })
  @ApiProperty({ required: true })
  token: string;

  @IsString({ message: '[senha] - Campo do tipo string' })
  @IsNotEmpty({ message: '[senha] - Campo obrigátório' })
  @ApiProperty({ required: true })
  password: string;
}
