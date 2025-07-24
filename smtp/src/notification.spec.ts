import { SmtpService } from './smtp.service';
import { NotificationService } from '../../../src/modules/sendEmail/services/testeEmail.service';

describe('NotificacaoService', () => {
  let notificationService: NotificationService;
  let smtpService: SmtpService;

  const sendMailMock = jest.fn();

  beforeEach(() => {
    smtpService = {
      sendMail: sendMailMock,
    } as unknown as SmtpService;

    notificationService = new NotificationService(smtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar smtpService.sendMail com os parâmetros corretos', async () => {
    await notificationService.enviarEmailDeTeste();

    expect(sendMailMock).toHaveBeenCalledWith({
      to: 'heitor.ramos@sunter.com.br',
      subject: 'Teste de envio',
      template: 'send-email-to-test',
      context: {
        name: 'Fulano',
        protocolo: '123456',
      },
    });

    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});
