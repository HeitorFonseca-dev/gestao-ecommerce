import { SetMetadata } from '@nestjs/common';
// Custom meta
export const IS_ROUTE_PUBLIC = 'isPublic';
export const Public = () => SetMetadata('IS_ROUTE_PUBLIC', true);

export const ROLES_KEY = 'roles';
