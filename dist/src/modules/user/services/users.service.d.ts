import { DataSource, Repository } from 'typeorm';
import { QueryParamsDTO } from '../dto/queryParams.dto';
import { CreateUserDto, UpdateUserDTO } from '../dto/user.dto';
import { UserEntity } from '../entities/user.entity';
import { PaginationDTO } from '../../../utils/pagination.dto';
export declare class UsersService {
    private readonly _userRepository;
    private _datasource;
    constructor(_userRepository: Repository<UserEntity>, _datasource: DataSource);
    create(createUserDto: CreateUserDto): Promise<UserEntity>;
    findOne(id: number): Promise<UserEntity>;
    findAll(metaPagination: PaginationDTO, queryParams?: QueryParamsDTO): Promise<{
        data: UserEntity[];
        metaPagination: PaginationDTO;
    }>;
    update(id: number, dto: UpdateUserDTO): Promise<UserEntity>;
    delete(id: number): Promise<UserEntity>;
}
