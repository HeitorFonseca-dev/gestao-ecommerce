"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
const corsConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    const client_app_url = process.env.CLIENT_APP_URL || 'app.cotareconstruir.com';
    const corsOptions = {
        development: {
            origin: '*',
            methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTION',
            allowedHeaders: ['Content-Type', 'Authorization', 'storeid', 'storeId'],
        },
        production: {
            origin: [client_app_url],
            methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTION',
            allowedHeaders: ['Content-Type', 'Authorization', 'storeid', 'storeId'],
        },
    };
    return corsOptions[env] || corsOptions.development;
};
exports.corsConfig = corsConfig;
//# sourceMappingURL=cors.config.js.map