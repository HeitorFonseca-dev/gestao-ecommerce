import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Headers,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { ResponseAPI } from '../../../utils/responseAPI.dto';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { PaginationDTO } from '../../../utils/pagination.dto';
import { QueryParamsDTO } from '../dto/queryParams.dto';
import { JwtStrategy } from '../../../../auth-lib/src/strategy/jwt.strategy';
import { Profiles } from '../../../config/global.const';
import { Profile } from '../../user/enum/profiles.enum';

@ApiTags('product')
@ApiBearerAuth('JWT-auth')
@Controller('product')
export class ProductController {
  constructor(
    private readonly _productService: ProductService,
    private _jwtService: JwtStrategy,
  ) {}

  @Post()
  @Profiles(Profile.Admin)
  async create(
    @Body() dto: CreateProductDto,
    @Headers() headers,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    const metaToken = await this._jwtService.extractToken(
      headers?.authorization,
    );

    if (!metaToken) {
      throw new HttpException('Nao autorizado', HttpStatus.FORBIDDEN);
    }

    try {
      const users = await this._productService.create(dto, metaToken);

      response.data = users;
      response.message = 'Produto criado com sucesso!';
      response.statusCode = HttpStatus.CREATED;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar produto!';

      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @Profiles(Profile.Admin, Profile.Customer)
  @ApiQuery({ type: QueryParamsDTO })
  async findAll(
    @Query()
    query: Partial<PaginationDTO> & Partial<QueryParamsDTO> & QueryParamsDTO,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();
    const metaPagination = new PaginationDTO(query);
    const queryParams: QueryParamsDTO = query;

    try {
      const responseAPI = await this._productService.findAll(
        metaPagination,
        queryParams,
      );

      if (responseAPI && responseAPI.data) {
        response.data = responseAPI.data;
        response.metaPagination = responseAPI.metaPagination;
        response.message = 'Produtos listados com sucesso';
        response.statusCode = HttpStatus.OK;
      } else {
        response.data = null;
        response.message = 'Nao existem produtos cadastrados';
        response.statusCode = HttpStatus.NOT_FOUND;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        response.message = error.message;
      } else {
        response.message = 'Erro ao listar produtos!';
      }
      response.data = null;
      response.statusCode = HttpStatus.NOT_FOUND;
    }

    return instanceToPlain(response) as ResponseAPI;
  }

  @Get(':id')
  @Profiles(Profile.Admin, Profile.Customer)
  async findOne(@Param('id') id: number): Promise<ResponseAPI> {
    try {
      const user = await this._productService.findOne(id);

      if (!user || !user.id) {
        throw new NotFoundException('Produto não encontrado');
      }

      const response = new ResponseAPI();
      response.data = user;
      response.message = 'Produto listado com sucesso';
      response.statusCode = HttpStatus.OK;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao listar produto!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @Profiles(Profile.Admin)
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateProductDto,
    @Headers() headers,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    const metaToken = await this._jwtService.extractToken(
      headers?.authorization,
    );

    if (!metaToken) {
      throw new HttpException('Nao autorizado', HttpStatus.FORBIDDEN);
    }

    try {
      const user = await this._productService.update(id, dto, metaToken);

      if (!user || !user.id) {
        throw new HttpException(
          'Produto não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }

      response.data = user;
      response.message = 'Produto atualizado com sucesso';
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
  @Profiles(Profile.Admin)
  async delete(
    @Param('id') id: number,
    @Headers() headers,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    const metaToken = await this._jwtService.extractToken(
      headers?.authorization,
    );

    if (!metaToken) {
      throw new HttpException('Nao autorizado', HttpStatus.FORBIDDEN);
    }

    const user = await this._productService.delete(id, metaToken);

    if (user && user.id) {
      response.message = 'Produto deletado com sucesso';
    } else {
      response.message = 'Produto nao encontrado';
    }

    return instanceToPlain(response) as ResponseAPI;
  }
}
