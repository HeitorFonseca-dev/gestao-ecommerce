import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../modules/user/entities/user.entity';
import { OrderEntity } from '../modules/order/entities/order.entity';
import { CartEntity } from '../modules/cart/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OrderEntity, CartEntity])],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
