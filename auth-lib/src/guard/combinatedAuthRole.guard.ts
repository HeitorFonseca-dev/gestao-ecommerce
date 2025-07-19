import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Injectable()
export class CombinedAuthRolesGuard implements CanActivate {
  constructor(private readonly authGuard: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuth = await this.authGuard.canActivate(context);
    if (!isAuth) return false;
    return true;
  }
}
