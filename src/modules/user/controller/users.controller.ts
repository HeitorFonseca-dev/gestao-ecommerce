import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Headers,
  HttpException,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { Public } from '../../../config/global.const';
import { QueryParamsDTO } from '../dto/queryParams.dto';
import { CreateUserDto, UpdateUserDTO } from '../dto/user.dto';
import { UsersService } from '../services/users.service';
import { ResponseAPI } from '../../../utils/responseAPI.dto';
import { JwtStrategy } from '../../../../auth-lib/src/strategy/jwt.strategy';
import { PaginationDTO } from '../../../utils/pagination.dto';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(
    private readonly _usersService: UsersService,
    private _jwtService: JwtStrategy,
  ) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Headers() headers,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    // const metaToken = await this._jwtService.extractToken(
    //   headers?.authorization,
    // );

    // if (!metaToken) {
    //   throw new HttpException('Nao autorizado', HttpStatus.FORBIDDEN);
    // }

    try {
      const users = await this._usersService.create(createUserDto);

      response.data = users;
      response.message = 'Usuário criado com sucesso!';
      response.statusCode = HttpStatus.CREATED;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar usuário!';

      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(
    @Query() query: Partial<PaginationDTO> & Partial<QueryParamsDTO>,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();
    const metaPagination = new PaginationDTO(query);
    const queryParams: QueryParamsDTO = query;

    try {
      const responseAPI = await this._usersService.findAll(
        metaPagination,
        queryParams,
      );

      if (responseAPI && responseAPI.data) {
        response.data = responseAPI.data;
        response.metaPagination = responseAPI.metaPagination;
        response.message = 'Usuários listados com sucesso';
        response.statusCode = HttpStatus.OK;
      } else {
        response.data = null;
        response.message = 'Nao existem usuários cadastrados';
        response.statusCode = HttpStatus.NOT_FOUND;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        response.message = error.message;
      } else {
        response.message = 'Erro ao listar usuários!';
      }
      response.data = null;
      response.statusCode = HttpStatus.NOT_FOUND;
    }

    return instanceToPlain(response) as ResponseAPI;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ResponseAPI> {
    try {
      const user = await this._usersService.findOne(id);

      if (!user || !user.id) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const response = new ResponseAPI();
      response.data = user;
      response.message = 'Usuário listado com sucesso';
      response.statusCode = HttpStatus.OK;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao listar usuário!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateUserDTO,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    try {
      const user = await this._usersService.update(id, dto);

      if (!user || !user.id) {
        throw new HttpException(
          'Usuário não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }

      response.data = user;
      response.message = 'Usuário atualizado com sucesso';
      response.statusCode = HttpStatus.OK;
      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.BAD_REQUEST;

      response.message = error.message as HttpException['message'];
      response.data = null;
      response.statusCode = status;

      throw new HttpException(response, status);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    const user = await this._usersService.delete(id);

    if (user && user.id) {
      response.message = 'Usuário deletado com sucesso';
    } else {
      response.message = 'Usuário nao encontrado';
    }

    return instanceToPlain(response) as ResponseAPI;
  }
}
