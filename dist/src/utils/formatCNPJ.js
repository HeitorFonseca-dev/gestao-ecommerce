"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCNPJUtils = void 0;
class ValidateCNPJUtils {
    static validateCNPJ(cnpj = '') {
        if (!cnpj) {
            return false;
        }
        const isString = typeof cnpj === 'string';
        const validTypes = isString || Number.isInteger(cnpj) || Array.isArray(cnpj);
        if (!validTypes) {
            return false;
        }
        if (isString) {
            const digitsOnly = /^\d{14}$/.test(cnpj);
            const validFormat = ValidateCNPJUtils._regexCNPJ.test(cnpj);
            const isValid = digitsOnly || validFormat;
            if (!isValid) {
                return false;
            }
            const numbers = this.matchNumbers(cnpj);
            if (numbers.length !== 14)
                return false;
            const items = [...new Set(numbers)];
            if (items.length === 1)
                return false;
            const digits = numbers.slice(12);
            const digit0 = this.validCalc(12, numbers);
            if (digit0 !== digits[0])
                return false;
            const digit1 = this.validCalc(13, numbers);
            return digit1 === digits[1];
        }
        return true;
    }
    static formatCNPJ(value = '') {
        const valid = this.validateCNPJ(value);
        if (!valid)
            return '';
        const numbers = this.matchNumbers(value);
        const text = numbers.join('');
        const format = text.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        return format;
    }
    static validCalc(x, numbers) {
        const slice = numbers.slice(0, x);
        let factor = x - 7;
        let sum = 0;
        for (let i = x; i >= 1; i--) {
            const n = slice[x - i];
            sum += n * factor--;
            if (factor < 2)
                factor = 9;
        }
        const result = 11 - (sum % 11);
        return result > 9 ? 0 : result;
    }
    static matchNumbers(value = '') {
        const match = value.toString().match(/\d/g);
        return Array.isArray(match) ? match.map(Number) : [];
    }
}
exports.ValidateCNPJUtils = ValidateCNPJUtils;
ValidateCNPJUtils._regexCNPJ = /^\d{2}.\d{3}.\d{3}\/\d{4}-\d{2}$/;
//# sourceMappingURL=formatCNPJ.js.map