import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CartController } from './controller/cart.controller';
import { CartItemEntity } from './entities/cart-items.entity';
import { CartService } from './services/cart.service';
import { RedisModule } from '../../redis/redis.module';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderItemsEntity } from '../order/order-items/entities/order-items.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartEntity,
      CartItemEntity,
      ProductEntity,
      UserEntity,
      OrderEntity,
      OrderItemsEntity,
    ]),
    RedisModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
