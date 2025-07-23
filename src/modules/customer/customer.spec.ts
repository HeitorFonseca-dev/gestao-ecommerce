import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { UserEntity } from '../user/entities/user.entity';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { CustomerService } from './services/customer.service';
import { CreateCustomerDto } from './dto/customer.dto';
import { TokenJWTPayload } from '../../../auth-lib/src/dto/token-jwt-payload.dto';

describe('CustomerService', () => {
  let service: CustomerService;
  let customerRepo: Partial<Repository<CustomerEntity>>;
  let userRepo: Partial<Repository<UserEntity>>;
  let queryRunner: Partial<QueryRunner>;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      manager: {
        save: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as Partial<QueryRunner>;

    const dataSourceMock: Partial<DataSource> = {
      createQueryRunner: () => queryRunner as QueryRunner,
    };

    customerRepo = {
      create: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: getRepositoryToken(CustomerEntity), useValue: customerRepo },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should create a customer successfully', async () => {
    const dto: CreateCustomerDto = { userId: 1, name: 'John' } as any;
    const token: TokenJWTPayload = {
      sub: 1,
      name: 'admin',
      iss: 'core',
      aud: 'app',
      iat: 1,
    };

    const fakeUser = { id: 1 };
    const fakeCustomer = { ...dto, user: fakeUser, created_by: 'admin' };
    const savedCustomer = { id: 1, ...fakeCustomer };

    userRepo.findOne = jest.fn().mockResolvedValue(fakeUser);
    customerRepo.create = jest.fn().mockReturnValue(fakeCustomer);
    queryRunner.manager!.save = jest.fn().mockResolvedValue(savedCustomer);

    const result = await service.create(dto, token);
    expect(result).toEqual(savedCustomer);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('should throw if user not found', async () => {
    const dto: CreateCustomerDto = { userId: 999, name: 'Unknown' } as any;
    const token: TokenJWTPayload = {
      sub: 1,
      name: 'admin',
      iss: 'core',
      aud: 'app',
      iat: 1,
    };

    userRepo.findOne = jest.fn().mockResolvedValue(null);

    await expect(service.create(dto, token)).rejects.toThrow(
      'Usuário nao encontrado',
    );
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('should rollback transaction on error', async () => {
    const dto: CreateCustomerDto = { userId: 1, name: 'Erro' } as any;
    const token: TokenJWTPayload = {
      sub: 1,
      name: 'admin',
      iss: 'core',
      aud: 'app',
      iat: 1,
    };

    const fakeUser = { id: 1 };

    userRepo.findOne = jest.fn().mockResolvedValue(fakeUser);
    customerRepo.create = jest.fn().mockReturnValue({});
    queryRunner.manager!.save = jest
      .fn()
      .mockRejectedValue(new Error('DB error'));

    await expect(service.create(dto, token)).rejects.toThrow('DB error');
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
