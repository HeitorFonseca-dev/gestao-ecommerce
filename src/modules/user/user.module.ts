import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controller/users.controller';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { DatabaseModule } from '../../database/database.module';
import { JwtStrategy } from '../../../auth-lib/src/strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
