import { SetMetadata } from '@nestjs/common';
import { Profile } from '../modules/user/enum/profiles.enum';
// Custom meta
export const IS_ROUTE_PUBLIC = 'isPublic';
export const Public = () => SetMetadata('IS_ROUTE_PUBLIC', true);

export const ROLES_KEY = 'roles';

export const Profiles = (...perfis: Profile[]) =>
  SetMetadata(ROLES_KEY, perfis);
