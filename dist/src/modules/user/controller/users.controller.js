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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const user_dto_1 = require("../dto/user.dto");
const users_service_1 = require("../services/users.service");
const responseAPI_dto_1 = require("../../../utils/responseAPI.dto");
const jwt_strategy_1 = require("../../../../auth-lib/src/strategy/jwt.strategy");
const pagination_dto_1 = require("../../../utils/pagination.dto");
let UsersController = class UsersController {
    constructor(_usersService, _jwtService) {
        this._usersService = _usersService;
        this._jwtService = _jwtService;
    }
    async create(createUserDto, headers) {
        const response = new responseAPI_dto_1.ResponseAPI();
        try {
            const users = await this._usersService.create(createUserDto);
            response.data = users;
            response.message = 'Usuário criado com sucesso!';
            response.statusCode = common_1.HttpStatus.CREATED;
            return (0, class_transformer_1.instanceToPlain)(response);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar usuário!';
            throw new common_1.HttpException(message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async findAll(query) {
        const response = new responseAPI_dto_1.ResponseAPI();
        const metaPagination = new pagination_dto_1.PaginationDTO(query);
        const queryParams = query;
        try {
            const responseAPI = await this._usersService.findAll(metaPagination, queryParams);
            if (responseAPI && responseAPI.data) {
                response.data = responseAPI.data;
                response.metaPagination = responseAPI.metaPagination;
                response.message = 'Usuários listados com sucesso';
                response.statusCode = common_1.HttpStatus.OK;
            }
            else {
                response.data = null;
                response.message = 'Nao existem usuários cadastrados';
                response.statusCode = common_1.HttpStatus.NOT_FOUND;
            }
        }
        catch (error) {
            if (error instanceof Error) {
                response.message = error.message;
            }
            else {
                response.message = 'Erro ao listar usuários!';
            }
            response.data = null;
            response.statusCode = common_1.HttpStatus.NOT_FOUND;
        }
        return (0, class_transformer_1.instanceToPlain)(response);
    }
    async findOne(id) {
        try {
            const user = await this._usersService.findOne(id);
            if (!user || !user.id) {
                throw new common_1.NotFoundException('Usuário não encontrado');
            }
            const response = new responseAPI_dto_1.ResponseAPI();
            response.data = user;
            response.message = 'Usuário listado com sucesso';
            response.statusCode = common_1.HttpStatus.OK;
            return (0, class_transformer_1.instanceToPlain)(response);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Erro ao listar usuário!', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, dto) {
        const response = new responseAPI_dto_1.ResponseAPI();
        try {
            const user = await this._usersService.update(id, dto);
            if (!user || !user.id) {
                throw new common_1.HttpException('Usuário não encontrado', common_1.HttpStatus.BAD_REQUEST);
            }
            response.data = user;
            response.message = 'Usuário atualizado com sucesso';
            response.statusCode = common_1.HttpStatus.OK;
            return (0, class_transformer_1.instanceToPlain)(response);
        }
        catch (error) {
            const status = error instanceof common_1.HttpException
                ? error.getStatus()
                : common_1.HttpStatus.BAD_REQUEST;
            response.message = error.message;
            response.data = null;
            response.statusCode = status;
            throw new common_1.HttpException(response, status);
        }
    }
    async delete(id) {
        const response = new responseAPI_dto_1.ResponseAPI();
        const user = await this._usersService.delete(id);
        if (user && user.id) {
            response.message = 'Usuário deletado com sucesso';
        }
        else {
            response.message = 'Usuário nao encontrado';
        }
        return (0, class_transformer_1.instanceToPlain)(response);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_dto_1.UpdateUserDTO]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "delete", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('user'),
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_strategy_1.JwtStrategy])
], UsersController);
//# sourceMappingURL=users.controller.js.map