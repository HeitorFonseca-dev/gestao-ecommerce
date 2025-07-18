"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataBaseProviders = exports.AppDataSource = void 0;
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
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
    entities: [],
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