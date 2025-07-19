import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../database/database.module';
import { JwtStrategy } from '../../../auth-lib/src/strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ProductController } from './controller/product.controller';
import { ProductService } from './services/product.service';
import { ProductEntity } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), DatabaseModule],
  controllers: [ProductController],
  providers: [ProductService, JwtStrategy, JwtService],
  exports: [ProductService],
})
export class ProductModule {}
