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
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [UserEntity, CustomerEntity, ProductEntity],
      synchronize: false,
      logging: false,
      ssl: false,
    }),
    // AuthModule,
    UsersModule,
    DatabaseModule,
    CustomerModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
