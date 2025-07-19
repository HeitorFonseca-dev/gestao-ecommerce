import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { changePasswordDTO } from '../dto/recovery-acess.dto';
import { RecoveryPasswordDto } from '../dto/recovery-password.dto';
import { RefreshTokenDTO } from '../dto/refresh-token.dto';
import { ResendEmailDTO } from '../dto/resend-email.dto';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { TokenJWT } from '../tokenJWT.dto';
import { AuthService } from '../services/auth.service';
import { ResponseAPI } from '../../../src/utils/responseAPI.dto';
import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Res,
  Headers,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { Public } from '../../../src/config/global.const';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private _authService: AuthService,
    private _jwtService: JwtStrategy,
  ) {}

  @Public()
  @Post('sign-in')
  async signIn(@Body() credenciaisDTO: any, @Res() res: Response) {
    const response = new ResponseAPI();

    await this._authService
      .signIn(credenciaisDTO)
      .then((token: TokenJWT) => {
        if (token.accessToken && token.refreshToken) {
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

  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Body() refreshTokenDTO: RefreshTokenDTO,
    @Res() res: Response,
  ) {
    const response = new ResponseAPI();

    await this._authService
      .refreshToken(refreshTokenDTO)
      .then(token => {
        if (token.accessToken && token.refreshToken) {
          response.data = token;
          response.message = 'Token renovado com sucesso';
          response.statusCode = HttpStatus.OK;
        } else {
          response.data = null;
          response.message = 'Renovação de token não autorizada';
          response.statusCode = HttpStatus.UNAUTHORIZED;
        }
      })
      .catch(error => {
        response.data = null;
        response.message = `${'Houve um erro critico - Detalhe: ' + error}`;
        response.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      });

    return res.status(Number(response.statusCode)).send(response);
  }

  @Public()
  @Post('recovery-password')
  async recoveryPassword(
    @Body() recoveryPasswordDto: RecoveryPasswordDto,
    @Res() res: Response,
  ) {
    const response = new ResponseAPI();

    await this._authService
      .recoveryPassword(recoveryPasswordDto)
      .then(tokenRecovery => {
        if (tokenRecovery) {
          response.data = null;
          response.message = 'Solicitacao de recuperação gerada com sucesso';
          response.statusCode = HttpStatus.OK;
        } else {
          response.data = null;
          response.message = 'Solicitação não enviada';
          response.statusCode = HttpStatus.BAD_REQUEST;
        }
      })
      .catch((error: unknown) => {
        console.error('[ERRO RECOVERY PASSWORD]', error);

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

  @Public()
  @Get('/validate-token')
  async validateToken(@Query('token') token: string, @Res() res: Response) {
    const response = new ResponseAPI();

    await this._authService
      .validateToken(token)
      .then(tokenRecovery => {
        if (tokenRecovery) {
          response.data = null;
          response.message = 'O token é válido';
          response.statusCode = HttpStatus.OK;
        } else {
          response.data = null;
          response.message = 'Falha ao validar o token';
          response.statusCode = HttpStatus.BAD_REQUEST;
        }
      })
      .catch((error: unknown) => {
        console.error('[ERRO RECOVERY PASSWORD]', error);

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

  @Public()
  @Get('recovery-password-validate')
  async recoveryPasswordValidate(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const response = new ResponseAPI();

    await this._authService
      .recoveryPasswordValidate(token)
      .then(tokenValidated => {
        if (tokenValidated) {
          response.data = null;
          response.message = 'Token reconhecido';
          response.statusCode = HttpStatus.OK;
        } else {
          response.data = null;
          response.message = 'Token não reconhecido e/ou fora de validade';
          response.statusCode = HttpStatus.NOT_FOUND;
        }
      })
      .catch(error => {
        response.data = null;
        response.message = `${'Houve um erro critico - Detalhe: ' + error}`;
        response.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      });

    return res.status(Number(response.statusCode)).send(response);
  }

  @Public()
  @Patch('recovery-password-change')
  async recoveryPasswordChange(
    @Body() changePasswordDTO: changePasswordDTO,
    @Res() res: Response,
    @Query('token') token: string,
  ) {
    const response = new ResponseAPI();

    await this._authService
      .recoveryPasswordChange(changePasswordDTO, token)
      .then(userUpdate => {
        if (userUpdate && userUpdate.id) {
          response.data = userUpdate;
          response.message = 'Senha atualizada com sucesso';
          response.statusCode = HttpStatus.OK;
        } else {
          response.data = null;
          response.message = 'Não foi possível realizada a atualização';
          response.statusCode = HttpStatus.BAD_REQUEST;
        }
      })
      .catch(error => {
        response.data = null;
        response.message = `${'Houve um erro critico - Detalhe: ' + error}`;
        response.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      });

    return res.status(Number(response.statusCode)).send(response);
  }
}
