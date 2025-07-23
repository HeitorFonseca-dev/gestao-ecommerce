export declare class ValidateCNPJUtils {
    private static _regexCNPJ;
    static validateCNPJ(cnpj?: string | number | number[]): boolean;
    static formatCNPJ(value?: string | number | number[]): string;
    private static validCalc;
    static matchNumbers(value?: string | number | number[]): number[];
}
