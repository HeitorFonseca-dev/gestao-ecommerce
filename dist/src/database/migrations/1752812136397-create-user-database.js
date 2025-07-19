"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDatabase1752812136397 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserDatabase1752812136397 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'user',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '30',
                    isNullable: false,
                },
                {
                    name: 'phone',
                    type: 'varchar',
                    length: '20',
                    isNullable: false,
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    isNullable: false,
                    default: true,
                },
                {
                    name: 'role',
                    type: 'varchar',
                    length: '30',
                    isNullable: false,
                },
                {
                    name: 'password',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'deleted_at',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'deleted_by',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'created_by',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'now()',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_by',
                    type: 'varchar',
                    isNullable: true,
                },
            ],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('user');
    }
}
exports.CreateUserDatabase1752812136397 = CreateUserDatabase1752812136397;
//# sourceMappingURL=1752812136397-create-user-database.js.map