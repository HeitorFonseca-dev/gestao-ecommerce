import { Profile } from '../modules/user/enum/profiles.enum';
export declare const IS_ROUTE_PUBLIC = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const ROLES_KEY = "roles";
export declare const Profiles: (...role: Profile[]) => import("@nestjs/common").CustomDecorator<string>;
