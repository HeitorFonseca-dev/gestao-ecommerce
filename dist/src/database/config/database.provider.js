"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataBaseProviders = exports.AppDataSource = void 0;
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../modules/user/entities/user.entity");
const customer_entity_1 = require("../../modules/customer/entities/customer.entity");
const product_entity_1 = require("../../modules/product/entities/product.entity");
const order_entity_1 = require("../../modules/order/entities/order.entity");
const order_items_entity_1 = require("../../modules/order/order-items/entities/order-items.entity");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV}` });
const PORT = process.env.DATABASE_PORT || '25060';
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: process.env.CERT ? { ca: process.env.CERT } : false,
    entities: [
        user_entity_1.UserEntity,
        customer_entity_1.CustomerEntity,
        order_entity_1.OrderEntity,
        product_entity_1.ProductEntity,
        order_items_entity_1.OrderItemsEntity,
    ],
    migrations: ['dist/src/database/migrations/**/*.js'],
    logging: process.env.LOGGING === 'true',
});
exports.dataBaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            await exports.AppDataSource.initialize();
            return exports.AppDataSource;
        },
    },
];
//# sourceMappingURL=database.provider.js.map