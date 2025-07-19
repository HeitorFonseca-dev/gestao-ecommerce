import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './controller/auth.controller';

import { AuthRefreshTokenEntity } from './entities/auth-refresh-token-entity.entity';
import { RecoveryAcessEntity } from './entities/recovery-acess-entity.entity';
import { AuthGuard } from './guard/auth.guard';
import { CombinedAuthRolesGuard } from './guard/combinatedAuthRole.guard';
import { SendEmailService } from './services/send-email.service';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { DatabaseModule } from '../../src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: 'onceuponatimeitwasmidnight',
      signOptions: {
        expiresIn: '1h', // equivalente a 3600 segundos
      },
    }),
    TypeOrmModule.forFeature([
      // UserEntity,
      AuthRefreshTokenEntity,
      RecoveryAcessEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: CombinedAuthRolesGuard,
    },
  ],
  exports: [AuthService], // exporta caso outros módulos precisem usar
})
export class AuthModule {}
