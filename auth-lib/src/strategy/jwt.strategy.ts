import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenJWTPayload } from '../dto/token-jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private jwtService: JwtService,
    private _configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'super-secret',
    });
  }

  public async generateJwtToken(payload: TokenJWTPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  public async verifyToken(token: string): Promise<TokenJWTPayload> {
    return await this.jwtService.verifyAsync<TokenJWTPayload>(token, {
      secret: this._configService.get<string>('security.jwt.secretToken'),
    });
  }

  public async decodedToken(token: string) {
    return await this.jwtService.decode(token);
  }

  public async extractToken(token: string): Promise<TokenJWTPayload | null> {
    return await this.decodedToken(token.split(' ')[1])
      .then((tokenDecoded: TokenJWTPayload) => tokenDecoded)
      .catch(() => null);
  }

  public async validate(payload: TokenJWTPayload): Promise<TokenJWTPayload> {
    if (!payload) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return {
      sub: payload.sub,
      name: payload.name,
      role: payload.role,
    };
  }
}
