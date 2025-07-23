import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { TokenJWT } from '../tokenJWT.dto';
import { AuthService } from '../services/auth.service';
import { ResponseAPI } from '../../../src/utils/responseAPI.dto';
import { Controller, HttpStatus, Post, Body, Res } from '@nestjs/common';
import { Public } from '../../../src/config/global.const';
import { CredentialsDTO } from '../auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private _authService: AuthService,
    private _jwtService: JwtStrategy,
  ) {}

  @Public()
  @ApiQuery({ type: CredentialsDTO })
  @Post('signIn')
  async signIn(@Body() credenciaisDTO: CredentialsDTO, @Res() res: Response) {
    const response = new ResponseAPI();

    await this._authService
      .signIn(credenciaisDTO)
      .then((token: TokenJWT) => {
        if (token.accessToken) {
          response.data = token;
          response.message = 'Acesso concedido com sucesso';
          response.statusCode = HttpStatus.OK;
        } else {
          response.data = null;
          response.message = 'Usuário e/ou Senha inválido';
          response.statusCode = HttpStatus.UNAUTHORIZED;
        }
      })
      .catch((error: unknown) => {
        console.error('[ERRO SIGNIN]', error);

        let errorMessage = 'Erro desconhecido';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        response.data = null;
        response.message = `Houve um erro crítico - Detalhe: ${errorMessage}`;
        response.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      });

    return res.status(Number(response.statusCode)).send(response);
  }
}
