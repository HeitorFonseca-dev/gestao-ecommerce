import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { TokenJWTPayload } from '../dto/token-jwt-payload.dto';
import { JwtStrategy } from '../strategy/jwt.strategy';
// import { TokenJWT } from '../tokenJWT.dto';
import { CredentialsDTO } from '../auth.dto';
import { UserEntity } from '../../../src/modules/user/entities/user.entity';
import { HashToolsUtils } from '../../../src/utils/hashTools.util';
export interface TokenJWT {
  sub?: string;
  full_name?: string;
  iss?: string;
  aud?: string;
  iat?: number;
  accessToken?: string | null;
  refreshToken?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private _configService: ConfigService,
    private jwtService: JwtStrategy,
  ) {}

  async signIn(credenciaisDTO: CredentialsDTO): Promise<TokenJWT> {
    const validatedUser = await this.checkCredentials(credenciaisDTO);

    let token: TokenJWT = { accessToken: '', refreshToken: '' };

    if (validatedUser) {
      token = await this.generateToken(validatedUser);
    }
    return token;
  }

  async checkCredentials(credentialDTO: CredentialsDTO): Promise<UserEntity> {
    const user = await this._userRepository.findOne({
      where: { email: credentialDTO.email, is_active: true },
    });

    if (
      !user ||
      !(await HashToolsUtils.compareHash(credentialDTO.password, user.password))
    ) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }

  async generateToken(validatedUser: UserEntity): Promise<TokenJWT> {
    const validationData = new Date();
    validationData.setHours(validationData.getHours() + 1);

    const user = await this._userRepository.findOne({
      where: { id: validatedUser.id },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payloadData: TokenJWTPayload = {
      sub: user.id,
      name: validatedUser.name,
      iss: this._configService.get<string>('core.apiNomeCore'),
      aud: this._configService.get<string>('core.clientAppUrl'),
      iat: Math.floor(Date.now() / 1000),
    };
    const token: TokenJWT = {
      accessToken: (
        await this.jwtService.generateJwtToken(payloadData)
      ).toString(),
    };
    return {
      accessToken: token.accessToken,
    };
  }

  async verifyToken(token: string) {
    return await this.jwtService.verifyToken(token);
  }
}
