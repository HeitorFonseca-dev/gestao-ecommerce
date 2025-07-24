"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const database_module_1 = require("./database/database.module");
const user_entity_1 = require("./modules/user/entities/user.entity");
const user_module_1 = require("./modules/user/user.module");
const customer_entity_1 = require("./modules/customer/entities/customer.entity");
const customer_module_1 = require("./modules/customer/customer.module");
const product_entity_1 = require("./modules/product/entities/product.entity");
const product_module_1 = require("./modules/product/product.module");
const order_module_1 = require("./modules/order/order.module");
const order_entity_1 = require("./modules/order/entities/order.entity");
const order_items_entity_1 = require("./modules/order/order-items/entities/order-items.entity");
const reports_module_1 = require("./modules/reports/reports.module");
const auth_module_1 = require("../auth-lib/src/auth.module");
const core_1 = require("@nestjs/core");
const profile_guard_1 = require("./guards/profile.guard");
const jwt_strategy_1 = require("../auth-lib/src/strategy/jwt.strategy");
const auth_guard_1 = require("../auth-lib/src/guard/auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                envFilePath: `.env.${process.env.NODE_ENV}`,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt((_a = process.env.DATABASE_PORT) !== null && _a !== void 0 ? _a : '25060', 10),
                username: process.env.DATABASE_USER,
                database: process.env.DATABASE_NAME,
                entities: [
                    user_entity_1.UserEntity,
                    customer_entity_1.CustomerEntity,
                    product_entity_1.ProductEntity,
                    order_entity_1.OrderEntity,
                    order_items_entity_1.OrderItemsEntity,
                ],
                synchronize: false,
                logging: false,
            }),
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
            user_module_1.UsersModule,
            database_module_1.DatabaseModule,
            customer_module_1.CustomerModule,
            product_module_1.ProductModule,
            order_module_1.OrderModule,
            reports_module_1.ReportsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            jwt_strategy_1.JwtStrategy,
            {
                provide: core_1.APP_GUARD,
                useClass: auth_guard_1.AuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: profile_guard_1.ProfileGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map