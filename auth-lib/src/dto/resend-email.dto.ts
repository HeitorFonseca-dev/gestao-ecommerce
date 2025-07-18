import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendEmailDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
