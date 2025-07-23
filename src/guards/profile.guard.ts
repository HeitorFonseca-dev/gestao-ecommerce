import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenJWTPayload } from '../../auth-lib/src/dto/token-jwt-payload.dto';
import { ROLES_KEY } from '../config/global.const';
import { Profile } from '../modules/user/enum/profiles.enum';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Pega os perfis requeridos pelo decorator da rota ou controller
    const requiredRoles = this.reflector.getAllAndOverride<Profile[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não tem perfis definidos na rota, libera acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: TokenJWTPayload = request.user;

    console.log(user);

    if (!user) {
      // Se não existe user no request, bloqueia acesso
      return false;
    }

    return this.verifyRoles(requiredRoles, user);
  }

  private verifyRoles(
    requiredRoles: Profile[],
    payload: TokenJWTPayload,
  ): boolean {
    if (!payload.role) {
      return false;
    }

    // Supondo que payload.role pode ser string ou string[]
    const userRoles = Array.isArray(payload.role)
      ? payload.role
      : [payload.role];

    // Verifica se algum perfil do usuário está nos perfis requeridos
    return userRoles.some(role => requiredRoles.includes(role as Profile));
  }
}
