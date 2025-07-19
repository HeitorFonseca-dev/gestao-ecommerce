import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  type FindManyOptions,
  type FindOptionsWhere,
  ILike,
  IsNull,
  Repository,
} from 'typeorm';
import { HashToolsUtils } from '../../../utils/hashTools.util';
import { QueryParamsDTO } from '../dto/queryParams.dto';
import { CreateUserDto, UpdateUserDTO } from '../dto/user.dto';
import { UserEntity } from '../entities/user.entity';
import { PaginationDTO } from '../../../utils/pagination.dto';
import { TokenJWTPayload } from '../../../../auth-lib/src/dto/token-jwt-payload.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,

    private _datasource: DataSource,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    // metaToken: TokenJWTPayload,
  ): Promise<UserEntity> {
    const { password, is_active, phone, ...rest } = createUserDto;

    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userHasExists = await queryRunner.manager.findOne(UserEntity, {
        where: { email: createUserDto.email, deleted_at: IsNull() },
      });

      if (userHasExists) {
        throw new BadRequestException(
          'Usuário ja cadastrado com o email informado',
        );
      }

      const user = this._userRepository.create({
        password: password ? await HashToolsUtils.termToHash(password) : null,
        // created_by: metaToken.name,
        phone: phone.replace(/\D/g, ''),
        ...rest,
      });

      const savedUser = await queryRunner.manager.save(UserEntity, user);

      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('Erro ao criar usuário: ' + (error.message || error));
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this._userRepository.findOne({
      where: {
        id: id,
        deleted_at: IsNull(),
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findAll(metaPagination: PaginationDTO, queryParams?: QueryParamsDTO) {
    const whereConditions: FindOptionsWhere<UserEntity> = {};

    if (queryParams?.is_active !== undefined && queryParams.is_active !== '') {
      whereConditions.is_active =
        String(queryParams.is_active).toLowerCase() === 'true';
    }

    if (queryParams?.name !== undefined && queryParams.name !== '') {
      whereConditions.name = ILike(`%${queryParams.name}%`);
    }

    if (queryParams?.email !== undefined && queryParams.email !== '') {
      whereConditions.email = ILike(`%${queryParams.email}%`);
    }

    if (queryParams?.phone !== undefined && queryParams.phone !== '') {
      whereConditions.phone = ILike(`%${queryParams.phone}%`);
    }

    const paramsQuery: FindManyOptions<UserEntity> = {
      where: {
        ...whereConditions,
        deleted_at: IsNull(),
      },
      order: {
        [metaPagination.order || 'name']: metaPagination.sort || 'ASC',
      },
      skip: (metaPagination.page - 1) * metaPagination.take,
      take: metaPagination.take,
    };

    const data = await this._userRepository.find(paramsQuery);

    const totalRecords = await this._userRepository.count({
      where: {
        ...whereConditions,
        deleted_at: IsNull(),
      },
    });

    metaPagination.totalRecords = totalRecords;
    metaPagination.skip = (metaPagination.page - 1) * metaPagination.take;

    const metaPage = new PaginationDTO(metaPagination);

    return {
      data,
      metaPagination: metaPage,
    };
  }

  async update(id: number, dto: UpdateUserDTO): Promise<UserEntity> {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this._userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      Object.assign(user, dto);

      if (dto.password) {
        user.password = await HashToolsUtils.termToHash(dto.password);
      }

      await this._userRepository.save(user);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Erro ao atualizar usuário: ' + (error.message || error));
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number): Promise<UserEntity> {
    const user = await this._userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this._userRepository.update(id, {
      is_active: false,
      deleted_at: new Date(),
    });

    return user;
  }
}
