import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  IsNull,
  Repository,
} from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { NotFoundException } from '@nestjs/common';
import { PaginationDTO } from '../../../utils/pagination.dto';
import { QueryParamsDTO } from '../dto/queryParams.dto';
import { TokenJWTPayload } from '../../../../auth-lib/src/dto/token-jwt-payload.dto';

export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly _productRepository: Repository<ProductEntity>,

    private _datasource: DataSource,
  ) {}

  async create(
    dto: CreateProductDto,
    metaToken: TokenJWTPayload,
  ): Promise<ProductEntity> {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = this._productRepository.create(dto);
      product.created_by = metaToken.name;
      await queryRunner.manager.save(ProductEntity, product);

      await queryRunner.commitTransaction();

      return product;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async findOne(id: number): Promise<ProductEntity> {
    const customer = await this._productRepository.findOne({
      where: {
        id: id,
        deleted_at: IsNull(),
      },
    });

    if (!customer) {
      throw new NotFoundException('Produto não encontrado');
    }

    return customer;
  }

  async findAll(metaPagination: PaginationDTO, queryParams?: QueryParamsDTO) {
    const whereConditions: FindOptionsWhere<ProductEntity> = {};

    if (
      queryParams?.productName !== undefined &&
      queryParams.productName !== ''
    ) {
      whereConditions.product_name = ILike(`%${queryParams.productName}%`);
    }

    if (
      queryParams?.description !== undefined &&
      queryParams.description !== ''
    ) {
      whereConditions.description = ILike(`%${queryParams.description}%`);
    }

    const paramsQuery: FindManyOptions<ProductEntity> = {
      where: {
        ...whereConditions,
        deleted_at: IsNull(),
      },
      order: {
        [metaPagination.order || 'product_name']: metaPagination.sort || 'ASC',
      },
      skip: (metaPagination.page - 1) * metaPagination.take,
      take: metaPagination.take,
    };

    const data = await this._productRepository.find(paramsQuery);

    const totalRecords = await this._productRepository.count({
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
    dto: UpdateProductDto,
    metaToken: TokenJWTPayload,
  ): Promise<ProductEntity> {
    const queryRunner = this._datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this._productRepository.findOne({ where: { id } });

      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      product.updated_by = metaToken.name;
      Object.assign(product, dto);

      await this._productRepository.save(product);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Erro ao atualizar produto: ' + (error.message || error));
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number, metaToken: TokenJWTPayload): Promise<ProductEntity> {
    const product = await this._productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    await this._productRepository.update(id, {
      deleted_at: new Date(),
      deleted_by: metaToken.name,
    });

    return product;
  }
}
