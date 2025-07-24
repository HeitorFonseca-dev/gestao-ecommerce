import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import * as hbs from 'handlebars';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { SendMailOptions } from './interfaces/send-mail-options.interface';

@Injectable()
export class SmtpService {
  private apiInstance: SibApiV3Sdk.EmailCampaignsApi;

  constructor() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.SMTP_API_KEY;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      let htmlContent = options.html || '';

      if (options.template) {
        const templatePath = join(process.cwd(), 'templates', `${options.template}.hbs`);

        if (!existsSync(templatePath)) {
          throw new Error(`Template não encontrado no caminho: ${templatePath}`);
        }

        const source = readFileSync(templatePath, 'utf8');
        const compiled = hbs.compile(source);
        htmlContent = compiled(options.context || {});
      }

      const email = new SibApiV3Sdk.SendSmtpEmail();
      email.subject = options.subject;
      email.htmlContent = htmlContent;
      email.sender = {
        name: 'Cotar e construir',
        email: options.from || process.env.SMTP_USER,
      };
      email.to = Array.isArray(options.to)
        ? options.to.map((email) => ({ email }))
        : [{ email: options.to }];

      await this.apiInstance.sendTransacEmail(email);
      return true;
    } catch (error) {
      console.error('Erro ao enviar e-mail transacional:', error);
      throw new Error(`Erro ao enviar e-mail transacional: ${error.message}`);
    }
  }
}
