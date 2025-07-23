import { Test } from '@nestjs/testing';
import { OrderService } from './services/order.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { TokenJWTPayload } from '../../../auth-lib/src/dto/token-jwt-payload.dto';
import { OrderStatus } from './enum/order-status.enum';
import { OrderEntity } from './entities/order.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OrderService - create', () => {
  let service: OrderService;
  let dataSourceMock: Partial<DataSource>;
  let queryRunner: Partial<QueryRunner>;
  let customerRepo: Partial<Repository<OrderEntity>>;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    } as unknown as Partial<QueryRunner>;

    dataSourceMock = {
      createQueryRunner: () => queryRunner as QueryRunner,
    };

    customerRepo = {
      create: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(OrderEntity), useValue: customerRepo },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should create an order and return it with full relations', async () => {
    const dto = {
      customer_id: 1,
      total_amount: 300,
      products: [
        { product_id: 10, quantity: 2 },
        { product_id: 20, quantity: 1 },
      ],
      status: OrderStatus.Received,
    };

    const metaToken = { name: 'admin' } as TokenJWTPayload;

    const fakeCustomer = { id: 1 };
    const fakeProduct1 = { id: 10, price: 100 };
    const fakeProduct2 = { id: 20, price: 200 };
    const fakeOrder = { id: 99, total_amount: 0 };
    const fakeOrderItems = [{ subtotal: 200 }, { subtotal: 200 }];
    const fullOrder = { id: 99, orderItems: fakeOrderItems };

    (queryRunner.manager!.findOne as jest.Mock)
      .mockResolvedValueOnce(fakeCustomer) // find customer
      .mockResolvedValueOnce(fakeProduct1) // find product 1
      .mockResolvedValueOnce(fakeProduct2) // find product 2
      .mockResolvedValueOnce(fullOrder); // find full order with relations

    (queryRunner.manager!.create as jest.Mock)
      .mockReturnValueOnce(fakeOrder) // create order
      .mockReturnValueOnce(fakeOrderItems[0]) // order item 1
      .mockReturnValueOnce(fakeOrderItems[1]); // order item 2

    (queryRunner.manager!.save as jest.Mock)
      .mockResolvedValueOnce(fakeOrder) // save order
      .mockResolvedValueOnce(fakeOrderItems) // save items
      .mockResolvedValueOnce({ ...fakeOrder, total_amount: 400 }); // save total

    const result = await service.create(dto, metaToken);

    expect(result).toEqual(fullOrder);
    expect(queryRunner.startTransaction).toBeCalled();
    expect(queryRunner.commitTransaction).toBeCalled();
    expect(queryRunner.manager!.save).toHaveBeenCalledTimes(3);
    expect(queryRunner.release).toBeCalled();
  });
});
