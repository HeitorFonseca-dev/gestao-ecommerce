import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenJWTPayload } from '../dto/token-jwt-payload.dto';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private jwtService;
    private _configService;
    constructor(jwtService: JwtService, _configService: ConfigService);
    generateJwtToken(payload: TokenJWTPayload): Promise<string>;
    verifyToken(token: string): Promise<TokenJWTPayload>;
    decodedToken(token: string): Promise<any>;
    extractToken(token: string): Promise<TokenJWTPayload | null>;
}
export {};
