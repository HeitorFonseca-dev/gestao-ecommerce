import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../database/database.module';
import { JwtStrategy } from '../../../auth-lib/src/strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entities/user.entity';
import { CustomerService } from './services/customer.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), DatabaseModule],
  controllers: [UsersController],
  providers: [CustomerService, JwtStrategy, JwtService],
  exports: [CustomerService],
})
export class UsersModule {}
