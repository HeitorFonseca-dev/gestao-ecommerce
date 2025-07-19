"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashToolsUtils = void 0;
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
const SECRET_KEY = 'sua-chave-secreta-muito-segura';
class HashToolsUtils {
    static generateSha256FromTerm(term) {
        const hash = CryptoJS.SHA256(term);
        return hash.toString(CryptoJS.enc.Hex);
    }
    static async termToHash(term) {
        return bcrypt.hash(term, 10);
    }
    static async compareHash(term, termTwo) {
        if (termTwo === null) {
            return false;
        }
        return bcrypt.compare(term, termTwo);
    }
    static encrypt(text) {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    }
    static decrypt(ciphertext) {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    static async generateHash() {
        return await CryptoJS.SHA256(`${Math.random.toString() + new Date().valueOf().toString()}`).toString();
    }
}
exports.HashToolsUtils = HashToolsUtils;
//# sourceMappingURL=hashTools.util.js.map