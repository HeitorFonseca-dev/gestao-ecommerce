import { ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { ResponseAPI } from '../../../utils/responseAPI.dto';
import { CreateOrderDto } from '../dto/order.dto';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly _orderService: OrderService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<ResponseAPI> {
    const response = new ResponseAPI();

    // const metaToken = await this._jwtService.extractToken(
    //   headers?.authorization,
    // );

    // if (!metaToken) {
    //   throw new HttpException('Nao autorizado', HttpStatus.FORBIDDEN);
    // }

    try {
      const order = await this._orderService.create(dto);

      response.data = order;
      response.message = 'Order criado com sucesso!';
      response.statusCode = HttpStatus.CREATED;

      return instanceToPlain(response) as ResponseAPI;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar order!';

      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
