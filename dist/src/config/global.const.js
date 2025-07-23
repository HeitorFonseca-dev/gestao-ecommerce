"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profiles = exports.ROLES_KEY = exports.Public = exports.IS_ROUTE_PUBLIC = void 0;
const common_1 = require("@nestjs/common");
exports.IS_ROUTE_PUBLIC = 'isPublic';
const Public = () => (0, common_1.SetMetadata)('IS_ROUTE_PUBLIC', true);
exports.Public = Public;
exports.ROLES_KEY = 'roles';
const Profiles = (...perfis) => (0, common_1.SetMetadata)(exports.ROLES_KEY, perfis);
exports.Profiles = Profiles;
//# sourceMappingURL=global.const.js.map