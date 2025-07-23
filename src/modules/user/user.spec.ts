import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, IsNull, QueryRunner, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/user.dto';
import { Profiles } from './enum/profiles.enum';
import { HashToolsUtils } from '../../utils/hashTools.util';
import { TokenJWTPayload } from '../../../auth-lib/src/dto/token-jwt-payload.dto';
import { plainToInstance } from 'class-transformer';
import { getRepositoryToken } from '@nestjs/typeorm';

// jest.mock('src/shared/utils/hash-tools');

describe('UserService - create', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let userRepo: Partial<Repository<UserEntity>>;

  beforeEach(async () => {
    userRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
      isTransactionActive: true,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    dataSource = module.get(DataSource);
    queryRunner = dataSource.createQueryRunner() as any;
  });

  it('should create and return a new user', async () => {
    const dto: CreateUserDto = {
      name: 'João da Silva',
      email: 'joao@email.com',
      password: 'senha123',
      phone: '(11) 91234-5678',
      is_active: true,
      role: Profiles.Admin,
    };

    const metaToken: TokenJWTPayload = {
      sub: 1,
      name: 'Admin Tester',
    };

    // mocks
    (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(null);
    jest
      .spyOn(HashToolsUtils, 'termToHash')
      .mockResolvedValue('hashedPassword');

    const userEntityMock = plainToInstance(UserEntity, {
      id: 'uuid',
      name: dto.name,
      email: dto.email,
      phone: '11912345678',
      is_active: dto.is_active,
      role: dto.role,
      created_by: metaToken.name,
      deleted_at: null,
      deleted_by: null,
      customers: [],
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: null,
    });

    (queryRunner.manager.save as jest.Mock).mockResolvedValue(userEntityMock);

    const result = await service.create(dto, metaToken);

    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.manager.findOne).toHaveBeenCalledWith(
      UserEntity,
      expect.objectContaining({
        where: {
          email: dto.email,
          deleted_at: IsNull(),
        },
      }),
    );
    expect(HashToolsUtils.termToHash).toHaveBeenCalledWith(dto.password);
    expect(userRepository.create).toHaveBeenCalledWith({
      ...dto,
      password: 'hashedPassword',
      phone: '11912345678',
      is_active: dto.is_active,
      created_by: metaToken.name,
    });
    expect(queryRunner.manager.save).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();

    expect(result).toMatchObject({
      id: 'uuid',
      name: dto.name,
      email: dto.email,
      phone: '11912345678',
      is_active: dto.is_active,
      role: dto.role,
      created_by: metaToken.name,
    });
  });

  it('should throw BadRequestException if user already exists', async () => {
    (queryRunner.manager.findOne as jest.Mock).mockResolvedValue({
      id: 'existing',
    });

    const metaToken: TokenJWTPayload = {
      sub: 1,
      name: 'Admin Tester',
    };

    const dto: CreateUserDto = {
      name: 'João da Silva',
      email: 'joao@email.com',
      password: 'senha123',
      phone: '(11) 91234-5678',
      is_active: true,
      role: Profiles.Admin,
    };

    await expect(service.create(dto, metaToken)).rejects.toThrow(
      BadRequestException,
    );

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
