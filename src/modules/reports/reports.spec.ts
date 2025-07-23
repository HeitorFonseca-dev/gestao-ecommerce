import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { GenerateReportsService } from './services/report-from-orders.service';

jest.mock('fs');
jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn(),
}));

describe('YourService - getReportFromOrders', () => {
  let service: GenerateReportsService;
  let queryRunner: QueryRunner;
  const mockCsvWriter = {
    writeRecords: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateReportsService,
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                find: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GenerateReportsService>(GenerateReportsService);
    queryRunner = (service as any)._dataSource.createQueryRunner();

    (createObjectCsvWriter as jest.Mock).mockReturnValue(mockCsvWriter);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
  });

  it('should generate a CSV report with aggregated sales data', async () => {
    const mockOrders = [
      {
        created_at: new Date('2025-07-01T10:00:00Z'),
        customer: { name: 'Cliente 1' },
        orderItems: [
          {
            product: { product_name: 'Produto A', price: 10 },
            quantity: 2,
            subtotal: 20,
          },
          {
            product: { product_name: 'Produto B', price: 5 },
            quantity: 1,
            subtotal: 5,
          },
        ],
      },
    ];

    queryRunner.manager.find = jest.fn().mockResolvedValue(mockOrders);

    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-31');

    const reportPath = await service.getReportFromOrders(startDate, endDate);

    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.manager.find).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(createObjectCsvWriter).toHaveBeenCalled();
    expect(mockCsvWriter.writeRecords).toHaveBeenCalledWith([
      {
        customer: 'Cliente 1',
        product: 'Produto A',
        quantity_sold: 2,
        total_sold: 20,
        sold_at: expect.any(String),
      },
      {
        customer: 'Cliente 1',
        product: 'Produto B',
        quantity_sold: 1,
        total_sold: 5,
        sold_at: expect.any(String),
      },
    ]);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(reportPath).toMatch(/sales-report-\d+\.csv$/);
  });

  it('should rollback and throw error if no orders are found', async () => {
    queryRunner.manager.find = jest.fn().mockResolvedValue([]);

    await expect(
      service.getReportFromOrders(new Date(), new Date()),
    ).rejects.toThrow('No sales found for the selected period.');

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
