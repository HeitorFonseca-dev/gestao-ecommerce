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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { instanceToPlain } from 'class-transformer';
import { ResponseAPI } from '../../../utils/responseAPI.dto';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';
import { PaginationDTO } from '../../../utils/pagination.dto';
import { QueryParamsDTO } from '../dto/queryParams.dto';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly _customerService: CustomerService) {}

  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    // const metaToken = await this._jwtService.extractToken(
    //   headers?.authorization,
    // );

    // if (!metaToken) {
    //   throw new HttpException('Nao autorizado', HttpStatus.FORBIDDEN);
    // }

    try {
      const users = await this._customerService.create(dto);

      response.data = users;
      response.message = 'Cliente criado com sucesso!';
      response.statusCode = HttpStatus.CREATED;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar cliente!';

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
      const responseAPI = await this._customerService.findAll(
        metaPagination,
        queryParams,
      );

      if (responseAPI && responseAPI.data) {
        response.data = responseAPI.data;
        response.metaPagination = responseAPI.metaPagination;
        response.message = 'Clientes listados com sucesso';
        response.statusCode = HttpStatus.OK;
      } else {
        response.data = null;
        response.message = 'Nao existem clientes cadastrados';
        response.statusCode = HttpStatus.NOT_FOUND;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        response.message = error.message;
      } else {
        response.message = 'Erro ao listar clientes!';
      }
      response.data = null;
      response.statusCode = HttpStatus.NOT_FOUND;
    }

    return instanceToPlain(response) as ResponseAPI;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ResponseAPI> {
    try {
      const user = await this._customerService.findOne(id);

      if (!user || !user.id) {
        throw new NotFoundException('Cliente não encontrado');
      }

      const response = new ResponseAPI();
      response.data = user;
      response.message = 'Cliente listado com sucesso';
      response.statusCode = HttpStatus.OK;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao listar cliente!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateCustomerDto,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    try {
      const user = await this._customerService.update(id, dto);

      if (!user || !user.id) {
        throw new HttpException(
          'Cliente não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }

      response.data = user;
      response.message = 'Cliente atualizado com sucesso';
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

    const user = await this._customerService.delete(id);

    if (user && user.id) {
      response.message = 'Cliente deletado com sucesso';
    } else {
      response.message = 'Cliente nao encontrado';
    }

    return instanceToPlain(response) as ResponseAPI;
  }
}
