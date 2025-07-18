import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { LessThanOrEqual, Repository } from 'typeorm';
import { changePasswordDTO } from '../dto/recovery-acess.dto';
import { RecoveryPasswordDto } from '../dto/recovery-password.dto';
import { RefreshTokenDTO } from '../dto/refresh-token.dto';
import { TokenJWTPayload } from '../dto/token-jwt-payload.dto';
import { AuthRefreshTokenEntity } from '../entities/auth-refresh-token-entity.entity';
import { RecoveryAcessEntity } from '../entities/recovery-acess-entity.entity';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { TokenJWT } from '../tokenJWT.dto';
import { CredentialsDTO } from '../auth.dto';
import { UserEntity } from '../../../src/modules/user/entities/user.entity';
interface Identifier {
  id: string;
}
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RecoveryAcessEntity)
    private readonly _recoveryAcessRepository: Repository<RecoveryAcessEntity>,
    @InjectRepository(AuthRefreshTokenEntity)
    private readonly _authRefreshTokenRepository: Repository<AuthRefreshTokenEntity>,
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private _configService: ConfigService,
    private jwtService: JwtStrategy,
  ) {}

  async signIn(credenciaisDTO: CredentialsDTO): Promise<TokenJWT> {
    const validatedUser = await this.checkCredentials(credenciaisDTO);

    let token: TokenJWT = { accessToken: '', refreshToken: '' };
    if (validatedUser) {
      token = await this.generateToken(validatedUser);

      await this.saveRecoveryToken(token.refreshToken as string, validatedUser);
    }

    return instanceToPlain(token);
  }

  async checkCredentials(credentialDTO: CredentialsDTO): Promise<UserEntity> {
    const user = await this._userRepository.findOne({
      where: { email: credentialDTO.email, is_active: true },
    });

    if (
      !user ||
      !(await HashToolsUtils.compareHash(credentialDTO.password, user.password))
    ) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }

  async generateToken(validatedUser: UserEntity): Promise<TokenJWT> {
    const validationData = new Date();
    validationData.setHours(validationData.getHours() + 1);

    const user = await this._userRepository.findOne({
      where: { id: validatedUser.id },
      relations: [
        'user_stores',
        'user_stores.role',
        'user_stores.store',
        'users_constructors.role',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const role = user.user_stores.map(userStore => userStore.role);

    const roleConstructor = user.users_constructors.map(
      userStore => userStore.role,
    );

    const roles =
      role.length > 0
        ? role
        : roleConstructor.length > 0
          ? roleConstructor
          : [RolesEnum.SADMIN];

    const store = Array.from(
      new Map(
        user.user_stores.map(userStore => [
          userStore.store.id,
          userStore.store,
        ]),
      ).values(),
    );

    const payloadData: TokenJWTPayload = {
      sub: user.id,
      name: validatedUser.full_name,
      iss: this._configService.get<string>('core.apiNomeCore'),
      aud: this._configService.get<string>('core.clientAppUrl'),
      roles: roles as RolesEntity[],
      store: store,
      iat: Math.floor(Date.now() / 1000),
    };

    const token: TokenJWT = {
      accessToken: (
        await this.jwtService.generateJwtToken(payloadData)
      ).toString(),
      refreshToken: (
        await this.insertUpdatedToken(validationData, validatedUser)
      ).toString(),
    };

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async saveRecoveryToken(
    refreshToken: string,
    user: UserEntity,
  ): Promise<void> {
    const recoveryAccess = new RecoveryAcessEntity();
    recoveryAccess.token = refreshToken;
    recoveryAccess.user = user;
    recoveryAccess.status = false;
    recoveryAccess.expire_in = new Date(Date.now() + 3600000);

    await this._recoveryAcessRepository.save(recoveryAccess);
  }

  async insertUpdatedToken(expireIn: Date, user: UserEntity): Promise<string> {
    const validationData = new Date();
    validationData.setHours(validationData.getHours() + 24);

    const refreshToken = new AuthRefreshTokenEntity();
    refreshToken.expire_in = validationData;
    refreshToken.user = user;

    const result = await this._authRefreshTokenRepository.insert(refreshToken);

    if (!result) {
      throw new Error('Erro ao inserir token de atualização');
    }

    // Extraindo o ID gerado de forma segura
    const identifiers = result.identifiers as Identifier[];

    const insertedId = identifiers.find(item => item.id)?.id;

    if (!insertedId) {
      throw new Error('Erro ao inserir token de atualização: ID não retornado');
    }

    return insertedId;
  }

  async verifyToken(token: string) {
    return await this.jwtService.verifyToken(token);
  }

  async recoveryPassword(
    recoveryPasswordDto: RecoveryPasswordDto,
  ): Promise<boolean> {
    const user = await this._userRepository.findOne({
      where: { email: recoveryPasswordDto.email, is_active: true },
    });

    if (!user || !user.id) {
      throw new HttpException(
        'E-mail inexistente ou inativo',
        HttpStatus.NOT_FOUND,
      );
    }

    const validationDate = new Date();
    validationDate.setHours(validationDate.getHours() + 12);

    const tenativeRecovery: RecoveryAcessEntity = {
      status: false,
      user: user,
      token: (await HashToolsUtils.generateHash()).toString(),
      expire_in: validationDate,
    };

    try {
      const data = await this._recoveryAcessRepository.save(tenativeRecovery);

      if (!data || !data.id) {
        throw new Error('Erro ao salvar tentativa de recuperação');
      }

      const emailSent: boolean = await this._sendEmailService.sendMail({
        to: user.email,
        subject: 'Recuperação de senha',
        template: 'send-email-recovery-password',
        context: {
          name: user.full_name,
          token: tenativeRecovery.token,
        },
      });

      return emailSent;
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao enviar e-mail');
    }
  }

  async checkUpdateToken(refreshTokenDTO: RefreshTokenDTO): Promise<boolean> {
    const refreshToken = await this._authRefreshTokenRepository.findOne({
      where: { id: refreshTokenDTO.token },
    });
    if (refreshToken && new Date() <= refreshToken.expire_in) {
      // Remove o token utilizado para o refresh
      await this._authRefreshTokenRepository.remove(refreshToken);
      return true;
    } else {
      // Remove refresh tokens abandonados
      await this._authRefreshTokenRepository.delete({
        user: refreshTokenDTO.user,
        expire_in: LessThanOrEqual(new Date()),
      });
      return false;
    }
  }

  async refreshToken(refreshTokenDTO: RefreshTokenDTO): Promise<TokenJWT> {
    let token: TokenJWT = { accessToken: null, refreshToken: null };

    if (await this.checkUpdateToken(refreshTokenDTO)) {
      const user = await this._userRepository.findOne({
        where: { id: refreshTokenDTO.user.id },
      });

      if (!user) {
        throw new UnauthorizedException(
          'Usuário não encontrado para atualizar o token.',
        );
      }

      token = await this.generateToken(user);
    }
    return token;
  }

  async validateToken(token: string): Promise<boolean> {
    const tokenActivation = await this._activeUserRepository.findOne({
      where: {
        token_activation: token,
        password_change: false,
      },
    });

    if (!tokenActivation) {
      throw new Error('Token inválido ou já foi utilizado');
    }

    if (tokenActivation.expire_in < new Date()) {
      throw new Error('Token expirado');
    }

    return true;
  }

  async recoveryPasswordChange(
    changePasswordDTO: changePasswordDTO,
    token: string,
  ): Promise<UserEntity | null> {
    const tenativeRecovery = await this._recoveryAcessRepository.findOne({
      where: { token: token, status: false },
    });

    if (tenativeRecovery && tenativeRecovery.expire_in >= new Date()) {
      const hashedPassword = await HashToolsUtils.termToHash(
        changePasswordDTO.password,
      );

      const userUpdated = await this._userRepository.update(
        { id: tenativeRecovery.user.id },
        { password: hashedPassword },
      );

      if (userUpdated) {
        await this._recoveryAcessRepository.delete({ token: token });

        const user = await this._userRepository.findOne({
          select: {
            id: true,
            full_name: true,
            email: true,
            password: false,
          },
          where: { id: tenativeRecovery.user.id },
        });

        if (!user) {
          throw new Error('Usuário não encontrado após atualização de senha.');
        }

        tenativeRecovery.status = true;
        await this._recoveryAcessRepository.save(tenativeRecovery);

        return user;
      }
    }

    return null;
  }

  async reSendEmailEmployeePassword(
    email: string,
    storeId: string,
  ): Promise<boolean> {
    const user = await this._userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new HttpException(
        'E-mail inexistente ou inativo',
        HttpStatus.NOT_FOUND,
      );
    }

    const store = await this._storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new HttpException('Loja inexistente', HttpStatus.NOT_FOUND);
    }

    const userStore = await this._userStoreRepository.findOne({
      where: {
        user: { id: user.id },
        store: { id: store.id },
      },
    });

    if (!userStore) {
      throw new HttpException(
        'Usuário não existe na loja informada',
        HttpStatus.NOT_FOUND,
      );
    }

    const hasActiveToken = await this._activeUserRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });

    if (hasActiveToken) {
      await this._activeUserRepository.remove(hasActiveToken);
    }

    const token = await this._activeUserRepository.save({
      token_activation: (await HashToolsUtils.generateHash()).toString(),
      status: false,
      expire_in: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created_at: new Date(),
      updated_at: new Date(),
      user: user,
    });

    await this._sendEmailService.sendMail({
      to: user.email,
      subject: 'Cadastro de usuário',
      template: 'send-email-when-register-employee',
      context: {
        name: user.full_name,
        token: token.token_activation,
        env: process.env.EMAIL_ENV,
      },
    });

    return true;
  }

  async recoveryPasswordValidate(token: string): Promise<boolean> {
    const tokenActivation = await this._recoveryAcessRepository.findOne({
      where: {
        token: token,
      },
    });

    if (!tokenActivation) {
      throw new Error('Token inválido ou já foi utilizado');
    }

    if (tokenActivation.expire_in < new Date()) {
      throw new Error('Token expirado');
    }

    return true;
  }
}
