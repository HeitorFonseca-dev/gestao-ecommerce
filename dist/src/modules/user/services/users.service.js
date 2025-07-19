"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const hashTools_util_1 = require("../../../utils/hashTools.util");
const user_entity_1 = require("../entities/user.entity");
const pagination_dto_1 = require("../../../utils/pagination.dto");
let UsersService = class UsersService {
    constructor(_userRepository, _datasource) {
        this._userRepository = _userRepository;
        this._datasource = _datasource;
    }
    async create(createUserDto) {
        const { password, is_active, phone } = createUserDto, rest = __rest(createUserDto, ["password", "is_active", "phone"]);
        const queryRunner = this._datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userHasExists = await queryRunner.manager.findOne(user_entity_1.UserEntity, {
                where: { email: createUserDto.email, deleted_at: (0, typeorm_2.IsNull)() },
            });
            if (userHasExists) {
                throw new common_1.BadRequestException('Usuário ja cadastrado com o email informado');
            }
            const user = this._userRepository.create(Object.assign({ password: password ? await hashTools_util_1.HashToolsUtils.termToHash(password) : null, phone: phone.replace(/\D/g, '') }, rest));
            const savedUser = await queryRunner.manager.save(user_entity_1.UserEntity, user);
            await queryRunner.commitTransaction();
            return savedUser;
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new Error('Erro ao criar usuário: ' + (error.message || error));
        }
        finally {
            await queryRunner.release();
        }
    }
    async findOne(id) {
        const user = await this._userRepository.findOne({
            where: {
                id: id,
                deleted_at: (0, typeorm_2.IsNull)(),
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return user;
    }
    async findAll(metaPagination, queryParams) {
        const whereConditions = {};
        if ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.is_active) !== undefined && queryParams.is_active !== '') {
            whereConditions.is_active =
                String(queryParams.is_active).toLowerCase() === 'true';
        }
        if ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.name) !== undefined && queryParams.name !== '') {
            whereConditions.name = (0, typeorm_2.ILike)(`%${queryParams.name}%`);
        }
        if ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.email) !== undefined && queryParams.email !== '') {
            whereConditions.email = (0, typeorm_2.ILike)(`%${queryParams.email}%`);
        }
        if ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.phone) !== undefined && queryParams.phone !== '') {
            whereConditions.phone = (0, typeorm_2.ILike)(`%${queryParams.phone}%`);
        }
        const paramsQuery = {
            where: Object.assign(Object.assign({}, whereConditions), { deleted_at: (0, typeorm_2.IsNull)() }),
            order: {
                [metaPagination.order || 'name']: metaPagination.sort || 'ASC',
            },
            skip: (metaPagination.page - 1) * metaPagination.take,
            take: metaPagination.take,
        };
        const data = await this._userRepository.find(paramsQuery);
        const totalRecords = await this._userRepository.count({
            where: Object.assign(Object.assign({}, whereConditions), { deleted_at: (0, typeorm_2.IsNull)() }),
        });
        metaPagination.totalRecords = totalRecords;
        metaPagination.skip = (metaPagination.page - 1) * metaPagination.take;
        const metaPage = new pagination_dto_1.PaginationDTO(metaPagination);
        return {
            data,
            metaPagination: metaPage,
        };
    }
    async update(id, dto) {
        const queryRunner = this._datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await this._userRepository.findOne({ where: { id } });
            if (!user) {
                throw new common_1.NotFoundException('Usuário não encontrado');
            }
            Object.assign(user, dto);
            if (dto.password) {
                user.password = await hashTools_util_1.HashToolsUtils.termToHash(dto.password);
            }
            await this._userRepository.save(user);
            await queryRunner.commitTransaction();
            return this.findOne(id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error('Erro ao atualizar usuário: ' + (error.message || error));
        }
        finally {
            await queryRunner.release();
        }
    }
    async delete(id) {
        const user = await this._userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        await this._userRepository.update(id, {
            is_active: false,
            deleted_at: new Date(),
        });
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], UsersService);
//# sourceMappingURL=users.service.js.map