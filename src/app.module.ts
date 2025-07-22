import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { UserEntity } from './modules/user/entities/user.entity';
import { UsersModule } from './modules/user/user.module';
import { CustomerEntity } from './modules/customer/entities/customer.entity';
import { CustomerModule } from './modules/customer/customer.module';
import { ProductEntity } from './modules/product/entities/product.entity';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { OrderEntity } from './modules/order/entities/order.entity';
import { OrderItemsEntity } from './modules/order/order-items/entities/order-items.entity';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        UserEntity,
        CustomerEntity,
        ProductEntity,
        OrderEntity,
        OrderItemsEntity,
      ],
      synchronize: false,
      logging: false,
      ssl: false,
    }),
    // AuthModule,
    UsersModule,
    DatabaseModule,
    CustomerModule,
    ProductModule,
    OrderModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
