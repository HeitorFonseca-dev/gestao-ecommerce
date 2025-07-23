import { ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
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
import { CreateOrderDto, UpdateOrderDto } from '../dto/order.dto';
import { PaginationDTO } from '../../../utils/pagination.dto';
import { QueryParamsDTO } from '../../user/dto/queryParams.dto';
import { JwtStrategy } from '../../../../auth-lib/src/strategy/jwt.strategy';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(
    private readonly _orderService: OrderService,
    private _jwtService: JwtStrategy,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateOrderDto,
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
      const order = await this._orderService.create(dto, metaToken);

      response.data = order;
      response.message = 'Pedido criado com sucesso!';
      response.statusCode = HttpStatus.CREATED;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar pedido!';

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
      const responseAPI = await this._orderService.findAll(
        metaPagination,
        queryParams,
      );

      if (responseAPI && responseAPI.data) {
        response.data = responseAPI.data;
        response.metaPagination = responseAPI.metaPagination;
        response.message = 'Pedidos listados com sucesso';
        response.statusCode = HttpStatus.OK;
      } else {
        response.data = null;
        response.message = 'Nao existem pedidos cadastrados';
        response.statusCode = HttpStatus.NOT_FOUND;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        response.message = error.message;
      } else {
        response.message = 'Erro ao listar pedidos!';
      }
      response.data = null;
      response.statusCode = HttpStatus.NOT_FOUND;
    }

    return instanceToPlain(response) as ResponseAPI;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ResponseAPI> {
    try {
      const user = await this._orderService.findOne(id);

      if (!user || !user.id) {
        throw new NotFoundException('Pedido não encontrado');
      }

      const response = new ResponseAPI();
      response.data = user;
      response.message = 'Pedido listado com sucesso';
      response.statusCode = HttpStatus.OK;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao listar pedido!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateOrderDto,
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
      const order = await this._orderService.update(id, dto, metaToken);

      if (!order || !order.id) {
        throw new HttpException(
          'Pedido não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }

      response.data = order;
      response.message = 'Pedido atualizado com sucesso';
      response.statusCode = HttpStatus.OK;
      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      console.log(error);
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

    const user = await this._orderService.delete(id, metaToken);

    if (user && user.id) {
      response.message = 'Pedido deletado com sucesso';
    } else {
      response.message = 'Pedido nao encontrado';
    }

    return instanceToPlain(response) as ResponseAPI;
  }

  @Delete(':orderId/items/:productId')
  async removeItemFromOrder(
    @Param('orderId') orderId: number,
    @Param('productId') productId: number,
  ): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    try {
      await this._orderService.removeItemFromOrder(orderId, productId);

      response.message = 'Item removido do pedido com sucesso';
      response.data = null;
      response.statusCode = HttpStatus.OK;
      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      console.log(error);
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
}
