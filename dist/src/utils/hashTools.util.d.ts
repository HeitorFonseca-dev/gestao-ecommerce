export declare class HashToolsUtils {
    static generateSha256FromTerm(term: string): string;
    static termToHash(term: string): Promise<string>;
    static compareHash(term: string, termTwo: string | null): Promise<boolean>;
    static encrypt(text: string): string;
    static decrypt(ciphertext: string): string;
    static generateHash(): Promise<string>;
}
