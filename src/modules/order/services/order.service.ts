import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/order.dto';
import { OrderItemsEntity } from '../order-items/entities/order-items.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { ProductEntity } from '../../product/entities/product.entity';

export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly _orderRepository: Repository<OrderEntity>,

    private _datasource: DataSource,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log(dto);
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

      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
