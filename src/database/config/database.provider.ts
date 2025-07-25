import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { CustomerEntity } from '../../modules/customer/entities/customer.entity';
import { ProductEntity } from '../../modules/product/entities/product.entity';
import { OrderEntity } from '../../modules/order/entities/order.entity';
import { OrderItemsEntity } from '../../modules/order/order-items/entities/order-items.entity';
import { CartEntity } from '../../modules/cart/entities/cart.entity';
import { CartItemEntity } from '../../modules/cart/entities/cart-items.entity';

config({ path: `.env.${process.env.NODE_ENV}` });

const PORT = process.env.DATABASE_PORT || '25060';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: process.env.CERT ? { ca: process.env.CERT } : false,
  entities: [
    UserEntity,
    CustomerEntity,
    OrderEntity,
    ProductEntity,
    OrderItemsEntity,
    CartEntity,
    CartItemEntity,
  ],
  migrations: ['dist/src/database/migrations/**/*.js'],
  logging: process.env.LOGGING === 'true',
});

export const dataBaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      await AppDataSource.initialize();
      return AppDataSource;
    },
  },
];
