import * as bcrypt from 'bcryptjs';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'sua-chave-secreta-muito-segura';

export class HashToolsUtils {
  public static generateSha256FromTerm(term: string): string {
    const hash: CryptoJS.lib.WordArray = CryptoJS.SHA256(term); // tipagem explícita
    return hash.toString(CryptoJS.enc.Hex);
  }

  public static async termToHash(term: string): Promise<string> {
    return bcrypt.hash(term, 10);
  }

  public static async compareHash(
    term: string,
    termTwo: string | null,
  ): Promise<boolean> {
    if (termTwo === null) {
      return false;
    }

    return bcrypt.compare(term, termTwo);
  }

  public static encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  }

  public static decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public static async generateHash(): Promise<string> {
    return await CryptoJS.SHA256(
      `${Math.random.toString() + new Date().valueOf().toString()}`,
    ).toString();
  }
}
