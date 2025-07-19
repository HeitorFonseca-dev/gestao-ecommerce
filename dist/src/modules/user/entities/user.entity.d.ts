import { BaseEntity } from '../../../database/base/base.entity';
import { Profiles } from '../enum/profiles.enum';
export declare class UserEntity extends BaseEntity {
    name: string;
    email: string;
    phone: string;
    is_active: boolean;
    role: Profiles;
    password: string | null;
    deleted_at: Date;
    deleted_by: string;
}
