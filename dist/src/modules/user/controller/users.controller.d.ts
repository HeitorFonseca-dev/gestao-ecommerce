import { QueryParamsDTO } from '../dto/queryParams.dto';
import { CreateUserDto, UpdateUserDTO } from '../dto/user.dto';
import { UsersService } from '../services/users.service';
import { ResponseAPI } from '../../../utils/responseAPI.dto';
import { JwtStrategy } from '../../../../auth-lib/src/strategy/jwt.strategy';
import { PaginationDTO } from '../../../utils/pagination.dto';
export declare class UsersController {
    private readonly _usersService;
    private _jwtService;
    constructor(_usersService: UsersService, _jwtService: JwtStrategy);
    create(createUserDto: CreateUserDto, headers: any): Promise<ResponseAPI>;
    findAll(query: Partial<PaginationDTO> & Partial<QueryParamsDTO>): Promise<ResponseAPI>;
    findOne(id: number): Promise<ResponseAPI>;
    update(id: number, dto: UpdateUserDTO): Promise<ResponseAPI>;
    delete(id: number): Promise<ResponseAPI>;
}
