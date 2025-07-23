import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  IsNull,
  Repository,
} from 'typeorm';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { QueryParamsDTO } from '../dto/queryParams.dto';
import { PaginationDTO } from '../../../utils/pagination.dto';
import { NotFoundException } from '@nestjs/common';
import { HashToolsUtils } from '../../../utils/hashTools.util';
import { TokenJWTPayload } from '../../../../auth-lib/src/dto/token-jwt-payload.dto';

export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly _customerRepository: Repository<CustomerEntity>,

    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,

    private _datasource: DataSource,
  ) {}

  async create(dto: CreateCustomerDto) {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this._userRepository.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new Error('Usuário nao encontrado');
      }

      const customer = this._customerRepository.create({
        ...dto,
        user,
        created_by: user.name,
      });

      const savedCustomer = await queryRunner.manager.save(
        CustomerEntity,
        customer,
      );
      await queryRunner.commitTransaction();
      return savedCustomer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async findOne(id: number): Promise<CustomerEntity> {
    const customer = await this._customerRepository.findOne({
      where: {
        id: id,
        deleted_at: IsNull(),
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
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

    if (queryParams?.phone !== undefined && queryParams.phone !== '') {
      whereConditions.phone = ILike(`%${queryParams.phone}%`);
    }

    const paramsQuery: FindManyOptions<CustomerEntity> = {
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

    const data = await this._customerRepository.find(paramsQuery);

    const totalRecords = await this._customerRepository.count({
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

  async update(
    id: number,
    dto: UpdateCustomerDto,
    metaToken: TokenJWTPayload,
  ): Promise<CustomerEntity> {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this._userRepository.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
      const customer = await this._customerRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!customer) {
        throw new NotFoundException('Cliente nao encontrado');
      }

      customer.updated_by = metaToken.name;

      Object.assign(customer, dto);

      if (dto.password) {
        user.password = await HashToolsUtils.termToHash(dto.password);
      }

      await this._userRepository.save(user);

      await queryRunner.manager.save(CustomerEntity, customer);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Erro ao atualizar cliente: ' + (error.message || error));
    }
  }

  async delete(
    id: number,
    metaToken: TokenJWTPayload,
  ): Promise<CustomerEntity> {
    const customer = await this._customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    await this._customerRepository.update(id, {
      deleted_at: new Date(),
      deleted_by: metaToken.name,
    });

    return customer;
  }
}
