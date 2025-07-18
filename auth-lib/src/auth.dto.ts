import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CredentialsDTO {
  @IsEmail()
  @IsString({ message: '[email] - Campo do tipo string' })
  @IsNotEmpty({ message: '[email] - Campo obrigátório' })
  @ApiProperty({ required: true })
  email: string;

  @IsString({ message: '[senha] - Campo do tipo string' })
  @IsNotEmpty({ message: '[senha] - Campo obrigátório' })
  @ApiProperty({ required: true })
  password: string;
}
