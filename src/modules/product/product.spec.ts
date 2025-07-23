import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { TokenJWTPayload } from '../../../auth-lib/src/dto/token-jwt-payload.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from './services/product.service';
import { CreateProductDto } from './dto/product.dto';

describe('ProductsService - create', () => {
  let service: ProductService;
  let productRepository: Partial<Repository<ProductEntity>>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    productRepository = {
      create: jest.fn(),
    };

    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    } as unknown as QueryRunner;

    const dataSourceMock = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as unknown as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: productRepository,
        },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
  });

  it('should create and return a new product', async () => {
    const dto: CreateProductDto = {
      product_name: 'Produto Teste',
      description: 'Descrição do produto',
      price: 100,
      stock_quantity: 10,
    };

    const metaToken: TokenJWTPayload = {
      sub: 1,
      name: 'Test User',
    };

    const createdProduct = {
      ...dto,
      created_by: metaToken.name,
    };

    (productRepository.create as jest.Mock).mockReturnValue(createdProduct);
    (queryRunner.manager.save as jest.Mock).mockResolvedValue(createdProduct);

    const result = await service.create(dto, metaToken);

    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(productRepository.create).toHaveBeenCalledWith(dto);
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      ProductEntity,
      createdProduct,
    );
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(result).toEqual(createdProduct);
  });

  it('should rollback transaction and throw error if save fails', async () => {
    const dto: CreateProductDto = {
      product_name: 'Produto Teste',
      description: 'Descrição do produto',
      price: 100,
      stock_quantity: 10,
    };

    const metaToken: TokenJWTPayload = {
      sub: 1,
      name: 'Test User',
    };

    const createdProduct = {
      ...dto,
      created_by: metaToken.name,
    };

    (productRepository.create as jest.Mock).mockReturnValue(createdProduct);
    (queryRunner.manager.save as jest.Mock).mockRejectedValue(
      new Error('Save failed'),
    );

    await expect(service.create(dto, metaToken)).rejects.toThrow('Save failed');
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).not.toHaveBeenCalled(); // opcional: você pode testar release se quiser
  });
});
