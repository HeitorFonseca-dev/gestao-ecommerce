import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../database/database.module';
import { JwtStrategy } from '../../../auth-lib/src/strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entities/user.entity';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controller/customer.controller';
import { CustomerEntity } from './entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CustomerEntity]),
    DatabaseModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService, JwtStrategy, JwtService],
  exports: [CustomerService],
})
export class CustomerModule {}
