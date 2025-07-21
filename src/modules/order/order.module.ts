import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../../../auth-lib/src/strategy/jwt.strategy';
import { DatabaseModule } from '../../database/database.module';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { UserEntity } from '../user/entities/user.entity';
import { OrderController } from './controller/order.controller';
import { OrderEntity } from './entities/order.entity';
import { OrderService } from './services/order.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CustomerEntity, OrderEntity]),
    DatabaseModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtStrategy, JwtService],
  exports: [OrderService],
})
export class OrderModule {}
