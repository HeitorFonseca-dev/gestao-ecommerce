import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { UserEntity } from '../../../../src/modules/user/entities/user.entity';

export class RefreshTokenDTO {
  @IsString({ message: '[chave] - Campo do tipo string' })
  @IsNotEmpty({ message: '[chave] - Campo obrigátório' })
  token: string;

  @IsObject()
  @IsNotEmpty({ message: '[idUsuario] - Campo obrigátório' })
  @ApiProperty({ required: true })
  user: UserEntity;
}
