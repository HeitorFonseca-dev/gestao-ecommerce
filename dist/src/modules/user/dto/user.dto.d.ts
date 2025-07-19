import { Profiles } from '../enum/profiles.enum';
export declare class CreateUserDto {
    name: string;
    email: string;
    role: Profiles;
    phone: string;
    is_active: boolean;
    password: string;
}
export declare class UpdateUserDTO extends CreateUserDto {
}
