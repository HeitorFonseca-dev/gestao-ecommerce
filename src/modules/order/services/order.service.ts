import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  IsNull,
  FindOptionsWhere,
  FindManyOptions,
  ILike,
} from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderDto } from '../dto/order.dto';
import { OrderItemsEntity } from '../order-items/entities/order-items.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { PaginationDTO } from '../../../utils/pagination.dto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '../enum/order-status.enum';
import { TokenJWTPayload } from '../../../../auth-lib/src/dto/token-jwt-payload.dto';
import { QueryParamsDTO } from '../dto/queryParams.dto';

export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly _orderRepository: Repository<OrderEntity>,

    private _datasource: DataSource,
  ) {}

  async create(
    dto: CreateOrderDto,
    metaToken: TokenJWTPayload,
  ): Promise<OrderEntity> {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await queryRunner.manager.findOne(CustomerEntity, {
        where: { id: dto.customer_id },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      let order = queryRunner.manager.create(OrderEntity, {
        customer: customer,
        status: dto.status,
        total_amount: 0,
        created_by: metaToken.name,
      });

      order = await queryRunner.manager.save(OrderEntity, order);

      const orderItems = await Promise.all(
        dto.products.map(async product => {
          const findProduct = await queryRunner.manager.findOne(ProductEntity, {
            where: { id: product.product_id },
          });

          if (!findProduct) {
            throw new Error(`Product not found: ${product.product_id}`);
          }

          return queryRunner.manager.create(OrderItemsEntity, {
            order: order,
            product: findProduct,
            quantity: product.quantity,
            unit_price: findProduct.price,
            subtotal: findProduct.price * product.quantity,
            created_by: metaToken.name,
          });
        }),
      );

      await queryRunner.manager.save(OrderItemsEntity, orderItems);

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );

      order.total_amount = totalAmount;
      await queryRunner.manager.save(OrderEntity, order);

      const fullOrder = await queryRunner.manager.findOne(OrderEntity, {
        where: { id: order.id },
        relations: [
          'orderItems',
          'orderItems.product',
          'customer',
          'customer.user',
        ],
      });

      if (!fullOrder) {
        throw new Error('Order not found');
      }

      await queryRunner.commitTransaction();

      return fullOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<OrderEntity> {
    const user = await this._orderRepository.findOne({
      relations: ['orderItems', 'orderItems.product'],
      where: {
        id: id,
        deleted_at: IsNull(),
      },
    });

    if (!user) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return user;
  }

  async findAll(metaPagination: PaginationDTO, queryParams?: QueryParamsDTO) {
    const whereConditions: FindOptionsWhere<OrderEntity> = {};

    if (queryParams?.status !== undefined && queryParams.status !== '') {
      whereConditions.status = queryParams.status;
    }

    if (queryParams?.items !== undefined && queryParams.items !== '') {
      whereConditions.orderItems = {
        product: {
          product_name: ILike(`%${queryParams.items}%`),
        },
      };
    }

    const paramsQuery: FindManyOptions<OrderEntity> = {
      relations: ['orderItems', 'orderItems.product'],
      where: {
        ...whereConditions,
        deleted_at: IsNull(),
      },
      order: {
        [metaPagination.order || 'created_at']: metaPagination.sort || 'ASC',
      },
      skip: (metaPagination.page - 1) * metaPagination.take,
      take: metaPagination.take,
    };

    const data = await this._orderRepository.find(paramsQuery);

    const totalRecords = await this._orderRepository.count({
      where: {
        ...whereConditions,
        deleted_at: IsNull(),
      },
    });

    metaPagination.totalRecords = totalRecords;
    metaPagination.skip = (metaPagination.page - 1) * metaPagination.take;

    const metaPage = new PaginationDTO(metaPagination);

    return {
      data,
      metaPagination: metaPage,
    };
  }

  async update(
    id: number,
    dto: UpdateOrderDto,
    metaToken: TokenJWTPayload,
  ): Promise<OrderEntity> {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingOrder = await queryRunner.manager.findOne(OrderEntity, {
        where: { id },
        relations: ['orderItems'],
      });

      if (!existingOrder) {
        throw new NotFoundException('Pedido não encontrado');
      }

      const statusBlockMessages = {
        [OrderStatus.Delivered]: 'Não é possível alterar um pedido entregue.',
        [OrderStatus.Cancelled]: 'Não é possível alterar um pedido cancelado.',
        [OrderStatus.Dispatched]:
          'Não é possível alterar um pedido que já foi enviado. É necessário realizar a devolução para efetuar alterações.',
      };

      const message = statusBlockMessages[existingOrder.status];
      if (message) {
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }

      existingOrder.status = dto.status ?? existingOrder.status;

      for (const product of dto.products) {
        const findProduct = await queryRunner.manager.findOne(ProductEntity, {
          where: { id: product.product_id },
        });

        if (!findProduct) {
          throw new Error(`Product not found: ${product.product_id}`);
        }

        const existingOrderItem = existingOrder.orderItems.find(
          item => item.product.id === product.product_id,
        );

        if (existingOrderItem) {
          existingOrderItem.quantity = product.quantity;
          existingOrderItem.unit_price = findProduct.price;
          existingOrderItem.subtotal = findProduct.price * product.quantity;
          existingOrderItem.updated_by = metaToken.name;
          await queryRunner.manager.save(OrderItemsEntity, existingOrderItem);
        } else {
          const orderItem = queryRunner.manager.create(OrderItemsEntity, {
            order: existingOrder,
            product: findProduct,
            quantity: product.quantity,
            unit_price: findProduct.price,
            subtotal: findProduct.price * product.quantity,
            created_by: metaToken.name,
          });
          existingOrder.orderItems.push(orderItem);
          await queryRunner.manager.save(OrderItemsEntity, orderItem);
        }

        // Soma dos subtotais corretamente com valores numéricos
        existingOrder.total_amount = parseFloat(
          existingOrder.orderItems
            .reduce((sum, item) => sum + Number(item.subtotal), 0)
            .toFixed(2),
        );

        await queryRunner.manager.save(OrderEntity, existingOrder);
      }

      const updatedOrder = await queryRunner.manager.findOne(OrderEntity, {
        where: { id: existingOrder.id },
        relations: [
          'orderItems',
          'orderItems.product',
          'customer',
          'customer.user',
        ],
      });

      if (!updatedOrder) {
        throw new BadRequestException('O pedido não pôde ser atualizado');
      }

      await queryRunner.commitTransaction();
      return updatedOrder;
    } catch (error) {
      console.log('error', error);
      await queryRunner.rollbackTransaction();
      throw new Error('Erro ao atualizar pedido: ' + (error.message || error));
    }
  }

  async delete(id: number, metaToken: TokenJWTPayload): Promise<OrderEntity> {
    const order = await this._orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    await this._orderRepository.update(id, {
      deleted_at: new Date(),
      deleted_by: metaToken.name,
    });

    return order;
  }

  async removeItemFromOrder(orderId: number, productId: number) {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const itemToRemove = await queryRunner.manager.findOne(OrderItemsEntity, {
        where: {
          order: { id: orderId },
          product: { id: productId },
        },
      });

      if (!itemToRemove) {
        throw new Error(
          `Produto ${productId} não encontrado no pedido ${orderId}`,
        );
      }

      await queryRunner.manager.delete(OrderItemsEntity, {
        order: { id: orderId },
        product: { id: productId },
      });

      const remainingItems = await queryRunner.manager.find(OrderItemsEntity, {
        where: { order: { id: orderId } },
      });

      const newTotalAmount = remainingItems.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0,
      );

      await queryRunner.manager.update(OrderEntity, orderId, {
        total_amount: newTotalAmount,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
