"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const name = process.argv[2];
if (!name) {
    console.error('⚠️  Você precisa fornecer o nome da migration.');
    process.exit(1);
}
const path = `src/database/migrations`;
const cmd = `npx typeorm migration:create ${path}/${name}`;
try {
    (0, child_process_1.execSync)(cmd, { stdio: 'inherit' });
}
catch (error) {
    console.error(' Erro ao criar a migration:', error);
    process.exit(1);
}
//# sourceMappingURL=scriptMigration.js.map