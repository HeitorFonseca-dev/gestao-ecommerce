import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { CustomerEntity } from '../../modules/customer/entities/customer.entity';

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
  entities: [UserEntity, CustomerEntity],
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
