import { DataSource, Between } from 'typeorm';
import { createObjectCsvWriter } from 'csv-writer';
import * as path from 'path';
import * as fs from 'fs';
import { OrderEntity } from '../../order/entities/order.entity';
import { Injectable } from '@nestjs/common';

type ProductSummary = {
  quantity: number;
  total: number;
};

type CsvRecord = {
  customer: string;
  product: string;
  quantity_sold: number;
  sold_at: Date | string;
  total_sold: number;
};

@Injectable()
export class GenerateReportsService {
  constructor(private _dataSource: DataSource) {}

  async getReportFromOrders(startDate: Date, endDate: Date): Promise<string> {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orders = await queryRunner.manager.find(OrderEntity, {
        relations: ['orderItems', 'orderItems.product', 'customer'],
        where: {
          created_at: Between(startDate, endDate),
        },
      });

      if (orders.length === 0) {
        throw new Error('No sales found for the selected period.');
      }

      const productAggregation: Record<string, ProductSummary> = {};

      const csvRecords: CsvRecord[] = [];

      for (const order of orders) {
        const customerName = order.customer?.name || 'Unknown Customer';

        for (const item of order.orderItems) {
          const productName = item.product?.product_name || 'Unknown Product';
          const quantity = Number(item.quantity);
          const subtotal = Number(item.subtotal);
          const soldAt = new Date(order.created_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false,
          });

          if (!productAggregation[productName]) {
            productAggregation[productName] = { quantity: 0, total: 0 };
          }
          productAggregation[productName].quantity += quantity;
          productAggregation[productName].total += subtotal;

          // Prepare CSV record per product sold per customer
          csvRecords.push({
            customer: customerName,
            product: productName,
            quantity_sold: quantity,
            total_sold: subtotal,
            sold_at: soldAt,
          });
        }
      }

      const sortedProducts = Object.entries(productAggregation).sort(
        ([, a], [, b]) => b.quantity - a.quantity,
      );

      // const bestSellingProduct = sortedProducts[0];
      // const worstSellingProduct = sortedProducts[sortedProducts.length - 1];

      const outputFilePath = path.join(
        process.cwd(), // raiz do projeto (onde fica o src/)
        'src',
        'reports',
        `sales-report-${Date.now()}.csv`,
      );

      // Ensure directory exists
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: outputFilePath,
        header: [
          { id: 'customer', title: 'Cliente' },
          { id: 'product', title: 'Produto' },
          { id: 'quantity_sold', title: 'Quantidade Vendida' },
          { id: 'sold_at', title: 'Data da Venda' },
          { id: 'total_sold', title: 'Total (R$)' },
        ],
        fieldDelimiter: ';',
      });

      // Write CSV file
      await csvWriter.writeRecords(csvRecords);

      await queryRunner.commitTransaction();

      return outputFilePath;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
