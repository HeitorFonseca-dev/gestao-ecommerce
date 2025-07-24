import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenJWTPayload } from '../../auth-lib/src/dto/token-jwt-payload.dto';
import { ROLES_KEY } from '../config/global.const';
import { Profile } from '../modules/user/enum/profiles.enum';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Profile[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return this.verifyRoles(requiredRoles, user);
  }

  verifyRoles(requiredRoles: string[], payload: TokenJWTPayload): boolean {
    if (!payload || !payload.role) {
      return false;
    }

    const userRoles = Array.isArray(payload.role)
      ? payload.role
      : [payload.role];

    return userRoles.some(role => requiredRoles.includes(role));
  }
}
