import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { AuthModule } from '../auth-lib/src/auth.module';
<<<<<<< HEAD
import { APP_GUARD } from '@nestjs/core';
import { ProfileGuard } from './guards/profile.guard';
import { JwtStrategy } from '../auth-lib/src/strategy/jwt.strategy';
=======
import { AuthGuard } from '../auth-lib/src/guard/auth.guard';
>>>>>>> master

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
      port: parseInt(process.env.DATABASE_PORT ?? '25060', 10),
      username: process.env.DATABASE_USER,
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
    }),
    AuthModule,
    DatabaseModule,
    UsersModule,
    DatabaseModule,
    CustomerModule,
    ProductModule,
    OrderModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ProfileGuard, // depois valida o perfil
    },
  ],
})
export class AppModule {}
